'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type IssueRow = Database['public']['Tables']['issues']['Row']

export interface IssueWithAssignee extends IssueRow {
  assignee?: {
    full_name: string | null
    email: string
  } | null
}

interface UseIssuesRealtimeOptions {
  initialIssues: IssueWithAssignee[]
  projectId: string
}

/**
 * Hook that manages issues state with Supabase Realtime.
 * Automatically syncs INSERT/UPDATE/DELETE events from other users.
 */
export function useIssuesRealtime({ initialIssues, projectId }: UseIssuesRealtimeOptions) {
  const [issues, setIssues] = useState<IssueWithAssignee[]>(initialIssues)
  const supabase = createClient()

  // Sync with server data when initialIssues changes (on navigation/revalidation)
  useEffect(() => {
    setIssues(initialIssues)
  }, [initialIssues])

  // Handle realtime payload changes
  const handleRealtimeChange = useCallback((
    payload: RealtimePostgresChangesPayload<IssueRow>
  ) => {
    const eventType = payload.eventType

    if (eventType === 'INSERT') {
      const newIssue = payload.new as IssueRow
      
      // Only add if belongs to this project and doesn't exist already
      if (newIssue.project_id === projectId) {
        setIssues(prev => {
          // Prevent duplicates (optimistic update may have already added it)
          if (prev.some(i => i.id === newIssue.id)) {
            return prev
          }
          // Add with empty assignee (will be filled on next revalidation or we could fetch)
          return [{ ...newIssue, assignee: null }, ...prev]
        })
      }
    }

    if (eventType === 'UPDATE') {
      const updatedIssue = payload.new as IssueRow
      
      setIssues(prev => prev.map(issue => {
        if (issue.id === updatedIssue.id) {
          // Preserve existing assignee data if payload doesn't include it
          return {
            ...issue,
            ...updatedIssue,
            assignee: issue.assignee, // Keep existing assignee to avoid flicker
          }
        }
        return issue
      }))
    }

    if (eventType === 'DELETE') {
      const deletedIssue = payload.old as IssueRow
      
      setIssues(prev => prev.filter(issue => issue.id !== deletedIssue.id))
    }
  }, [projectId])

  // Subscribe to Realtime channel
  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`issues-realtime-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
          filter: `project_id=eq.${projectId}`,
        },
        handleRealtimeChange
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to issues channel')
        }
      })

    return () => {
      console.log('[Realtime] Unsubscribing from issues channel')
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase, handleRealtimeChange])

  // Optimistic update function for local changes (Drag & Drop)
  const optimisticUpdate = useCallback((issueId: string, updates: Partial<IssueRow>) => {
    setIssues(prev => prev.map(issue =>
      issue.id === issueId ? { ...issue, ...updates } : issue
    ))
  }, [])

  // Rollback function for failed updates
  const rollback = useCallback((issueId: string, originalData: Partial<IssueRow>) => {
    setIssues(prev => prev.map(issue =>
      issue.id === issueId ? { ...issue, ...originalData } : issue
    ))
  }, [])

  return {
    issues,
    optimisticUpdate,
    rollback,
  }
}
