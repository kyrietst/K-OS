import Sidebar from './sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        {children}
      </main>
    </div>
  )
}
