-- Enable PostgreSQL Row Level Security (RLS) on all tenant-scoped tables

-- Session variable used: app.current_organization_id

-- 1. Function helper to retrieve current organization ID
CREATE OR REPLACE FUNCTION current_app_org_id() RETURNS TEXT AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_organization_id', true), '');
END;
$$ LANGUAGE plpgsql STABLE;

-- List of tenant-scoped tables:
-- users, projects, project_activities, insights, insight_actions, tasks,
-- documents, reports, conversations, messages, notifications, ask_rf_queries, audit_logs

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON users
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON projects
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on project_activities
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON project_activities
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on insights
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON insights
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on insight_actions
ALTER TABLE insight_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON insight_actions
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON tasks
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON documents
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON reports
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON conversations
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON messages
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON notifications
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on ask_rf_queries
ALTER TABLE ask_rf_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON ask_rf_queries
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON audit_logs
  FOR ALL
  USING (organization_id = current_app_org_id())
  WITH CHECK (organization_id = current_app_org_id());
