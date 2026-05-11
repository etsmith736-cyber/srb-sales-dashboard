import { useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>
  isLoading: boolean
}

export function LoginPage({ onLogin, isLoading }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }

    const success = await onLogin(email, password)
    if (!success) {
      setError('Incorrect email or password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF6EA] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-wider text-[#2E2D32]">
            SOFIA ROSE
          </h1>
          <p className="text-xs tracking-[0.3em] text-[#2E2D32]/60 mt-0.5">
            BERNARDI
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-center text-[#2E2D32]">
            Welcome back
          </h2>
          <p className="text-sm text-[#2E2D32]/50 text-center mt-1 mb-6">
            Sign in to your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#2E2D32]/70 mb-1.5">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4F700]/50 focus:border-[#C4F700] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#2E2D32]/70 mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4F700]/50 focus:border-[#C4F700] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#C4F700] hover:bg-[#b8e800] text-[#2E2D32] font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn size={16} />
              Sign in
            </button>
          </form>
        </div>

        <p className="text-xs text-[#2E2D32]/40 text-center mt-4">
          Rising Ventures &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
