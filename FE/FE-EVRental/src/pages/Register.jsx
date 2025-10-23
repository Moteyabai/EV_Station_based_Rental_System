import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Auth.css'

// Component hiển thị preview file
function FilePreview({ file, label }) {
  if (file) {
    return (
      <div className="upload-preview">
        <div className="file-preview">
          <img 
            src={URL.createObjectURL(file)} 
            alt={`${label} Preview`} 
            className="preview-image"
          />
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            <span className="file-size">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="upload-preview">
      <div className="upload-prompt">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Nhấn để upload {label}</span>
        <small>JPG, PNG, WebP (tối đa 5MB)</small>
      </div>
    </div>
  )
}

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    avatarPicture: null,
    idCardFront: null,
    idCardBack: null,
    licenseCardFront: null,
    licenseCardBack: null
  })
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [name]: 'Chỉ chấp nhận file hình ảnh (JPG, PNG, WebP)'
        }))
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [name]: 'Kích thước file không được vượt quá 5MB'
        }))
        return
      }
      
      // Clear previous errors for this field
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
      
      setFormData(prev => ({
        ...prev,
        [name]: file
      }))
    }
  }

  function validateStep1() {
    const newErrors = {}
    
    if (!formData.fullName) {
      newErrors.fullName = 'Họ tên đầy đủ là bắt buộc'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|yahoomail\.com)$/.test(formData.email)) {
      newErrors.email = 'Hệ thống chỉ hỗ trợ gmail và yahoomail'
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    } else if (!/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ hoa và 1 ký tự đặc biệt'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc'
    } else if (!/^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8-9]|9[0-9])[0-9]{7}$/.test(formData.phone)) {
      newErrors.phone = 'Vui lòng nhập đúng định dạng số điện thoại Việt Nam'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function validateStep2() {
    const newErrors = {}
    if (!formData.avatarPicture) newErrors.avatarPicture = 'Ảnh đại diện là bắt buộc'
    if (!formData.idCardFront) newErrors.idCardFront = 'Ảnh CMND/CCCD mặt trước là bắt buộc'
    if (!formData.idCardBack) newErrors.idCardBack = 'Ảnh CMND/CCCD mặt sau là bắt buộc'
    if (!formData.licenseCardFront) newErrors.licenseCardFront = 'Ảnh GPLX mặt trước là bắt buộc'
    if (!formData.licenseCardBack) newErrors.licenseCardBack = 'Ảnh GPLX mặt sau là bắt buộc'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function nextStep() {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  function prevStep() {
    setStep(1)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (step === 2 && validateStep2()) {
      registerAccount()
    }
  }

  async function registerAccount() {
    setLoading(true)
    setErrors({})
    
    try {
      // Tạo FormData để gửi file
      const formDataToSend = new FormData()
      formDataToSend.append('FullName', formData.fullName)
      formDataToSend.append('Email', formData.email)
      formDataToSend.append('Password', formData.password)
      formDataToSend.append('Phone', formData.phone)
      formDataToSend.append('AvatarPicture', formData.avatarPicture)
      formDataToSend.append('IDCardFront', formData.idCardFront)
      formDataToSend.append('IDCardBack', formData.idCardBack)
      formDataToSend.append('LicenseCardFront', formData.licenseCardFront)
      formDataToSend.append('LicenseCardBack', formData.licenseCardBack)

      // Gọi API backend
      const response = await fetch('http://localhost:5168/api/Account/Register', {
        method: 'POST',
        body: formDataToSend
        // Không set Content-Type header, browser sẽ tự động set với boundary cho multipart/form-data
      })

      // Kiểm tra response có phải JSON không
      const contentType = response.headers.get('content-type')
      let data = null
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error('=== DEBUG: Non-JSON Response ===')
        console.error('Status:', response.status, response.statusText)
        console.error('Content-Type:', contentType)
        console.error('Response Body:', text)
        console.error('================================')
        
        // Nếu là HTML error page
        if (text.includes('<html') || text.includes('<!DOCTYPE')) {
          throw new Error('Server đang gặp lỗi hoặc endpoint không tồn tại. Vui lòng kiểm tra backend.')
        }
        
        throw new Error('Server trả về định dạng không hợp lệ. Vui lòng liên hệ quản trị viên.')
      }

      if (!response.ok) {
        // Xử lý các loại lỗi từ backend
        let errorMessage = 'Đăng ký thất bại'
        
        if (data.error || data.Error) {
          errorMessage = data.error || data.Error
        } else if (data.message || data.Message) {
          errorMessage = data.message || data.Message
        } else if (data.errors) {
          // Xử lý validation errors từ .NET
          const validationErrors = Object.values(data.errors).flat()
          errorMessage = validationErrors.join(', ')
        } else if (typeof data === 'string') {
          errorMessage = data
        }
        
        throw new Error(errorMessage)
      }

      // Đăng ký thành công
      alert('✅ Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.')
      navigate('/login')
      
    } catch (err) {
      console.error('=== Register Error ===')
      console.error('Error:', err)
      console.error('Error message:', err.message)
      console.error('====================')
      
      // Hiển thị thông báo lỗi chi tiết cho người dùng
      let errorMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage = '❌ Không thể kết nối đến server. Vui lòng kiểm tra:\n' +
                      '• Backend có đang chạy tại localhost:5168?\n' +
                      '• Có bật CORS trên backend chưa?\n' +
                      '• Kiểm tra firewall/antivirus'
      } else if (err.message.includes('Server đang gặp lỗi')) {
        errorMessage = '❌ ' + err.message + '\n\nGợi ý:\n' +
                      '• Kiểm tra Console backend có lỗi gì không\n' +
                      '• Đảm bảo endpoint /api/Account/Register tồn tại\n' +
                      '• Xem logs của ASP.NET'
      } else if (err.message) {
        errorMessage = '❌ ' + err.message
      }
      
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Đăng ký tài khoản</h2>
        <p className="step-indicator">Bước {step} / 2</p>

        <form onSubmit={handleSubmit} className={`auth-form ${step === 2 ? 'step-2' : ''}`}>
          {step === 1 ? (
            <>
              <label>
                Họ và tên đầy đủ
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required 
                />
                {errors.fullName && <span className="error">{errors.fullName}</span>}
              </label>

              <label>
                Email
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  required 
                />
                {errors.email && <span className="error">{errors.email}</span>}
                <small style={{color: '#64748b', fontSize: '0.85rem'}}>Chỉ hỗ trợ gmail và yahoomail</small>
              </label>

              <label>
                Số điện thoại
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  placeholder="0901234567"
                  required 
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </label>

              <label>
                Mật khẩu
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự, 1 chữ hoa, 1 ký tự đặc biệt"
                  required 
                />
                {errors.password && <span className="error">{errors.password}</span>}
              </label>

              <label>
                Xác nhận mật khẩu
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  required 
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </label>

              <div className="form-actions">
                <button type="button" className="btn primary" onClick={nextStep} style={{width: '100%'}}>
                  Tiếp theo →
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="document-upload">
                <h3>📋 Xác Thực Giấy Tờ</h3>
                <p>Vui lòng upload ảnh rõ nét của các giấy tờ để xác thực tài khoản</p>
              </div>
                
              {/* Ảnh đại diện */}
              <label className="file-upload">
                <span>📸 Ảnh đại diện</span>
                <input 
                  type="file" 
                  name="avatarPicture" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  onChange={handleFileChange} 
                  required 
                />
                <FilePreview file={formData.avatarPicture} label="ảnh đại diện" />
                {errors.avatarPicture && <span className="error">{errors.avatarPicture}</span>}
              </label>

              {/* CMND/CCCD mặt trước */}
              <label className="file-upload">
                <span>🆔 CMND/CCCD - Mặt trước</span>
                <input 
                  type="file" 
                  name="idCardFront" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  onChange={handleFileChange} 
                  required 
                />
                <FilePreview file={formData.idCardFront} label="CMND/CCCD mặt trước" />
                {errors.idCardFront && <span className="error">{errors.idCardFront}</span>}
              </label>

              {/* CMND/CCCD mặt sau */}
              <label className="file-upload">
                <span>🆔 CMND/CCCD - Mặt sau</span>
                <input 
                  type="file" 
                    name="idCardBack" 
                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                    onChange={handleFileChange} 
                    required 
                  />
                  <FilePreview file={formData.idCardBack} label="CMND/CCCD mặt sau" />
                  {errors.idCardBack && <span className="error">{errors.idCardBack}</span>}
                </label>

              {/* GPLX mặt trước */}
              <label className="file-upload">
                <span>🪪 Giấy phép lái xe - Mặt trước</span>
                <input 
                  type="file" 
                  name="licenseCardFront" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  onChange={handleFileChange} 
                  required 
                />
                <FilePreview file={formData.licenseCardFront} label="GPLX mặt trước" />
                {errors.licenseCardFront && <span className="error">{errors.licenseCardFront}</span>}
              </label>

              {/* GPLX mặt sau */}
              <label className="file-upload">
                <span>🪪 Giấy phép lái xe - Mặt sau</span>
                <input 
                  type="file" 
                  name="licenseCardBack" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  onChange={handleFileChange} 
                  required 
                />
                <FilePreview file={formData.licenseCardBack} label="GPLX mặt sau" />
                {errors.licenseCardBack && <span className="error">{errors.licenseCardBack}</span>}
              </label>

              <div className="document-info">
                <h4>💡 Lưu ý quan trọng:</h4>
                <ul>
                  <li>Đảm bảo ảnh rõ nét, không bị mờ hay lóa sáng</li>
                  <li>Chụp toàn bộ giấy tờ, không cắt xén</li>
                  <li>Giấy tờ phải còn hiệu lực và không bị hư hỏng</li>
                  <li>Tất cả ảnh đều là bắt buộc để hoàn tất đăng ký</li>
                </ul>
              </div>

              {errors.submit && (
                <div className="error-message" style={{
                  gridColumn: '1 / -1',
                  padding: '1rem 1.5rem',
                  marginTop: '1rem',
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  color: '#c33',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}>
                  {errors.submit}
                </div>
              )}

              <div className="form-actions" style={{
                gridColumn: '1 / -1',
                display: 'flex',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                <button 
                  type="button" 
                  className="btn secondary" 
                  onClick={prevStep} 
                  disabled={loading}
                  style={{flex: 1}}
                >
                  ← Quay lại
                </button>
                <button 
                  type="submit" 
                  className="btn primary" 
                  disabled={loading}
                  style={{flex: 2}}
                >
                  {loading ? '⏳ Đang đăng ký...' : '✅ Hoàn tất đăng ký'}
                </button>
              </div>
            </>
          )}
        </form>
        
        <div className="auth-footer">
          <p>Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập ngay</Link></p>
        </div>
      </div>
    </div>
  )
}
