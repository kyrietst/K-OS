'use client';

import React from 'react';
import { Card } from '@heroui/react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { ProjectAnalytics as AnalyticsData } from '@/features/projects/actions/get-project-analytics';
import { CheckCircle2, CircleDashed, Layout, Layers } from 'lucide-react';

interface ProjectAnalyticsProps {
  data: AnalyticsData;
}

export function ProjectAnalytics({ data }: ProjectAnalyticsProps) {
  // Safe check for empty data to avoid Recharts errors
  const isEmpty = data.totalIssues === 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-white/10 p-2 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-white">{payload[0].name}</p>
          <p className="text-gray-300">
            {payload[0].value} issues
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Issues"
          value={data.totalIssues}
          icon={<Layers className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          title="Completed"
          value={data.completedIssues}
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
        />
        <KpiCard
          title="Active"
          value={data.totalIssues - data.completedIssues}
          icon={<CircleDashed className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          title="Modules"
          value="--" // Placeholder for now as per plan
          icon={<Layout className="w-5 h-5 text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="bg-neutral-900/50 border-white/5">
          <Card.Content className="p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-6">Status Distribution</h3>
            <div className="h-[250px] w-full flex items-center justify-center">
              {isEmpty ? (
                <EmptyChartMessage />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.byStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {data.byStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <span className="font-mono text-gray-500">({item.value})</span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Priority Breakdown */}
        <Card className="bg-neutral-900/50 border-white/5">
          <Card.Content className="p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-6">Priority Breakdown</h3>
            <div className="h-[250px] w-full">
              {isEmpty ? (
                <EmptyChartMessage />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byPriority} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fill: '#9ca3af', fontSize: 12 }} 
                      width={60}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      content={<CustomTooltip />} 
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {data.byPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-neutral-900/50 border-white/5">
        <Card.Content className="p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Activity</h3>
          {data.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">No recent activity</div>
          ) : (
            <div className="space-y-4">
              {data.recentActivity.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getStatusColor(issue.status) }} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-200">{issue.title}</span>
                      <span className="text-xs text-gray-500">
                        {issue.assignee?.full_name || 'Unassigned'} • Updated {new Date(issue.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <PriorityBadge priority={issue.priority} />
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="bg-neutral-900/50 border-white/5 shadow-sm">
      <Card.Content className="p-4 flex flex-row items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
        </div>
        <div className="p-3 bg-white/5 rounded-full">
          {icon}
        </div>
      </Card.Content>
    </Card>
  );
}

function EmptyChartMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
      <CircleDashed className="w-8 h-8 mb-2 opacity-50" />
      No data available
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    urgent: 'bg-red-500/10 text-red-500',
    high: 'bg-orange-500/10 text-orange-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    low: 'bg-green-500/10 text-green-500',
    none: 'bg-gray-500/10 text-gray-500',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${colors[priority] || colors.none}`}>
      {priority}
    </span>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    backlog: '#a1a1aa',
    todo: '#fbbf24',
    in_progress: '#3b82f6',
    done: '#22c55e',
    canceled: '#ef4444'
  };
  return colors[status] || '#a1a1aa';
}
