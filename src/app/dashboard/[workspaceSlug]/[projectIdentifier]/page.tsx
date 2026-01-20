import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import IssueList from '@/components/issues/issue-list'
import CreateIssueModal from '@/components/issues/create-issue-modal'
import KanbanBoard from '@/components/kanban/kanban-board'
import { Link, Chip } from '@heroui/react'
import IssueDetailsModal from '@/components/issues/issue-details-modal'
import CreateCycleModal from '@/components/cycles/create-cycle-modal'
import CreateModuleModal from '@/components/modules/create-module-modal'
import { getProjectAnalytics } from '@/features/projects/actions/get-project-analytics'
import { ProjectAnalytics } from '@/components/analytics/project-analytics'

export default async function ProjectPage({
  params,
  searchParams
}: {
  params: Promise<{ workspaceSlug: string, projectIdentifier: string }>
  searchParams: Promise<{ view?: string; issueId?: string }>
}) {
  const { workspaceSlug, projectIdentifier } = await params
  const { view = 'overview', issueId } = await searchParams
  const supabase = await createClient()

  // 1. Get Workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspace) return notFound()

  // 2. Get Project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspace.id)
    .eq('identifier', projectIdentifier.toUpperCase()) 
    .single()

  if (!project) return notFound()

  // 3. Fetch Data in Parallel
  const [
    { data: issues },
    analytics,
    { data: profiles },
    { data: cycles },
    { data: modules }
  ] = await Promise.all([
    // Issues
    supabase
      .from('issues')
      .select(`
          *,
          assignee:assignee_id(email, full_name)
      `)
      .eq('project_id', project.id)
      .order('sequence_id', { ascending: false }),
    
    // Analytics
    getProjectAnalytics(project.id),

    // Profiles
    supabase
      .from('profiles')
      .select('*')
      .in('id', (
        await supabase
          .from('workspace_members')
          .select('user_id')
          .eq('workspace_id', workspace.id)
      ).data?.map(m => m.user_id) || []),

    // Cycles
    supabase
      .from('cycles')
      .select('*')
      .eq('project_id', project.id)
      .order('start_date', { ascending: true }),

    // Modules
    supabase
      .from('modules')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
  ])

  // 5. Selected Issue
  let selectedIssue = null
  if (issueId) {
    const { data } = await supabase
      .from('issues')
      .select('*, assignee:profiles!issues_assignee_id_fkey(*)')
      .eq('id', issueId)
      .single()
    
    if (data) selectedIssue = data
  }

  const currentView = view

  return (
    <div className="p-8 h-full flex flex-col">
       {/* Header */}
       <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 text-sm text-default-500">
                <Link href={`/dashboard/${workspaceSlug}`} className="hover:text-default-900 transition-colors">
                    {workspace.name}
                </Link>
                <span>/</span>
                <span className="text-default-900">{project.name}</span>
             </div>
             <h1 className="text-2xl font-bold flex items-center gap-2">
                {project.name} 
                <span className="text-sm font-normal text-default-400 font-mono">({project.identifier})</span>
             </h1>
          </div>
          <div className="flex items-center gap-2">
            {currentView === 'cycles' ? (
                <CreateCycleModal 
                    workspaceSlug={workspaceSlug}
                    projectIdentifier={projectIdentifier}
                    projectId={project.id}
                />
            ) : currentView === 'modules' ? (
                <CreateModuleModal 
                    workspaceSlug={workspaceSlug}
                    projectIdentifier={projectIdentifier}
                    projectId={project.id}
                />
            ) : currentView === 'overview' ? (
                // No specific action for overview yet
                null
            ) : (
                <CreateIssueModal 
                    workspaceId={workspace.id}
                    projectId={project.id}
                    workspaceSlug={workspaceSlug}
                    projectIdentifier={projectIdentifier}
                />
            )}
          </div>
       </div>

       {/* View Switcher */}
       <div className="border-b border-default-200 mb-6">
        <div className="flex gap-6">
          <Link
            href={`?view=overview${issueId ? `&issueId=${issueId}` : ''}`}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              currentView === 'overview'
                ? 'border-primary text-foreground'
                : 'border-transparent text-default-500 hover:text-foreground'
            }`}
          >
            Overview
          </Link>
          <Link
            href={`?view=list${issueId ? `&issueId=${issueId}` : ''}`}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              currentView === 'list'
                ? 'border-primary text-foreground'
                : 'border-transparent text-default-500 hover:text-foreground'
            }`}
          >
            List
          </Link>
          <Link
            href={`?view=board${issueId ? `&issueId=${issueId}` : ''}`}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              currentView === 'board'
                ? 'border-primary text-foreground'
                : 'border-transparent text-default-500 hover:text-foreground'
            }`}
          >
            Board
          </Link>
          <Link
            href={`?view=cycles${issueId ? `&issueId=${issueId}` : ''}`}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              currentView === 'cycles'
                ? 'border-primary text-foreground'
                : 'border-transparent text-default-500 hover:text-foreground'
            }`}
          >
            Cycles
          </Link>
          <Link
            href={`?view=modules${issueId ? `&issueId=${issueId}` : ''}`}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              currentView === 'modules'
                ? 'border-primary text-foreground'
                : 'border-transparent text-default-500 hover:text-foreground'
            }`}
          >
            Modules
          </Link>
        </div>
       </div>

       {/* Content */}
       <div className="flex-1 min-h-0">
           {currentView === 'overview' ? (
                <ProjectAnalytics data={analytics} />
           ) : currentView === 'board' ? (
                <KanbanBoard 
                    initialIssues={issues || []} 
                    workspaceSlug={workspaceSlug}
                    projectIdentifier={projectIdentifier}
                />
           ) : currentView === 'cycles' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cycles?.map((cycle) => {
                     const start = cycle.start_date ? new Date(cycle.start_date) : null
                     const end = cycle.end_date ? new Date(cycle.end_date) : null
                     const now = new Date()
                     
                     let status: 'Active' | 'Upcoming' | 'Completed' = 'Upcoming'
                     if (start && end) {
                        if (now >= start && now <= end) status = 'Active'
                        else if (now > end) status = 'Completed'
                     }

                     return (
                        <div key={cycle.id} className="p-4 rounded-xl border border-default-200 bg-content1 flex flex-col gap-3">
                           <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-lg truncate">{cycle.name}</h3>
                              <Chip 
                                size="sm" 
                                variant="soft" 
                                color={status === 'Active' ? 'warning' : status === 'Completed' ? 'success' : 'default'}
                              >
                                 {status}
                              </Chip>
                           </div>
                           <div className="text-sm text-default-500">
                              <p>Start: {start ? start.toLocaleDateString() : 'TBD'}</p>
                              <p>End: {end ? end.toLocaleDateString() : 'TBD'}</p>
                           </div>
                        </div>
                     )
                  })}
                  {(!cycles || cycles.length === 0) && (
                     <div className="col-span-full py-12 text-center text-default-500 border border-dashed border-default-200 rounded-xl">
                        No cycles created yet.
                     </div>
                  )}
               </div>
            ) : currentView === 'modules' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules?.map((module: any) => (
                     <div key={module.id} className="p-4 rounded-xl border border-default-200 bg-content1 flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold text-lg truncate flex-1">{module.name}</h3>
                            <Chip 
                             size="sm" 
                             variant="soft" 
                             color={
                                 module.status === 'In Progress' ? 'accent' : 
                                 module.status === 'Completed' ? 'success' : 
                                 module.status === 'Paused' ? 'warning' : 
                                 'default'
                             }
                         >
                                {module.status}
                            </Chip>
                        </div>
                        
                        {module.description && (
                            <p className="text-sm text-default-500 line-clamp-2 min-h-[2.5rem]">
                                {module.description}
                            </p>
                        )}

                        <div className="text-xs text-default-400 flex flex-col gap-1">
                            <div className="flex justify-between">
                                <span>Target: {module.target_date ? new Date(module.target_date).toLocaleDateString() : 'No date'}</span>
                                <span>0%</span>
                            </div>
                            <div className="h-1.5 w-full bg-default-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-0" />
                            </div>
                        </div>
                     </div>
                  ))}
                  {(!modules || modules.length === 0) && (
                     <div className="col-span-full py-12 text-center text-default-500 border border-dashed border-default-200 rounded-xl">
                        No modules created yet.
                     </div>
                  )}
               </div>
            ) : (
                <IssueList issues={issues || []} projectIdentifier={project.identifier} />
           )}
       </div>

       <IssueDetailsModal 
         issue={selectedIssue} 
         isOpen={!!selectedIssue} 
         workspaceSlug={workspaceSlug}
         projectIdentifier={projectIdentifier}
         profiles={profiles || []}
         cycles={cycles || []}
         // @ts-ignore
         modules={modules || []}
       />
    </div>
  )
}
