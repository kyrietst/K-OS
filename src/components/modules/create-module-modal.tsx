'use client'

import { useActionState, useState } from 'react'
import {
  Modal,
  Button,
  Input,
  Label,
  TextArea,
  Select,
  ListBox
} from "@heroui/react"
import { createModule, ActionState } from '@/app/dashboard/actions'

const initialState: ActionState = {
  message: '',
  errors: {}
}

interface CreateModuleDialogProps {
    isOpen: boolean
    onClose: () => void
    workspaceSlug: string
    projectIdentifier: string
    projectId: string
}

function CreateModuleDialog({ 
  isOpen, 
  onClose,
  workspaceSlug,
  projectIdentifier,
  projectId
}: CreateModuleDialogProps) {
  const [state, formAction, isPending] = useActionState(createModule, initialState)

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop />
      <Modal.Container className="fixed inset-0 z-50 flex items-center justify-center">
        <Modal.Dialog className="sm:max-w-md w-full bg-background border border-default-200 rounded-xl shadow-lg p-6">
            <form action={async (formData) => {
                await formAction(formData)
                onClose()
            }} className="flex flex-col gap-4">
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="project_identifier" value={projectIdentifier} />
                <input type="hidden" name="workspace_slug" value={workspaceSlug} />

                <Modal.Header className="flex flex-col gap-1 p-0 pb-2">
                    <h2 className="text-xl font-semibold">Create Module</h2>
                </Modal.Header>
                
                <Modal.Body className="flex flex-col gap-4 p-0">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Name</Label>
                        <Input
                            name="name"
                            placeholder="e.g. Q1 Marketing Campaign"
                            className="w-full"
                        />
                         {state.errors?.name && (
                            <p className="text-xs text-danger">{state.errors.name.join(', ')}</p>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <Select name="status" defaultSelectedKey="backlog">
                             <Select.Trigger>
                                <Select.Value />
                             </Select.Trigger>
                             <Select.Popover>
                                <ListBox>
                                    <ListBox.Item key="backlog" textValue="Backlog">Backlog</ListBox.Item>
                                    <ListBox.Item key="planned" textValue="Planned">Planned</ListBox.Item>
                                    <ListBox.Item key="in-progress" textValue="In Progress">In Progress</ListBox.Item>
                                    <ListBox.Item key="paused" textValue="Paused">Paused</ListBox.Item>
                                    <ListBox.Item key="completed" textValue="Completed">Completed</ListBox.Item>
                                    <ListBox.Item key="canceled" textValue="Canceled">Canceled</ListBox.Item>
                                </ListBox>
                             </Select.Popover>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                           <Label className="text-sm font-medium">Start Date</Label>
                           <input 
                                type="date" 
                                name="start_date"
                                className="h-10 w-full rounded-medium border border-default-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-default-400"
                           />
                        </div>
                        <div className="flex flex-col gap-2">
                           <Label className="text-sm font-medium">Target Date</Label>
                           <input 
                                type="date" 
                                name="target_date"
                                className="h-10 w-full rounded-medium border border-default-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-default-400"
                           />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Description</Label>
                        <TextArea 
                            name="description" 
                            placeholder="Describe the goals of this module..."
                            rows={3}
                        />
                    </div>

                    {state.message && (
                        <p className="text-sm text-danger">{state.message}</p>
                    )}
                </Modal.Body>
                
                <Modal.Footer className="flex justify-end gap-2 p-0 pt-4">
                    <Button variant="ghost" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isPending={isPending}>
                        Create Module
                    </Button>
                </Modal.Footer>
            </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}

export default function CreateModuleModal(props: Omit<CreateModuleDialogProps, 'isOpen' | 'onClose'>) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <Button onPress={() => setIsOpen(true)} className="bg-default-100 text-default-900 border border-default-200" size="sm">
                Create Module
            </Button>
            <CreateModuleDialog {...props} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
