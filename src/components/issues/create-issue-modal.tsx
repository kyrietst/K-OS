'use client'

import { useActionState, useState, useEffect } from 'react'
import { createIssue, ActionState } from '@/app/dashboard/actions'
import {
  Modal,
  Button,
  Input,
  TextArea,
  Select,
  Label,
  ListBox,
  Accordion,
  Switch,
  Slider,
  TextField,
  FieldError
} from "@heroui/react"
import { Settings } from "lucide-react"

const initialState: ActionState = {
  message: '',
  errors: {}
}

interface CreateIssueModalProps {
  workspaceId: string
  projectId: string
  workspaceSlug: string
  projectIdentifier: string
}

export function CreateIssueDialog({ 
  isOpen, 
  onOpenChange,
  workspaceId,
  projectId,
  workspaceSlug,
  projectIdentifier
}: CreateIssueModalProps & { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [state, formAction, isPending] = useActionState(createIssue, initialState);
  const [techScore, setTechScore] = useState(1);
  const [clientVisible, setClientVisible] = useState(true);
  
  useEffect(() => {
    if (!isPending && !state.errors && !state.message && isOpen) {
        // success logic handling if needed
    }
  }, [state, isPending, isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop />
      <Modal.Container placement="center" className="fixed inset-0 z-50 flex items-center justify-center">
        <Modal.Dialog className="sm:max-w-xl">
          <Modal.Header className="flex flex-col gap-1">Create New Issue</Modal.Header>
          <Modal.Body>
            <form action={async (formData) => {
                await formAction(formData);
                onOpenChange(false); 
            }} id="create-issue-form">
                <input type="hidden" name="workspace_id" value={workspaceId} />
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="workspace_slug" value={workspaceSlug} />
                <input type="hidden" name="project_identifier" value={projectIdentifier} />
                
                {/* Hidden inputs for non-form components */}
                <input type="hidden" name="technical_effort_score" value={techScore} />
                {clientVisible && <input type="hidden" name="client_visible" value="on" />}

                <div className="flex flex-col gap-4">
                    {/* Title Input */}
                    <div className="flex flex-col gap-2">
                      <TextField 
                        name="title" 
                        isRequired 
                        autoFocus
                        isInvalid={!!state.errors?.name}
                      >
                          <Label className="text-sm font-medium">Title</Label>
                          <Input placeholder="Issue title" />
                          {state.errors?.name && <FieldError>{state.errors.name.join(', ')}</FieldError>}
                      </TextField>
                    </div>

                    {/* Description Textarea */}
                    <div className="flex flex-col gap-2">
                       <TextField name="description">
                           <Label className="text-sm font-medium">Description</Label>
                           <TextArea placeholder="Add a description..." className="min-h-[100px]" />
                       </TextField>
                    </div>

                    {/* Priority Select */}
                    <div className="flex flex-col gap-2">
                      <Select 
                          name="priority"
                          defaultSelectedKey="none"
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

                    {/* Agency Controls */}
                    <Accordion className="px-0">
                      <Accordion.Item key="agency-controls">
                        <Accordion.Trigger>
                            <div className="flex items-center gap-2">
                                <Settings className="text-default-400" size={18} />
                                <span className="text-medium font-medium">Agency Controls</span>
                            </div>
                        </Accordion.Trigger>
                        <Accordion.Panel>
                         <div className="flex flex-col gap-6 py-2">
                            <Switch 
                                isSelected={clientVisible}
                                onChange={(e) => setClientVisible(e)}
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium">Client Visible</span>
                                    <span className="text-tiny text-default-400">Visible to Client in Portal</span>
                                </div>
                            </Switch>
                            
                            <div className="flex flex-col gap-3">
                                <Slider 
                                    defaultValue={1} 
                                    minValue={1} 
                                    maxValue={5} 
                                    step={1}
                                    value={techScore}
                                    onChange={(v) => setTechScore(Array.isArray(v) ? v[0] : v)}
                                >
                                     <Label className="text-sm font-medium text-default-600">Technical Complexity</Label>
                                    <div className="flex justify-between text-tiny text-default-400 mt-1">
                                        <span>Simple (1)</span>
                                        <span>Complex (5)</span>
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

                {state.message && (
                    <p className="text-tiny text-danger mt-2">{state.message}</p>
                )}
            </form>
          </Modal.Body>
          <Modal.Footer>
             <Button variant="secondary" onPress={() => onOpenChange(false)}>
                Cancel
             </Button>
             <Button className="bg-primary text-white" type="submit" form="create-issue-form" isPending={isPending}>
                Create Issue
             </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}

export default function CreateIssueModal(props: CreateIssueModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onPress={() => setIsOpen(true)} className="bg-primary text-white">New Issue</Button>
      <CreateIssueDialog {...props} isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
