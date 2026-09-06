import {
  Bell,
  HelpCircle,
  Search,
  Plus,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function TopBar() {
  const navigate = useNavigate()

  return (
    <header className="fixed inset-x-0 top-0 z-30 ml-[260px] h-[72px] border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-7">
        {/* Search */}
        <div className="relative w-[360px]">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search case ID or rule..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Bell size={20} strokeWidth={1.8} />

            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          <button
            aria-label="Help"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <HelpCircle size={20} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => navigate('/inspection/new')}
            className="flex items-center gap-2 rounded-lg bg-[#0B2347] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12345F]"
          >
            <Plus size={17} />
            New Inspection
          </button>

          {/* User */}
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-[#0B2347]">
            AO
          </button>
        </div>
      </div>
    </header>
  )
}