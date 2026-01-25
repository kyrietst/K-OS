'use client'

import React, { useState, useEffect } from "react"
import { 
  ListBox, 
  Avatar, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
} from "@heroui/react"
import { 
  LayoutDashboard, 
  CheckSquare, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ChevronsUpDown,
  Folder,
  FileText,
} from "lucide-react"
import { usePathname, useRouter, useParams } from "next/navigation"
import { signOutAction } from "@/app/auth/actions"
import { createClient } from "@/lib/supabase/client"
import { Tables } from "@/types/supabase"
import { InviteMemberModal } from "@/components/workspace/invite-member-modal" // Import
import { UserPlus } from "lucide-react"

type Workspace = Tables<'workspaces'>
type Project = Tables<'projects'>

export interface SidebarProps {
  user: {
    id: string
    email: string
    name: string
    avatar: string | null
  }
  workspaces: Workspace[]
}

/**
 * Main Sidebar Logic Component.
 * 
 * @see docs/01-architecture/SIDEBAR_ARCHITECTURE.md
 * @see docs/01-architecture/ADR-001-hydration-strategy.md
 * 
 * Note: This component is loaded via 'next/dynamic' in sidebar-wrapper.tsx
 * to ensure it only runs on the client, preventing Hydration Mismatches.
 */
