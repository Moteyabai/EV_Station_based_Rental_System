import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, remember });
    // Ở đây sẽ thêm logic xác thực người dùng
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Đăng nhập</h1>
          <p>Chào mừng bạn trở lại với EV Rental</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div className="form-options">
            <div className="remember-option">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember">Nhớ tài khoản</label>
            </div>
            <a href="#" className="forgot-password">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="login-button">Đăng nhập</button>
        </form>

        <div className="login-footer">
          <p>Chưa có tài khoản? <a href="#">Đăng ký ngay</a></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;