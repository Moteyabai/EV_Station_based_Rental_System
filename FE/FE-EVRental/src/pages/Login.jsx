import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

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
      // In a real app, this would validate against an API
      login({ email, password });
      
      // Redirect based on verification status
      // For demo, we'll go to home
      navigate('/');
    } catch (err) {
      setError('Invalid login credentials. Please try again.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login to EV Rental</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="your.email@example.com"
              required 
            />
          </label>
          
          <label>
            Password
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Your password"
              required 
            />
          </label>
          
          <button type="submit" className="btn primary">Login</button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Register now</Link></p>
        </div>
      </div>
    </div>
  );
}