export default function Sidebar({ user, workspaces }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const workspaceSlug = params?.workspaceSlug as string
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isMounted, setIsMounted] = useState(false)
  
  // Prevent Hydration Mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Encontrar workspace ativo
  const activeWorkspace = workspaces.find(w => w.slug === workspaceSlug) || workspaces[0]
  
  // Buscar projetos do workspace ativo
  useEffect(() => {
    async function fetchProjects() {
      if (!activeWorkspace) return
      
      const supabase = createClient()
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', activeWorkspace.id)
        .order('name')
        
      if (data) setProjects(data)
    }
    
    fetchProjects()
  }, [activeWorkspace?.id])


  if (!isMounted) {
    return (
      <aside className="w-64 h-full border-r border-white/5 bg-content1/50 backdrop-blur-xl relative z-40">
         {/* Static Skeleton to prevent layout shift */}
         <div className="h-16 border-b border-white/5" />
      </aside>
    )
  }

  // Get user initials for avatar fallback
  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Handlers
  const handleWorkspaceChange = (slug: string) => {
    router.push(`/dashboard/${slug}`)
  }

  const navigateToProject = (projectIdentifier: string) => {
    router.push(`/dashboard/${activeWorkspace?.slug}/${projectIdentifier}`)
  }

  return (
    <>
    <aside 
      suppressHydrationWarning
      className={`
        h-full flex flex-col border-r border-white/5 bg-content1/50 backdrop-blur-xl 
        transition-all duration-300 ease-in-out relative z-40
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header / Workspace Switcher */}
      <div className="h-16 flex-shrink-0 flex items-center px-4 border-b border-white/5">
        <Dropdown>
            <DropdownTrigger>
                <div 
                  className={`
                    group outline-none transition-all duration-200 cursor-pointer
                    ${isCollapsed 
                        ? 'flex justify-center w-full p-0' 
                        : 'flex items-center justify-between w-full h-10 hover:bg-white/5 px-2 rounded-lg'
                    }
                  `}
                  role="button"
                  tabIndex={0}
                >
                    {isCollapsed ? (
                        /* Collapsed State: Icon Only */
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                            {activeWorkspace?.name?.[0]?.toUpperCase() || 'K'}
                        </div>
                    ) : (
                        /* Expanded State: Full Layout */
                        <>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white font-bold text-xs shadow-md shadow-primary/20 flex-shrink-0">
                                    {activeWorkspace?.name?.[0]?.toUpperCase() || 'K'}
                                </div>
                                <div className="flex flex-col items-start truncate">
                                    <span className="text-sm font-medium text-foreground truncate w-full text-left">
                                        {activeWorkspace?.name || 'KyrieOS'}
                                    </span>
                                </div>
                            </div>
                            <ChevronsUpDown size={14} className="text-default-400 group-hover:text-default-200 flex-shrink-0 ml-1" />
                        </>
                    )}
                </div>
            </DropdownTrigger>
            <Dropdown.Popover>
                <DropdownMenu 
                    aria-label="Workspaces"
                    className="w-60"
                    onAction={(key) => {
                        if (key === 'create') {
                            alert('Create Workspace feature coming soon')
                        } else if (key === 'invite') {
                            setShowInviteModal(true)
                        } else {
                            handleWorkspaceChange(key as string)
                        }
                    }}
                >
                    <DropdownItem key="label" className="h-6 gap-2 opacity-50 font-bold text-xs uppercase cursor-default">
                        Meus Workspaces
                    </DropdownItem>
                    
                    {workspaces.map(w => (
                        <DropdownItem 
                            key={w.slug}
                            className={w.id === activeWorkspace?.id ? "bg-primary/10 text-primary" : ""}
                            textValue={w.name}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                                    {w.name[0]}
                                </div>
                                <span className="truncate">{w.name}</span>
                            </div>
                        </DropdownItem>
                    ))}
                    
                    <DropdownItem key="separator" className="p-0 h-px bg-white/5 my-1" />
                    
                    <DropdownItem key="create" textValue="Criar Workspace">
                        <div className="flex items-center gap-2">
                            <Plus size={16} />
                            <span>Criar Workspace</span>
                        </div>
                    </DropdownItem>
                    
                    <DropdownItem key="separator-2" className="p-0 h-px bg-white/5 my-1" />
                    
                    <DropdownItem key="invite" textValue="Convidar Membro" className="text-secondary bg-secondary/10">
                        <div className="flex items-center gap-2">
                            <UserPlus size={16} />
                            <span>Convidar Membro</span>
                        </div>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown.Popover>
        </Dropdown>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 flex flex-col gap-6 py-6 overflow-y-auto overflow-x-hidden scrollbar-hide min-h-0">
        
        {/* Main Menu */}
        <div className="px-3">
             <div className={`mb-2 px-3 text-xs font-bold text-default-500 uppercase tracking-widest whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 w-0 h-0 hidden' : 'opacity-100 w-auto h-auto block'}`}>
                 Menu
             </div>
             <ListBox 
                aria-label="Navegação Principal" 
                className="gap-1 p-0"
             >
                <ListBox.Item
                    key="overview"
                    textValue="Visão Geral"
                    onPress={() => activeWorkspace && router.push(`/dashboard/${activeWorkspace.slug}`)}
                    className={`data-[hover=true]:bg-default-100/50 ${pathname === `/dashboard/${activeWorkspace?.slug}` ? "bg-primary/10 text-primary font-medium" : "text-default-500"}`}
                >
                   <div 
                       className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
                       title={isCollapsed ? "Visão Geral" : undefined}
                   >
                      <LayoutDashboard size={20} className={`flex-shrink-0 ${pathname === `/dashboard/${activeWorkspace?.slug}` ? "text-primary" : "text-default-400"}`} />
                      <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Visão Geral</span>
                   </div>
                </ListBox.Item>

                <ListBox.Item
                    key="kanban"
                    textValue="Tarefas Globais"
                    onPress={() => activeWorkspace && router.push(`/dashboard/${activeWorkspace.slug}/all-issues`)}
                    className="text-default-500 data-[hover=true]:bg-default-100/50"
                >
                    <div 
                        className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? "Tarefas Globais" : undefined}
                    >
                        <CheckSquare size={20} className="flex-shrink-0 text-default-400" />
                        <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Tarefas Globais</span>
                    </div>
                </ListBox.Item>

                <ListBox.Item
                    key="report"
                    textValue="Relatório de Valor"
                    onPress={() => activeWorkspace && router.push(`/dashboard/${activeWorkspace.slug}/report`)}
                    className={`data-[hover=true]:bg-default-100/50 ${pathname === `/dashboard/${activeWorkspace?.slug}/report` ? "bg-primary/10 text-primary font-medium" : "text-default-500"}`}
                >
                    <div 
                        className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? "Relatório de Valor" : undefined}
                    >
                        <FileText size={20} className={`flex-shrink-0 ${pathname === `/dashboard/${activeWorkspace?.slug}/report` ? "text-primary" : "text-default-400"}`} />
                        <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Relatório de Valor</span>
                    </div>
                </ListBox.Item>
             </ListBox>
        </div>

        {/* Projects List */}
        <div className="px-3">
            <div className={`flex items-center justify-between mb-2 px-3 transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100 h-auto'}`}>
                 <span className="text-xs font-bold text-default-500 uppercase tracking-widest whitespace-nowrap">
                    Projetos
                 </span>
                 <button className="text-default-400 hover:text-white transition-colors">
                     <Plus size={14} />
                 </button>
            </div>
            
            {projects.length === 0 && !isCollapsed && (
                 <div className="px-4 py-3 text-sm text-default-400 italic whitespace-nowrap">
                     Nenhum projeto encontrado.
                 </div>
            )}

            <div className="flex flex-col gap-1">
                {projects.map(project => {
                    const isActive = pathname?.includes(project.identifier)
                    
                    return (
                        <button
                            key={project.id}
                            onClick={() => navigateToProject(project.identifier)}
                            title={isCollapsed ? project.name : undefined}
                            className={`
                                flex items-center gap-3 px-3 py-2 rounded-medium transition-colors w-full
                                ${isActive 
                                    ? "bg-content2 text-foreground font-medium" 
                                    : "text-default-500 hover:bg-default-100/50 hover:text-default-700"
                                }
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                        >
                            <Folder 
                                size={18} 
                                className={`flex-shrink-0 ${isActive ? "text-primary fill-primary/20" : "text-default-400"}`}
                            />
                            <span className={`truncate text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                {project.name}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>

      </div>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-white/5 bg-black/20 flex-shrink-0">
        <div className="flex flex-col gap-2">
            {/* Collapse Button */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`
                    flex items-center justify-center p-2 rounded-lg text-default-400 
                    hover:bg-white/5 hover:text-white transition-colors
                    ${isCollapsed ? 'self-center' : 'self-end'}
                `}
                title={isCollapsed ? "Expandir" : "Colapsar"}
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Profile */}
            <div className={`
                flex items-center gap-3 p-2 rounded-xl transition-colors
                ${isCollapsed ? 'justify-center' : 'justify-between hover:bg-white/5'}
            `}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div title={isCollapsed ? user.name : undefined} className="cursor-pointer flex-shrink-0">
                        <Avatar size="sm" className="ring-2 ring-white/10 flex-shrink-0">
                            {user.avatar ? (
                                <Avatar.Image src={user.avatar} alt={user.name} />
                            ) : null}
                            <Avatar.Fallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold">
                                {initials}
                            </Avatar.Fallback>
                        </Avatar>
                    </div>
                    
                    <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        <span className="text-small font-medium text-foreground truncate max-w-[120px] whitespace-nowrap">
                            {user.name}
                        </span>
                        <span className="text-[10px] text-default-400 truncate max-w-[120px] whitespace-nowrap">
                            {user.email}
                        </span>
                    </div>
                </div>

                <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
                    <button 
                        onClick={() => signOutAction()}
                        className="p-2 rounded-lg text-default-400 hover:text-danger hover:bg-danger/10 transition-all"
                        title="Sair"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
      </div>

    </aside>

    {activeWorkspace && (
        <InviteMemberModal 
            workspaceId={activeWorkspace.id} 
            isOpen={showInviteModal} 
            onOpenChange={setShowInviteModal} 
        />
    )}
    </>
  )
}
