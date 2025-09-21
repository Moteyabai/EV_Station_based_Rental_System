import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './NavBar.css'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="ev-nav">
      <div className="ev-container">
        <Link to="/" className="brand">EV Rental</Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          {user ? (
            <>
              <span className="ev-user">{user.email}</span>
              <button className="ev-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
