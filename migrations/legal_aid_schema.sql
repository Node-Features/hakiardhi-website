-- Legal Aid Management System - Database Schema
-- This schema supports Hakiardhi's legal assistance tracking

-- =====================================================
-- TABLE: legal_aid_requests
-- Main table for tracking legal aid requests
-- =====================================================

CREATE TABLE IF NOT EXISTS legal_aid_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number VARCHAR(50) UNIQUE NOT NULL, -- HAK-YYYY-NNNN format

  -- Contact Information
  name VARCHAR(200) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),

  -- Beneficiary Details (JSONB for flexibility)
  beneficiary_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure:
  -- {
  --   "age": 35,
  --   "gender": "Female",
  --   "occupation": "Farmer",
  --   "education_level": "Primary",
  --   "income_level": "Low",
  --   "disability_status": "None",
  --   "marital_status": "Married",
  --   "number_of_dependents": 3,
  --   "id_number": "12345678",
  --   "id_type": "National ID"
  -- }

  -- Demographic Details (JSONB)
  demographic_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure:
  -- {
  --   "region_id": "uuid",
  --   "district_id": "uuid",
  --   "ward": "Ward Name",
  --   "village": "Village Name",
  --   "street": "Street Name",
  --   "residential_status": "Owner",
  --   "years_in_residence": 10,
  --   "tribe": "Tribe Name",
  --   "religion": "Religion",
  --   "language_preference": "Swahili"
  -- }

  -- Case Details (JSONB)
  case_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure:
  -- {
  --   "case_type": "Land Dispute",
  --   "case_category": "Boundary Conflict",
  --   "case_description": "Detailed description...",
  --   "land_size": "5 acres",
  --   "land_location": "Plot 123, Village X",
  --   "land_use": "Agriculture",
  --   "title_deed_available": true,
  --   "title_deed_number": "DEED-12345",
  --   "dispute_duration": "2 years",
  --   "previous_attempts_at_resolution": "Village council meeting failed",
  --   "opposing_party": "Neighbor John Doe",
  --   "witnesses_available": true,
  --   "evidence_documents": ["deed_copy.pdf", "survey_map.pdf"],
  --   "court_documents_needed": ["Title Deed Certificate", "Survey Report"],
  --   "has_active_court_case": true,
  --   "court_case_number": "CASE-2024-123",
  --   "court_name": "High Court of Tanzania",
  --   "next_court_date": "2025-11-15",
  --   "urgency_level": "High",
  --   "estimated_loss_value": "10,000,000 TSH"
  -- }

  -- Stage Management
  current_stage VARCHAR(100) NOT NULL DEFAULT 'Intake - Pending Review',
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium', -- Low, Medium, High, Urgent
  queue_position INTEGER,

  -- Assignment
  assigned_lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Communication Preferences
  preferred_contact_method VARCHAR(20) NOT NULL DEFAULT 'Phone', -- Phone, Email, WhatsApp, SMS
  preferred_language VARCHAR(20) NOT NULL DEFAULT 'Swahili', -- Swahili, English

  -- Consent & Source
  consent_to_data_processing BOOLEAN NOT NULL DEFAULT false,
  how_did_you_hear_about_us TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_legal_aid_case_number ON legal_aid_requests(case_number);
CREATE INDEX idx_legal_aid_current_stage ON legal_aid_requests(current_stage);
CREATE INDEX idx_legal_aid_priority ON legal_aid_requests(priority);
CREATE INDEX idx_legal_aid_assigned_lawyer ON legal_aid_requests(assigned_lawyer_id);
CREATE INDEX idx_legal_aid_created_at ON legal_aid_requests(created_at DESC);
CREATE INDEX idx_legal_aid_phone ON legal_aid_requests(phone_number);

-- JSONB indexes for filtering
CREATE INDEX idx_legal_aid_region ON legal_aid_requests USING gin ((demographic_details->'region_id'));
CREATE INDEX idx_legal_aid_district ON legal_aid_requests USING gin ((demographic_details->'district_id'));
CREATE INDEX idx_legal_aid_case_type ON legal_aid_requests USING gin ((case_details->'case_type'));
CREATE INDEX idx_legal_aid_has_court_case ON legal_aid_requests USING gin ((case_details->'has_active_court_case'));

-- =====================================================
-- TABLE: stage_history
-- Tracks stage transitions for audit and analytics
-- =====================================================

CREATE TABLE IF NOT EXISTS stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_aid_requests(id) ON DELETE CASCADE,
  stage VARCHAR(100) NOT NULL,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  duration_hours NUMERIC(10, 2),
  notes TEXT,
  current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stage_history_request ON stage_history(request_id);
CREATE INDEX idx_stage_history_stage ON stage_history(stage);
CREATE INDEX idx_stage_history_current ON stage_history(current);
CREATE INDEX idx_stage_history_entered_at ON stage_history(entered_at DESC);

-- =====================================================
-- TABLE: document_progress
-- Tracks document preparation and collection progress
-- =====================================================

