import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getRenterByAccountID } from "../api/rentals";
import { getToken } from "../utils/auth";
import "../styles/UserProfile.css";

export default function UserProfile() {
  const { user, logout, verificationStatus } = useAuth();
  const navigate = useNavigate();

  // State for editing profile and loading
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    email: "",
    fullName: "",
    phone: "",
    dateOfBirth: "",
    citizenId: "",
    driverLicense: "",
    totalRental: 0,
    totalSpent: 0,
    accountStatus: 0,
    documentStatus: 0,
  });

  // Check authentication and role
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Chặn Staff (roleID = 2) và Admin (roleID = 3)
    const userRoleId = user?.roleID || user?.RoleID;
    if (userRoleId === 2 || userRoleId === 3) {
      console.log("UserProfile: Access denied for Staff/Admin, redirecting...");
      if (userRoleId === 2) {
        navigate("/staff");
      } else {
        navigate("/admin");
      }
      return;
    }

    // Fetch user data from API
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      const accountID = user?.accountID || user?.AccountID;

      if (!token) {
        throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
      }

      if (!accountID) {
        throw new Error("Account ID không tồn tại");
      }

      console.log("Fetching user data for accountID:", accountID);
      console.log("Using token:", token ? "Token exists" : "No token");

      const renterData = await getRenterByAccountID(accountID, token);

      console.log("Received renter data:", renterData);

      // Map API response to profile data
      setProfileData({
        email: renterData.email || user?.email || "",
        fullName: renterData.fullName || "Chưa cập nhật",
        phone: renterData.phone || "Chưa cập nhật",
        dateOfBirth: renterData.dateOfBirth || "",
        citizenId: renterData.idNumber || "Chưa cập nhật",
        driverLicense: renterData.licenseNumber || "Chưa cập nhật",
        totalRental: renterData.totalRental || 0,
        totalSpent: renterData.totalSpent || 0,
        accountStatus: renterData.accountStatus || 0,
        documentStatus: renterData.documentStatus || 0,
        documentID: renterData.documentID || 0,
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    // Trong ứng dụng thực, đây sẽ là API call để cập nhật thông tin user
    console.log("Đang lưu thông tin:", profileData);
    setIsEditing(false);
    // Ở đây bạn thường sẽ cập nhật user context với dữ liệu mới
  };

  const handleCancelEdit = () => {
    // Khôi phục dữ liệu gốc bằng cách fetch lại từ API
    fetchUserData();
    setIsEditing(false);
  };

  const getVerificationStatusText = () => {
    // Sử dụng documentStatus từ API
    switch (profileData.documentStatus) {
      case 1:
        return "Đã xác minh";
      case 0:
        return "Đang chờ xác minh";
      case -1:
        return "Chưa xác minh";
      default:
        return "Chưa xác minh";
    }
  };

  const getVerificationStatusClass = () => {
    // Sử dụng documentStatus từ API
    switch (profileData.documentStatus) {
      case 1:
        return "status-verified";
      case 0:
        return "status-pending";
      case -1:
        return "status-unverified";
      default:
        return "status-unverified";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="user-profile-page">
        <div className="profile-container">
          <div className="loading-message">
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchUserData} className="retry-btn">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Thông tin cá nhân</h1>
          <div className="profile-actions">
            {!isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSaveProfile}>
                  Lưu
                </button>
                <button className="cancel-btn" onClick={handleCancelEdit}>
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          {/* Statistics Section */}
          <div className="profile-section">
            <h2>Thống kê</h2>
            <div className="statistics-grid">
              <div className="stat-item">
                <span className="stat-label">Tổng số lần thuê:</span>
                <span className="stat-value">
                  {profileData.totalRental || 0}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tổng chi tiêu:</span>
                <span className="stat-value">
                  {profileData.totalSpent?.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>
          </div>

          {/* Account Status Section */}
          <div className="profile-section">
            <h2>Trạng thái tài khoản</h2>
            <div className="account-status">
              <div className="status-item">
                <span className="status-label">Trạng thái tài khoản:</span>
                <span
                  className={`status-badge ${profileData.accountStatus === 1 ? "status-verified" : "status-unverified"}`}
                >
                  {profileData.accountStatus === 1
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">
                  Trạng thái xác minh giấy tờ:
                </span>
                <span
                  className={`status-badge ${getVerificationStatusClass()}`}
                >
                  {getVerificationStatusText()}
                </span>
              </div>
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
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
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
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <span className="form-value">{profileData.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label>Ngày sinh:</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                  />
                ) : (
                  <span className="form-value">
                    {profileData.dateOfBirth
                      ? new Date(profileData.dateOfBirth).toLocaleDateString(
                          "vi-VN",
                        )
                      : "Chưa cập nhật"}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>CCCD/CMND:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.citizenId}
                    onChange={(e) =>
                      handleInputChange("citizenId", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("driverLicense", e.target.value)
                    }
                    placeholder="Nhập số bằng lái xe"
                  />
                ) : (
                  <span className="form-value">
                    {profileData.driverLicense}
                  </span>
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
                onClick={() => navigate("/history")}
              >
                📋 Xem lịch sử thuê xe
              </button>
              <button
                className="action-btn cart-btn"
                onClick={() => navigate("/cart")}
              >
                🛒 Xem giỏ hàng
              </button>
              <button
                className="action-btn vehicles-btn"
                onClick={() => navigate("/vehicles")}
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
                onClick={() =>
                  alert(
                    "Tính năng đổi mật khẩu sẽ được phát triển trong tương lai",
                  )
                }
              >
                🔒 Đổi mật khẩu
              </button>
              <button
                className="action-btn logout-btn"
                onClick={() => {
                  logout();
                  navigate("/");
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
