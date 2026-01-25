'use client'

import { useState, useActionState } from 'react'
import {
  Modal,
  Button,
  Input,
  Select,
  ListBox,
  TextField,
  Label,
  FieldError,
  Spinner
} from "@heroui/react"
import { Mail } from "lucide-react"
import { useFormStatus } from 'react-dom'
import { createInviteAction, ActionState } from '@/app/dashboard/actions'

interface InviteMemberModalProps {
  workspaceId: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const initialState: ActionState & { data?: { inviteLink: string } } = {
  message: '',
  errors: {}
}

export function InviteMemberModal({ workspaceId, isOpen: externalIsOpen, onOpenChange: externalOnOpenChange }: InviteMemberModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  const isControlled = externalIsOpen !== undefined
  const isOpen = isControlled ? externalIsOpen : internalIsOpen
  const onOpenChange = isControlled && externalOnOpenChange ? externalOnOpenChange : setInternalIsOpen

  const [state, formAction, isPending] = useActionState(createInviteAction, initialState)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  if (state?.message === 'success' && state.data?.inviteLink && !inviteLink) {
    setInviteLink(state.data.inviteLink)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setInviteLink(null)
    }
    onOpenChange(open)
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Backdrop />
      <Modal.Container placement="center">
        <Modal.Dialog>
            <Modal.Header className="flex flex-col gap-1">Convidar Membro</Modal.Header>
            <Modal.Body>
              {inviteLink ? (
                <div className="flex flex-col gap-4 py-4">
                  <div className="p-4 bg-success-50 text-success-700 rounded-lg text-sm text-center">
                    Convite criado com sucesso!
                  </div>
                  <p className="text-sm text-default-500">
                    Compartilhe este link com o usuário. Ele tem validade de 7 dias.
                  </p>
                  <div className="w-full bg-default-100 p-3 rounded-md font-mono text-sm break-all text-primary">
                    {inviteLink}
                  </div>
                </div>
              ) : (
                <form id="invite-form" action={formAction} className="flex flex-col gap-4">
                  <input type="hidden" name="workspace_id" value={workspaceId} />
                  
                  <TextField 
                    name="email"
                    type="email"
                    isInvalid={!!state?.errors?.email}
                    autoFocus
                  >
                        <Label>Email</Label>
                        <Input placeholder="email@exemplo.com" />
                        {state?.errors?.email && <FieldError>{state.errors.email[0]}</FieldError>}
                  </TextField>

                  <Select
                    name="role"
                    defaultSelectedKey="member"
                    isInvalid={!!state?.errors?.role}
                  >
                    <Label>Função (Role)</Label>
                    <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                        <ListBox>
                            <ListBox.Item id="member" textValue="Membro">Membro (Padrão)</ListBox.Item>
                            <ListBox.Item id="admin" textValue="Admin">Admin (Acesso Total)</ListBox.Item>
                            <ListBox.Item id="client" textValue="Cliente">Cliente (Limitado)</ListBox.Item>
                        </ListBox>
                    </Select.Popover>
                    {state?.errors?.role && <FieldError>{state.errors.role[0]}</FieldError>}
                  </Select>

                  {state?.message && state.message !== 'success' && (
                      <div className="text-danger text-sm">{state.message}</div>
                  )}
                </form>
              )}
            </Modal.Body>
            <Modal.Footer>
              {inviteLink ? (
                <Button onPress={() => handleOpenChange(false)} className="bg-primary text-white">
                  Concluído
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onPress={() => handleOpenChange(false)} className="text-danger">
                    Cancelar
                  </Button>
                  <SubmitButton />
                </>
              )}
            </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" isDisabled={pending} className="bg-primary text-white">
      {pending && <Spinner size="sm" color="current" />}
      {pending ? 'Gerando...' : 'Gerar Convite'}
    </Button>
  )
}
