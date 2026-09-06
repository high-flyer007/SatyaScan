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
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import satyaScanLogo from '../../assets/SatyaScan logo.jpeg'

const mainNavigation = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'New Inspection',
    path: '/inspection/new',
    icon: PlusCircle,
  },
  {
    label: 'Active Inspections',
    path: '/inspection/active',
    icon: ClipboardCheck,
  },
  {
    label: 'History',
    path: '/history',
    icon: History,
  },
  {
    label: 'Products',
    path: '/products',
    icon: Package,
  },
  {
    label: 'Manufacturers',
    path: '/manufacturers',
    icon: Building2,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: FileBarChart,
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Rules & Compliance',
    path: '/rules',
    icon: ShieldCheck,
  },
  {
    label: 'Users',
    path: '/users',
    icon: Users,
  },
  {
    label: 'Audit Log',
    path: '/audit-log',
    icon: FileClock,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
  {
    label: 'Help',
    path: '/help',
    icon: HelpCircle,
  },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      {/* <div className="flex h-[78px] shrink-0 items-center border-b border-slate-100 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2347] text-white">
            <ShieldCheck size={25} strokeWidth={2} />
          </div>

          <div>
            <div className="text-[22px] font-bold tracking-tight text-[#0B2347]">
              Satya<span className="text-emerald-600">Scan</span>
            </div>

            <div className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-500">
              Smart. Connected. Citizen-first.
            </div>
          </div>
        </div>
      </div> */}

      {/* Brand */}
<div className="flex h-[78px] shrink-0 items-center border-b border-slate-100 px-4">
  <img
    src={satyaScanLogo}
    alt="SatyaScan"
    className="w-full max-w-[225px] object-contain"
  />
</div>

      {/* Navigation */}
      <nav className="flex-1 overflow-hidden px-3 py-3">
        <div className="space-y-0.5">
          {mainNavigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-[#0B4A8B]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="shrink-0 border-t border-slate-100 p-3">
        <button className="mb-1.5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50">
          <Download size={17} />
          Export Summary
        </button>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
          <Headphones size={18} />
          Support
        </button>
      </div>
    </aside>
  )
}