import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Gọi API backend để đăng nhập
      const response = await fetch('http://localhost:5168/api/Account/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Xử lý lỗi từ backend
        throw new Error(data.error || 'Đăng nhập thất bại');
      }

      // Lưu thông tin user vào context
      login({
        accountID: data.accountID,
        fullName: data.fullName,
        email: data.email,
        roleID: data.roleID,
        roleName: data.roleName,
        token: data.token
      });

      // Lưu token vào localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        accountID: data.accountID,
        fullName: data.fullName,
        email: data.email,
        roleID: data.roleID,
        roleName: data.roleName
      }));
      
      // Chuyển hướng về trang chủ
      navigate('/');
    } catch (err) {
      setError(err.message || 'Thông tin đăng nhập không hợp lệ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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
          
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
}