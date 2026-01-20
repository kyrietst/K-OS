'use client'

import { useActionState, useState, useEffect } from 'react'
import { createProject, ActionState } from '@/app/dashboard/actions'
import {
  Modal,
  Button,
  Input,
} from "@heroui/react"
import { Plus } from 'lucide-react'

export interface CreateProjectModalProps {
    workspaceId: string
}

const initialState: ActionState = {
  message: '',
  errors: {}
}

export default function CreateProjectModal({ workspaceId }: CreateProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createProject, initialState)
  const [projectName, setProjectName] = useState('')
  const [identifier, setIdentifier] = useState('')

  // Auto-generate identifier from name (max 3 chars, uppercase)
  useEffect(() => {
    if (!projectName) return
    const id = projectName
        .replace(/[^a-zA-Z]/g, '')
        .slice(0, 3)
        .toUpperCase()
    setIdentifier(id)
  }, [projectName])

  // Close modal on success (simple check for 'success' message or no errors if we enhanced ActionState)
  useEffect(() => {
     if (state.message === 'success') {
         setProjectName('')
         setIdentifier('')
         setIsOpen(false)
     }
  }, [state.message])

  return (
    <>
      <Button onPress={() => setIsOpen(true)} variant="primary">
        <Plus size={16} />
        New Project
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop />
        <Modal.Container placement="center" className="fixed inset-0 z-50 flex items-center justify-center">
          <Modal.Dialog>
            <Modal.Header className="flex flex-col gap-1">Create New Project</Modal.Header>
            <Modal.Body>
              <form action={formAction} id="create-project-form">
                  <input type="hidden" name="workspace_id" value={workspaceId} />
                  <p className="text-sm text-default-500 mb-2">
                      Create a new project to track specific tasks.
                  </p>
                  <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium" htmlFor="name">Project Name</label>
                          <Input
                            autoFocus
                            name="name"
                            id="name"
                            placeholder="Website Redesign"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="border border-default-200 rounded-md px-3 py-2"
                          />
                           {state.errors?.name && (
                              <p className="text-tiny text-danger">{state.errors.name.join(', ')}</p>
                          )}
                      </div>

                       <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium" htmlFor="identifier">Identifier (ID)</label>
                          <Input
                            name="identifier"
                            id="identifier"
                            placeholder="WEB"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                            className="border border-default-200 rounded-md px-3 py-2"
                            maxLength={3}
                          />
                          <p className="text-tiny text-default-400">Used for issue IDs (e.g., WEB-12)</p>
                      </div>
                  </div>
                  {state.message && state.message !== 'success' && (
                      <p className="text-tiny text-danger mt-2">{state.message}</p>
                  )}
              </form>
            </Modal.Body>
            <Modal.Footer>
               <Button variant="danger" onPress={() => setIsOpen(false)}>
                  Cancel
               </Button>
               <Button variant="primary" type="submit" form="create-project-form" isPending={isPending}>
                  Create Project
               </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </>
  )
}
