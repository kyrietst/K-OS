import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardEmptyState from '@/components/dashboard/empty-state'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify auth again (Middleware does it too, but safe for data fetch)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch workspaces for this user
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select(`
        *,
        workspace_members!inner(user_id)
    `)
    .eq('workspace_members.user_id', user.id)

  if (workspaces && workspaces.length > 0) {
    // Scenario A: Has workspaces -> Redirect to first one
    redirect(`/dashboard/${workspaces[0].slug}`)
  }

  // Scenario B: No workspaces -> Show Empty State (Client Component)
  return <DashboardEmptyState />
}
