import { useState, useCallback } from 'react'
import { trpc } from '@/lib/trpc'

const SESSION_KEY = 'rv_session'

interface Session {
  id: number
  email: string
  isAdmin: number
  loggedInAt: number
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(user: any): Session {
  const session: Session = { ...user, loggedInAt: Date.now() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(() => loadSession())
  const validateMutation = trpc.dashboardUsers.validateCredentials.useMutation()

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const result = await validateMutation.mutateAsync({ email, password })
        if (!result.success || !result.user) return false
        const s = saveSession(result.user)
        setSession(s)
        return true
      } catch {
        return false
      }
    },
    [validateMutation]
  )

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  return {
    isAuthenticated: session !== null,
    session,
    isAdmin: session?.isAdmin === 1,
    login,
    logout,
    isLoggingIn: validateMutation.isPending,
  }
}
