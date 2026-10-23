
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './Topbar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#14243b]">
      <Sidebar />
      <TopBar />

      <main className="ml-[260px] min-h-screen pt-[72px]">
        <div className="min-h-[calc(100vh-72px)]">
          {children}
        </div>
      </main>
    </div>
  )
}
