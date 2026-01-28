'use client'

import { useDraggable } from '@dnd-kit/core'
import { Card, CardHeader, CardFooter, Chip, Avatar } from "@heroui/react"
import { Calendar, MoreHorizontal } from "lucide-react"

// Interface alinhada com seus dados
interface KanbanCardProps {
  issue: {
    id: string
    title: string
    sequence_id: number | null
    priority: "urgent" | "high" | "medium" | "low" | "none" | null
    due_date?: string | null
    assignee?: {
      full_name: string | null
      email: string
    } | null
  }
  projectIdentifier: string
}

const priorityColorMap: Record<string, "danger" | "warning" | "accent" | "success" | "default"> = {
  urgent: "danger",
  high: "warning",
  medium: "accent",
  low: "default",
  none: "default"
}

export default function KanbanCard({ issue, projectIdentifier }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none mb-3">
      <Card 
        className={`w-full border-small border-white/5 bg-content1/60 backdrop-blur-md shadow-sm transition-all hover:bg-content1/80 hover:border-white/10 ${isDragging ? 'opacity-50 rotate-2' : ''}`}
        // radius="lg" // radius is also likely deprecated or different, but 'isPressable' definitely errored. Removing isPressable. 
      >
        <CardHeader className="justify-between items-start pb-0 pt-3 px-3">
            <span className="font-mono text-[10px] text-default-400 uppercase tracking-wider">
                {projectIdentifier}-{issue.sequence_id}
            </span>
            <button className="text-default-400 hover:text-default-200 transition-colors">
                <MoreHorizontal size={14} />
            </button>
        </CardHeader>
        
        <div className="px-3 py-2">
            <h4 className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                {issue.title}
            </h4>
        </div>

        <CardFooter className="gap-2 pt-0 pb-3 px-3 justify-between items-center">
             <div className="flex items-center gap-2">
                 <Chip 
                    size="sm" 
                    variant="soft" 
                    color={priorityColorMap[issue.priority || 'none']}
                    className="border-0 pl-0 gap-1"
                 >
                    <span className="font-medium text-[10px] text-default-500">{issue.priority || 'none'}</span>
                 </Chip>
                 {issue.due_date && (
                    <div className="flex items-center gap-1 text-[10px] text-default-400">
                        <Calendar size={10} />
                        <span>{new Date(issue.due_date).toLocaleDateString()}</span>
                    </div>
                 )}
             </div>
             
             {issue.assignee ? (
                <Avatar size="sm" className="size-5">
                    <Avatar.Image src="" alt="Assignee" />
                    <Avatar.Fallback className="text-[9px]">
                        {issue.assignee.full_name?.[0] || issue.assignee.email?.charAt(0)}
                    </Avatar.Fallback>
                </Avatar>
             ) : (
                 <div className="w-5 h-5 rounded-full border border-dashed border-default-300 flex items-center justify-center">
                    <span className="text-[8px] text-default-400">?</span>
                 </div>
             )}
        </CardFooter>
      </Card>
    </div>
  )
}
