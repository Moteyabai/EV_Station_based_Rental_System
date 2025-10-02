import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Auth.css'

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    drivingLicense: null,
    idCard: null
  })
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const { register } = useAuth()
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
    if (!formData.firstName) newErrors.firstName = 'Họ là bắt buộc'
    if (!formData.lastName) newErrors.lastName = 'Tên là bắt buộc'
    if (!formData.email) newErrors.email = 'Email là bắt buộc'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ'
    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc'
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    if (!formData.phone) newErrors.phone = 'Số điện thoại là bắt buộc'
    else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function validateStep2() {
    const newErrors = {}
    if (!formData.drivingLicense) newErrors.drivingLicense = 'Bằng lái xe là bắt buộc'
    if (!formData.idCard) newErrors.idCard = 'CMND/CCCD là bắt buộc'

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
      // In a real app, you would create a FormData object to send files
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        // We're not sending actual files in this demo
        documentsUploaded: true
      }
      
      // Register the user
      register(userData)
      
      // Navigate to verification pending page
      navigate('/verification-pending')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Đăng ký</h2>
        <p className="step-indicator">Bước {step} / 2</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {step === 1 ? (
            <>
              <div className="form-row">
                <label>
                  Họ
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    required 
                  />
                  {errors.firstName && <span className="error">{errors.firstName}</span>}
                </label>
                <label>
                  Tên
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    required 
                  />
                  {errors.lastName && <span className="error">{errors.lastName}</span>}
                </label>
              </div>

              <label>
                Email
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </label>

              <label>
                Số điện thoại
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
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
                  required 
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </label>

              <button type="button" className="btn primary" onClick={nextStep}>Tiếp theo</button>
            </>
          ) : (
            <>
              <div className="document-upload">
                <h3>Xác Thực Giấy Tờ</h3>
                <p>Vui lòng upload ảnh rõ nét của các giấy tờ để xác thực</p>
                
                <label className="file-upload">
                  <span>Bằng Lái Xe</span>
                  <input 
                    type="file" 
                    name="drivingLicense" 
                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                    onChange={handleFileChange} 
                    required 
                  />
                  <div className="upload-preview">
                    {formData.drivingLicense ? (
                      <div className="file-preview">
                        <img 
                          src={URL.createObjectURL(formData.drivingLicense)} 
                          alt="Driver's License Preview" 
                          className="preview-image"
                        />
                        <div className="file-info">
                          <span className="file-name">{formData.drivingLicense.name}</span>
                          <span className="file-size">
                            {(formData.drivingLicense.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-prompt">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        <span>Nhấn để upload bằng lái xe</span>
                        <small>JPG, PNG, WebP (tối đa 5MB)</small>
                      </div>
                    )}
                  </div>
                  {errors.drivingLicense && <span className="error">{errors.drivingLicense}</span>}
                </label>

                <label className="file-upload">
                  <span>CMND/CCCD/Hộ Chiếu</span>
                  <input 
                    type="file" 
                    name="idCard" 
                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                    onChange={handleFileChange} 
                    required 
                  />
                  <div className="upload-preview">
                    {formData.idCard ? (
                      <div className="file-preview">
                        <img 
                          src={URL.createObjectURL(formData.idCard)} 
                          alt="ID Card Preview" 
                          className="preview-image"
                        />
                        <div className="file-info">
                          <span className="file-name">{formData.idCard.name}</span>
                          <span className="file-size">
                            {(formData.idCard.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-prompt">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        <span>Nhấn để upload CMND/CCCD</span>
                        <small>JPG, PNG, WebP (tối đa 5MB)</small>
                      </div>
                    )}
                  </div>
                  {errors.idCard && <span className="error">{errors.idCard}</span>}
                </label>

                <div className="document-info">
                  <h4>💡 Lưu ý quan trọng:</h4>
                  <ul>
                    <li>Đảm bảo ảnh rõ nét, không bị mờ hay lóa sáng</li>
                    <li>Chụp toàn bộ giấy tờ, không cắt xén</li>
                    <li>Giấy tờ phải còn hiệu lực và không bị hư hỏng</li>
                    <li>Bạn có thể hoàn tất xác thực tại bất kỳ điểm thuê nào</li>
                  </ul>
                </div>
              </div>

              <div className="button-group">
                <button type="button" className="btn secondary" onClick={prevStep}>Quay lại</button>
                <button type="submit" className="btn primary">Hoàn tất đăng ký</button>
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
