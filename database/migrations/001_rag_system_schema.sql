-- RAG Multi-Agent System Database Schema
-- Supabase migration for session management and budget tracking
-- Run this in Supabase SQL Editor

-- =============================================================================
-- SESSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY,
    user_id TEXT,
    session_state TEXT NOT NULL CHECK (session_state IN ('active', 'expired', 'flushed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    raw_forms JSONB NOT NULL DEFAULT '{}',
    flags JSONB NOT NULL DEFAULT '{
        "vectorized": false,
        "has_itinerary": false,
        "budget_exceeded": false
    }',
    metadata JSONB NOT NULL DEFAULT '{
        "form_count": 0
    }'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_state ON sessions(session_state);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- Index for cleanup operations
CREATE INDEX IF NOT EXISTS idx_sessions_expired_cleanup 
ON sessions(expires_at, session_state) 
WHERE session_state = 'active';

-- =============================================================================
-- BUDGET TRACKING TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS budget_tracking (
    session_id UUID PRIMARY KEY REFERENCES sessions(session_id) ON DELETE CASCADE,
    total_spent_usd DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    limit_usd DECIMAL(10,4) NOT NULL DEFAULT 5.0000,
    operations_count INTEGER NOT NULL DEFAULT 0,
    last_operation_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_over_budget BOOLEAN NOT NULL DEFAULT FALSE,
    breakdown JSONB NOT NULL DEFAULT '{
        "embedding_cost": 0,
        "generation_cost": 0,
        "search_cost": 0
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for budget tracking
CREATE INDEX IF NOT EXISTS idx_budget_tracking_over_budget ON budget_tracking(is_over_budget);
CREATE INDEX IF NOT EXISTS idx_budget_tracking_updated_at ON budget_tracking(updated_at);

-- =============================================================================
-- TOKEN USAGE LOG TABLE (for cost tracking and analysis)
-- =============================================================================

CREATE TABLE IF NOT EXISTS token_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
    request_id UUID NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('groq', 'gemini', 'cerebras', 'huggingface')),
    operation TEXT NOT NULL CHECK (operation IN ('embedding', 'generation', 'search', 'summarization')),
    model_name TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER NOT NULL,
    cost_usd DECIMAL(10,6) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for token usage analysis
CREATE INDEX IF NOT EXISTS idx_token_usage_session_id ON token_usage_log(session_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_provider ON token_usage_log(provider);
CREATE INDEX IF NOT EXISTS idx_token_usage_operation ON token_usage_log(operation);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage_log(created_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_log ENABLE ROW LEVEL SECURITY;

-- Policy for sessions: Users can only access their own sessions
CREATE POLICY "Users can access own sessions" ON sessions
    FOR ALL USING (
        user_id = auth.uid()::text OR 
        user_id IS NULL -- Allow anonymous sessions
    );

-- Policy for budget tracking: Users can only access their own budget data
CREATE POLICY "Users can access own budget data" ON budget_tracking
    FOR ALL USING (
        session_id IN (
            SELECT session_id FROM sessions 
            WHERE user_id = auth.uid()::text OR user_id IS NULL
        )
    );

-- Policy for token usage: Users can only access their own usage data
CREATE POLICY "Users can access own token usage" ON token_usage_log
    FOR ALL USING (
        session_id IN (
            SELECT session_id FROM sessions 
            WHERE user_id = auth.uid()::text OR user_id IS NULL
        )
    );

-- Service role can access all data (for backend operations)
CREATE POLICY "Service role full access sessions" ON sessions
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access budget" ON budget_tracking
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access token usage" ON token_usage_log
    FOR ALL TO service_role USING (true);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for budget_tracking updated_at
CREATE TRIGGER update_budget_tracking_updated_at 
    BEFORE UPDATE ON budget_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create budget tracking entry for new sessions
CREATE OR REPLACE FUNCTION create_budget_tracking_for_session()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO budget_tracking (session_id, limit_usd)
    VALUES (NEW.session_id, 5.0000)
    ON CONFLICT (session_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create budget tracking when session is created
CREATE TRIGGER create_budget_tracking_trigger 
    AFTER INSERT ON sessions 
    FOR EACH ROW EXECUTE FUNCTION create_budget_tracking_for_session();

-- Function to cleanup expired sessions (can be called by cron)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    UPDATE sessions 
    SET session_state = 'expired'
    WHERE expires_at < NOW() 
    AND session_state = 'active';
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RETURN cleanup_count;
END;
$$ language 'plpgsql';

-- =============================================================================
-- PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Partial index for active sessions only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_active_expires 
ON sessions(expires_at) 
WHERE session_state = 'active';

-- Composite index for budget queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_session_over_budget 
ON budget_tracking(session_id, is_over_budget);

-- =============================================================================
-- INITIAL DATA AND CONFIGURATION
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON budget_tracking TO authenticated;
GRANT SELECT, INSERT ON token_usage_log TO authenticated;

-- Grant full permissions to service role
GRANT ALL ON sessions TO service_role;
GRANT ALL ON budget_tracking TO service_role;
GRANT ALL ON token_usage_log TO service_role;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE sessions IS 'User sessions for RAG multi-agent travel planning system';
COMMENT ON TABLE budget_tracking IS 'Cost tracking and budget management per session';
COMMENT ON TABLE token_usage_log IS 'Detailed token usage and cost analysis log';

COMMENT ON COLUMN sessions.session_id IS 'Unique session identifier (UUID)';
COMMENT ON COLUMN sessions.user_id IS 'Optional user identifier for authenticated sessions';
COMMENT ON COLUMN sessions.session_state IS 'Current state: active, expired, or flushed';
COMMENT ON COLUMN sessions.raw_forms IS 'JSON storage for all form data submitted in session';
COMMENT ON COLUMN sessions.flags IS 'Boolean flags for session status tracking';
COMMENT ON COLUMN sessions.metadata IS 'Additional metadata including form count and IDs';

COMMENT ON COLUMN budget_tracking.total_spent_usd IS 'Total amount spent in USD for this session';
COMMENT ON COLUMN budget_tracking.limit_usd IS 'Budget limit in USD for this session';
COMMENT ON COLUMN budget_tracking.breakdown IS 'Cost breakdown by operation type';

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Batch cleanup function for expired sessions - call from cron job';
COMMENT ON FUNCTION create_budget_tracking_for_session() IS 'Automatically creates budget tracking entry for new sessions';

-- Success message
SELECT 'RAG Multi-Agent System database schema created successfully!' as message;