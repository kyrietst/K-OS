'use client'

import React from "react"
import { ListBox, Avatar } from "@heroui/react"
import { LayoutDashboard, Layers, CheckSquare, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { signOutAction } from "@/app/auth/actions"

interface SidebarProps {
  user: {
    id: string
    email: string
    name: string
    avatar: string | null
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleAction = (key: React.Key) => {
     if (key === "logout") {
         signOutAction()
         return
     }
     router.push(key as string)
  }

  // Get user initials for avatar fallback
  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="h-full w-64 flex flex-col border-r border-white/5 bg-content1/50 backdrop-blur-xl">
      {/* Header / Logo */}
      <div className="h-14 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="font-bold text-white text-xs">K</span>
            </div>
            <span className="font-semibold text-small tracking-tight text-foreground">KyrieOS</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-6">
        <ListBox 
            aria-label="Navegação Principal" 
            variant="default"
            onAction={handleAction}
            className="gap-1"
        >
            <ListBox.Item
                key="/dashboard"
                textValue="Visão Geral"
                className={pathname === "/dashboard" ? "bg-primary/10 text-primary font-medium" : "text-default-500"}
            >
               <div className="flex items-center gap-2">
                  <LayoutDashboard size={18} className={pathname === "/dashboard" ? "text-primary" : "text-default-400"} />
                  <span>Visão Geral</span>
               </div>
            </ListBox.Item>
            
            <ListBox.Item
                key="/dashboard/kanban"
                textValue="Tarefas"
                className={pathname?.includes("kanban") ? "bg-primary/10 text-primary font-medium" : "text-default-500"}
            >
                <div className="flex items-center gap-2">
                    <CheckSquare size={18} className={pathname?.includes("kanban") ? "text-primary" : "text-default-400"} />
                    <span>Tarefas</span>
                </div>
            </ListBox.Item>

            <ListBox.Item
                key="/dashboard/cycles"
                textValue="Ciclos"
                className="text-default-500"
            >
                <div className="flex items-center gap-2">
                    <Layers size={18} className="text-default-400" />
                    <span>Ciclos</span>
                </div>
            </ListBox.Item>
        </ListBox>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-default-100/50 transition-colors">
            {/* User Info */}
            <div className="flex items-center gap-3">
                <Avatar size="sm" className="ring-2 ring-primary/20">
                    {user.avatar ? (
                        <Avatar.Image src={user.avatar} alt={user.name} />
                    ) : null}
                    <Avatar.Fallback className="bg-primary/20 text-primary text-xs font-bold">
                        {initials}
                    </Avatar.Fallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-small font-medium text-foreground">{user.name}</span>
                    <span className="text-[10px] text-default-400">{user.email}</span>
                </div>
            </div>

            {/* Logout Button */}
            <button 
                onClick={() => signOutAction()}
                className="text-default-400 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                title="Sair"
            >
                <LogOut size={16} />
            </button>
        </div>
      </div>
    </aside>
  )
}
