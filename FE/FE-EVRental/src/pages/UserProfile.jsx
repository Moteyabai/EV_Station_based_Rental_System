import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfile.css';

export default function UserProfile() {
  const { user, logout, verificationStatus } = useAuth();
  const navigate = useNavigate();
  
  // State for editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    fullName: user?.fullName || 'Chưa cập nhật',
    phone: user?.phone || 'Chưa cập nhật',
    address: user?.address || 'Chưa cập nhật',
    dateOfBirth: user?.dateOfBirth || '',
    citizenId: user?.citizenId || 'Chưa cập nhật',
    driverLicense: user?.driverLicense || 'Chưa cập nhật'
  });

  // If user is not logged in, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    // Trong ứng dụng thực, đây sẽ là API call để cập nhật thông tin user
    console.log('Đang lưu thông tin:', profileData);
    setIsEditing(false);
    // Ở đây bạn thường sẽ cập nhật user context với dữ liệu mới
  };

  const handleCancelEdit = () => {
    // Khôi phục dữ liệu gốc
    setProfileData({
      email: user?.email || '',
      fullName: user?.fullName || 'Chưa cập nhật',
      phone: user?.phone || 'Chưa cập nhật',
      address: user?.address || 'Chưa cập nhật',
      dateOfBirth: user?.dateOfBirth || '',
      citizenId: user?.citizenId || 'Chưa cập nhật',
      driverLicense: user?.driverLicense || 'Chưa cập nhật'
    });
    setIsEditing(false);
  };

  const getVerificationStatusText = () => {
    if (!verificationStatus) return 'Chưa xác minh';
    if (verificationStatus.documentsVerified) return 'Đã xác minh';
    if (verificationStatus.documentsSubmitted) return 'Đang chờ xác minh';
    return 'Chưa xác minh';
  };

  const getVerificationStatusClass = () => {
    if (!verificationStatus) return 'status-pending';
    if (verificationStatus.documentsVerified) return 'status-verified';
    if (verificationStatus.documentsSubmitted) return 'status-pending';
    return 'status-unverified';
  };

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Thông tin cá nhân</h1>
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="edit-btn" 
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-btn" 
                  onClick={handleSaveProfile}
                >
                  Lưu
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={handleCancelEdit}
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          {/* Account Status Section */}
          <div className="profile-section">
            <h2>Trạng thái tài khoản</h2>
            <div className="account-status">
              <div className="status-item">
                <span className="status-label">Trạng thái xác minh:</span>
                <span className={`status-badge ${getVerificationStatusClass()}`}>
                  {getVerificationStatusText()}
                </span>
              </div>
              {verificationStatus?.verificationMessage && (
                <div className="verification-message">
                  <p>{verificationStatus.verificationMessage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="profile-section">
            <h2>Thông tin cá nhân</h2>
            <div className="profile-form">
              <div className="form-group">
                <label>Email:</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled // Email không nên được chỉnh sửa
                  />
                ) : (
                  <span className="form-value">{profileData.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Họ và tên:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <span className="form-value">{profileData.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Số điện thoại:</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <span className="form-value">{profileData.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label>Địa chỉ:</label>
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Nhập địa chỉ"
                    rows="3"
                  />
                ) : (
                  <span className="form-value">{profileData.address}</span>
                )}
              </div>

              <div className="form-group">
                <label>Ngày sinh:</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                ) : (
                  <span className="form-value">
                    {profileData.dateOfBirth ? 
                      new Date(profileData.dateOfBirth).toLocaleDateString('vi-VN') : 
                      'Chưa cập nhật'
                    }
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>CCCD/CMND:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.citizenId}
                    onChange={(e) => handleInputChange('citizenId', e.target.value)}
                    placeholder="Nhập số CCCD/CMND"
                  />
                ) : (
                  <span className="form-value">{profileData.citizenId}</span>
                )}
              </div>

              <div className="form-group">
                <label>Bằng lái xe:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.driverLicense}
                    onChange={(e) => handleInputChange('driverLicense', e.target.value)}
                    placeholder="Nhập số bằng lái xe"
                  />
                ) : (
                  <span className="form-value">{profileData.driverLicense}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="profile-section">
            <h2>Hành động nhanh</h2>
            <div className="quick-actions">
              <button 
                className="action-btn history-btn"
                onClick={() => navigate('/history')}
              >
                📋 Xem lịch sử thuê xe
              </button>
              <button 
                className="action-btn cart-btn"
                onClick={() => navigate('/cart')}
              >
                🛒 Xem giỏ hàng
              </button>
              <button 
                className="action-btn vehicles-btn"
                onClick={() => navigate('/vehicles')}
              >
                🏍️ Thuê xe mới
              </button>
            </div>
          </div>

          {/* Account Management Section */}
          <div className="profile-section">
            <h2>Quản lý tài khoản</h2>
            <div className="account-actions">
              <button 
                className="action-btn change-password-btn"
                onClick={() => alert('Tính năng đổi mật khẩu sẽ được phát triển trong tương lai')}
              >
                🔒 Đổi mật khẩu
              </button>
              <button 
                className="action-btn logout-btn"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                🚪 Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}