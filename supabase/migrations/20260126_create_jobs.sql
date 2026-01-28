-- Create jobs table for AI Agents
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    result JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow Service Role full access (for AI Engine)
CREATE POLICY "Service Role Full Access" ON public.jobs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow Authenticated Users to view their workspace jobs (Optional - requires token with workspace_id)
-- For now, we rely on Service Role for all AI operations.
