import React, { createContext, useContext, useState, useEffect } from 'react'
import { ref, get } from 'firebase/database'
import { db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem('shax_session')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (session) {
      localStorage.setItem('shax_session', JSON.stringify(session))
    } else {
      localStorage.removeItem('shax_session')
    }
  }, [session])

  const isOwner = session?.role === 'owner'

  return (
    <AuthContext.Provider value={{ session, setSession, isOwner }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
