import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Auth.css'

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    drivingLicense: null,
    idCard: null
  })
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }))
    }
  }

  function validateStep1() {
    const newErrors = {}
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.phone) newErrors.phone = 'Phone number is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function validateStep2() {
    const newErrors = {}
    if (!formData.drivingLicense) newErrors.drivingLicense = 'Driving license is required'
    if (!formData.idCard) newErrors.idCard = 'ID card is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function nextStep() {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  function prevStep() {
    setStep(1)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (step === 2 && validateStep2()) {
      // In a real app, you would create a FormData object to send files
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        // We're not sending actual files in this demo
        documentsUploaded: true
      }
      
      // Register the user
      register(userData)
      
      // Navigate to verification pending page
      navigate('/verification-pending')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Register</h2>
        <p className="step-indicator">Step {step} of 2</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {step === 1 ? (
            <>
              <div className="form-row">
                <label>
                  First Name
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    required 
                  />
                  {errors.firstName && <span className="error">{errors.firstName}</span>}
                </label>
                <label>
                  Last Name
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    required 
                  />
                  {errors.lastName && <span className="error">{errors.lastName}</span>}
                </label>
              </div>

              <label>
                Email
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </label>

              <label>
                Phone Number
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </label>

              <label>
                Password
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                {errors.password && <span className="error">{errors.password}</span>}
              </label>

              <label>
                Confirm Password
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </label>

              <button type="button" className="btn primary" onClick={nextStep}>Next</button>
            </>
          ) : (
            <>
              <div className="document-upload">
                <h3>Document Verification</h3>
                <p>Please upload clear photos of your documents for verification</p>
                
                <label className="file-upload">
                  <span>Driver's License</span>
                  <input 
                    type="file" 
                    name="drivingLicense" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    required 
                  />
                  <div className="upload-preview">
                    {formData.drivingLicense ? (
                      <div className="file-name">{formData.drivingLicense.name}</div>
                    ) : (
                      <div className="upload-prompt">Click to upload</div>
                    )}
                  </div>
                  {errors.drivingLicense && <span className="error">{errors.drivingLicense}</span>}
                </label>

                <label className="file-upload">
                  <span>ID Card (National ID/Passport)</span>
                  <input 
                    type="file" 
                    name="idCard" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    required 
                  />
                  <div className="upload-preview">
                    {formData.idCard ? (
                      <div className="file-name">{formData.idCard.name}</div>
                    ) : (
                      <div className="upload-prompt">Click to upload</div>
                    )}
                  </div>
                  {errors.idCard && <span className="error">{errors.idCard}</span>}
                </label>

                <div className="document-info">
                  <p>Your documents will be verified by our staff.</p>
                  <p>You can complete verification at any rental location.</p>
                </div>
              </div>

              <div className="button-group">
                <button type="button" className="btn secondary" onClick={prevStep}>Back</button>
                <button type="submit" className="btn primary">Complete Registration</button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
