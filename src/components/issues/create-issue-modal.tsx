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
  ListBox
} from "@heroui/react"

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
  
  useEffect(() => {
    if (!isPending && !state.errors && !state.message && isOpen) {
        // success logic handling if needed
    }
  }, [state, isPending, isOpen])

  return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop />
        <Modal.Container placement="center" className="fixed inset-0 z-50 flex items-center justify-center">
          <Modal.Dialog>
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

                  <div className="flex flex-col gap-4">
                      {/* Title Input */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="text-sm font-medium">Title</label>
                        <Input
                            autoFocus
                            name="title"
                            id="title"
                            placeholder="Issue title"
                            required
                            className="border border-default-200 rounded-md px-3 py-2 w-full"
                        />
                         {state.errors?.name && (
                            <p className="text-tiny text-danger">{state.errors.name.join(', ')}</p>
                        )}
                      </div>

                      {/* Description Textarea */}
                      <div className="flex flex-col gap-2">
                         <label htmlFor="description" className="text-sm font-medium">Description</label>
                         <TextArea
                            name="description"
                            id="description"
                            placeholder="Add a description..."
                            className="border border-default-200 rounded-md px-3 py-2 w-full min-h-[100px]"
                         />
                      </div>

                      {/* Priority Select */}
                      <div className="flex flex-col gap-2">
                        <Select 
                            name="priority"
                            className="w-full" 
                            placeholder="Select Priority"
                            defaultSelectedKey="none"
                        >
                            <Label>Priority</Label>
                            <Select.Trigger className="border border-default-200 rounded-md px-3 py-2 w-full flex justify-between items-center text-left">
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
               <Button variant="primary" type="submit" form="create-issue-form" isPending={isPending}>
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
      <Button onPress={() => setIsOpen(true)} variant="primary">New Issue</Button>
      <CreateIssueDialog {...props} isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
