import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './Topbar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <TopBar />

      <main className="ml-[260px] min-h-screen pt-[72px]">
        {children}
      </main>
    </div>
  )
}