-- Migration: Create Donation Tables for Public Portal
-- Description: Creates tables for donation campaigns and transactions
-- Author: Development Team
-- Date: 2024-11-20

-- =====================================================
-- DONATION CAMPAIGNS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT NOT NULL,
  cover_image TEXT,
  gallery JSONB DEFAULT '[]',
  target_amount DECIMAL(12,2) NOT NULL,
  raised_amount DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'TZS',
  donors_count INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  category VARCHAR(100), -- 'Emergency', 'Education', 'Legal Aid', 'Research'
  beneficiaries_target INTEGER,
  impact_description TEXT,
  updates JSONB DEFAULT '[]', -- Array of {date, title, content}
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_recurring BOOLEAN DEFAULT FALSE, -- Allows recurring donations
  min_amount DECIMAL(10,2) DEFAULT 1000,
  suggested_amounts JSONB DEFAULT '[5000, 10000, 25000, 50000, 100000]',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON public.donation_campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON public.donation_campaigns(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_featured ON public.donation_campaigns(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON public.donation_campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.donation_campaigns(start_date, end_date);

-- Comments
COMMENT ON TABLE public.donation_campaigns IS 'Stores donation campaign information';
COMMENT ON COLUMN public.donation_campaigns.raised_amount IS 'Total amount raised (updated via trigger)';
COMMENT ON COLUMN public.donation_campaigns.donors_count IS 'Total number of donors (updated via trigger)';

-- =====================================================
-- DONATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_reference VARCHAR(100) UNIQUE,
  campaign_id UUID REFERENCES public.donation_campaigns(id),
  donor_name VARCHAR(255),
  donor_email VARCHAR(255),
  donor_phone VARCHAR(50),
  donor_address TEXT,
  donor_country VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TZS',
  amount_usd DECIMAL(12,2), -- Converted amount for reporting
  frequency VARCHAR(20) DEFAULT 'one-time', -- 'one-time', 'monthly', 'quarterly', 'yearly'
  payment_method VARCHAR(50), -- 'mobile_money', 'card', 'bank_transfer', 'cash'
  payment_provider VARCHAR(50), -- 'mpesa', 'tigopesa', 'airtel', 'stripe', 'paypal'
  payment_reference VARCHAR(255),
  payment_phone VARCHAR(50), -- For mobile money
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded'
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_id VARCHAR(100), -- Subscription ID for recurring donations
  dedication_type VARCHAR(50), -- 'in_honor', 'in_memory', null
  dedication_name VARCHAR(255),
  message TEXT, -- Donor message
  receipt_sent BOOLEAN DEFAULT FALSE,
  receipt_sent_at TIMESTAMP WITH TIME ZONE,
  tax_receipt_number VARCHAR(100),
  metadata JSONB DEFAULT '{}', -- Payment gateway response, etc.
  failed_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_donations_reference ON public.donations(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON public.donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_email ON public.donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_phone ON public.donations(donor_phone);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_method ON public.donations(payment_method);
CREATE INDEX IF NOT EXISTS idx_donations_recurring ON public.donations(is_recurring) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_donations_created ON public.donations(created_at DESC);

-- Constraints
ALTER TABLE public.donations
ADD CONSTRAINT chk_donation_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
ADD CONSTRAINT chk_donation_frequency CHECK (frequency IN ('one-time', 'monthly', 'quarterly', 'yearly')),
ADD CONSTRAINT chk_donation_method CHECK (payment_method IN ('mobile_money', 'card', 'bank_transfer', 'cash', 'check', 'online'));

-- Comments
COMMENT ON TABLE public.donations IS 'Stores individual donation transactions';
COMMENT ON COLUMN public.donations.transaction_reference IS 'Unique reference for the donation';
COMMENT ON COLUMN public.donations.recurring_id IS 'Subscription ID for recurring donations';

-- =====================================================
-- DONATION TRANSACTION REFERENCE GENERATION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_donation_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_reference IS NULL THEN
    NEW.transaction_reference := 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                                LPAD(NEXTVAL('donation_ref_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence if not exists
CREATE SEQUENCE IF NOT EXISTS donation_ref_seq START 1;

DROP TRIGGER IF EXISTS trigger_generate_donation_ref ON public.donations;
CREATE TRIGGER trigger_generate_donation_ref
BEFORE INSERT ON public.donations
FOR EACH ROW
EXECUTE FUNCTION generate_donation_reference();

-- =====================================================
-- UPDATE CAMPAIGN TOTALS TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_campaign_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update campaign totals when donation status changes to completed
  IF NEW.campaign_id IS NOT NULL AND NEW.status = 'completed' THEN
    UPDATE public.donation_campaigns
    SET
      raised_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.donations
        WHERE campaign_id = NEW.campaign_id AND status = 'completed'
      ),
      donors_count = (
        SELECT COUNT(DISTINCT COALESCE(donor_email, donor_phone))
        FROM public.donations
        WHERE campaign_id = NEW.campaign_id AND status = 'completed'
      )
    WHERE id = NEW.campaign_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_campaign_totals ON public.donations;
CREATE TRIGGER trigger_update_campaign_totals
AFTER INSERT OR UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_totals();

-- =====================================================
-- DONATION IMPACT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.donation_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_range VARCHAR(50) NOT NULL, -- '5000', '10000', '25000', '50000', '100000+'
  impact_description TEXT NOT NULL,
  icon_name VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.donation_impact IS 'Shows what different donation amounts can achieve';

-- =====================================================
-- PAYMENT METHODS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE, -- 'mpesa', 'tigopesa', 'stripe'
  type VARCHAR(50) NOT NULL, -- 'mobile_money', 'card', 'bank'
  provider VARCHAR(100),
  icon_url TEXT,
  instructions TEXT,
  min_amount DECIMAL(10,2),
  max_amount DECIMAL(10,2),
  fee_percentage DECIMAL(5,2),
  fee_fixed DECIMAL(10,2),
  supported_currencies JSONB DEFAULT '["TZS"]',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_code ON public.payment_methods(code);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON public.payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE public.payment_methods IS 'Available payment methods for donations';

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS trigger_campaigns_updated ON public.donation_campaigns;
CREATE TRIGGER trigger_campaigns_updated
BEFORE UPDATE ON public.donation_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_donations_updated ON public.donations;
CREATE TRIGGER trigger_donations_updated
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Payment Methods
-- =====================================================

INSERT INTO public.payment_methods (name, code, type, provider, icon_url, min_amount, max_amount, display_order) VALUES
('M-Pesa', 'mpesa', 'mobile_money', 'Vodacom', '/images/payments/mpesa.png', 1000, 3000000, 1),
('Tigo Pesa', 'tigopesa', 'mobile_money', 'Tigo', '/images/payments/tigopesa.png', 1000, 3000000, 2),
('Airtel Money', 'airtel', 'mobile_money', 'Airtel', '/images/payments/airtel.png', 1000, 3000000, 3),
('Visa/Mastercard', 'card', 'card', 'DPO', '/images/payments/visa-mc.png', 5000, 10000000, 4),
('Bank Transfer', 'bank', 'bank', 'CRDB', '/images/payments/bank.png', 10000, NULL, 5)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SEED DATA: Donation Impact
-- =====================================================

INSERT INTO public.donation_impact (amount_range, impact_description, icon_name, display_order) VALUES
('5000', 'Provides legal documents for 1 family', 'FileText', 1),
('10000', 'Funds a community education session', 'Users', 2),
('25000', 'Supports 1 legal aid case', 'Scale', 3),
('50000', 'Trains 1 Land Rights Monitor', 'GraduationCap', 4),
('100000', 'Covers a village-wide awareness campaign', 'Megaphone', 5)
ON CONFLICT DO NOTHING;
