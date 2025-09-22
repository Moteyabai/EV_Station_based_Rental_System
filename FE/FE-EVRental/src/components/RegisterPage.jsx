import React, { useState } from 'react';
import './RegisterPage.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Vui lòng nhập họ';
    if (!formData.lastName.trim()) newErrors.lastName = 'Vui lòng nhập tên';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Số điện thoại không hợp lệ';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản dịch vụ';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 2 && validateStep2()) {
      console.log('Registration data:', formData);
      // Ở đây sẽ thêm logic đăng ký người dùng
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Đăng ký tài khoản</h1>
          <p>Bước {currentStep}/2</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {currentStep === 1 ? (
            // Step 1: Personal Information
            <div className="form-step">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Họ</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Nhập họ"
                  />
                  {errors.firstName && <span className="error">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Tên</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Nhập tên"
                  />
                  {errors.lastName && <span className="error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>

              <button type="button" className="btn-next" onClick={nextStep}>
                Tiếp tục
              </button>
            </div>
          ) : (
            // Step 2: Password & Terms
            <div className="form-step">
              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                />
                {errors.password && <span className="error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <label htmlFor="agreeTerms">
                  Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a>
                </label>
                {errors.agreeTerms && <span className="error">{errors.agreeTerms}</span>}
              </div>

              <div className="button-group">
                <button type="button" className="btn-prev" onClick={prevStep}>
                  Quay lại
                </button>
                <button type="submit" className="btn-register">
                  Đăng ký
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="register-footer">
          <p>Đã có tài khoản? <a href="#">Đăng nhập</a></p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;