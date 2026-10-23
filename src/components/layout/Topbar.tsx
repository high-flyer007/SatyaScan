import {
  Bell,
  HelpCircle,
  Search,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function TopBar() {
  const navigate = useNavigate()

  return (
    <header className="fixed inset-x-0 top-0 z-30 ml-[260px] h-[72px] border-b border-slate-200/80 bg-white/95 shadow-[0_2px_12px_rgba(15,35,70,0.03)] backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-4 px-7">

        {/* Search */}
        <div className="relative w-full max-w-[420px]">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            placeholder="Search inspections, products or rules..."
            aria-label="Search inspections, products or rules"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-[#0B4A8B]"
          >
            <Bell size={19} strokeWidth={1.8} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
          </button>

          <button
            type="button"
            aria-label="Help"
            title="Help"
            onClick={() => navigate('/help')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-[#0B4A8B]"
          >
            <HelpCircle size={19} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/inspection/new')}
            className="group flex h-11 items-center gap-2 rounded-xl bg-[#102A4C] px-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#174477] hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
          >
            <Plus
              size={17}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
            <span className="hidden sm:inline">New Inspection</span>
          </button>

          <div className="ml-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 transition hover:border-slate-300 hover:bg-slate-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-emerald-100 text-xs font-bold text-[#102A4C]">
              AO
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-semibold text-slate-800">
                Admin Officer
              </p>
              <p className="text-[10px] text-slate-500">
                Enforcement Portal
              </p>
            </div>
            <ChevronDown
              size={14}
              className="hidden text-slate-400 xl:block"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
