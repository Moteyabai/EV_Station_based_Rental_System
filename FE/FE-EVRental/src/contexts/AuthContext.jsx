import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('ev_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem('ev_user', JSON.stringify(user))
    else localStorage.removeItem('ev_user')
  }, [user])

  function login({ email }) {
    // placeholder: in real app call API
    setUser({ email })
  }

  function logout() {
    setUser(null)
  }

  function register({ email }) {
    // placeholder: in real app call API
    setUser({ email })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
