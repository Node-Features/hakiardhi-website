# Database Schema for Analytics & AI Systems

This document defines the complete database schema for the analytics data collection, statistics aggregation, and AI-powered services.

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Core Analytics Tables](#core-analytics-tables)
3. [Visitor & Session Tables](#visitor--session-tables)
4. [Engagement & Behavior Tables](#engagement--behavior-tables)
5. [Acquisition & Referrer Tables](#acquisition--referrer-tables)
6. [Technology & Device Tables](#technology--device-tables)
7. [Conversion & Goal Tables](#conversion--goal-tables)
8. [AI & ML Tables](#ai--ml-tables)
9. [Aggregation & Reporting Tables](#aggregation--reporting-tables)
10. [Indexes & Performance](#indexes--performance)
11. [Migrations](#migrations)

---

## Schema Overview

### Entity Relationship Diagram

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    visitors      │     │ visitor_sessions │     │   page_views     │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK)          │◄────┤ visitor_id (FK)  │◄────┤ session_id (FK)  │
│ first_seen       │     │ id (PK)          │     │ id (PK)          │
│ last_seen        │     │ start_time       │     │ page_url         │
│ total_sessions   │     │ end_time         │     │ time_on_page     │
└──────────────────┘     │ duration         │     │ scroll_depth     │
                         │ is_bounce        │     └──────────────────┘
                         └──────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│visitor_browser_  │  │visitor_device_   │  │visitor_referrers │
│info              │  │info              │  │                  │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ session_id (FK)  │  │ session_id (FK)  │  │ session_id (FK)  │
│ browser_type     │  │ device_type      │  │ referrer_type    │
│ ip_address       │  │ operating_system │  │ utm_source       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Naming Conventions

- **Tables**: snake_case, plural (e.g., `visitor_sessions`)
- **Columns**: snake_case (e.g., `created_at`)
- **Primary Keys**: `id` with UUID type
- **Foreign Keys**: `{table_singular}_id` (e.g., `visitor_id`)
- **Timestamps**: `created_at`, `updated_at`
- **Booleans**: Prefix with `is_`, `has_`, `can_` (e.g., `is_bounce`)

---

## Core Analytics Tables

### 1. visitors

Master table for unique visitors identified by cookies/fingerprints.

```sql
CREATE TABLE visitors (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    fingerprint VARCHAR(64),
    cookie_id VARCHAR(64),

    -- Visitor Lifecycle
    first_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Aggregated Metrics
    total_sessions INTEGER DEFAULT 1,
    total_page_views INTEGER DEFAULT 0,
    total_time_on_site INTEGER DEFAULT 0, -- seconds
    total_conversions INTEGER DEFAULT 0,

    -- Classification
    visitor_type VARCHAR(20) DEFAULT 'new', -- new, returning, loyal
    lifetime_value DECIMAL(10, 2) DEFAULT 0,

    -- Consent
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_visitors_fingerprint UNIQUE (fingerprint),
    CONSTRAINT uq_visitors_cookie_id UNIQUE (cookie_id)
);

-- Indexes
CREATE INDEX idx_visitors_first_seen ON visitors(first_seen);
CREATE INDEX idx_visitors_last_seen ON visitors(last_seen);
CREATE INDEX idx_visitors_type ON visitors(visitor_type);
CREATE INDEX idx_visitors_fingerprint ON visitors(fingerprint);
```

### 2. cookie_consents

Track user consent for GDPR compliance.

```sql
CREATE TABLE cookie_consents (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,

    -- Consent Categories
    necessary BOOLEAN NOT NULL DEFAULT TRUE,
    analytics BOOLEAN NOT NULL DEFAULT FALSE,
    marketing BOOLEAN NOT NULL DEFAULT FALSE,
    personalization BOOLEAN NOT NULL DEFAULT FALSE,

    -- Consent Details
    consent_version VARCHAR(20) NOT NULL,
    consent_method VARCHAR(50), -- banner, settings, api
    consent_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Audit Trail
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_cookie_consents_visitor ON cookie_consents(visitor_id);
CREATE INDEX idx_cookie_consents_date ON cookie_consents(consent_date);
```

---

## Visitor & Session Tables

### 3. visitor_sessions

Individual browsing sessions.

```sql
CREATE TABLE visitor_sessions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,

    -- Session Timing
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    total_duration INTEGER, -- seconds

    -- Session Metrics
    page_views_count INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,

    -- Engagement Flags
    is_bounce BOOLEAN DEFAULT TRUE,
    is_engaged BOOLEAN DEFAULT FALSE, -- duration > 30s or pages > 1

    -- Session State
    session_number INTEGER DEFAULT 1, -- nth session for this visitor
    is_converted BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_visitor ON visitor_sessions(visitor_id);
CREATE INDEX idx_sessions_start_time ON visitor_sessions(start_time);
CREATE INDEX idx_sessions_bounce ON visitor_sessions(is_bounce);
CREATE INDEX idx_sessions_converted ON visitor_sessions(is_converted);

-- Partitioning by month for better performance
CREATE TABLE visitor_sessions_y2024m01 PARTITION OF visitor_sessions
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
-- Add more partitions as needed
```

### 4. visitor_browser_info

Browser and network information per session.

```sql
CREATE TABLE visitor_browser_info (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    session_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,

    -- Network Information
    ip_address VARCHAR(45) NOT NULL,
    ip_country VARCHAR(100),
    ip_country_code VARCHAR(3),
    ip_region VARCHAR(100),
    ip_city VARCHAR(100),
    ip_postal VARCHAR(20),
    ip_latitude DECIMAL(10, 8),
    ip_longitude DECIMAL(11, 8),
    ip_timezone VARCHAR(50),
    ip_isp VARCHAR(200),

    -- Browser Information
    browser_type VARCHAR(50) NOT NULL,
    browser_version VARCHAR(30),
    browser_engine VARCHAR(50),

    -- User Agent
    user_agent TEXT,
    user_agent_parsed JSONB,

    -- Browser Capabilities
    language VARCHAR(10),
    languages JSONB, -- Array of accepted languages
    cookies_enabled BOOLEAN DEFAULT TRUE,
    do_not_track BOOLEAN DEFAULT FALSE,
    java_enabled BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_browser_info_session ON visitor_browser_info(session_id);
CREATE INDEX idx_browser_info_browser ON visitor_browser_info(browser_type);
CREATE INDEX idx_browser_info_country ON visitor_browser_info(ip_country_code);
CREATE INDEX idx_browser_info_city ON visitor_browser_info(ip_city);
```

---

## Engagement & Behavior Tables

### 5. page_views

Individual page view events.

```sql
CREATE TABLE page_views (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    session_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,

    -- Page Information
    page_url TEXT NOT NULL,
    page_path VARCHAR(500),
    page_title VARCHAR(500),
    page_hostname VARCHAR(255),

    -- Query Parameters
    query_string TEXT,
    query_params JSONB,

    -- Timing
    entry_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP,
    time_on_page INTEGER, -- seconds

    -- Engagement Metrics
    scroll_depth INTEGER DEFAULT 0, -- percentage 0-100
    max_scroll_depth INTEGER DEFAULT 0,

    -- Page Position
    page_sequence INTEGER, -- order in session
    is_entry_page BOOLEAN DEFAULT FALSE,
    is_exit_page BOOLEAN DEFAULT FALSE,
    is_bounce BOOLEAN DEFAULT FALSE,

    -- Performance
    page_load_time INTEGER, -- milliseconds
    dom_interactive_time INTEGER,
    dom_complete_time INTEGER,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_url ON page_views(page_url);
CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_entry_time ON page_views(entry_time);
CREATE INDEX idx_page_views_entry_page ON page_views(is_entry_page) WHERE is_entry_page = TRUE;
CREATE INDEX idx_page_views_exit_page ON page_views(is_exit_page) WHERE is_exit_page = TRUE;

-- Full text search on page content
CREATE INDEX idx_page_views_title_fts ON page_views USING gin(to_tsvector('english', page_title));
```

### 6. tracking_events

Custom events and interactions.

```sql
CREATE TABLE tracking_events (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    session_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    page_view_id UUID REFERENCES page_views(id) ON DELETE SET NULL,

    -- Event Classification
    event_category VARCHAR(100) NOT NULL,
    event_action VARCHAR(100) NOT NULL,
    event_label VARCHAR(500),
    event_value DECIMAL(10, 2),

    -- Event Details
    event_data JSONB,

    -- Context
    page_url TEXT,
    element_id VARCHAR(100),
    element_class VARCHAR(255),
    element_text VARCHAR(500),

    -- Timing
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_since_page_load INTEGER, -- milliseconds

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_events_session ON tracking_events(session_id);
CREATE INDEX idx_events_category ON tracking_events(event_category);
CREATE INDEX idx_events_action ON tracking_events(event_action);
CREATE INDEX idx_events_time ON tracking_events(event_time);
CREATE INDEX idx_events_data ON tracking_events USING gin(event_data);
```

### 7. scroll_events

Detailed scroll tracking.

```sql
CREATE TABLE scroll_events (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    page_view_id UUID NOT NULL REFERENCES page_views(id) ON DELETE CASCADE,

    -- Scroll Data
    scroll_depth INTEGER NOT NULL, -- percentage
    scroll_direction VARCHAR(10), -- up, down
    scroll_position INTEGER, -- pixels from top

    -- Viewport
    viewport_height INTEGER,
    document_height INTEGER,

    -- Timing
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_at_depth INTEGER, -- seconds spent at this depth

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_scroll_page_view ON scroll_events(page_view_id);
CREATE INDEX idx_scroll_depth ON scroll_events(scroll_depth);
```

### 8. click_events

Click and interaction tracking.

```sql
CREATE TABLE click_events (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    page_view_id UUID NOT NULL REFERENCES page_views(id) ON DELETE CASCADE,

    -- Click Position
    click_x INTEGER NOT NULL,
    click_y INTEGER NOT NULL,
    viewport_width INTEGER,
    viewport_height INTEGER,

    -- Element Information
    element_tag VARCHAR(50),
    element_id VARCHAR(100),
    element_class VARCHAR(255),
    element_text VARCHAR(500),
    element_href TEXT,

    -- Click Type
    click_type VARCHAR(20) DEFAULT 'single', -- single, double, right
    is_rage_click BOOLEAN DEFAULT FALSE,
    is_dead_click BOOLEAN DEFAULT FALSE,

    -- Timing
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_click_page_view ON click_events(page_view_id);
CREATE INDEX idx_click_element ON click_events(element_id);
CREATE INDEX idx_click_rage ON click_events(is_rage_click) WHERE is_rage_click = TRUE;
```

---

## Acquisition & Referrer Tables

### 9. visitor_referrers

Traffic source and campaign tracking.

```sql
CREATE TABLE visitor_referrers (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    session_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,

    -- Referrer Information
    referrer_url TEXT,
    referrer_domain VARCHAR(255),
    referrer_path VARCHAR(500),

    -- Traffic Classification
    referrer_type VARCHAR(20) NOT NULL, -- direct, organic, social, referral, paid, email
    referrer_source VARCHAR(100), -- google, facebook, twitter, etc.
    referrer_medium VARCHAR(100), -- organic, cpc, social, email, referral

    -- UTM Parameters
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(200),
    utm_content VARCHAR(200),
    utm_term VARCHAR(200),

    -- Additional Parameters
    gclid VARCHAR(100), -- Google Click ID
    fbclid VARCHAR(100), -- Facebook Click ID
    msclkid VARCHAR(100), -- Microsoft Click ID

    -- Landing Page
    landing_page TEXT,
    landing_page_path VARCHAR(500),

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_referrers_session ON visitor_referrers(session_id);
CREATE INDEX idx_referrers_type ON visitor_referrers(referrer_type);
CREATE INDEX idx_referrers_source ON visitor_referrers(utm_source);
CREATE INDEX idx_referrers_campaign ON visitor_referrers(utm_campaign);
CREATE INDEX idx_referrers_medium ON visitor_referrers(utm_medium);
CREATE INDEX idx_referrers_domain ON visitor_referrers(referrer_domain);
```

### 10. campaigns

Marketing campaign definitions.

```sql
CREATE TABLE campaigns (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Campaign Details
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Campaign Type
    campaign_type VARCHAR(50) NOT NULL, -- email, social, ppc, display, content
    channel VARCHAR(50),

    -- UTM Configuration
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(200),
    utm_content VARCHAR(200),
    utm_term VARCHAR(200),

    -- Budget & Dates
    budget DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_campaigns_name ON campaigns(name);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
```

---

## Technology & Device Tables

### 11. visitor_device_info

Device and hardware information.

```sql
CREATE TABLE visitor_device_info (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    session_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,

    -- Device Classification
    device_type VARCHAR(20) NOT NULL, -- desktop, mobile, tablet
    device_brand VARCHAR(100),
    device_model VARCHAR(100),

    -- Operating System
    operating_system VARCHAR(50) NOT NULL,
    os_version VARCHAR(30),

    -- Screen Information
    screen_width INTEGER,
    screen_height INTEGER,
    screen_resolution VARCHAR(20),
    screen_color_depth INTEGER,
    pixel_ratio DECIMAL(4, 2),

    -- Device Capabilities
    touch_enabled BOOLEAN DEFAULT FALSE,
    max_touch_points INTEGER,

    -- Hardware (when available)
    hardware_concurrency INTEGER, -- CPU cores
    device_memory DECIMAL(5, 2), -- GB

    -- Connection
    connection_type VARCHAR(50), -- wifi, cellular, ethernet
    connection_effective_type VARCHAR(20), -- slow-2g, 2g, 3g, 4g

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_device_info_session ON visitor_device_info(session_id);
CREATE INDEX idx_device_info_type ON visitor_device_info(device_type);
CREATE INDEX idx_device_info_os ON visitor_device_info(operating_system);
CREATE INDEX idx_device_info_resolution ON visitor_device_info(screen_resolution);
```

---

## Conversion & Goal Tables

### 12. goals

Goal and conversion definitions.

```sql
CREATE TABLE goals (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Goal Details
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Goal Type
    goal_type VARCHAR(50) NOT NULL, -- destination, duration, pages_per_session, event

    -- Goal Configuration
    match_type VARCHAR(20), -- equals, starts_with, regex, contains
    match_value TEXT,

    -- Event-based Goal
    event_category VARCHAR(100),
    event_action VARCHAR(100),
    event_label VARCHAR(500),

    -- Numeric Goals
    threshold_value DECIMAL(10, 2), -- for duration or pages goals
    threshold_operator VARCHAR(10), -- >, <, =, >=, <=

    -- Goal Value
    goal_value DECIMAL(10, 2) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_goals_active ON goals(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_goals_type ON goals(goal_type);
```

### 13. conversions

Completed goal conversions.

```sql
CREATE TABLE conversions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    session_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,

    -- Conversion Details
    conversion_value DECIMAL(10, 2) DEFAULT 0,
    conversion_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Attribution
    attribution_source VARCHAR(100),
    attribution_medium VARCHAR(100),
    attribution_campaign VARCHAR(200),

    -- Context
    conversion_page TEXT,
    conversion_data JSONB,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_conversions_session ON conversions(session_id);
CREATE INDEX idx_conversions_visitor ON conversions(visitor_id);
CREATE INDEX idx_conversions_goal ON conversions(goal_id);
CREATE INDEX idx_conversions_time ON conversions(conversion_time);
```

### 14. funnels

Conversion funnel definitions.

```sql
CREATE TABLE funnels (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Funnel Details
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE funnel_steps (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,

    -- Step Details
    step_number INTEGER NOT NULL,
    step_name VARCHAR(200) NOT NULL,

    -- Step Configuration
    step_type VARCHAR(50) NOT NULL, -- page_view, event
    match_type VARCHAR(20),
    match_value TEXT,

    -- Event Details
    event_category VARCHAR(100),
    event_action VARCHAR(100),

    -- Required
    is_required BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_funnel_steps_funnel ON funnel_steps(funnel_id);
CREATE INDEX idx_funnel_steps_number ON funnel_steps(step_number);
```

### 15. funnel_progress

Track user progress through funnels.

```sql
CREATE TABLE funnel_progress (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    session_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES funnel_steps(id) ON DELETE CASCADE,

    -- Progress
    step_number INTEGER NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_to_complete INTEGER, -- seconds from funnel start

    -- Status
    is_exit_step BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_funnel_progress_session ON funnel_progress(session_id);
CREATE INDEX idx_funnel_progress_funnel ON funnel_progress(funnel_id);
CREATE INDEX idx_funnel_progress_step ON funnel_progress(step_id);
```

---

## AI & ML Tables

### 16. ml_predictions

Store ML model predictions.

```sql
CREATE TABLE ml_predictions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL,
    visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,

    -- Model Information
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,

    -- Prediction Details
    prediction_type VARCHAR(50) NOT NULL, -- churn, conversion, segment
    prediction_value DECIMAL(10, 4),
    prediction_label VARCHAR(100),
    confidence_score DECIMAL(5, 4),

    -- Features Used
    features JSONB,

    -- Timing
    prediction_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Outcome (for model evaluation)
    actual_outcome VARCHAR(100),
    outcome_recorded_at TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_predictions_session ON ml_predictions(session_id);
CREATE INDEX idx_predictions_visitor ON ml_predictions(visitor_id);
CREATE INDEX idx_predictions_model ON ml_predictions(model_name, model_version);
CREATE INDEX idx_predictions_type ON ml_predictions(prediction_type);
CREATE INDEX idx_predictions_time ON ml_predictions(prediction_time);
```

### 17. anomalies

Detected anomalies.

```sql
CREATE TABLE anomalies (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Anomaly Details
    anomaly_type VARCHAR(50) NOT NULL, -- traffic_spike, traffic_drop, bounce_spike, etc.
    metric_name VARCHAR(100) NOT NULL,

    -- Values
    expected_value DECIMAL(15, 4),
    actual_value DECIMAL(15, 4),
    deviation DECIMAL(10, 4),

    -- Classification
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    confidence DECIMAL(5, 4),

    -- Analysis
    possible_causes JSONB, -- Array of strings
    suggested_actions JSONB, -- Array of strings

    -- Time Range
    detection_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    anomaly_start TIMESTAMP,
    anomaly_end TIMESTAMP,

    -- Status
    status VARCHAR(20) DEFAULT 'new', -- new, acknowledged, resolved, dismissed
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    resolution_notes TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_anomalies_type ON anomalies(anomaly_type);
CREATE INDEX idx_anomalies_severity ON anomalies(severity);
CREATE INDEX idx_anomalies_status ON anomalies(status);
CREATE INDEX idx_anomalies_time ON anomalies(detection_time);
```

### 18. content_embeddings

Vector embeddings for semantic search.

```sql
CREATE TABLE content_embeddings (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content Reference
    content_type VARCHAR(50) NOT NULL, -- page, article, product
    content_id VARCHAR(200) NOT NULL,
    content_url TEXT,
    content_title VARCHAR(500),

    -- Embedding
    embedding vector(1536), -- OpenAI ada-002 dimension
    embedding_model VARCHAR(100) NOT NULL,

    -- Content Metadata
    content_text TEXT,
    content_metadata JSONB,

    -- Timestamps
    indexed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    content_updated_at TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vector similarity index (requires pgvector extension)
CREATE INDEX idx_embeddings_vector ON content_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_embeddings_type ON content_embeddings(content_type);
CREATE INDEX idx_embeddings_content ON content_embeddings(content_id);
```

### 19. recommendations

Content recommendations for users.

```sql
CREATE TABLE recommendations (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL,

    -- Recommendation Details
    recommendation_type VARCHAR(50) NOT NULL, -- content, product, action
    content_id VARCHAR(200) NOT NULL,
    content_type VARCHAR(50),

    -- Scoring
    score DECIMAL(5, 4) NOT NULL,
    method VARCHAR(50) NOT NULL, -- collaborative, content-based, hybrid
    reason TEXT,

    -- Context
    context_page TEXT,
    context_data JSONB,

    -- Interaction
    was_shown BOOLEAN DEFAULT FALSE,
    shown_at TIMESTAMP,
    was_clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_recommendations_visitor ON recommendations(visitor_id);
CREATE INDEX idx_recommendations_session ON recommendations(session_id);
CREATE INDEX idx_recommendations_type ON recommendations(recommendation_type);
CREATE INDEX idx_recommendations_score ON recommendations(score DESC);
```

### 20. chat_conversations

Chatbot conversations.

```sql
CREATE TABLE chat_conversations (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
    session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL,

    -- Conversation State
    status VARCHAR(20) DEFAULT 'active', -- active, closed, transferred

    -- Classification
    primary_intent VARCHAR(100),
    sentiment VARCHAR(20), -- positive, neutral, negative
    resolution_status VARCHAR(50), -- resolved, unresolved, transferred

    -- Timing
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    total_messages INTEGER DEFAULT 0,

    -- Feedback
    user_rating INTEGER, -- 1-5
    user_feedback TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,

    -- Message Details
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,

    -- AI Metadata
    intent VARCHAR(100),
    confidence DECIMAL(5, 4),
    tokens_used INTEGER,

    -- Sources
    sources JSONB, -- Array of source references

    -- Timing
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_chat_conversations_visitor ON chat_conversations(visitor_id);
CREATE INDEX idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sent ON chat_messages(sent_at);
```

### 21. feedback_analysis

Analyzed user feedback.

```sql
CREATE TABLE feedback_analysis (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Source
    source_type VARCHAR(50) NOT NULL, -- form, survey, review, chat
    source_id VARCHAR(200),

    -- Original Content
    original_text TEXT NOT NULL,

    -- Sentiment Analysis
    sentiment VARCHAR(20) NOT NULL, -- positive, neutral, negative
    sentiment_score DECIMAL(5, 4),
    confidence DECIMAL(5, 4),

    -- Aspect Analysis
    aspects JSONB, -- Array of {aspect, sentiment, score}

    -- Emotion Detection
    emotions JSONB, -- {joy, sadness, anger, fear, surprise}

    -- Keywords & Topics
    keywords JSONB, -- Array of strings
    topics JSONB, -- Array of strings

    -- Classification
    category VARCHAR(100),
    urgency VARCHAR(20), -- low, medium, high

    -- Actionable Insights
    insights JSONB, -- Array of insight objects
    recommended_actions JSONB, -- Array of action strings

    -- Timing
    analyzed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_feedback_sentiment ON feedback_analysis(sentiment);
CREATE INDEX idx_feedback_source ON feedback_analysis(source_type);
CREATE INDEX idx_feedback_analyzed ON feedback_analysis(analyzed_at);
CREATE INDEX idx_feedback_keywords ON feedback_analysis USING gin(keywords);
```

---

## Aggregation & Reporting Tables

### 22. daily_aggregates

Pre-computed daily statistics.

```sql
CREATE TABLE daily_aggregates (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time Dimension
    date DATE NOT NULL,

    -- Visitor Metrics
    total_visitors INTEGER NOT NULL DEFAULT 0,
    new_visitors INTEGER NOT NULL DEFAULT 0,
    returning_visitors INTEGER NOT NULL DEFAULT 0,

    -- Session Metrics
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_page_views INTEGER NOT NULL DEFAULT 0,
    total_events INTEGER NOT NULL DEFAULT 0,

    -- Engagement Metrics
    avg_session_duration DECIMAL(10, 2),
    avg_pages_per_session DECIMAL(10, 2),
    bounce_rate DECIMAL(5, 2),
    avg_scroll_depth DECIMAL(5, 2),

    -- Conversion Metrics
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 4),
    total_goal_value DECIMAL(15, 2) DEFAULT 0,

    -- Traffic Sources
    direct_sessions INTEGER DEFAULT 0,
    organic_sessions INTEGER DEFAULT 0,
    social_sessions INTEGER DEFAULT 0,
    referral_sessions INTEGER DEFAULT 0,
    paid_sessions INTEGER DEFAULT 0,
    email_sessions INTEGER DEFAULT 0,

    -- Device Distribution
    desktop_sessions INTEGER DEFAULT 0,
    mobile_sessions INTEGER DEFAULT 0,
    tablet_sessions INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_daily_aggregates_date UNIQUE (date)
);

-- Indexes
CREATE INDEX idx_daily_aggregates_date ON daily_aggregates(date);
```

### 23. monthly_aggregates

Pre-computed monthly statistics.

```sql
CREATE TABLE monthly_aggregates (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time Dimension
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,

    -- Visitor Metrics
    total_visitors INTEGER NOT NULL DEFAULT 0,
    new_visitors INTEGER NOT NULL DEFAULT 0,
    returning_visitors INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,

    -- Session Metrics
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_page_views INTEGER NOT NULL DEFAULT 0,
    total_events INTEGER NOT NULL DEFAULT 0,
    total_time_on_site INTEGER DEFAULT 0, -- seconds

    -- Engagement Metrics
    avg_session_duration DECIMAL(10, 2),
    median_session_duration DECIMAL(10, 2),
    avg_pages_per_session DECIMAL(10, 2),
    bounce_rate DECIMAL(5, 2),
    engagement_rate DECIMAL(5, 2),
    avg_scroll_depth DECIMAL(5, 2),

    -- Conversion Metrics
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 4),
    total_goal_value DECIMAL(15, 2) DEFAULT 0,
    avg_conversion_value DECIMAL(10, 2),

    -- Growth Metrics
    visitor_growth_rate DECIMAL(8, 4), -- vs previous month
    session_growth_rate DECIMAL(8, 4),
    conversion_growth_rate DECIMAL(8, 4),

    -- Top Performers
    top_pages JSONB, -- Array of {url, views}
    top_referrers JSONB, -- Array of {domain, sessions}
    top_campaigns JSONB, -- Array of {campaign, conversions}

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_monthly_aggregates UNIQUE (year, month)
);

-- Indexes
CREATE INDEX idx_monthly_aggregates_date ON monthly_aggregates(year, month);
```

### 24. quarterly_aggregates

Pre-computed quarterly statistics.

```sql
CREATE TABLE quarterly_aggregates (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time Dimension
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL, -- 1-4

    -- All same fields as monthly_aggregates
    total_visitors INTEGER NOT NULL DEFAULT 0,
    new_visitors INTEGER NOT NULL DEFAULT 0,
    returning_visitors INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,

    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_page_views INTEGER NOT NULL DEFAULT 0,
    total_events INTEGER NOT NULL DEFAULT 0,
    total_time_on_site INTEGER DEFAULT 0,

    avg_session_duration DECIMAL(10, 2),
    median_session_duration DECIMAL(10, 2),
    avg_pages_per_session DECIMAL(10, 2),
    bounce_rate DECIMAL(5, 2),
    engagement_rate DECIMAL(5, 2),
    avg_scroll_depth DECIMAL(5, 2),

    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 4),
    total_goal_value DECIMAL(15, 2) DEFAULT 0,
    avg_conversion_value DECIMAL(10, 2),

    visitor_growth_rate DECIMAL(8, 4),
    session_growth_rate DECIMAL(8, 4),
    conversion_growth_rate DECIMAL(8, 4),

    top_pages JSONB,
    top_referrers JSONB,
    top_campaigns JSONB,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_quarterly_aggregates UNIQUE (year, quarter)
);

-- Indexes
CREATE INDEX idx_quarterly_aggregates_date ON quarterly_aggregates(year, quarter);
```

### 25. annual_aggregates

Pre-computed annual statistics.

```sql
CREATE TABLE annual_aggregates (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time Dimension
    year INTEGER NOT NULL,

    -- All same fields as monthly/quarterly
    total_visitors INTEGER NOT NULL DEFAULT 0,
    new_visitors INTEGER NOT NULL DEFAULT 0,
    returning_visitors INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,

    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_page_views INTEGER NOT NULL DEFAULT 0,
    total_events INTEGER NOT NULL DEFAULT 0,
    total_time_on_site INTEGER DEFAULT 0,

    avg_session_duration DECIMAL(10, 2),
    median_session_duration DECIMAL(10, 2),
    avg_pages_per_session DECIMAL(10, 2),
    bounce_rate DECIMAL(5, 2),
    engagement_rate DECIMAL(5, 2),
    avg_scroll_depth DECIMAL(5, 2),

    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 4),
    total_goal_value DECIMAL(15, 2) DEFAULT 0,
    avg_conversion_value DECIMAL(10, 2),

    visitor_growth_rate DECIMAL(8, 4),
    session_growth_rate DECIMAL(8, 4),
    conversion_growth_rate DECIMAL(8, 4),

    top_pages JSONB,
    top_referrers JSONB,
    top_campaigns JSONB,

    -- Year-specific summaries
    monthly_breakdown JSONB, -- Array of monthly summaries
    quarterly_breakdown JSONB, -- Array of quarterly summaries

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_annual_aggregates UNIQUE (year)
);

-- Indexes
CREATE INDEX idx_annual_aggregates_year ON annual_aggregates(year);
```

---

## Indexes & Performance

### Composite Indexes for Common Queries

```sql
-- Session queries with date filtering
CREATE INDEX idx_sessions_visitor_date ON visitor_sessions(visitor_id, start_time);

-- Page views with session and time
CREATE INDEX idx_page_views_session_time ON page_views(session_id, entry_time);

-- Events by category and action
CREATE INDEX idx_events_cat_action ON tracking_events(event_category, event_action);

-- Referrers with source and campaign
CREATE INDEX idx_referrers_source_campaign ON visitor_referrers(utm_source, utm_campaign);

-- Conversions by goal and time
CREATE INDEX idx_conversions_goal_time ON conversions(goal_id, conversion_time);
```

### Partial Indexes for Filtered Queries

```sql
-- Only bounced sessions
CREATE INDEX idx_sessions_bounced ON visitor_sessions(start_time)
WHERE is_bounce = TRUE;

-- Only converted sessions
CREATE INDEX idx_sessions_converted ON visitor_sessions(start_time)
WHERE is_converted = TRUE;

-- High-value conversions
CREATE INDEX idx_conversions_high_value ON conversions(conversion_time)
WHERE conversion_value > 100;

-- Critical anomalies
CREATE INDEX idx_anomalies_critical ON anomalies(detection_time)
WHERE severity = 'critical';
```

### Materialized Views for Reporting

```sql
-- Daily visitor summary
CREATE MATERIALIZED VIEW mv_daily_visitor_summary AS
SELECT
    DATE(start_time) AS date,
    COUNT(DISTINCT visitor_id) AS unique_visitors,
    COUNT(*) AS total_sessions,
    AVG(total_duration) AS avg_duration,
    SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 AS bounce_rate
FROM visitor_sessions
GROUP BY DATE(start_time);

CREATE UNIQUE INDEX idx_mv_daily_visitor ON mv_daily_visitor_summary(date);

-- Refresh schedule
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_visitor_summary;

-- Page performance summary
CREATE MATERIALIZED VIEW mv_page_performance AS
SELECT
    page_path,
    COUNT(*) AS total_views,
    COUNT(DISTINCT session_id) AS unique_views,
    AVG(time_on_page) AS avg_time_on_page,
    AVG(scroll_depth) AS avg_scroll_depth,
    SUM(CASE WHEN is_exit_page THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 AS exit_rate
FROM page_views
WHERE entry_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY page_path;

CREATE UNIQUE INDEX idx_mv_page_performance ON mv_page_performance(page_path);
```

---

## Migrations

### Initial Migration

```sql
-- migrations/001_create_analytics_schema.sql

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings

-- Create tables in dependency order
-- 1. visitors
-- 2. cookie_consents
-- 3. visitor_sessions
-- 4. visitor_browser_info
-- 5. visitor_device_info
-- 6. visitor_referrers
-- 7. page_views
-- 8. tracking_events
-- etc.

COMMIT;
```

### Add Triggers for Automatic Updates

```sql
-- migrations/002_add_triggers.sql

-- Update visitor last_seen on new session
CREATE OR REPLACE FUNCTION update_visitor_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE visitors
    SET
        last_seen = NEW.start_time,
        total_sessions = total_sessions + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.visitor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_session_update_visitor
    AFTER INSERT ON visitor_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_visitor_last_seen();

-- Update session page_views_count
CREATE OR REPLACE FUNCTION update_session_page_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE visitor_sessions
    SET
        page_views_count = page_views_count + 1,
        is_bounce = CASE WHEN page_views_count = 0 THEN TRUE ELSE FALSE END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_page_view_update_session
    AFTER INSERT ON page_views
    FOR EACH ROW
    EXECUTE FUNCTION update_session_page_count();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_visitors_updated_at
    BEFORE UPDATE ON visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
-- Repeat for other tables...
```

### Aggregation Jobs

```sql
-- migrations/003_aggregation_functions.sql

-- Function to compute daily aggregates
CREATE OR REPLACE FUNCTION compute_daily_aggregate(target_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_aggregates (
        date,
        total_visitors,
        new_visitors,
        returning_visitors,
        total_sessions,
        total_page_views,
        total_events,
        avg_session_duration,
        avg_pages_per_session,
        bounce_rate,
        total_conversions,
        conversion_rate
    )
    SELECT
        target_date,
        COUNT(DISTINCT vs.visitor_id),
        COUNT(DISTINCT CASE
            WHEN v.first_seen::DATE = target_date THEN vs.visitor_id
        END),
        COUNT(DISTINCT CASE
            WHEN v.first_seen::DATE < target_date THEN vs.visitor_id
        END),
        COUNT(vs.id),
        SUM(vs.page_views_count),
        SUM(vs.events_count),
        AVG(vs.total_duration),
        AVG(vs.page_views_count),
        (SUM(CASE WHEN vs.is_bounce THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(*), 0)) * 100,
        (SELECT COUNT(*) FROM conversions WHERE conversion_time::DATE = target_date),
        (SELECT COUNT(*)::FLOAT / NULLIF(COUNT(DISTINCT session_id), 0)
         FROM conversions WHERE conversion_time::DATE = target_date)
    FROM visitor_sessions vs
    JOIN visitors v ON vs.visitor_id = v.id
    WHERE vs.start_time::DATE = target_date
    ON CONFLICT (date) DO UPDATE SET
        total_visitors = EXCLUDED.total_visitors,
        new_visitors = EXCLUDED.new_visitors,
        returning_visitors = EXCLUDED.returning_visitors,
        total_sessions = EXCLUDED.total_sessions,
        total_page_views = EXCLUDED.total_page_views,
        total_events = EXCLUDED.total_events,
        avg_session_duration = EXCLUDED.avg_session_duration,
        avg_pages_per_session = EXCLUDED.avg_pages_per_session,
        bounce_rate = EXCLUDED.bounce_rate,
        total_conversions = EXCLUDED.total_conversions,
        conversion_rate = EXCLUDED.conversion_rate,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
```

---

## Data Retention Procedures

```sql
-- migrations/004_data_retention.sql

-- Anonymize old IP addresses
CREATE OR REPLACE FUNCTION anonymize_old_ips(days_old INTEGER)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE visitor_browser_info
    SET
        ip_address = 'xxx.xxx.xxx.' || SPLIT_PART(ip_address, '.', 4),
        ip_city = NULL,
        ip_postal = NULL,
        ip_latitude = NULL,
        ip_longitude = NULL
    WHERE created_at < CURRENT_TIMESTAMP - (days_old || ' days')::INTERVAL
      AND ip_address NOT LIKE 'xxx.%';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- Archive old sessions
CREATE OR REPLACE FUNCTION archive_old_sessions(days_old INTEGER)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Move to archive table
    INSERT INTO visitor_sessions_archive
    SELECT * FROM visitor_sessions
    WHERE start_time < CURRENT_TIMESTAMP - (days_old || ' days')::INTERVAL;

    -- Delete from main table
    DELETE FROM visitor_sessions
    WHERE start_time < CURRENT_TIMESTAMP - (days_old || ' days')::INTERVAL;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;
```

---

## Summary

This schema provides a comprehensive foundation for:

- **Data Collection**: All visitor, session, and event data
- **Analytics**: Pre-aggregated statistics for fast reporting
- **AI/ML**: Predictions, embeddings, recommendations, and chat
- **Privacy**: Consent tracking and data retention

### Table Count Summary

| Category | Tables |
|----------|--------|
| Core Analytics | 2 |
| Visitor & Session | 2 |
| Engagement & Behavior | 4 |
| Acquisition & Referrer | 2 |
| Technology & Device | 1 |
| Conversion & Goal | 4 |
| AI & ML | 6 |
| Aggregation & Reporting | 4 |
| **Total** | **25** |

### Next Steps

1. Review and approve schema design
2. Create migration scripts
3. Set up database with extensions
4. Implement data retention jobs
5. Create aggregation scheduled tasks
6. Build API data access layer
7. Configure backup and monitoring
