import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Link } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import ProjectSettingsForm from './project-settings-form'

export default async function ProjectSettingsPage({
  params
}: {
  params: Promise<{ workspaceSlug: string, projectIdentifier: string }>
}) {
  const { workspaceSlug, projectIdentifier } = await params
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

  // 3. Get Workspace Members with Profiles
  const { data: members } = await supabase
    .from('workspace_members')
    .select(`
      role,
      created_at,
      user_id,
      profiles:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('workspace_id', workspace.id)

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 border-b border-white/5 bg-content1/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <Link 
            href={`/dashboard/${workspaceSlug}/${projectIdentifier}`}
            className="p-2 rounded-lg bg-content2/50 hover:bg-content2 transition-colors"
          >
            <ArrowLeft size={18} className="text-default-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-default-500 mb-1">
              <span>{workspace.name}</span>
              <span>/</span>
              <span>{project.name}</span>
              <span>/</span>
              <span>Settings</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Project Settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <ProjectSettingsForm 
            project={project}
            workspace={workspace}
            members={(members || []) as any}
            workspaceSlug={workspaceSlug}
            projectIdentifier={projectIdentifier}
          />
        </div>
      </div>
    </div>
  )
}
