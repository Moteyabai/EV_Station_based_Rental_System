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
    // placeholder: trong ứng dụng thực sẽ call API để xác thực thông tin đăng nhập
    // Cho demo, chúng ta sẽ kiểm tra xem user có tồn tại trong localStorage không
    setUser({ 
      email,
      isAuthenticated: true,
      fullName: 'Nguyễn Văn An',
      phone: '0123456789',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      dateOfBirth: '1990-01-15',
      citizenId: '001234567890',
      driverLicense: 'B1-123456789'
    })
    
    // Trong ứng dụng thực, chúng ta sẽ lấy trạng thái xác minh từ server
    setVerificationStatus({
      documentsSubmitted: true,
      documentsVerified: false,
      verificationMessage: 'Giấy tờ của bạn đang chờ xác minh. Vui lòng đến bất kỳ điểm thuê nào để hoàn tất xác minh.',
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
