'use client'

import {
  Chip
} from "@heroui/react"
import { Database } from '@/types/supabase'

type Issue = Database['public']['Tables']['issues']['Row'] & {
    assignee?: {
        full_name: string | null
        email: string
    } | null
}

const statusColorMap: Record<string, "success" | "warning" | "danger" | "default" | "accent"> = {
  done: "success",
  canceled: "danger",
  "in-progress": "accent",
  todo: "default",
  backlog: "warning" // 'secondary' replaced by 'warning' or 'default'
};

const priorityColorMap: Record<string, "success" | "warning" | "danger" | "default" | "accent"> = {
    urgent: "danger",
    high: "warning",
    medium: "accent", // 'primary' replaced by 'accent'
    low: "success",
    none: "default"
}

import { useRouter } from 'next/navigation'

// ... existing code ...

export default function IssueList({ issues, projectIdentifier }: { issues: Issue[], projectIdentifier: string }) {
  const router = useRouter()
  
  if (issues.length === 0) {
      return (
          <div className="w-full border border-dashed border-default-200 rounded-lg p-8 flex flex-col items-center justify-center text-default-400">
              <p>No issues yet.</p>
          </div>
      )
  }

  return (
    <div className="w-full overflow-x-auto border border-default-200 rounded-lg">
        <table className="w-full text-sm text-left">
            <thead className="bg-default-100/50 text-default-500 font-medium uppercase text-xs">
                <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Assignee</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-default-100">
                {issues.map((issue) => (
                    <tr 
                        key={issue.id} 
                        className="hover:bg-default-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`?view=list&issueId=${issue.id}`)}
                    >
                        <td className="px-4 py-3 font-mono text-default-500 text-xs">
                            {projectIdentifier}-{issue.sequence_id}
                        </td>
                        <td className="px-4 py-3 font-medium">
                            {issue.title}
                        </td>
                        <td className="px-4 py-3">
                            <Chip className="capitalize" color={statusColorMap[issue.status || 'backlog']} size="sm" variant="soft">
                                {issue.status || 'Backlog'}
                            </Chip>
                        </td>
                        <td className="px-4 py-3">
                            <Chip className="capitalize" color={priorityColorMap[issue.priority || 'none']} size="sm" variant="soft">
                                {issue.priority || 'None'}
                            </Chip>
                        </td>
                        <td className="px-4 py-3 text-default-500">
                             {(issue as any).assignee?.email || 'Unassigned'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  )
}
