'use client'

import { useState, useMemo } from 'react'
import { useActionState } from 'react'
import { Button, Modal, Input, Label, TextArea } from '@heroui/react'
import { Plus, Layers } from 'lucide-react'
import ModuleCard from './module-card'
import { createModule, ActionState } from '@/app/dashboard/actions'
import { Tables } from '@/types/supabase'

type Module = Tables<'modules'>
type Issue = Tables<'issues'>

interface ModulesViewProps {
  modules: Module[]
  issues: Issue[]
  workspaceSlug: string
  projectIdentifier: string
  projectId: string
}

export default function ModulesView({ 
  modules, 
  issues,
  workspaceSlug,
  projectIdentifier,
  projectId
}: ModulesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Memoize o mapeamento de issues por module_id para performance
  const issuesByModule = useMemo(() => {
    const map = new Map<string, Issue[]>()
    
    issues.forEach(issue => {
      if (issue.module_id) {
        const existing = map.get(issue.module_id) || []
        existing.push(issue)
        map.set(issue.module_id, existing)
      }
    })
    
    return map
  }, [issues])
  
  // Empty State
  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="p-4 rounded-full bg-primary/10">
            <Layers size={48} className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum Module criado
            </h3>
            <p className="text-default-500 text-sm">
              Modules (Epics) representam grandes entregas ou funcionalidades. 
              Use-os para agrupar tarefas relacionadas e acompanhar o progresso de iniciativas maiores.
            </p>
          </div>
          <Button 
            variant="primary" 
            onPress={() => setIsModalOpen(true)}
          >
            <Plus size={18} className="mr-1.5" />
            Criar Primeiro Module
          </Button>
        </div>
        
        {/* Modal de Criação */}
        {isModalOpen && (
          <CreateModuleDialog
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            workspaceSlug={workspaceSlug}
            projectIdentifier={projectIdentifier}
            projectId={projectId}
          />
        )}
      </div>
    )
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header da View */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Modules</h2>
          <p className="text-sm text-default-500">
            {modules.length} {modules.length === 1 ? 'epic' : 'epics'} • {issues.filter(i => i.module_id).length} tarefas vinculadas
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="sm"
          onPress={() => setIsModalOpen(true)}
        >
          <Plus size={16} className="mr-1" />
          Novo Module
        </Button>
      </div>
      
      {/* Grid de Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(module => (
          <ModuleCard
            key={module.id}
            module={module}
            moduleIssues={issuesByModule.get(module.id) || []}
          />
        ))}
      </div>
      
      {/* Modal de Criação */}
      {isModalOpen && (
        <CreateModuleDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workspaceSlug={workspaceSlug}
          projectIdentifier={projectIdentifier}
          projectId={projectId}
        />
      )}
    </div>
  )
}

// ============================================
// Dialog de Criação (com fix do bug do Select)
// ============================================

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
  const [selectedStatus, setSelectedStatus] = useState('backlog')

  const statusOptions = [
    { key: 'backlog', label: 'Backlog' },
    { key: 'planned', label: 'Planejado' },
    { key: 'in-progress', label: 'Em Progresso' },
    { key: 'paused', label: 'Pausado' },
    { key: 'completed', label: 'Concluído' },
    { key: 'canceled', label: 'Cancelado' }
  ]

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
                {/* Input hidden para o status - FIX DO BUG */}
                <input type="hidden" name="status" value={selectedStatus} />

                <Modal.Header className="flex flex-col gap-1 p-0 pb-2">
                    <h2 className="text-xl font-semibold">Criar Novo Module</h2>
                    <p className="text-sm text-default-500">Defina um épico ou grande entrega</p>
                </Modal.Header>
                
                <Modal.Body className="flex flex-col gap-4 p-0">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Nome</Label>
                        <Input
                            name="name"
                            placeholder="ex: Lançamento Q1"
                            className="w-full"
                        />
                         {state.errors?.name && (
                            <p className="text-xs text-danger">{state.errors.name.join(', ')}</p>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => setSelectedStatus(option.key)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                selectedStatus === option.key
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-default-100 text-default-700 border-default-200 hover:bg-default-200'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                           <Label className="text-sm font-medium">Data de Início</Label>
                           <input 
                                type="date" 
                                name="start_date"
                                className="h-10 w-full rounded-medium border border-default-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-default-400"
                           />
                        </div>
                        <div className="flex flex-col gap-2">
                           <Label className="text-sm font-medium">Data Alvo</Label>
                           <input 
                                type="date" 
                                name="target_date"
                                className="h-10 w-full rounded-medium border border-default-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-default-400"
                           />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Descrição</Label>
                        <TextArea 
                            name="description" 
                            placeholder="Descreva os objetivos deste module..."
                            rows={3}
                        />
                    </div>

                    {state.message && (
                        <p className="text-sm text-danger">{state.message}</p>
                    )}
                </Modal.Body>
                
                <Modal.Footer className="flex justify-end gap-2 p-0 pt-4">
                    <Button variant="ghost" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" isPending={isPending}>
                        Criar Module
                    </Button>
                </Modal.Footer>
            </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}
