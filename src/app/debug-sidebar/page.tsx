"use client";

import Sidebar from "@/app/dashboard/sidebar";

export default function DebugSidebarPage() {
  const mockUser = {
    id: "debug-user",
    name: "Debug Admin",
    email: "debug@kyrieos.com",
    avatar: null
  };

  const mockWorkspaces = [
    { 
      id: "ws-1", 
      name: "Gamma Workspace", 
      slug: "gamma-workspace",
      created_at: new Date().toISOString(),
      owner_id: "debug-user",
      image_url: null,
      plan: "pro"
    },
    { 
      id: "ws-2", 
      name: "Test Workspace", 
      slug: "test-workspace",
      created_at: new Date().toISOString(),
      owner_id: "debug-user",
      image_url: null,
      plan: "free"
    }
  ];

  return (
    <div className="flex h-screen w-full bg-black text-white">
      <Sidebar user={mockUser} workspaces={mockWorkspaces as any} />
      <main className="flex-1 p-8 bg-zinc-900">
        <h1 className="text-2xl font-bold mb-4">Sidebar Debug Harness</h1>
        <p className="text-zinc-400">
          Esta página renderiza o Sidebar isoladamente para verificação visual.
          Use o botão de colapso para testar a animação.
        </p>
        <div className="mt-8 p-4 border border-zinc-700 rounded-lg">
           <h2 className="font-bold text-zinc-200">Estado Atual:</h2>
           <p className="text-zinc-500">Verifique se o texto "Gamma Workspace" está encavalado.</p>
        </div>
      </main>
    </div>
  );
}
