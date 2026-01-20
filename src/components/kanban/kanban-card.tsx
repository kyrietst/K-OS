'use client'

import { useDraggable } from '@dnd-kit/core'
import { Card, Chip } from "@heroui/react"
import { Database } from '@/types/supabase'

type Issue = Database['public']['Tables']['issues']['Row'] & {
    assignee?: {
        full_name: string | null
        email: string
    } | null
}

const priorityColorMap: Record<string, "success" | "warning" | "danger" | "default" | "accent"> = {
    urgent: "danger",
    high: "warning",
    medium: "accent",
    low: "success",
    none: "default"
}

import { useRouter } from 'next/navigation'

export default function KanbanCard({ issue, projectIdentifier }: { issue: Issue, projectIdentifier: string }) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
    data: { issue }
  })

  // Using translate3d for better performance
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined
  
  const handleClick = () => {
    if (!isDragging) {
        // Use URLSearchParams to preserve other params if needed, or just hardcode view=board
        router.push(`?view=board&issueId=${issue.id}`)
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none" onClick={handleClick}>
       <Card 
            className={`p-3 cursor-grab border border-default-100 hover:border-default-300 transition-all ${isDragging ? 'opacity-50 ring-2 ring-primary rotate-2 z-50 shadow-xl' : 'shadow-sm'}`}
       >
            <div className="flex flex-col gap-2">
                <span className="text-small font-medium line-clamp-2 select-none">{issue.title}</span>
                <div className="flex justify-between items-center">
                    <span className="font-mono text-tiny text-default-400 select-none">
                        {projectIdentifier}-{issue.sequence_id}
                    </span>
                    <Chip 
                        className="capitalize h-5 text-[10px]" 
                        color={priorityColorMap[issue.priority || 'none']} 
                        size="sm" 
                        variant="soft"
                    >
                        {issue.priority || 'None'}
                    </Chip>
                </div>
            </div>
       </Card>
    </div>
  )
}
