import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import VehicleHandover from "./VehicleHandover";
import CustomerVerification from "./CustomerVerification";
import PaymentManagement from "./PaymentManagement";
import VehicleManagement from "./VehicleManagement";
import "../../styles/Staff.css";

export default function Staff() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("handover");

  useEffect(() => {
    // Kiểm tra quyền truy cập
    const userRoleId = user?.roleID || user?.RoleID;
    console.log("Staff page: User:", user, "RoleID:", userRoleId);

    if (!user || userRoleId !== 2) {
      console.log("Staff page: Access denied, redirecting to home");
      navigate("/");
      return;
    }

    // Thay thế history state để ngăn back về trang trước
    window.history.replaceState(null, "", "/staff");
  }, [user, navigate]);

  // Xử lý nút back của trình duyệt
  useEffect(() => {
    const handlePopState = (event) => {
      const userRoleId = user?.roleID || user?.RoleID;

      // Nếu là Staff, ngăn không cho back về trang user
      if (userRoleId === 2) {
        console.log("Staff trying to go back - preventing navigation");
        event.preventDefault();

        // Giữ lại ở trang staff
        window.history.pushState(null, "", "/staff");

        // Hiển thị cảnh báo (tùy chọn)
        alert(
          "⚠️ Bạn không thể quay lại trang trước. Vui lòng sử dụng menu điều hướng hoặc đăng xuất."
        );
      }
    };

    // Thêm state ban đầu để có thể catch popstate
    window.history.pushState(null, "", window.location.pathname);

    // Lắng nghe sự kiện popstate (nút back/forward)
    window.addEventListener("popstate", handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="staff-page">
      {/* Header */}
      <header className="staff-header">
        <div className="staff-header-content">
          <div className="staff-brand">
            <h1>🏍️ Nhân Viên Điểm Thuê</h1>
            <p>Quản lý giao nhận xe và khách hàng</p>
          </div>
          <div className="staff-user-info">
            <div className="user-details">
              <span className="user-name">{user.fullName}</span>
              <span className="user-role">👤 {user.roleName}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="staff-nav">
        <button
          className={`nav-tab ${activeTab === "handover" ? "active" : ""}`}
          onClick={() => setActiveTab("handover")}
        >
          🔄 Giao nhận xe
        </button>
        <button
          className={`nav-tab ${activeTab === "verification" ? "active" : ""}`}
          onClick={() => setActiveTab("verification")}
        >
          🔐 Xác thực KH
        </button>
        <button
          className={`nav-tab ${activeTab === "payment" ? "active" : ""}`}
          onClick={() => setActiveTab("payment")}
        >
          💳 Thanh toán
        </button>
        <button
          className={`nav-tab ${activeTab === "vehicles" ? "active" : ""}`}
          onClick={() => setActiveTab("vehicles")}
        >
          🏍️ Quản lý xe
        </button>
      </nav>

      {/* Main Content */}
      <main className="staff-content">
        <div className="content-container">
          {activeTab === "handover" && <VehicleHandover />}
          {activeTab === "verification" && <CustomerVerification />}
          {activeTab === "payment" && <PaymentManagement key={activeTab} />}
          {activeTab === "vehicles" && <VehicleManagement />}
        </div>
      </main>
    </div>
  );
}
