'use client'

import { useState, useEffect } from 'react'
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable
} from '@dnd-kit/core'
import { updateIssueStatus } from '@/app/dashboard/actions'
import KanbanCard from './kanban-card'
import { Database } from '@/types/supabase'

type Issue = Database['public']['Tables']['issues']['Row'] & {
    assignee?: {
        full_name: string | null
        email: string
    } | null
}

const COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
  { id: 'canceled', title: 'Canceled' },
]

function KanbanColumn({ id, title, issues, projectIdentifier }: { id: string, title: string, issues: Issue[], projectIdentifier: string }) {
  const { setNodeRef } = useDroppable({
    id: id,
  })

  return (
    <div ref={setNodeRef} className="flex flex-col w-80 shrink-0 gap-4">
       <div className="flex items-center justify-between px-2">
           <h3 className="font-semibold text-default-600 flex items-center gap-2">
                {title}
                <span className="text-tiny bg-default-100 px-2 py-0.5 rounded-full text-default-500">
                    {issues.length}
                </span>
           </h3>
       </div>
       <div className="flex flex-col gap-3 h-full min-h-[200px] bg-default-50/50 rounded-lg p-2 border border-dashed border-transparent hover:border-default-200 transition-colors">
            {issues.map(issue => (
                <KanbanCard key={issue.id} issue={issue} projectIdentifier={projectIdentifier} />
            ))}
            {issues.length === 0 && (
                <div className="h-full flex items-center justify-center text-default-300 text-sm italic py-8">
                    Empty
                </div>
            )}
       </div>
    </div>
  )
}

interface KanbanBoardProps {
    initialIssues: Issue[]
    workspaceSlug: string
    projectIdentifier: string
}

export default function KanbanBoard({ initialIssues, workspaceSlug, projectIdentifier }: KanbanBoardProps) {
    const [issues, setIssues] = useState<Issue[]>(initialIssues)

    // Sync state with props when initialIssues changes (server update)
    useEffect(() => {
        setIssues(initialIssues)
    }, [initialIssues])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            }
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        
        if (!over) return

        const issueId = active.id as string
        const newStatus = over.id as string
        const currentIssue = issues.find(i => i.id === issueId)

        if (!currentIssue || currentIssue.status === newStatus) return

        const oldStatus = currentIssue.status
        setIssues(prev => prev.map(issue => 
            issue.id === issueId ? { ...issue, status: newStatus } : issue
        ))

        try {
            const result = await updateIssueStatus(issueId, newStatus, workspaceSlug, projectIdentifier)
            if (result.message !== 'success') {
                 setIssues(prev => prev.map(issue => 
                    issue.id === issueId ? { ...issue, status: oldStatus } : issue
                 ))
                 console.error(result.message)
            }
        } catch (e) {
            setIssues(prev => prev.map(issue => 
                issue.id === issueId ? { ...issue, status: oldStatus } : issue
            ))
            console.error(e)
        }
    }

    const getIssuesByStatus = (status: string) => {
        return issues.filter(i => (i.status || 'backlog') === status)
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-6 overflow-x-auto pb-4">
                {COLUMNS.map(col => (
                    <KanbanColumn 
                        key={col.id} 
                        id={col.id} 
                        title={col.title} 
                        issues={getIssuesByStatus(col.id)} 
                        projectIdentifier={projectIdentifier}
                    />
                ))}
            </div>
        </DndContext>
    )
}
