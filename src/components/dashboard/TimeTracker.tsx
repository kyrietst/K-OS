'use client'

import { Card, Button, Input } from "@heroui/react"
import { Play, Square, Timer } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { saveWorklog } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { useParams } from "next/navigation"

export function TimeTracker() {
  const params = useParams()
  const workspaceSlug = params.workspaceSlug as string
  const projectIdentifier = params.projectIdentifier as string // Might be undefined but handled

  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [description, setDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // Use a ref to hold the interval ID so we can clear it reliably
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleStop = async () => {
    setIsRunning(false)
    if (elapsedSeconds < 60) {
      toast.warning("Minimum 1 minute needed to log time.")
      return
    }
    
    // Convert to hours with 2 decimal places using math to ensure number type
    const hours = Math.round((elapsedSeconds / 3600) * 100) / 100
    
    setIsSaving(true)
    try {
      const result = await saveWorklog(
        workspaceSlug, 
        projectIdentifier || null, 
        hours, 
        description || "Worklog manual"
      )

      if (result.message === 'success') {
        toast.success("Time logged successfully!")
        setElapsedSeconds(0)
        setDescription("")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to save worklog.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full shadow-sm border border-default-200">
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-default-100 rounded-md border border-default-200">
            <Timer className="w-4 h-4 text-default-500" />
            <span className="font-mono text-lg font-medium tracking-wider text-default-800">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <Input
            placeholder="O que você está fazendo?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1"
          />

          <div className="flex items-center gap-1">
            {!isRunning ? (
              <Button
                isIconOnly
                size="sm"
                onPress={() => setIsRunning(true)}
                className="w-9 h-9 min-w-9 bg-success text-success-foreground"
              >
                <Play className="w-4 h-4 fill-current" />
              </Button>
            ) : (
              <Button
                isIconOnly
                size="sm"
                variant="danger"
                onPress={handleStop}
                className="w-9 h-9 min-w-9 animate-pulse"
                isPending={isSaving}
              >
                <Square className="w-4 h-4 fill-current" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

