import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
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
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  useEffect(() => {
    if (verificationStatus) localStorage.setItem('ev_verification_status', JSON.stringify(verificationStatus))
    else localStorage.removeItem('ev_verification_status')
  }, [verificationStatus])

  function login(userData) {
    // Nhận data từ API và set vào user state
    setUser({
      ...userData,
      isAuthenticated: true
    })
  }

  function logout() {
    setUser(null)
  }

  function register(userData) {
    // Trong ứng dụng thực, đây sẽ là API call để đăng ký user
    // và xử lý upload tài liệu
    
    // Cho mục đích demo, chúng ta sẽ mô phỏng đăng ký thành công
    setUser({
      ...userData,
      isAuthenticated: true,
    })
    
    // Thiết lập trạng thái xác minh ban đầu
    setVerificationStatus({
      documentsSubmitted: true,
      documentsVerified: false,
      verificationMessage: 'Tài khoản của bạn đã được tạo. Vui lòng đến bất kỳ điểm thuê nào để hoàn tất xác minh.',
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
