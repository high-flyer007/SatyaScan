
import { useMemo, useState } from 'react'
import { Search, Users as UsersIcon, ShieldCheck } from 'lucide-react'

type DirectoryUser = {
  name: string
  username: string
  role: 'Admin' | 'Officer'
  status: 'Active'
}

const demoUsers: DirectoryUser[] = [
  {
    name: 'System Administrator',
    username: 'admin',
    role: 'Admin',
    status: 'Active',
  },
  {
    name: 'Alex Officer',
    username: 'officer',
    role: 'Officer',
    status: 'Active',
  },
]

export default function Users() {
  const [search, setSearch] = useState('')

  const currentSession = (() => {
    try {
      return JSON.parse(
        localStorage.getItem('satyascan_session') || 'null',
      )
    } catch {
      return null
    }
  })()

  const users = useMemo(() => {
    return demoUsers.filter((user) =>
      `${user.name} ${user.username} ${user.role}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
  }, [search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          User Directory
        </h1>
        <p className="mt-2 text-slate-500">
          View the demo accounts and their application roles.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Directory accounts</p>
            <UsersIcon className="text-blue-700" size={22} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {demoUsers.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Your current role</p>
            <ShieldCheck className="text-green-700" size={22} />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {currentSession?.role
              ? String(currentSession.role)
              : 'Unknown'}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Application Accounts
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Demo directory · {users.length} displayed
            </p>
          </div>

          <div className="relative sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search accounts..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-4">User</th>
                <th className="px-3 py-4">Username</th>
                <th className="px-3 py-4">Role</th>
                <th className="px-3 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.username}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-3 py-4 font-medium text-slate-900">
                    {user.name}
                  </td>
                  <td className="px-3 py-4 text-slate-600">
                    {user.username}
                  </td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-10 text-center text-slate-500"
                  >
                    No matching accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          This is a demo directory, not a live identity-management system.
          Account creation, password management and permissions are not
          implemented here.
        </p>
      </section>
    </div>
  )
}
