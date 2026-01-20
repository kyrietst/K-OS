'use client'

import { useActionState, useState } from 'react'
import {
  Modal,
  Button,
  Input,
  Label,
} from "@heroui/react"
import { createCycle, ActionState } from '@/app/dashboard/actions'

const initialState: ActionState = {
  message: '',
  errors: {}
}

interface CreateCycleDialogProps {
    isOpen: boolean
    onClose: () => void
    workspaceSlug: string
    projectIdentifier: string
    projectId: string
}

function CreateCycleDialog({ 
  isOpen, 
  onClose,
  workspaceSlug,
  projectIdentifier,
  projectId
}: CreateCycleDialogProps) {
  const [state, formAction, isPending] = useActionState(createCycle, initialState)

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
                    <h2 className="text-xl font-semibold">Create Sprint</h2>
                </Modal.Header>
                
                <Modal.Body className="flex flex-col gap-4 p-0">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Name</Label>
                        <Input
                            name="name"
                            placeholder="e.g. Sprint 34"
                            className="w-full"
                        />
                         {state.errors?.name && (
                            <p className="text-xs text-danger">{state.errors.name.join(', ')}</p>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                           <Label className="text-sm font-medium">Start Date</Label>
                           <input 
                                type="date" 
                                name="start_date"
                                className="h-10 w-full rounded-medium border border-default-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-default-400"
                           />
                           {state.errors?.startDate && (
                               <p className="text-xs text-danger">{state.errors.startDate.join(', ')}</p>
                           )}
                        </div>
                        <div className="flex flex-col gap-2">
                           <Label className="text-sm font-medium">End Date</Label>
                           <input 
                                type="date" 
                                name="end_date"
                                className="h-10 w-full rounded-medium border border-default-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-default-400"
                           />
                           {state.errors?.endDate && (
                               <p className="text-xs text-danger">{state.errors.endDate.join(', ')}</p>
                           )}
                        </div>
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
                        Create Cycle
                    </Button>
                </Modal.Footer>
            </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}

export default function CreateCycleModal(props: Omit<CreateCycleDialogProps, 'isOpen' | 'onClose'>) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <Button onPress={() => setIsOpen(true)} className="bg-default-100 text-default-900 border border-default-200" size="sm">
                Create Cycle
            </Button>
            <CreateCycleDialog {...props} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
