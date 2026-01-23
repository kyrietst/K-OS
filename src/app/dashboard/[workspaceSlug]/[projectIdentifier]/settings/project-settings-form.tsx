'use client'

import { useState, useActionState } from 'react'
import { Card, Button, Input, Label, TextArea, Modal, Avatar } from '@heroui/react'
import { Save, Trash2, Users, Settings, AlertTriangle } from 'lucide-react'
import { updateProject, deleteProject, ActionState } from '@/app/dashboard/actions'
import { Tables } from '@/types/supabase'

type Project = Tables<'projects'>
type Profile = Tables<'profiles'>

interface Member {
  role: string | null
  created_at: string
  user_id: string
  profiles: Profile | null
}

interface ProjectSettingsFormProps {
  project: Project
  workspace: { id: string; name: string }
  members: Member[]
  workspaceSlug: string
  projectIdentifier: string
}

const initialState: ActionState = {
  message: '',
  errors: {}
}

export default function ProjectSettingsForm({
  project,
  workspace,
  members,
  workspaceSlug,
  projectIdentifier
}: ProjectSettingsFormProps) {
  const [updateState, updateAction, isUpdating] = useActionState(updateProject, initialState)
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteProject, initialState)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const isConfirmValid = confirmText.toUpperCase() === project.identifier.toUpperCase()

  return (
    <div className="space-y-6">
      {/* General Settings Card */}
      <Card className="bg-content1/50 backdrop-blur-md border border-white/5">
        <Card.Header className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings size={20} className="text-primary" />
            </div>
            <div>
              <Card.Title className="text-lg">General Settings</Card.Title>
              <Card.Description>Update your project name and description</Card.Description>
            </div>
          </div>
        </Card.Header>
        
        <Card.Content>
          <form action={updateAction} className="space-y-4">
            <input type="hidden" name="project_id" value={project.id} />
            <input type="hidden" name="workspace_slug" value={workspaceSlug} />
            <input type="hidden" name="project_identifier" value={projectIdentifier} />
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Project Name</Label>
              <Input 
                name="name" 
                defaultValue={project.name}
                placeholder="My Project"
                className="max-w-md"
              />
              {updateState.errors?.name && (
                <p className="text-xs text-danger">{updateState.errors.name.join(', ')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Project Identifier</Label>
              <div className="flex items-center gap-2 max-w-md">
                <div className="px-3 py-2 rounded-lg bg-default-100 text-default-500 font-mono text-sm">
                  {project.identifier}
                </div>
                <span className="text-xs text-default-400">Cannot be changed</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <TextArea 
                name="description" 
                defaultValue={project.description || ''}
                placeholder="Describe your project..."
                rows={3}
                className="max-w-md"
              />
            </div>

            {updateState.message && updateState.message !== 'success' && (
              <p className="text-sm text-danger">{updateState.message}</p>
            )}
            
            {updateState.message === 'success' && (
              <p className="text-sm text-success">Project updated successfully!</p>
            )}

            <Button type="submit" variant="primary" isPending={isUpdating}>
              <Save size={16} className="mr-1.5" />
              Save Changes
            </Button>
          </form>
        </Card.Content>
      </Card>

      {/* Members Card */}
      <Card className="bg-content1/50 backdrop-blur-md border border-white/5">
        <Card.Header className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Users size={20} className="text-secondary" />
            </div>
            <div>
              <Card.Title className="text-lg">Team Members</Card.Title>
              <Card.Description>Members with access to this project</Card.Description>
            </div>
          </div>
        </Card.Header>
        
        <Card.Content>
          <div className="space-y-3">
            {members.map((member) => (
              <div 
                key={member.user_id}
                className="flex items-center justify-between p-3 rounded-lg bg-content2/30 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    {member.profiles?.avatar_url && (
                      <Avatar.Image 
                        src={member.profiles.avatar_url}
                        alt={member.profiles?.full_name || 'User avatar'}
                      />
                    )}
                    <Avatar.Fallback>
                      {(member.profiles?.full_name?.charAt(0) || member.profiles?.email?.charAt(0) || 'U').toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {member.profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-default-500">
                      {member.profiles?.email}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.role === 'admin' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-default-100 text-default-500'
                }`}>
                  {member.role === 'admin' ? 'Admin' : 'Member'}
                </div>
              </div>
            ))}
            
            {members.length === 0 && (
              <p className="text-sm text-default-500 text-center py-4">
                No members found
              </p>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Danger Zone Card */}
      <Card className="bg-content1/50 backdrop-blur-md border border-danger/30">
        <Card.Header className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-danger/10">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <div>
              <Card.Title className="text-lg text-danger">Danger Zone</Card.Title>
              <Card.Description>Irreversible actions</Card.Description>
            </div>
          </div>
        </Card.Header>
        
        <Card.Content>
          <div className="p-4 rounded-lg bg-danger/5 border border-danger/20 space-y-3">
            <div>
              <h4 className="font-semibold text-foreground">Delete Project</h4>
              <p className="text-sm text-default-500">
                Once you delete a project, there is no going back. All issues, cycles, and modules will be permanently deleted.
              </p>
            </div>
            <Button 
              variant="danger" 
              onPress={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 size={16} className="mr-1.5" />
              Delete Project
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onOpenChange={(open) => !open && setIsDeleteModalOpen(false)}>
        <Modal.Backdrop />
        <Modal.Container className="fixed inset-0 z-50 flex items-center justify-center">
          <Modal.Dialog className="sm:max-w-md w-full bg-background border border-danger/30 rounded-xl shadow-lg p-6">
            <form action={deleteAction}>
              <input type="hidden" name="project_id" value={project.id} />
              <input type="hidden" name="workspace_slug" value={workspaceSlug} />
              <input type="hidden" name="project_identifier" value={project.identifier} />
              <input type="hidden" name="confirmation" value={confirmText} />

              <Modal.Header className="flex flex-col gap-1 p-0 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-danger/10">
                    <AlertTriangle size={24} className="text-danger" />
                  </div>
                  <h2 className="text-xl font-semibold text-danger">Delete {project.name}?</h2>
                </div>
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-4 p-0">
                <p className="text-sm text-default-500">
                  This action cannot be undone. This will permanently delete the project <strong className="text-foreground">{project.name}</strong> and all of its data including issues, cycles, and modules.
                </p>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Type <strong className="font-mono text-danger">{project.identifier}</strong> to confirm:
                  </Label>
                  <Input 
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={project.identifier}
                    className="font-mono"
                  />
                </div>

                {deleteState.message && deleteState.message !== 'success' && (
                  <p className="text-sm text-danger">{deleteState.message}</p>
                )}
              </Modal.Body>

              <Modal.Footer className="flex justify-end gap-2 p-0 pt-4">
                <Button 
                  variant="ghost" 
                  onPress={() => {
                    setIsDeleteModalOpen(false)
                    setConfirmText('')
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="danger" 
                  isDisabled={!isConfirmValid}
                  isPending={isDeleting}
                >
                  <Trash2 size={16} className="mr-1.5" />
                  Delete Project
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </div>
  )
}
