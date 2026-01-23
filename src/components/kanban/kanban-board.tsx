'use client'

import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable
} from '@dnd-kit/core'
import { ScrollShadow } from "@heroui/react"
import { updateIssueStatus } from '@/app/dashboard/actions'
import KanbanCard from './kanban-card'
import { toast } from 'sonner'
import { useIssuesRealtime, IssueWithAssignee } from '@/hooks/use-issues-realtime'

const COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
  { id: 'canceled', title: 'Canceled' },
]

function KanbanColumn({ id, title, issues, projectIdentifier }: { id: string, title: string, issues: IssueWithAssignee[], projectIdentifier: string }) {
  const { setNodeRef } = useDroppable({
    id: id,
  })

  return (
    <div ref={setNodeRef} className="flex flex-col w-80 shrink-0 gap-3 h-full">
       <div className="flex items-center justify-between px-1">
           <h3 className="font-medium text-small text-default-500 uppercase tracking-wider flex items-center gap-2">
                {title}
                <span className="flex items-center justify-center h-5 min-w-5 px-1.5 text-[10px] font-bold bg-content2 text-default-600 rounded-full">
                    {issues.length}
                </span>
           </h3>
       </div>
       
       <div className="flex-1 bg-content2/20 rounded-xl p-2 h-full overflow-hidden border border-white/5">
            <ScrollShadow className="w-full h-full p-2 -m-2">
                <div className="flex flex-col gap-3 pb-4">
                    {issues.map(issue => (
                        <KanbanCard key={issue.id} issue={issue} projectIdentifier={projectIdentifier} />
                    ))}
                    {issues.length === 0 && (
                        <div className="h-32 flex items-center justify-center text-default-400 text-xs italic border-2 border-dashed border-default-100 rounded-lg">
                            Empty
                        </div>
                    )}
                </div>
            </ScrollShadow>
       </div>
    </div>
  )
}

interface KanbanBoardProps {
    initialIssues: IssueWithAssignee[]
    workspaceSlug: string
    projectIdentifier: string
    projectId: string
}

export default function KanbanBoard({ initialIssues, workspaceSlug, projectIdentifier, projectId }: KanbanBoardProps) {
    // Use Realtime-enabled hook instead of plain useState
    const { issues, optimisticUpdate, rollback } = useIssuesRealtime({
        initialIssues,
        projectId,
    })

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
        
        // Optimistic update via hook
        optimisticUpdate(issueId, { status: newStatus })

        try {
            const result = await updateIssueStatus(issueId, newStatus, workspaceSlug, projectIdentifier)
            if (result.message === 'success') {
                toast.success(`Moved to ${newStatus.replace('-', ' ')}`)
            } else {
                // Rollback on failure
                rollback(issueId, { status: oldStatus })
                toast.error('Failed to move card')
            }
        } catch (e) {
            // Rollback on error
            rollback(issueId, { status: oldStatus })
            toast.error('Failed to move card')
            console.error(e)
        }
    }

    const getIssuesByStatus = (status: string) => {
        return issues.filter(i => (i.status || 'backlog') === status)
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4 px-2">
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

