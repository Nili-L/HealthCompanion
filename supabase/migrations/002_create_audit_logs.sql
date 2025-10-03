-- Audit Logs Table for HIPAA Compliance
-- This table stores access logs for PHI without storing the PHI itself

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'unauthorized')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Non-PHI metadata only
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- RLS: Only admins and the user themselves can view audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Only the system can insert audit logs (via service role)
-- No UPDATE or DELETE policies - audit logs are immutable

-- Prevent updates and deletes
CREATE POLICY "Audit logs are immutable" ON audit_logs
  FOR UPDATE USING (false);

CREATE POLICY "Audit logs cannot be deleted" ON audit_logs
  FOR DELETE USING (false);

-- Function to automatically log certain actions
CREATE OR REPLACE FUNCTION log_data_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status)
  VALUES (
    auth.uid(),
    TG_ARGV[0], -- action name passed as trigger argument
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    'success'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Auto-log when profiles are viewed (via SELECT)
-- Note: This requires custom Supabase functions or application-level logging
-- For now, logging will be done at the application layer

-- Retention policy: Keep audit logs for 7 years (HIPAA requirement)
-- This should be implemented via scheduled job or backup strategy
COMMENT ON TABLE audit_logs IS 'HIPAA audit logs - Retain for 7 years minimum';