CREATE TABLE IF NOT EXISTS document_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_aid_requests(id) ON DELETE CASCADE,
  document_type VARCHAR(200) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, In Progress, Completed, Unable to Obtain
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_document_progress_request ON document_progress(request_id);
CREATE INDEX idx_document_progress_status ON document_progress(status);
CREATE INDEX idx_document_progress_assigned_to ON document_progress(assigned_to);

-- =====================================================
-- TABLE: analytics_events (for shared analytics)
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL, -- view, download, share, search, interaction
  resource_id UUID NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_resource ON analytics_events(resource_id, resource_type);
CREATE INDEX idx_analytics_type ON analytics_events(type);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp DESC);

-- =====================================================
-- TABLE: download_quality_stats (for file analytics)
-- =====================================================

CREATE TABLE IF NOT EXISTS download_quality_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL,
  quality VARCHAR(20) NOT NULL, -- full, low_data
  count INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_download_quality_resource ON download_quality_stats(resource_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for legal_aid_requests
CREATE TRIGGER update_legal_aid_requests_updated_at
  BEFORE UPDATE ON legal_aid_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for document_progress
CREATE TRIGGER update_document_progress_updated_at
  BEFORE UPDATE ON document_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE legal_aid_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and Legal Advisors can view all requests
CREATE POLICY legal_aid_view_policy ON legal_aid_requests
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'legal_advisor', 'project_manager')
  );

-- Policy: Admins and Legal Advisors can insert requests
CREATE POLICY legal_aid_insert_policy ON legal_aid_requests
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'legal_advisor', 'field_officer')
  );

-- Policy: Admins and assigned lawyers can update requests
CREATE POLICY legal_aid_update_policy ON legal_aid_requests
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    assigned_lawyer_id::text = auth.jwt() ->> 'sub'
  );

-- Policy: Only admins can delete requests
CREATE POLICY legal_aid_delete_policy ON legal_aid_requests
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Stage history policies (inherit from legal_aid_requests)
CREATE POLICY stage_history_view_policy ON stage_history
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'legal_advisor', 'project_manager')
  );

CREATE POLICY stage_history_insert_policy ON stage_history
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'legal_advisor')
  );

-- Document progress policies
CREATE POLICY document_progress_view_policy ON document_progress
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'legal_advisor', 'project_manager')
  );

CREATE POLICY document_progress_insert_policy ON document_progress
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'legal_advisor')
  );

CREATE POLICY document_progress_update_policy ON document_progress
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    assigned_to::text = auth.jwt() ->> 'sub'
  );

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Note: Run this only in development/testing environments
-- INSERT INTO legal_aid_requests (case_number, name, phone_number, ...) VALUES (...);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View: Active cases with assigned lawyer details
CREATE OR REPLACE VIEW active_legal_aid_cases AS
SELECT
  lar.id,
  lar.case_number,
  lar.name,
  lar.current_stage,
  lar.priority,
  lar.case_details->>'case_type' as case_type,
  lar.demographic_details->>'region_id' as region_id,
  lar.demographic_details->>'district_id' as district_id,
  lar.assigned_lawyer_id,
  u.first_name || ' ' || u.last_name as lawyer_name,
  lar.created_at,
  lar.assigned_at,
  EXTRACT(DAY FROM (NOW() - lar.created_at)) as days_open
FROM legal_aid_requests lar
LEFT JOIN users u ON u.id = lar.assigned_lawyer_id
WHERE lar.current_stage NOT IN (
  'Completed - Documents Provided',
  'Completed - Case Resolved',
  'Completed - Referred to Litigation',
  'Completed - Withdrawn',
  'Closed - Unable to Assist'
);

-- View: Lawyer workload summary
CREATE OR REPLACE VIEW lawyer_workload_summary AS
SELECT
  u.id as lawyer_id,
  u.first_name || ' ' || u.last_name as lawyer_name,
  u.email,
  COUNT(lar.id) as active_cases,
  COUNT(CASE WHEN lar.priority = 'Urgent' THEN 1 END) as urgent_cases,
  COUNT(CASE WHEN lar.priority = 'High' THEN 1 END) as high_priority_cases,
  AVG(EXTRACT(DAY FROM (NOW() - lar.created_at))) as avg_case_age_days
FROM users u
LEFT JOIN legal_aid_requests lar ON lar.assigned_lawyer_id = u.id
  AND lar.current_stage NOT IN (
    'Completed - Documents Provided',
    'Completed - Case Resolved',
    'Completed - Referred to Litigation',
    'Completed - Withdrawn',
    'Closed - Unable to Assist'
  )
WHERE EXISTS (
  SELECT 1 FROM roles r
  INNER JOIN user_roles ur ON ur.role_id = r.id
  WHERE ur.user_id = u.id AND r.name = 'legal_advisor'
)
GROUP BY u.id, u.first_name, u.last_name, u.email;

COMMENT ON TABLE legal_aid_requests IS 'Main table for legal assistance requests from beneficiaries';
COMMENT ON TABLE stage_history IS 'Audit trail of stage transitions for legal aid cases';
COMMENT ON TABLE document_progress IS 'Tracks document preparation and collection status';
COMMENT ON VIEW active_legal_aid_cases IS 'Active legal aid cases with lawyer assignments';
COMMENT ON VIEW lawyer_workload_summary IS 'Summary of active cases per legal advisor';
