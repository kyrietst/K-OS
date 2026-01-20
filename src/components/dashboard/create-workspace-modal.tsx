'use client'

import { useActionState, useState } from 'react'
import { createWorkspace, ActionState } from '@/app/dashboard/actions'
import {
  Modal,
  Button,
  Input,
} from "@heroui/react"

const initialState: ActionState = {
  message: '',
  errors: {}
}

export function CreateWorkspaceDialog({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [state, formAction, isPending] = useActionState(createWorkspace, initialState);

  return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop />
        <Modal.Container placement="center" className="fixed inset-0 z-50 flex items-center justify-center">
          <Modal.Dialog>
            <Modal.Header className="flex flex-col gap-1">Create New Workspace</Modal.Header>
            <Modal.Body>
              <form action={formAction} id="create-workspace-form">
                  <p className="text-sm text-default-500 mb-2">
                      Enter a name for your team's workspace.
                  </p>
                  <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium" htmlFor="name">Workspace Name</label>
                      <Input
                        autoFocus
                        name="name"
                        id="name"
                        placeholder="Acme Corp"
                        className="border border-default-200 rounded-md px-3 py-2"
                      />
                      {state.errors?.name && (
                          <p className="text-tiny text-danger">{state.errors.name.join(', ')}</p>
                      )}
                  </div>
                  {state.message && (
                      <p className="text-tiny text-danger">{state.message}</p>
                  )}
              </form>
            </Modal.Body>
            <Modal.Footer>
               <Button variant="danger" onPress={() => onOpenChange(false)}>
                  Cancel
               </Button>
               <Button variant="primary" type="submit" form="create-workspace-form" isPending={isPending}>
                  Create Workspace
               </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
  )
}

export default function CreateWorkspaceModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onPress={() => setIsOpen(true)} variant="primary">Create Workspace</Button>
      <CreateWorkspaceDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
