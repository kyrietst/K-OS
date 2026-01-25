import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SidebarWrapper from './sidebar-wrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Redirect to login if not authenticated
  if (error || !user) {
    redirect('/login')
  }

  // Get user's workspaces
  const { data: members } = await supabase
    .from('workspace_members')
    .select('workspace:workspaces(*)')
    .eq('user_id', user.id)

  // Extract clean workspaces array
  const workspaces = members?.map(m => m.workspace).filter(Boolean) || []

  // If no workspaces, they should probably go to onboarding, but for now assuming they have one or creating one is handled elsewhere
  // If we really wanted to be safe we could redirect to an onboarding flow if workspaces.length === 0

  // Format user data for Sidebar
  const userData = {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    avatar: user.user_metadata?.avatar_url || null,
  }

  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden">
      <div className="print:hidden">
        <SidebarWrapper user={userData} workspaces={workspaces as any[]} />
      </div>
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Subtle grid texture for technical depth */}
        <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />
        
        {children}
      </main>
    </div>
  )
}
