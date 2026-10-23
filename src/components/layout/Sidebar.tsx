
import {
  BarChart3,
  ClipboardCheck,
  FileBarChart,
  FileClock,
  HelpCircle,
  History,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  Users,
  Building2,
  PlusCircle,
  Headphones,
  Download,
  ChevronRight,
  ScanLine,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import satyaScanLogo from '../../assets/SatyaScan logo.jpeg'

const mainNavigation = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'New Inspection', path: '/inspection/new', icon: PlusCircle },
  { label: 'Active Inspections', path: '/inspection/active', icon: ClipboardCheck },
  { label: 'History', path: '/history', icon: History },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Manufacturers', path: '/manufacturers', icon: Building2 },
  { label: 'Reports', path: '/reports', icon: FileBarChart },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Rules & Compliance', path: '/rules', icon: ShieldCheck },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'Audit Log', path: '/audit-log', icon: FileClock },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Help', path: '/help', icon: HelpCircle },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/10 bg-[#102541] text-slate-300 shadow-[8px_0_32px_rgba(16,37,65,0.08)]">
      {/* Brand */}
        <div className="flex h-[98px] shrink-0 items-center justify-center border-b border-white/10 px-3">
          <div className="flex h-[76px] w-full items-center justify-center overflow-hidden rounded-xl bg-white px-2">
            <img
              src={satyaScanLogo}
              alt="SatyaScan"
              className="h-full w-full object-contain"
              style={{ transform: 'scale(1.18)' }}
            />
          </div>
        </div>

      {/* Platform identity */}
      <div className="mx-3 mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
          <ScanLine size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold tracking-wide text-white">
            Enforcement Portal
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Inspection workspace
          </p>
        </div>
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        <div className="space-y-1">
          {mainNavigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-[10px] text-[13px] transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-400/20 to-sky-400/10 font-semibold text-white shadow-inner shadow-white/[0.03]'
                      : 'font-medium text-slate-400 hover:bg-white/[0.06] hover:text-white',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-emerald-300" />
                    )}
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.2 : 1.7}
                      className={
                        isActive
                          ? 'shrink-0 text-emerald-300'
                          : 'shrink-0 text-slate-500 transition-colors group-hover:text-slate-200'
                      }
                    />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <ChevronRight size={15} className="shrink-0 text-emerald-300/80" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-white/10 bg-black/10 p-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-300/40 hover:bg-white/10 hover:text-white"
        >
          <Download size={16} />
          Export / Print
        </button>

        <button
          type="button"
          onClick={() => window.location.assign('/help')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <Headphones size={17} />
          Support & Help
        </button>

        <div className="mt-3 flex items-center gap-2 border-t border-white/[0.08] px-2 pt-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-300/15 text-emerald-300">
            <ShieldCheck size={15} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-300">SatyaScan</p>
            <p className="mt-0.5 text-[9px] text-slate-500">
              Compliance workspace
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
