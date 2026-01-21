'use client'

import React from "react"
import { ListBox, Avatar } from "@heroui/react"
import { LayoutDashboard, Layers, CheckSquare, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  // Mock Data (temporário até conexão com Supabase Auth)
  const user = {
    name: "Lukke Ferreira",
    email: "lukke@kyrie.agency",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  }

  const handleAction = (key: React.Key) => {
     if (key === "logout") {
         console.log("Logout triggered")
         return
     }
     router.push(key as string)
  }

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
            variant="default" // "flat" is not valid in v3, using default but classes handle style
            onAction={handleAction}
            className="gap-1" // ListBox prop for classes
        >
            <ListBox.Item
                key="/dashboard"
                textValue="Visão Geral"
                // Starting content passed as child/layout in v3 or mimicking user's code
                // User provided startContent prop. In v3, ListBox.Item MIGHT NOT support startContent directly if it's not in the props list?
                // Docs say ListBox.Item has children. Adapter patterns often use children.
                // However, I'll try to match the user's "startContent" intent by putting it in the children flex layout.
                className={pathname === "/dashboard" ? "bg-default-100 text-primary font-medium" : "text-default-500"}
            >
               <div className="flex items-center gap-2">
                  <LayoutDashboard size={18} className={pathname === "/dashboard" ? "text-primary" : "text-default-400"} />
                  <span>Visão Geral</span>
               </div>
            </ListBox.Item>
            
            <ListBox.Item
                key="/dashboard/kanban"
                textValue="Tarefas"
                className={pathname?.includes("kanban") ? "bg-default-100 text-primary font-medium" : "text-default-500"}
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
            {/* Simulated User Component */}
            <div className="flex items-center gap-3">
                <Avatar 
                    src={user.avatar}
                    size="sm"
                    isBordered
                    className="ring-2 ring-primary/20"
                />
                <div className="flex flex-col">
                    <span className="text-small font-medium text-foreground">{user.name}</span>
                    <span className="text-[10px] text-default-400">{user.email}</span>
                </div>
            </div>

            <button className="text-default-400 hover:text-danger transition-colors opacity-0 group-hover:opacity-100">
                <LogOut size={16} />
            </button>
        </div>
      </div>
    </aside>
  )
}
