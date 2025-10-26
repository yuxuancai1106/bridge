'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange } from '@/lib/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
