'use client'

import { useState, useMemo } from 'react'
import { Button } from '@heroui/react'
import { Plus, CalendarDays } from 'lucide-react'
import CycleCard from './cycle-card'
import CreateCycleModal from './create-cycle-modal'
import { Tables } from '@/types/supabase'

type Cycle = Tables<'cycles'>
type Issue = Tables<'issues'>

interface CyclesViewProps {
  cycles: Cycle[]
  issues: Issue[]
  workspaceSlug: string
  projectIdentifier: string
  projectId: string
}

export default function CyclesView({ 
  cycles, 
  issues,
  workspaceSlug,
  projectIdentifier,
  projectId
}: CyclesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Memoize o mapeamento de issues por cycle_id para performance
  const issuesByCycle = useMemo(() => {
    const map = new Map<string, Issue[]>()
    
    issues.forEach(issue => {
      if (issue.cycle_id) {
        const existing = map.get(issue.cycle_id) || []
        existing.push(issue)
        map.set(issue.cycle_id, existing)
      }
    })
    
    return map
  }, [issues])
  
  // Empty State
  if (cycles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="p-4 rounded-full bg-primary/10">
            <CalendarDays size={48} className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum Cycle criado
            </h3>
            <p className="text-default-500 text-sm">
              Cycles (Sprints) ajudam a organizar seu trabalho em períodos de tempo definidos. 
              Crie seu primeiro cycle para começar!
            </p>
          </div>
          <Button 
            variant="primary" 
            onPress={() => setIsModalOpen(true)}
          >
            <Plus size={18} className="mr-1.5" />
            Criar Primeiro Cycle
          </Button>
        </div>
        
        {/* Modal de Criação */}
        {isModalOpen && (
          <CreateCycleDialog
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
          <h2 className="text-lg font-semibold text-foreground">Cycles</h2>
          <p className="text-sm text-default-500">
            {cycles.length} {cycles.length === 1 ? 'sprint' : 'sprints'} • {issues.filter(i => i.cycle_id).length} tarefas vinculadas
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="sm"
          onPress={() => setIsModalOpen(true)}
        >
          <Plus size={16} className="mr-1" />
          Novo Cycle
        </Button>
      </div>
      
      {/* Grid de Cycles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cycles.map(cycle => (
          <CycleCard
            key={cycle.id}
            cycle={cycle}
            cycleIssues={issuesByCycle.get(cycle.id) || []}
          />
        ))}
      </div>
      
      {/* Modal de Criação */}
      {isModalOpen && (
        <CreateCycleDialog
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

// Componente interno para o Dialog (evita importar tudo do modal)
import { useActionState } from 'react'
import {
  Modal,
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
                    <h2 className="text-xl font-semibold">Criar Novo Cycle</h2>
                    <p className="text-sm text-default-500">Defina o período do sprint</p>
                </Modal.Header>
                
                <Modal.Body className="flex flex-col gap-4 p-0">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Nome</Label>
                        <Input
                            name="name"
                            placeholder="ex: Sprint 34 - Black Friday"
                            className="w-full"
                        />
                         {state.errors?.name && (
                            <p className="text-xs text-danger">{state.errors.name.join(', ')}</p>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                           <Label className="text-sm font-medium">Data de Início</Label>
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
                           <Label className="text-sm font-medium">Data de Fim</Label>
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
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" isPending={isPending}>
                        Criar Cycle
                    </Button>
                </Modal.Footer>
            </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}
