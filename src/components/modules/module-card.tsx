'use client'

import { Card } from '@heroui/react'
import { Calendar, Target, CheckCircle2, FileText } from 'lucide-react'
import { Tables } from '@/types/supabase'

type Module = Tables<'modules'>
type Issue = Tables<'issues'>

interface ModuleCardProps {
  module: Module
  moduleIssues: Issue[]
}

/**
 * Retorna configuração visual baseada no status do módulo
 */
function getStatusConfig(status: string | null) {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-') || 'backlog'
  
  switch (normalizedStatus) {
    case 'in-progress':
      return {
        label: 'Em Progresso',
        color: 'bg-primary',
        textColor: 'text-primary',
        bgColor: 'bg-primary/10'
      }
    case 'done':
    case 'completed':
      return {
        label: 'Concluído',
        color: 'bg-success',
        textColor: 'text-success',
        bgColor: 'bg-success/10'
      }
    case 'canceled':
    case 'cancelled':
      return {
        label: 'Cancelado',
        color: 'bg-danger',
        textColor: 'text-danger',
        bgColor: 'bg-danger/10'
      }
    case 'paused':
      return {
        label: 'Pausado',
        color: 'bg-warning',
        textColor: 'text-warning',
        bgColor: 'bg-warning/10'
      }
    case 'planned':
      return {
        label: 'Planejado',
        color: 'bg-secondary',
        textColor: 'text-secondary',
        bgColor: 'bg-secondary/10'
      }
    case 'backlog':
    default:
      return {
        label: 'Backlog',
        color: 'bg-default-400',
        textColor: 'text-default-500',
        bgColor: 'bg-default-100'
      }
  }
}

/**
 * Formata datas no estilo "Jan 15 → Fev 15"
 */
function formatDateRange(startDate: string | null, targetDate: string | null): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  
  const start = startDate 
    ? new Date(startDate).toLocaleDateString('pt-BR', options)
    : 'Início não definido'
    
  const target = targetDate
    ? new Date(targetDate).toLocaleDateString('pt-BR', options)
    : 'Data alvo não definida'
  
  if (!startDate && !targetDate) return 'Datas não definidas'
  
  return `${start} → ${target}`
}

/**
 * Trunca texto mantendo palavras inteiras
 */
function truncateText(text: string | null, maxLength: number = 100): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

export default function ModuleCard({ module, moduleIssues }: ModuleCardProps) {
  // Calcular progresso
  const totalIssues = moduleIssues.length
  const doneIssues = moduleIssues.filter(issue => issue.status === 'done').length
  const progress = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0
  
  // Configuração de status
  const statusConfig = getStatusConfig(module.status)
  const dateRange = formatDateRange(module.start_date ?? null, module.target_date ?? null)
  const description = truncateText(module.description)
  
  return (
    <Card className="bg-content1/50 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all duration-300">
      <Card.Header className="pb-2">
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 min-w-0">
            <Card.Title className="text-lg font-semibold truncate">{module.name}</Card.Title>
            <Card.Description className="flex items-center gap-1.5 mt-1">
              <Target size={14} className="text-default-400 flex-shrink-0" />
              <span className="truncate">{dateRange}</span>
            </Card.Description>
          </div>
          
          {/* Status Badge */}
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
            {statusConfig.label}
          </div>
        </div>
      </Card.Header>
      
      <Card.Content className="pt-2 pb-4 space-y-3">
        {/* Description */}
        {description && (
          <div className="flex items-start gap-2 text-sm text-default-500">
            <FileText size={14} className="mt-0.5 flex-shrink-0 text-default-400" />
            <p className="line-clamp-2">{description}</p>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-default-500">Progresso</span>
            <span className={`font-semibold ${progress >= 100 ? 'text-success' : statusConfig.textColor}`}>
              {progress}%
            </span>
          </div>
          
          {/* Custom Progress Bar */}
          <div className="h-2 bg-default-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                progress >= 100 ? 'bg-success' : statusConfig.color
              }`}
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
