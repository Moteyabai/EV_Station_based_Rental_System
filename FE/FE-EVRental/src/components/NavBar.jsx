import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './NavBar.css'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span>EV</span> Rental
          </Link>
        </div>
        
        <nav className="navbar-nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Trang chủ</Link>
          <Link to="/vehicles" className={`nav-link ${isActive('/vehicles')}`}>Xe máy điện</Link>
          <Link to="/stations" className={`nav-link ${isActive('/stations')}`}>Điểm thuê</Link>
          <Link to="/about" className={`nav-link ${isActive('/about')}`}>Giới thiệu</Link>
        </nav>
        
        <div className="navbar-actions">
          {user ? (
            <>
              <span className="user-info">{user.email}</span>
              <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">Đăng nhập</Link>
              <Link to="/register" className="register-btn">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
