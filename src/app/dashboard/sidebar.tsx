'use client'

import React, { useEffect, useState } from 'react'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  DropdownPopover,
  Button,
  Avatar
} from "@heroui/react"
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { CreateWorkspaceDialog } from '@/components/dashboard/create-workspace-modal'
// Icons
import {
  ChevronDown,
  LayoutDashboard,
  Layers,
  CheckSquare,
  LogOut,
  Plus
} from 'lucide-react'

type Workspace = Database['public']['Tables']['workspaces']['Row']

export default function Sidebar() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchWorkspaces() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('workspaces')
        .select(`
           *,
           workspace_members!inner(user_id)
        `)
        .eq('workspace_members.user_id', user.id)

      if (data && data.length > 0) {
        setWorkspaces(data)
        // Simple logic: pick first one for now, or read from URL in parent
        setCurrentWorkspace(data[0]) 
      }
    }

    fetchWorkspaces()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 border-r border-default-200 h-screen flex flex-col bg-content1/50 p-4">
      {/* Workspace Switcher */}
      <div className="mb-6">
        <Dropdown>
          <DropdownTrigger className="w-full justify-between h-14 bg-background border-default-200 data-[hover=true]:bg-default-100 border rounded-medium transition-colors flex items-center px-4">
              <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {currentWorkspace ? currentWorkspace.name.charAt(0).toUpperCase() : 'K'}
                    </div>
                    <div className="flex flex-col overflow-hidden text-left">
                        <span className="text-small font-bold truncate">
                            {currentWorkspace ? currentWorkspace.name : 'Select Workspace'}
                        </span>
                        <span className="text-tiny text-default-400">Free Plan</span>
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-default-400 flex-shrink-0"/>
              </div>
          </DropdownTrigger>
          <DropdownPopover>
            <DropdownMenu aria-label="Workspaces">
                <DropdownSection aria-label="Workspaces">
                    {workspaces.map((ws) => (
                        <DropdownItem 
                            key={ws.id}
                            onPress={() => {
                                setCurrentWorkspace(ws)
                                router.push(`/dashboard/${ws.slug}`)
                            }}
                            textValue={ws.name}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs">{ws.name.charAt(0)}</div>
                                <div className="flex flex-col">
                                    <span>{ws.name}</span>
                                    <span className="text-xs text-muted-foreground">{ws.slug}</span>
                                </div>
                            </div>
                        </DropdownItem>
                    ))}
                </DropdownSection>
                <DropdownSection aria-label="Actions">
                    <DropdownItem 
                        key="create_new" 
                        textValue="Create Workspace"
                        onPress={() => setIsCreateWorkspaceOpen(true)}
                    >
                        <div className="flex items-center gap-2">
                            <Plus size={16} />
                            <span>Create Workspace</span>
                        </div>
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
          </DropdownPopover>
        </Dropdown>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        <div className="flex flex-col gap-1">
             <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-default-500 hover:bg-default-100 hover:text-foreground transition-colors text-left" onClick={() => router.push('/dashboard')}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
             </button>
             <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-default-500 hover:bg-default-100 hover:text-foreground transition-colors text-left">
                <CheckSquare size={20} />
                <span>Issues</span>
             </button>
             <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-default-500 hover:bg-default-100 hover:text-foreground transition-colors text-left">
                <Layers size={20} />
                <span>Cycles</span>
             </button>
        </div>
      </nav>

      {/* User Profile */}
      <div className="mt-auto border-t border-default-200 pt-4">
         <Dropdown>
            <DropdownTrigger className="w-full justify-start gap-2 h-auto py-2 px-2 data-[hover=true]:bg-default-100 rounded-medium transition-colors flex items-center">
                <div className="flex items-center gap-2 w-full">
                    <Avatar size="sm" className="ring-2 ring-default">
                        <Avatar.Image src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                        <Avatar.Fallback>U</Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold">User Name</span>
                        <span className="text-tiny text-default-400">@user</span>
                    </div>
                </div>
            </DropdownTrigger>
            <DropdownPopover placement="top start">
                <DropdownMenu aria-label="User Actions">
                    <DropdownItem key="profile" className="h-14 gap-2" textValue="Signed in as">
                        <p className="font-bold">Signed in as</p>
                        <p className="font-bold">@user</p>
                    </DropdownItem>
                    <DropdownItem key="settings" textValue="My Settings">
                        My Settings
                    </DropdownItem>
                    <DropdownItem key="logout" onPress={handleSignOut} textValue="Log Out" className="text-danger">
                        <div className="flex items-center gap-2">
                            <LogOut size={16}/>
                            <span>Log Out</span>
                        </div>
                    </DropdownItem>
                </DropdownMenu>
            </DropdownPopover>
         </Dropdown>
      </div>
      <CreateWorkspaceDialog isOpen={isCreateWorkspaceOpen} onOpenChange={setIsCreateWorkspaceOpen} />
    </aside>
  )
}
