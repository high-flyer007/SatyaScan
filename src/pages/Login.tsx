import React, { useState } from 'react'
// import { ShieldCheck, Eye, EyeOff, LockKeyhole, User } from 'lucide-react'
import { Eye, EyeOff, LockKeyhole, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import satyaScanLogo from '../assets/SatyaScan logo.jpeg'

export default function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'Officer' | 'Admin'>('Officer')
  const [error, setError] = useState('')

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    const validCredentials =
      (role === 'Officer' &&
        username === 'officer' &&
        password === '1234') ||
      (role === 'Admin' &&
        username === 'admin' &&
        password === '1234')

    if (!validCredentials) {
      setError('Invalid username or password.')
      return
    }

    localStorage.setItem(
      'satyascan_session',
      JSON.stringify({
        username,
        role,
        loggedIn: true,
      }),
    )

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 flex justify-center">
  <img
    src={satyaScanLogo}
    alt="SatyaScan"
    className="w-full max-w-[430px] object-contain"
  />
</div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#0B2347]">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to access the SatyaScan enforcement portal.
            </p>
          </div>

          {/* Role */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Login As
            </label>

            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setRole('Officer')
                  setUsername('')
                  setPassword('')
                  setError('')
                }}
                className={`rounded-md py-2 text-sm font-semibold transition ${
                  role === 'Officer'
                    ? 'bg-white text-[#0B2347] shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Officer
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('Admin')
                  setUsername('')
                  setPassword('')
                  setError('')
                }}
                className={`rounded-md py-2 text-sm font-semibold transition ${
                  role === 'Admin'
                    ? 'bg-white text-[#0B2347] shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </label>

              <div className="relative">
                <User
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={
                    role === 'Officer' ? 'officer' : 'admin'
                  }
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#0B4A8B] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-[#0B4A8B] focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-[#0B2347] py-3 text-sm font-semibold text-white transition hover:bg-[#12345F]"
            >
              Sign In as {role}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-600">
              Demo credentials
            </p>
            <p className="mt-1">
              Officer: <span className="font-medium">officer / 1234</span>
            </p>
            <p>
              Admin: <span className="font-medium">admin / 1234</span>
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          SatyaScan Enforcement & Compliance Platform
        </p>
      </div>
    </div>
  )
}