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

  const [verificationStatus, setVerificationStatus] = useState(() => {
    try {
      const raw = localStorage.getItem('ev_verification_status')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem('ev_user', JSON.stringify(user))
    else localStorage.removeItem('ev_user')
  }, [user])

  useEffect(() => {
    if (verificationStatus) localStorage.setItem('ev_verification_status', JSON.stringify(verificationStatus))
    else localStorage.removeItem('ev_verification_status')
  }, [verificationStatus])

  function login({ email, password }) {
    // placeholder: in real app call API to validate credentials
    // For demo, we'll check if the user exists in localStorage
    setUser({ 
      email,
      isAuthenticated: true
    })
    
    // In a real app, we would fetch verification status from the server
    setVerificationStatus({
      documentsSubmitted: true,
      documentsVerified: false,
      verificationMessage: 'Your documents are pending verification. Visit any rental location to complete verification.',
    })
  }

  function logout() {
    setUser(null)
  }

  function register(userData) {
    // In a real app, this would make an API call to register the user
    // and handle document uploads
    
    // For demo purposes, we'll simulate a successful registration
    setUser({
      ...userData,
      isAuthenticated: true,
    })
    
    // Set initial verification status
    setVerificationStatus({
      documentsSubmitted: true,
      documentsVerified: false,
      verificationMessage: 'Your account has been created. Please visit any rental location to complete verification.',
    })
  }
  
  function updateVerificationStatus(status) {
    setVerificationStatus({
      ...verificationStatus,
      ...status
    })
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      verificationStatus,
      updateVerificationStatus
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
