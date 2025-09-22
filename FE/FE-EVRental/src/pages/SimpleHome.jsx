import React from 'react'

export default function SimpleHome() {
  return (
    <div style={{ padding: '40px', color: 'black', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1>EV Rental System - Simplified Home</h1>
      <p>This is a simplified version of the home page for debugging purposes.</p>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h2>System Status</h2>
        <ul>
          <li>✅ React is working</li>
          <li>✅ Router is working</li>
          <li>✅ Component rendering is working</li>
        </ul>
      </div>
    </div>
  )
}