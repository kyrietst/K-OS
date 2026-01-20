import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CreateProjectModal from '@/components/projects/create-project-modal'
import { Card, Link } from '@heroui/react'

export default async function WorkspacePage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  // 1. Get Workspace ID from Slug
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('slug', workspaceSlug)
    .single()

  if (!workspace) {
    notFound()
  }

  // 2. Fetch Projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl font-bold">{workspace.name}</h1>
         <CreateProjectModal workspaceId={workspace.id} />
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project) => (
                <Link 
                    key={project.id} 
                    href={`/dashboard/${workspaceSlug}/${project.identifier}`}
                    className="block"
                >
                    <Card className="hover:scale-[1.02] transition-transform cursor-pointer h-full">
                        <Card.Header>
                            <div className="flex justify-between items-center w-full">
                                <Card.Title>{project.name}</Card.Title>
                                <span className="text-xs font-mono bg-default-100 px-2 py-1 rounded text-default-500">
                                    {project.identifier}
                                </span>
                            </div>
                        </Card.Header>
                        <Card.Content>
                            <p className="text-sm text-default-400">
                                {(project.description as any)?.content || (typeof project.description === 'string' ? project.description : 'No description')}
                            </p>
                        </Card.Content>
                        <Card.Footer className="text-tiny text-default-400">
                            Updated {new Date(project.created_at).toLocaleDateString()}
                        </Card.Footer>
                    </Card>
                </Link>
            ))}
        </div>
      ) : (
        <div className="border border-dashed border-default-300 rounded-lg p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                📂
            </div>
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-default-500 max-w-sm mb-6">
                Projects help you organize issues and cycles. Create your first project to get started.
            </p>
            <CreateProjectModal workspaceId={workspace.id} />
        </div>
      )}
    </div>
  )
}
