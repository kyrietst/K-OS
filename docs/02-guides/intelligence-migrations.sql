-- =====================================================
-- kOS Intelligence Engine - Database Migrations
-- =====================================================
-- Run these migrations in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jxkmmdmpmrhwxibalmkc/editor
-- =====================================================

-- =====================================================
-- Migration 001: Create ai_actions table
-- Description: Audit log for AI agent decisions
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL CHECK (agent_name IN ('CFOAgent', 'ScrumMasterAgent', 'WorkerAgent')),
  action TEXT NOT NULL, -- 'priority_change', 'sprint_assignment', 'budget_alert', etc.
  reasoning TEXT NOT NULL, -- AI's explanation for transparency
  metadata JSONB, -- Flexible data: { "old_value": "...", "new_value": "...", "threshold": 10 }
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_actions_task_id ON ai_actions(task_id);
CREATE INDEX idx_ai_actions_status ON ai_actions(status);
CREATE INDEX idx_ai_actions_created_at ON ai_actions(created_at DESC);
CREATE INDEX idx_ai_actions_agent ON ai_actions(agent_name);

-- Row Level Security (RLS)
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "ai_actions_read" ON ai_actions FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only service role can insert (AI agents use service role key)
CREATE POLICY "ai_actions_insert_service_role" ON ai_actions FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- Migration 002: Create contracts table
-- Description: Stores client contracts for revenue analysis
-- =====================================================

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  monthly_value DECIMAL(10, 2) NOT NULL CHECK (monthly_value > 0),
  hourly_cost DECIMAL(10, 2) DEFAULT 150.00, -- Default R$150/hour (CFO uses this)
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = ongoing contract
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_contracts_workspace ON contracts(workspace_id);
CREATE INDEX idx_contracts_active ON contracts(is_active) WHERE is_active = true;
CREATE INDEX idx_contracts_client ON contracts(client_name);

-- RLS policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contracts_workspace_read" ON contracts FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "contracts_workspace_write" ON contracts FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- Migration 003: Create worklogs table
-- Description: Time tracking for CFO hour allocation analysis
-- =====================================================

CREATE TABLE IF NOT EXISTS worklogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hours DECIMAL(5, 2) NOT NULL CHECK (hours > 0),
  description TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_worklogs_issue ON worklogs(issue_id);
CREATE INDEX idx_worklogs_user ON worklogs(user_id);
CREATE INDEX idx_worklogs_logged_at ON worklogs(logged_at DESC);

-- RLS policies
ALTER TABLE worklogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "worklogs_user_read" ON worklogs FOR SELECT
  USING (
    user_id = auth.uid() OR
    issue_id IN (
      SELECT i.id FROM issues i
      JOIN workspace_members wm ON i.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "worklogs_user_write" ON worklogs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- Helper Function: Get worklog summary by client
-- Description: Used by CFO Agent's WorklogReaderTool
-- =====================================================

CREATE OR REPLACE FUNCTION get_worklog_summary(workspace_id_param UUID)
RETURNS TABLE (
  client_name TEXT,
  total_hours DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.client_name,
    COALESCE(SUM(w.hours), 0)::DECIMAL AS total_hours
  FROM contracts c
  LEFT JOIN issues i ON i.workspace_id = c.workspace_id
  LEFT JOIN worklogs w ON w.issue_id = i.id
  WHERE c.workspace_id = workspace_id_param
    AND c.is_active = true
  GROUP BY c.client_name
  ORDER BY total_hours DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('ai_actions', 'contracts', 'worklogs')
ORDER BY table_name;

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('ai_actions', 'contracts', 'worklogs')
ORDER BY tablename, indexname;
