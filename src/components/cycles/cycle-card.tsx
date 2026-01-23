'use client'

import { Card } from '@heroui/react'
import { Calendar, Target, CheckCircle2 } from 'lucide-react'
import { Tables } from '@/types/supabase'

type Cycle = Tables<'cycles'>
type Issue = Tables<'issues'>

interface CycleCardProps {
  cycle: Cycle
  cycleIssues: Issue[]
}

/**
 * Determina o status do ciclo baseado nas datas
 */
function getCycleStatus(startDate: string | null, endDate: string | null): 'past' | 'active' | 'future' {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  if (!startDate || !endDate) return 'future'
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (now > end) return 'past'
  if (now >= start && now <= end) return 'active'
  return 'future'
}

/**
 * Formata datas no estilo "Jan 15 - Jan 29"
 */
function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return 'Datas não definidas'
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const start = new Date(startDate).toLocaleDateString('pt-BR', options)
  const end = new Date(endDate).toLocaleDateString('pt-BR', options)
  
  return `${start} - ${end}`
}

/**
 * Retorna configuração visual baseada no status
 */
function getStatusConfig(status: 'past' | 'active' | 'future') {
  switch (status) {
    case 'active':
      return {
        label: 'Ativo',
        color: 'bg-success',
        textColor: 'text-success',
        bgColor: 'bg-success/10',
        progressColor: 'bg-success'
      }
    case 'past':
      return {
        label: 'Concluído',
        color: 'bg-default-400',
        textColor: 'text-default-500',
        bgColor: 'bg-default-100',
        progressColor: 'bg-default-400'
      }
    case 'future':
      return {
        label: 'Futuro',
        color: 'bg-primary',
        textColor: 'text-primary',
        bgColor: 'bg-primary/10',
        progressColor: 'bg-primary'
      }
  }
}

export default function CycleCard({ cycle, cycleIssues }: CycleCardProps) {
  // Calcular progresso
  const totalIssues = cycleIssues.length
  const doneIssues = cycleIssues.filter(issue => issue.status === 'done').length
  const progress = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0
  
  // Determinar status do ciclo
  const cycleStatus = getCycleStatus(cycle.start_date, cycle.end_date)
  const statusConfig = getStatusConfig(cycleStatus)
  const dateRange = formatDateRange(cycle.start_date, cycle.end_date)
  
  return (
    <Card className="bg-content1/50 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all duration-300">
      <Card.Header className="pb-2">
        <div className="flex items-start justify-between w-full">
          <div className="flex-1">
            <Card.Title className="text-lg font-semibold">{cycle.name}</Card.Title>
            <Card.Description className="flex items-center gap-1.5 mt-1">
              <Calendar size={14} className="text-default-400" />
              <span>{dateRange}</span>
            </Card.Description>
          </div>
          
          {/* Status Badge */}
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
            {statusConfig.label}
          </div>
        </div>
      </Card.Header>
      
      <Card.Content className="pt-2 pb-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-default-500">
              <Target size={14} />
              <span>Progresso</span>
            </div>
            <span className={`font-semibold ${statusConfig.textColor}`}>{progress}%</span>
          </div>
          
          {/* Custom Progress Bar */}
          <div className="h-2 bg-default-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${statusConfig.progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card.Content>
      
      <Card.Footer className="border-t border-white/5 pt-3">
        <div className="flex items-center gap-1.5 text-sm text-default-500">
          <CheckCircle2 size={14} className={doneIssues > 0 ? 'text-success' : ''} />
          <span>
            <span className={`font-medium ${doneIssues > 0 ? 'text-success' : 'text-default-400'}`}>
              {doneIssues}
            </span>
            /{totalIssues} tarefas concluídas
          </span>
        </div>
      </Card.Footer>
    </Card>
  )
}
