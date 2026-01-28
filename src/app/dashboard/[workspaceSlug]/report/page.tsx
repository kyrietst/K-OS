import { createClient } from '@/lib/supabase/server'
import { Button } from "@heroui/react"
import { Printer, ArrowLeft, CheckCircle2, Lock, Mountain, Activity, CalendarCheck } from "lucide-react"
import Link from "next/link"
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    workspaceSlug: string
  }>
}

export default async function ReportPage({ params }: PageProps) {
  const supabase = await createClient()
  const { workspaceSlug } = await params

  // 1. Fetch Workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, slug')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspace) {
    notFound()
  }

  // 2. Fetch Done Issues
  // Assuming 'done' is the status string. Adjust if your system uses different status keys.
  const { data: issues } = await supabase
    .from('issues')
    .select('id, title, description, client_visible, technical_effort_score, updated_at, sequence_id')
    .eq('workspace_id', workspace.id)
    .eq('status', 'done')
    .order('updated_at', { ascending: false })

  const safeIssues = issues || []

  // 3. Logic & Metrics
  const totalDeliverables = safeIssues.length
  const totalTechnicalPoints = safeIssues.reduce((acc, issue) => {
    // Treat null as 1 (default complexity)
    const points = issue.technical_effort_score ?? 1
    return acc + points
  }, 0)

  const icebergRatio = totalDeliverables > 0 ? (totalTechnicalPoints / totalDeliverables).toFixed(1) : "0"

  // Filter highlights (client visible)
  const clientVisibleIssues = safeIssues.filter(i => i.client_visible)
  const internalIssues = safeIssues.filter(i => !i.client_visible)

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans p-8 max-w-5xl mx-auto print:p-0 print:max-w-none">
      {/* HEADER (Screen Only Controls) */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link href={`/dashboard/${workspaceSlug}`}>
          <Button variant="ghost">
            <ArrowLeft size={18} className="mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
        <Button 
          variant="primary"
          onPress={() => typeof window !== 'undefined' && window.print()}
          className="bg-black text-white"
        >
          <Printer size={18} className="mr-2" />
          Imprimir Relatório
        </Button>
      </div>

      {/* REPORT HEADER */}
      <header className="border-b-4 border-black pb-6 mb-12 flex justify-between items-end print:mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">{workspace.name}</h1>
          <p className="text-zinc-500 font-medium tracking-wide">RELATÓRIO DE PERFORMANCE & ENTREGA</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-400 uppercase font-mono mb-1">DATA DE EMISSÃO</p>
          <p className="font-bold text-lg">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </header>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 print:mb-12">
        {/* Card 1: Deliverables */}
        <div className="bg-zinc-50 p-6 border border-zinc-200 rounded-lg print:border-black print:bg-white">
          <div className="flex items-center gap-2 mb-4 text-zinc-500">
            <CheckCircle2 size={20} />
            <span className="font-medium uppercase text-xs tracking-wider">Entregas Realizadas</span>
          </div>
          <div className="text-5xl font-black tracking-tighter">{totalDeliverables}</div>
          <p className="text-sm text-zinc-500 mt-2">Funcionalidades e correções finalizadas</p>
        </div>

        {/* Card 2: Iceberg (Technical Points) */}
        <div className="bg-black text-white p-6 rounded-lg print:bg-white print:text-black print:border-2 print:border-black relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-zinc-400 print:text-zinc-600">
              <Mountain size={20} />
              <span className="font-medium uppercase text-xs tracking-wider">Pontos de Esforço</span>
            </div>
            <div className="text-5xl font-black tracking-tighter">{totalTechnicalPoints}</div>
            <p className="text-sm text-zinc-400 mt-2 print:text-zinc-600">
              Complexidade técnica executada ("Iceberg")
            </p>
          </div>
          {/* Decorative background element for screen */}
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 print:hidden">
            <Mountain size={120} />
          </div>
        </div>

        {/* Card 3: Status/Impact */}
        <div className="bg-zinc-50 p-6 border border-zinc-200 rounded-lg print:border-black print:bg-white">
          <div className="flex items-center gap-2 mb-4 text-zinc-500">
            <Activity size={20} />
            <span className="font-medium uppercase text-xs tracking-wider">Densidade Técnica</span>
          </div>
          <div className="text-5xl font-black tracking-tighter">{icebergRatio}x</div>
          <p className="text-sm text-zinc-500 mt-2">Média de esforço por entrega visível</p>
        </div>
      </div>

      {/* TIMELINE OF DELIVERABLES */}
      <section>
        <h2 className="text-2xl font-bold mb-8 uppercase tracking-wide flex items-center gap-3">
          <CalendarCheck className="w-6 h-6" />
          Timeline de Execução
        </h2>

        <div className="space-y-0">
          {safeIssues.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-300 rounded-lg">
              Nenhuma entrega registrada neste período.
            </div>
          ) : (
             safeIssues.map((issue) => (
              <div 
                key={issue.id} 
                className="flex items-start gap-6 py-6 border-b border-zinc-100 last:border-0 print:break-inside-avoid"
              >
                <div className="w-16 pt-1 text-center hidden sm:block">
                    <span className="text-xs font-mono text-zinc-400 block">#{issue.sequence_id}</span>
                </div>
                
                <div className="flex-1">
                  {issue.client_visible ? (
                    // CLIENT VISIBLE
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 mb-1">{issue.title}</h3>
                      {issue.description && typeof issue.description === 'string' && (
                        <p className="text-zinc-500 text-sm max-w-2xl">{issue.description}</p>
                      )}
                      {/* Technical Score Indicator for Client Visible */}
                      <div className="flex items-center gap-1 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1.5 w-4 rounded-full ${
                              i < (issue.technical_effort_score || 1) 
                                ? 'bg-black' 
                                : 'bg-zinc-200'
                            }`} 
                          />
                        ))}
                        <span className="text-[10px] uppercase font-bold text-zinc-400 ml-2">Nível de Esforço</span>
                      </div>
                    </div>
                  ) : (
                    // INTERNAL / BACKSTAGE
                    <div className="flex items-center gap-3 opacity-60">
                      <div className="p-2 bg-zinc-100 rounded-md">
                        <Lock size={14} className="text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-600 uppercase tracking-tight">
                          Tarefa Técnica Interna (Backstage)
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                           {/* Mini score for internal */}
                          {Array.from({ length: (issue.technical_effort_score || 1) }).map((_, i) => (
                            <div key={i} className="h-1 w-1 rounded-full bg-zinc-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* DATE */}
                <div className="text-right w-24 pt-1">
                   <p className="text-xs font-medium text-zinc-500">
                     {issue.updated_at ? new Date(issue.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-'}
                   </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* PRINT FOOTER */}
      <footer className="mt-12 pt-8 border-t border-zinc-100 text-center text-xs text-zinc-400 hidden print:block">
        <p>Documento gerado automaticamente pelo KyrieOS • Agency Management System</p>
      </footer>
    </div>
  )
}
