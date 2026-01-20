'use server';

import { createClient } from '@/lib/supabase/server';

export type ProjectAnalytics = {
  totalIssues: number;
  completedIssues: number;
  byStatus: { name: string; value: number; color: string }[];
  byPriority: { name: string; value: number; color: string }[];
  recentActivity: any[]; // Returning specific fields for the list
};

export async function getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
  const supabase = await createClient();

  // 1. Fetch Issues with necessary fields
  const { data: issues, error } = await supabase
    .from('issues')
    .select('id, status, priority, title, updated_at, assignee:profiles(full_name, avatar_url)')
    .eq('project_id', projectId);

  if (error || !issues) {
    console.error('Error fetching analytics:', error);
    return {
      totalIssues: 0,
      completedIssues: 0,
      byStatus: [],
      byPriority: [],
      recentActivity: [],
    };
  }

  // 2. Aggregate Data in JS (assuming reasonable volume < 2000 items)
  // If scaling is needed, move to .rpc() or count queries.
  
  const totalIssues = issues.length;
  const completedIssues = issues.filter(i => i.status === 'done' || i.status === 'canceled').length;

  // Status Distribution
  const statusCounts: Record<string, number> = {};
  issues.forEach(i => {
    const status = i.status || 'backlog';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const statusColors: Record<string, string> = {
    backlog: '#a1a1aa', // neutral-400
    todo: '#fbbf24',    // amber-400
    in_progress: '#3b82f6', // blue-500
    done: '#22c55e',    // green-500
    canceled: '#ef4444' // red-500
  };

  const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: statusColors[status] || '#71717a'
  }));

  // Priority Breakdown
  const priorityCounts: Record<string, number> = {};
  issues.forEach(i => {
    const priority = i.priority || 'none';
    priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
  });

  const priorityColors: Record<string, string> = {
    urgent: '#ef4444', // red-500
    high: '#f97316',   // orange-500
    medium: '#eab308', // yellow-500
    low: '#22c55e',    // green-500
    none: '#a1a1aa'    // neutral-400
  };

  const byPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    color: priorityColors[priority] || '#d4d4d8'
  }));

  // Recent Activity (Top 5 recently updated)
  const recentActivity = [...issues]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return {
    totalIssues,
    completedIssues,
    byStatus,
    byPriority,
    recentActivity
  };
}
