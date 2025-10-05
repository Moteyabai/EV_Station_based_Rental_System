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
        accountID: data.accountID || data.AccountID,
        fullName: data.fullName || data.FullName,
        email: data.email || data.Email,
        roleID: data.roleID || data.RoleID,
        roleName: data.roleName || data.RoleName,
        token: data.token || data.Token
      });

      // Lưu token vào localStorage
      localStorage.setItem('token', data.token || data.Token);
      localStorage.setItem('user', JSON.stringify({
        accountID: data.accountID || data.AccountID,
        fullName: data.fullName || data.FullName,
        email: data.email || data.Email,
        roleID: data.roleID || data.RoleID,
        roleName: data.roleName || data.RoleName
      }));
      
      // Chuyển hướng dựa trên role
      // roleID: 1 - Customer, 2 - Staff, 3 - Admin
      const roleId = data.roleID || data.RoleID;
      console.log('Login successful! RoleID:', roleId); // Debug log
      
      if (roleId === 2) {
        // Nếu là staff, chuyển đến trang staff
        console.log('Redirecting to /staff'); // Debug log
        navigate('/staff');
      } else if (roleId === 3) {
        // Nếu là admin, chuyển đến trang admin (tạo sau)
        console.log('Redirecting to /admin'); // Debug log
        navigate('/admin');
      } else {
        // Nếu là customer, chuyển về trang chủ
        console.log('Redirecting to /'); // Debug log
        navigate('/');
      }
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