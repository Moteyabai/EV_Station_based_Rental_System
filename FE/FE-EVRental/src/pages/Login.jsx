import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    try {
      // Trong ứng dụng thực, đây sẽ xác thực thông qua API
      login({ email, password });
      
      // Chuyển hướng dựa trên trạng thái xác minh
      // Cho demo, chúng ta sẽ về trang chủ
      navigate('/');
    } catch (err) {
      setError('Thông tin đăng nhập không hợp lệ. Vui lòng thử lại.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Đăng nhập EV Rental</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="email.cua.ban@example.com"
              required 
            />
          </label>
          
          <label>
            Mật khẩu
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Mật khẩu của bạn"
              required 
            />
          </label>
          
          <button type="submit" className="btn primary">Đăng nhập</button>
        </form>
        
        <div className="auth-footer">
          <p>Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
}