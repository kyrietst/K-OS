'use client'

import dynamic from 'next/dynamic'
import { SidebarProps } from './sidebar'

// Dynamically import Sidebar with no SSR to prevent hydration mismatches
// caused by browser extensions or client-side only attributes
const Sidebar = dynamic(() => import('./sidebar'), { 
  ssr: false,
  loading: () => (
    <aside className="w-64 h-full border-r border-white/5 bg-content1/50 backdrop-blur-xl relative z-40">
       <div className="h-16 border-b border-white/5" />
    </aside>
  )
})

export default function SidebarWrapper(props: SidebarProps) {
  return <Sidebar {...props} />
}
