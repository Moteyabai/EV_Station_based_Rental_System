import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import StationDetail from './pages/StationDetail'
import ProductList from './components/ProductList'
import products from './data/products'
import ProductDetail from './pages/ProductDetail'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/stations/:id" element={<StationDetail />} />
          <Route path="/products" element={<ProductList products={products} />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
