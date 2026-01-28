'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateIssueDetails, deleteIssue, ActionState } from '@/app/dashboard/actions'
import {
  Modal,
  Button,
  Input,
  Select,
  Label,
  ListBox,
  Chip,
  Switch,
  Slider,
  Accordion,
  TextField
} from "@heroui/react"
import { Database } from '@/types/supabase'
import dynamic from 'next/dynamic'
import { Settings } from 'lucide-react'

const RichTextEditor = dynamic(() => import('@/components/ui/rich-editor'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-default-100 rounded-medium" />
})

type Issue = Database['public']['Tables']['issues']['Row'] & {
    assignee?: {
        id: string
        full_name: string | null
        email: string
    } | null
}

interface IssueDetailsModalProps {
  issue: Issue | null
  isOpen: boolean
  workspaceSlug: string
  projectIdentifier: string
  profiles: any[]
  cycles: any[]
  modules?: any[]
}

const initialState: ActionState = {
  message: '',
  errors: {}
}

export default function IssueDetailsModal({ 
  issue, 
  isOpen, 
  workspaceSlug, 
  projectIdentifier,
  profiles,
  cycles = [],
  modules = [],
  isReadOnly = false // Default to false
}: IssueDetailsModalProps & { cycles?: any[], modules?: any[], isReadOnly?: boolean }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateIssueDetails, initialState)
  const [deletePending, setDeletePending] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Local state for agency controls
  const [techScore, setTechScore] = useState(issue?.technical_effort_score || 1);
  const [clientVisible, setClientVisible] = useState(!!issue?.client_visible);

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // New State for AI and Editor
  const [title, setTitle] = useState(issue?.title || '')
  // Handle case where issue.description is null or not in expected format
  const description = issue?.description && typeof issue.description === 'object' && 'content' in issue.description 
    ? (issue.description as any).content 
    : ''
  const [localDescription, setLocalDescription] = useState(description)

  const handleClose = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('issueId')
    router.push(url.pathname + url.search)
  }

  const handleDelete = async () => {
    if (!issue || isReadOnly) return
    if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) return
    
    setDeletePending(true)
    try {
      const result = await deleteIssue(workspaceSlug, projectIdentifier, issue.id)
      if (result.message !== 'success') {
          console.error('Delete failed:', result.message)
          alert(result.message)
          setDeletePending(false)
          return
      }
      handleClose()
    } catch (error) {
      console.error(error)
      alert('Failed to delete issue')
    } finally {
      setDeletePending(false)
    }
  }

  if (!issue || !mounted) return null

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Modal.Backdrop />
      <Modal.Container className="fixed inset-0 z-50 flex items-center justify-center">
        <Modal.Dialog className="sm:max-w-4xl w-full">
            <form action={!isReadOnly ? formAction : undefined} className="contents">
                <input type="hidden" name="issue_id" value={issue.id} />
                <input type="hidden" name="project_identifier" value={projectIdentifier} />
                <input type="hidden" name="workspace_slug" value={workspaceSlug} />
                <input type="hidden" name="description" value={localDescription} />
                
                {/* Hidden fields for agency controls */}
                <input type="hidden" name="technical_effort_score" value={techScore} />
                {clientVisible && <input type="hidden" name="client_visible" value="on" />}

                <Modal.Header className="flex flex-row justify-between items-center pr-10">
                    <span className="font-mono text-default-400 text-sm">
                        {projectIdentifier}-{issue.sequence_id}
                    </span>
                    <div className="flex gap-2">
                        <Chip className="capitalize">
                            {issue.status}
                        </Chip>
                    </div>
                </Modal.Header>
                
                <Modal.Body className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Main Content */}
                    <div className="md:col-span-2 flex flex-col gap-4">
                        <TextField name="title" aria-label="Issue Title" isReadOnly={isReadOnly}>
                            <Input
                                defaultValue={issue.title}
                                onChange={(e) => !isReadOnly && setTitle(e.target.value)}
                                placeholder="Issue Title"
                                className="font-semibold text-xl border-b-2 border-default-200 focus:border-primary outline-none px-0 py-2 w-full bg-transparent"
                                readOnly={isReadOnly}
                            />
                        </TextField>
                        
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-medium text-default-500">Description</Label>
                            {isReadOnly ? (
                                <div className="prose prose-sm max-w-none text-default-700 bg-default-50 p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: localDescription }} />
                            ) : (
                                <RichTextEditor 
                                    content={localDescription} 
                                    onChange={setLocalDescription}
                                    issueTitle={title || issue?.title || 'Tarefa sem título'}
                                />
                            )}
                        </div>

                         {state.message && (
                            <p className="text-sm text-danger">{state.message}</p>
                        )}
                         {state.errors?.name && (
                            <p className="text-sm text-danger">{state.errors.name.join(', ')}</p>
                        )}
                    </div>

                    {/* Right Column: Meta */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Select 
                                name="status" 
                                defaultSelectedKey={issue.status || 'backlog'}
                                isDisabled={isReadOnly}
                            >
                                <Label>Status</Label>
                                <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        <ListBox.Item id="backlog" textValue="Backlog">Backlog</ListBox.Item>
                                        <ListBox.Item id="todo" textValue="Todo">Todo</ListBox.Item>
                                        <ListBox.Item id="in-progress" textValue="In Progress">In Progress</ListBox.Item>
                                        <ListBox.Item id="done" textValue="Done">Done</ListBox.Item>
                                        <ListBox.Item id="canceled" textValue="Canceled">Canceled</ListBox.Item>
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Select 
                                name="priority" 
                                defaultSelectedKey={issue.priority || 'none'}
                                isDisabled={isReadOnly}
                            >
                                <Label>Priority</Label>
                                <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        <ListBox.Item id="urgent" textValue="Urgent" className="text-danger">Urgent</ListBox.Item>
                                        <ListBox.Item id="high" textValue="High" className="text-warning">High</ListBox.Item>
                                        <ListBox.Item id="medium" textValue="Medium" className="text-primary">Medium</ListBox.Item>
                                        <ListBox.Item id="low" textValue="Low" className="text-success">Low</ListBox.Item>
                                        <ListBox.Item id="none" textValue="None" className="text-default-500">None</ListBox.Item>
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        </div>

                        {!isReadOnly && (
                        <div className="flex flex-col gap-1.5">
                            <Select 
                                name="assignee_id" 
                                defaultSelectedKey={issue.assignee_id || 'unassigned'}
                            >
                                <Label>Assignee</Label>
                                <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        <ListBox.Item id="unassigned" textValue="Unassigned">Unassigned</ListBox.Item>
                                        {profiles.map(profile => (
                                            <ListBox.Item key={profile.id} id={profile.id} textValue={profile.full_name || profile.email || 'User'}>
                                                <div className="flex items-center gap-2">
                                                    <span>{profile.full_name || profile.email}</span>
                                                </div>
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        </div>
                        )}

                        {!isReadOnly && (
                        <div className="flex flex-col gap-1.5">
                            <Select 
                                name="cycle_id" 
                                defaultSelectedKey={issue.cycle_id || 'none'}
                            >
                                <Label>Cycle</Label>
                                <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        <ListBox.Item id="none" textValue="None">None</ListBox.Item>
                                        {cycles.map(cycle => {
                                            const isActive = new Date() >= new Date(cycle.start_date) && new Date() <= new Date(cycle.end_date)
                                            return (
                                                <ListBox.Item key={cycle.id} id={cycle.id} textValue={cycle.name}>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span>{cycle.name}</span>
                                                        {isActive && <Chip size="sm" variant="soft" color="warning">Active</Chip>}
                                                    </div>
                                                </ListBox.Item>
                                            )
                                        })}
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        </div>
                        )}

                        {!isReadOnly && (
                        <div className="flex flex-col gap-1.5">
                            <Select
                                name="module_id"
                                defaultSelectedKey={issue.module_id || 'none'}
                            >
                                <Label>Module</Label>
                                <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        <ListBox.Item id="none" textValue="None">None</ListBox.Item>
                                        {modules.map((module: any) => (
                                            <ListBox.Item key={module.id} id={module.id} textValue={module.name}>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>{module.name}</span>
                                                    {module.status === 'In Progress' && (
                                                        <Chip size="sm" variant="soft" color="accent" className="ml-2 text-[10px] h-5">
                                                            Active
                                                        </Chip>
                                                    )}
                                                </div>
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <TextField name="due_date" isReadOnly={isReadOnly}>
                                <Label>Due Date</Label>
                                <Input type="date" defaultValue={issue.due_date || ''} readOnly={isReadOnly} />
                            </TextField>
                        </div>

                        {/* Agency Controls Accordion - HIDDEN IN READONLY */}
                        {!isReadOnly && (
                        <div className="pt-4 border-t border-default-100">
                             <Accordion className="px-0">
                                <Accordion.Item key="agency-controls">
                                    <Accordion.Trigger>
                                        <div className="flex items-center gap-2">
                                            <Settings className="text-default-400" size={16} />
                                            <span className="text-small font-semibold">Agency Controls</span>
                                        </div>
                                    </Accordion.Trigger>
                                    <Accordion.Panel>
                                    <div className="flex flex-col gap-6 py-2 px-1">
                                         <Switch 
                                            isSelected={clientVisible}
                                            onChange={(e: any) => setClientVisible(e?.target ? e.target.checked : e)}
                                            size="sm"
                                        >
                                            <div className="flex flex-col">
                                                 <span className="text-small text-default-500">Visible to Client</span>
                                            </div>
                                        </Switch>
                                        
                                        <div className="flex flex-col gap-3">
                                            <Slider 
                                                defaultValue={techScore} 
                                                minValue={1} 
                                                maxValue={5} 
                                                step={1}

                                                value={techScore}
                                                onChange={(v) => setTechScore(Array.isArray(v) ? v[0] : v)}
                                            >
                                                <Label className="text-sm font-medium text-default-500">Technical Complexity</Label>
                                                <div className="flex justify-between text-[10px] text-default-400 mt-1">
                                                    <span>Simple</span>
                                                    <span>Complex</span>
                                                </div>
                                                <Slider.Track>
                                                    <Slider.Fill />
                                                    <Slider.Thumb />
                                                </Slider.Track>
                                            </Slider>
                                        </div>
                                    </div>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                        )}
                    </div>
                </Modal.Body>
                
                <Modal.Footer className="justify-between">
                     {!isReadOnly ? (
                     <Button 
                        className="bg-danger text-danger-foreground" 
                        onPress={handleDelete}
                        isDisabled={deletePending || isPending}
                    >
                        {deletePending ? 'Deleting...' : 'Delete Issue'}
                    </Button>
                    ) : (
                        <div /> /* Spacer */
                    )}
                    <div className="flex gap-2">
                        <Button variant="ghost" onPress={handleClose}>
                            {isReadOnly ? 'Close' : 'Cancel'}
                        </Button>
                        {!isReadOnly && (
                            <Button className="bg-primary text-white" type="submit" isPending={isPending}>
                                Save Changes
                            </Button>
                        )}
                    </div>
                </Modal.Footer>
            </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}
