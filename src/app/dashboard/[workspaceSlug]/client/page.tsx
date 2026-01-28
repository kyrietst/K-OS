import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import IssueList from '@/components/issues/issue-list'
import IssueDetailsModal from '@/components/issues/issue-details-modal'

// Map internal statuses to client-friendly terms
const CLIENT_STATUS_MAP: Record<string, string> = {
  'done': 'Concluído',
  'in-progress': 'Em Execução',
  'todo': 'A Fazer',
  'backlog': 'Na Fila',
  'canceled': 'Cancelado'
}

export default async function ClientPage({
  params,
  searchParams
}: {
  params: Promise<{ workspaceSlug: string }>
  searchParams: Promise<{ issueId?: string }>
}) {
  const { workspaceSlug } = await params
  const { issueId } = await searchParams
  const supabase = await createClient()

  // 1. Get Workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspace) return notFound()

  // 2. Fetch Client-Visible Issues
  const { data: issues, error } = await supabase
    .from('issues')
    .select(`
        *,
        project:projects!inner(id, identifier, workspace_id),
        assignee:profiles!issues_assignee_id_fkey(full_name, email)
    `)
    .eq('project.workspace_id', workspace.id)
    .eq('client_visible', true)
    .order('sequence_id', { ascending: false })

  if (error) {
    console.error("Error fetching client issues:", error)
  }

  // 3. Fetch Selected Issue (if any)
  let selectedIssue = null
  if (issueId) {
    const { data } = await supabase
      .from('issues')
      .select('*, assignee:profiles!issues_assignee_id_fkey(*), project:projects!inner(identifier)')
      .eq('id', issueId)
      .single()
    
    // Security check: Ensure selected issue IS client visible and belongs to workspace
    // (Though RLS should handle visibility, explicit check is good)
    if (data && data.client_visible) { 
        // We also need to verify workspace ownership via project, but fetching it above implicitly does if we trust the ID. 
        // But better safe:
        const { data: projectCheck } = await supabase.from('projects').select('workspace_id').eq('id', data.project_id).single()
        if (projectCheck?.workspace_id === workspace.id) {
             selectedIssue = data
        }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome / Context Section */}
      <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-default-900">
          Acompanhamento de Projetos
        </h1>
        <p className="text-default-500 mt-1">
          Visualizando tarefas ativas em <strong>{workspace.name}</strong>.
        </p>
      </div>

      {/* Issues List */}
      <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-default-100 flex items-center justify-between">
              <h2 className="font-semibold text-default-700">Entregas & Tarefas</h2>
              <span className="text-xs font-mono text-default-400 bg-default-100 px-2 py-1 rounded">
                  {issues?.length || 0} itens visíveis
              </span>
          </div>
          
          <div className="p-0">
             <IssueList 
                issues={(issues as any) || []} 
                isReadOnly={true}
                statusLabelMap={CLIENT_STATUS_MAP}
                projectIdentifier="" // Individual issues carry their identifier
             />
          </div>
      </div>

      {/* Footer / Disclaimer */}
      <div className="text-center text-xs text-default-400 mt-8 mb-4">
        KyrieOS Client Portal • Atualizado em Tempo Real
      </div>

      {/* Read-Only Issue Details Modal */}
      <IssueDetailsModal 
        issue={selectedIssue} 
        isOpen={!!selectedIssue} 
        workspaceSlug={workspaceSlug}
        projectIdentifier={(selectedIssue as any)?.project?.identifier || '...'}
        profiles={[]} // No need to load profiles for read-only
        cycles={[]}
        modules={[]}
        isReadOnly={true}
      />
    </div>
  )
}
