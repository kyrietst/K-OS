'use client'

import { Card } from "@heroui/react"
import { Rocket } from 'lucide-react'
import CreateWorkspaceModal from '@/components/dashboard/create-workspace-modal'

export default function DashboardEmptyState() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="max-w-md w-full p-4">
        <Card.Header className="flex flex-col gap-2 pb-0 items-center">
           <Rocket size={48} className="text-default-300 mb-2" />
           <h1 className="text-2xl font-bold">Welcome to KyrieOS</h1>
           <p className="text-default-500 text-center">You don't have any workspaces yet.</p>
        </Card.Header>
        <Card.Content className="py-6 flex flex-col items-center">
            <p className="text-sm text-default-500 mb-6 text-center">
                Create a workspace to start managing your projects, cycles and issues like a pro.
            </p>
            <CreateWorkspaceModal />
        </Card.Content>
      </Card>
    </div>
  )
}
