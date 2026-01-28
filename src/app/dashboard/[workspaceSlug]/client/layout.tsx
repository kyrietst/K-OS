import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: Promise<{ workspaceSlug: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex flex-col h-screen w-full bg-default-50 overflow-hidden">
      {/* Client Header */}
      <header className="h-16 border-b border-default-200 bg-white flex items-center justify-between px-8 shadow-sm z-20">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold">
                K
            </div>
            <span className="font-semibold text-lg text-default-900">
                KyrieOS <span className="text-default-400 mx-2">/</span> Portal do Cliente
            </span>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="text-sm text-right hidden md:block">
                 <p className="font-medium text-default-900">{user.email}</p>
                 <p className="text-xs text-default-500">Visualização de Cliente</p>
             </div>
             
             {/* Simple Logout Link/Button - assuming standard Supabase auth */}
             <form action="/auth/signout" method="post">
                <button type="button" className="p-2 hover:bg-default-100 rounded-full transition-colors text-default-500">
                    <LogOut size={20} />
                </button>
             </form>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Technical Grid Background */}
        <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />
        {children}
      </main>
    </div>
  )
}
