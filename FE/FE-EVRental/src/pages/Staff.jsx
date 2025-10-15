import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getAllBookings,
  updateBookingStatus,
  verifyPayment,
  rejectPayment,
} from "../utils/bookingStorage";
import "../styles/Staff.css";

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
    }
  }, [user, navigate]);

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
          className={`nav-tab ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          Quản lý đơn hàng
        </button>
        <button
          className={`nav-tab ${activeTab === "handover" ? "active" : ""}`}
          onClick={() => setActiveTab("handover")}
        >
          Giao nhận xe
        </button>
        <button
          className={`nav-tab ${activeTab === "verification" ? "active" : ""}`}
          onClick={() => setActiveTab("verification")}
        >
          Xác thực KH
        </button>
        <button
          className={`nav-tab ${activeTab === "payment" ? "active" : ""}`}
          onClick={() => setActiveTab("payment")}
        >
          Thanh toán
        </button>
        <button
          className={`nav-tab ${activeTab === "vehicles" ? "active" : ""}`}
          onClick={() => setActiveTab("vehicles")}
        >
          Quản lý xe
        </button>
      </nav>

      {/* Main Content */}
      <main className="staff-content">
        <div className="content-container">
          {activeTab === "bookings" && (
            <BookingManagement userRole="staff" stationId={user.stationId} />
          )}
          `n{" "}
          {activeTab === "bookings" && (
            <BookingManagement userRole="staff" stationId={user.stationId} />
          )}
          `n {activeTab === "handover" && <VehicleHandover />}
          {activeTab === "verification" && <CustomerVerification />}
          {activeTab === "payment" && <PaymentManagement />}
          {activeTab === "vehicles" && <VehicleManagement />}
        </div>
      </main>
    </div>
  );
}

// Component Quản lý Giao - Nhận xe
function VehicleHandover() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);

  // Load bookings from localStorage on mount and set up refresh
  useEffect(() => {
    loadBookings();

    // Refresh bookings every 5 seconds to catch new bookings
    const interval = setInterval(loadBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadBookings = () => {
    const allBookings = getAllBookings();

    // CHỈ LẤY BOOKINGS ĐÃ XÁC THỰC THANH TOÁN (status !== 'pending_payment')
    const verifiedBookings = allBookings.filter(
      (booking) =>
        booking.status !== "pending_payment" && booking.status !== "cancelled"
    );

    // Transform bookings to vehicle format for display
    const transformedVehicles = verifiedBookings.map((booking) => {
      // Kiểm tra xe đã quá hạn chưa
      const returnDateTime = new Date(
        `${booking.returnDate} ${booking.returnTime}`
      );
      const now = new Date();
      const isOverdue = booking.status === "renting" && returnDateTime < now;

      return {
        id: booking.id,
        vehicleName: booking.vehicleName,
        licensePlate: booking.licensePlate,
        customerName: booking.userName,
        userPhone: booking.userPhone,
        userEmail: booking.userEmail,
        bookingId: booking.bookingId,
        status: booking.status,
        pickupDate: `${booking.pickupDate} ${booking.pickupTime}`,
        returnDate: `${booking.returnDate} ${booking.returnTime}`,
        pickupStation: booking.pickupStation?.name || "Chưa xác định",
        returnStation: booking.returnStation?.name || "Chưa xác định",
        battery: booking.battery,
        lastCheck: booking.lastCheck,
        completedDate: booking.completedDate,
        days: booking.days,
        totalPrice: booking.totalPrice,
        vehicleImage: booking.vehicleImage,
        paymentVerified: booking.paymentVerified,
        paymentVerifiedAt: booking.paymentVerifiedAt,
        isOverdue: isOverdue, // Flag để đánh dấu xe quá hạn
        overdueHours: isOverdue
          ? Math.floor((now - returnDateTime) / (1000 * 60 * 60))
          : 0,
      };
    });

    setVehicles(transformedVehicles);
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (selectedFilter === "all") return true;
    return v.status === selectedFilter;
  });

  const getStatusBadge = (status) => {
    const config = {
      booked: { text: "Đã đặt trước", class: "status-booked", icon: "📅" },
      renting: { text: "Đang cho thuê", class: "status-renting", icon: "�" },
      completed: {
        text: "Đã hoàn thành",
        class: "status-completed",
        icon: "✅",
      },
    };
    const c = config[status] || config.booked;
    return (
      <span className={`status-badge ${c.class}`}>
        {c.icon} {c.text}
      </span>
    );
  };

  const handlePickup = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowHandoverModal(true);
  };

  const handleReturn = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowHandoverModal(true);
  };

  const handleCompleteHandover = (vehicleId, newStatus) => {
    // Update status in localStorage
    updateBookingStatus(vehicleId, newStatus);

    // Reload bookings to refresh the display
    loadBookings();

    // Close modal
    setShowHandoverModal(false);
    setSelectedVehicle(null);
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>🔄 Quản lý Giao - Nhận Xe</h2>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedFilter === "all" ? "active" : ""}`}
            onClick={() => setSelectedFilter("all")}
          >
            Tất cả ({vehicles.length})
          </button>
          <button
            className={`filter-btn ${
              selectedFilter === "completed" ? "active" : ""
            }`}
            onClick={() => setSelectedFilter("completed")}
          >
            Đã hoàn thành đơn (
            {vehicles.filter((v) => v.status === "completed").length})
          </button>
          <button
            className={`filter-btn ${
              selectedFilter === "booked" ? "active" : ""
            }`}
            onClick={() => setSelectedFilter("booked")}
          >
            Đã đặt ({vehicles.filter((v) => v.status === "booked").length})
          </button>
          <button
            className={`filter-btn ${
              selectedFilter === "renting" ? "active" : ""
            }`}
            onClick={() => setSelectedFilter("renting")}
          >
            Đang thuê ({vehicles.filter((v) => v.status === "renting").length})
          </button>
        </div>
      </div>

      <div className="vehicles-list">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`handover-vehicle-card ${
              vehicle.isOverdue ? "overdue-warning" : ""
            }`}
          >
            <div className="vehicle-header">
              <div className="vehicle-title">
                <h3>{vehicle.vehicleName}</h3>
                <span className="license-plate">🏍️ {vehicle.licensePlate}</span>
              </div>
              <div className="status-badges">
                {vehicle.isOverdue && (
                  <span className="overdue-badge">
                    ⚠️ QUÁ HẠN {vehicle.overdueHours}h
                  </span>
                )}
                {getStatusBadge(vehicle.status)}
              </div>
            </div>

            {vehicle.isOverdue && (
              <div className="overdue-alert">
                <span className="alert-icon">🚨</span>
                <span className="alert-text">
                  Xe đã quá thời hạn trả{" "}
                  <strong>{vehicle.overdueHours} giờ</strong>! Vui lòng liên hệ
                  khách hàng ngay.
                </span>
              </div>
            )}

            <div className="vehicle-details">
              <div className="detail-row">
                <span className="label">🔋 Pin:</span>
                <span className="value">
                  <div className="battery-indicator">
                    <div
                      className="battery-fill"
                      style={{ width: vehicle.battery }}
                    />
                  </div>
                  {vehicle.battery}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">🕐 Kiểm tra cuối:</span>
                <span className="value">{vehicle.lastCheck}</span>
              </div>

              {vehicle.customerName && (
                <>
                  <div className="detail-row">
                    <span className="label">👤 Khách hàng:</span>
                    <span className="value">{vehicle.customerName}</span>
                  </div>
                  {vehicle.userPhone && (
                    <div className="detail-row">
                      <span className="label">📱 Số điện thoại:</span>
                      <span className="value">{vehicle.userPhone}</span>
                    </div>
                  )}
                  {vehicle.userEmail && (
                    <div className="detail-row">
                      <span className="label">� Email:</span>
                      <span className="value">{vehicle.userEmail}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">�📋 Mã booking:</span>
                    <span className="value">{vehicle.bookingId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📅 Nhận xe:</span>
                    <span className="value">{vehicle.pickupDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📅 Trả xe:</span>
                    <span className="value">{vehicle.returnDate}</span>
                  </div>
                  {vehicle.pickupStation && (
                    <div className="detail-row">
                      <span className="label">📍 Điểm nhận:</span>
                      <span className="value">{vehicle.pickupStation}</span>
                    </div>
                  )}
                  {vehicle.returnStation && (
                    <div className="detail-row">
                      <span className="label">📍 Điểm trả:</span>
                      <span className="value">{vehicle.returnStation}</span>
                    </div>
                  )}
                  {vehicle.status === "completed" && vehicle.completedDate && (
                    <div className="detail-row">
                      <span className="label">✅ Hoàn thành:</span>
                      <span className="value completed-date">
                        {vehicle.completedDate}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="vehicle-actions">
              {vehicle.status === "booked" && (
                <button
                  className="btn-action btn-pickup"
                  onClick={() => handlePickup(vehicle)}
                >
                  ✅ Bàn giao xe
                </button>
              )}
              {vehicle.status === "renting" && (
                <button
                  className="btn-action btn-return"
                  onClick={() => handleReturn(vehicle)}
                >
                  🔄 Thu hồi xe
                </button>
              )}
              {vehicle.status === "completed" && (
                <button className="btn-action btn-completed" disabled>
                  ✅ Đã hoàn thành
                </button>
              )}
              <button className="btn-action btn-view">👁️ Chi tiết xe</button>
            </div>
          </div>
        ))}
      </div>

      {showHandoverModal && selectedVehicle && (
        <HandoverModal
          vehicle={selectedVehicle}
          onClose={() => {
            setShowHandoverModal(false);
            setSelectedVehicle(null);
          }}
          onComplete={handleCompleteHandover}
        />
      )}
    </div>
  );
}

// Modal bàn giao xe
function HandoverModal({ vehicle, onClose, onComplete }) {
  const [checklist, setChecklist] = useState({
    bodyCondition: false,
    tireCondition: false,
    lightsWorking: false,
    brakeWorking: false,
    batteryCharged: false,
    documentsChecked: false,
  });
  const [signature, setSignature] = useState("");
  const [photos, setPhotos] = useState([]);

  const handleChecklistChange = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCompleteHandover = () => {
    // Determine new status based on current status
    let newStatus;
    if (vehicle.status === "booked") {
      newStatus = "renting"; // Bàn giao xe -> đang thuê
    } else if (vehicle.status === "renting") {
      newStatus = "completed"; // Thu hồi xe -> hoàn thành
    }

    // Call parent handler to update booking status
    if (onComplete && newStatus) {
      onComplete(vehicle.id, newStatus);
    }

    onClose();
  };

  const allChecked = Object.values(checklist).every((v) => v);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Thủ tục Bàn giao Xe</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="vehicle-info-box">
            <h3>{vehicle.vehicleName}</h3>
            <p className="license-plate-display">
              🏍️ Biển số: <strong>{vehicle.licensePlate}</strong>
            </p>
            <p>
              Khách hàng: <strong>{vehicle.customerName}</strong>
            </p>
            <p>
              Mã booking: <strong>{vehicle.bookingId}</strong>
            </p>
          </div>

          <div className="checklist-section">
            <h3>✅ Checklist kiểm tra xe</h3>
            <div className="checklist-items">
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.bodyCondition}
                  onChange={() => handleChecklistChange("bodyCondition")}
                />
                <span>Thân xe không trầy xước, móp méo</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.tireCondition}
                  onChange={() => handleChecklistChange("tireCondition")}
                />
                <span>Lốp xe trong tình trạng tốt</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.lightsWorking}
                  onChange={() => handleChecklistChange("lightsWorking")}
                />
                <span>Đèn chiếu sáng hoạt động bình thường</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.brakeWorking}
                  onChange={() => handleChecklistChange("brakeWorking")}
                />
                <span>Phanh hoạt động tốt</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.batteryCharged}
                  onChange={() => handleChecklistChange("batteryCharged")}
                />
                <span>Pin đầy, sạc tốt ({vehicle.battery})</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={checklist.documentsChecked}
                  onChange={() => handleChecklistChange("documentsChecked")}
                />
                <span>Giấy tờ xe đầy đủ</span>
              </label>
            </div>
          </div>

          <div className="photo-section">
            <h3>📸 Tình trạng xe (Trước/Sau/Trái/Phải)</h3>
            <div className="photo-upload">
              <button className="btn-upload">📷 Load ảnh xe</button>
              <span className="photo-count">{photos.length}/4 ảnh</span>
            </div>
          </div>

          <div className="signature-section">
            <h3>✍️ Ký xác nhận điện tử</h3>
            <div className="signature-box">
              <input
                type="text"
                placeholder="Nhập tên để ký xác nhận..."
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="signature-input"
              />
            </div>
            <p className="signature-note">
              Tôi xác nhận đã kiểm tra xe và đồng ý với tình trạng trên
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn-confirm"
            disabled={!allChecked || !signature}
            onClick={handleCompleteHandover}
          >
            ✅ Hoàn tất bàn giao
          </button>
        </div>
      </div>
    </div>
  );
}

// Component Xác thực khách hàng
function CustomerVerification() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([
    {
      id: 1,
      fullName: "Nguyễn Văn A",
      phone: "0901234567",
      email: "nguyenvana@email.com",
      idCard: "001234567890",
      driverLicense: "B1-123456789",
      licenseExpiry: "2028-12-31",
      verified: true,
      bookingId: "BK001",
    },
    {
      id: 2,
      fullName: "Trần Thị B",
      phone: "0912345678",
      email: "tranthib@email.com",
      idCard: "001234567891",
      driverLicense: "B1-987654321",
      licenseExpiry: "2027-06-30",
      verified: false,
      bookingId: "BK002",
    },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerify = (customer) => {
    setSelectedCustomer(customer);
    setShowVerifyModal(true);
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>🔐 Xác thực Khách hàng</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên, SĐT, mã booking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="customer-list">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="customer-card">
            <div className="customer-header">
              <div className="customer-info">
                <h3>{customer.fullName}</h3>
                <span className="booking-badge">📋 {customer.bookingId}</span>
              </div>
              <span
                className={`verify-badge ${
                  customer.verified ? "verified" : "pending"
                }`}
              >
                {customer.verified ? "✅ Đã xác thực" : "⏳ Chưa xác thực"}
              </span>
            </div>

            <div className="customer-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">📱 Số điện thoại:</span>
                  <span className="value">{customer.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📧 Email:</span>
                  <span className="value">{customer.email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">🆔 CMND/CCCD:</span>
                  <span className="value">{customer.idCard}</span>
                </div>
                <div className="detail-item">
                  <span className="label">🪪 GPLX:</span>
                  <span className="value">{customer.driverLicense}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📅 Hạn GPLX:</span>
                  <span className="value">{customer.licenseExpiry}</span>
                </div>
              </div>
            </div>

            <div className="customer-actions">
              {!customer.verified && (
                <button
                  className="btn-action btn-verify"
                  onClick={() => handleVerify(customer)}
                >
                  ✅ Xác thực
                </button>
              )}
              <button className="btn-action btn-view">👁️ Xem hồ sơ</button>
              <button className="btn-action btn-photo">📸 Chụp giấy tờ</button>
            </div>
          </div>
        ))}
      </div>

      {showVerifyModal && selectedCustomer && (
        <VerificationModal
          customer={selectedCustomer}
          onClose={() => {
            setShowVerifyModal(false);
            setSelectedCustomer(null);
          }}
          onVerify={() => {
            setCustomers(
              customers.map((c) =>
                c.id === selectedCustomer.id ? { ...c, verified: true } : c
              )
            );
            setShowVerifyModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

// Modal xác thực khách hàng
function VerificationModal({ customer, onClose, onVerify }) {
  const [verification, setVerification] = useState({
    idCardPhoto: false,
    licensePhoto: false,
    facePhoto: false,
    idCardMatch: false,
    licenseValid: false,
  });

  const allVerified = Object.values(verification).every((v) => v);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔐 Xác thực khách hàng</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="customer-info-box">
            <h3>{customer.fullName}</h3>
            <p>
              Mã booking: <strong>{customer.bookingId}</strong>
            </p>
            <p>
              Số điện thoại: <strong>{customer.phone}</strong>
            </p>
          </div>

          <div className="verification-section">
            <h3>📋 Checklist xác thực</h3>
            <div className="verification-items">
              <label className="verification-item">
                <input
                  type="checkbox"
                  checked={verification.idCardPhoto}
                  onChange={() =>
                    setVerification((prev) => ({
                      ...prev,
                      idCardPhoto: !prev.idCardPhoto,
                    }))
                  }
                />
                <span>📸 Đã chụp ảnh CMND/CCCD</span>
              </label>
              <label className="verification-item">
                <input
                  type="checkbox"
                  checked={verification.licensePhoto}
                  onChange={() =>
                    setVerification((prev) => ({
                      ...prev,
                      licensePhoto: !prev.licensePhoto,
                    }))
                  }
                />
                <span>📸 Đã chụp ảnh GPLX</span>
              </label>
              <label className="verification-item">
                <input
                  type="checkbox"
                  checked={verification.facePhoto}
                  onChange={() =>
                    setVerification((prev) => ({
                      ...prev,
                      facePhoto: !prev.facePhoto,
                    }))
                  }
                />
                <span>📸 Đã chụp ảnh khuôn mặt</span>
              </label>
              <label className="verification-item">
                <input
                  type="checkbox"
                  checked={verification.idCardMatch}
                  onChange={() =>
                    setVerification((prev) => ({
                      ...prev,
                      idCardMatch: !prev.idCardMatch,
                    }))
                  }
                />
                <span>✅ Thông tin CMND khớp với hồ sơ</span>
              </label>
              <label className="verification-item">
                <input
                  type="checkbox"
                  checked={verification.licenseValid}
                  onChange={() =>
                    setVerification((prev) => ({
                      ...prev,
                      licenseValid: !prev.licenseValid,
                    }))
                  }
                />
                <span>✅ GPLX còn hạn và hợp lệ</span>
              </label>
            </div>
          </div>

          <div className="document-info">
            <h3>📄 Thông tin giấy tờ</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>CMND/CCCD:</label>
                <span>{customer.idCard}</span>
              </div>
              <div className="info-item">
                <label>Giấy phép lái xe:</label>
                <span>{customer.driverLicense}</span>
              </div>
              <div className="info-item">
                <label>Ngày hết hạn GPLX:</label>
                <span>{customer.licenseExpiry}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn-confirm"
            disabled={!allVerified}
            onClick={onVerify}
          >
            ✅ Xác thực
          </button>
        </div>
      </div>
    </div>
  );
}

// Component Quản lý thanh toán
// Component Quản lý thanh toán
function PaymentManagement() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load bookings chờ xác nhận thanh toán
  useEffect(() => {
    loadPendingPayments();

    // Auto refresh mỗi 5 giây
    const interval = setInterval(loadPendingPayments, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingPayments = () => {
    const allBookings = getAllBookings();

    console.log(
      "🔍 PaymentManagement: Loading bookings...",
      allBookings.length
    );

    // Lấy tất cả bookings (bao gồm pending_payment, booked, completed)
    const paymentData = allBookings.map((booking) => ({
      id: booking.id,
      bookingId: booking.id, // Sử dụng booking.id thay vì booking.bookingId
      customerName: booking.userName,
      customerPhone: booking.userPhone,
      customerEmail: booking.userEmail,
      vehicleName: booking.vehicleName,
      licensePlate: booking.licensePlate,
      type: "rental", // Phí thuê xe
      amount: booking.totalPrice,
      status:
        booking.status === "pending_payment"
          ? "pending"
          : booking.status === "cancelled"
          ? "cancelled"
          : "verified",
      method:
        booking.paymentMethod === "credit_card"
          ? "card"
          : booking.paymentMethod === "bank_transfer"
          ? "transfer"
          : booking.paymentMethod === "e_wallet"
          ? "ewallet"
          : "cash",
      date: booking.createdAt,
      pickupDate: `${booking.pickupDate} ${booking.pickupTime}`,
      returnDate: `${booking.returnDate} ${booking.returnTime}`,
      days: booking.days,
      pickupStation: booking.pickupStation, // Đã là string
      returnStation: booking.returnStation, // Đã là string
      paymentVerified: booking.paymentVerified,
      paymentVerifiedAt: booking.paymentVerifiedAt,
      paymentVerifiedBy: booking.paymentVerifiedBy,
      rejectedAt: booking.rejectedAt,
      rejectedBy: booking.rejectedBy,
      rejectionReason: booking.rejectionReason,
    }));

    console.log("✅ PaymentManagement: Loaded payments:", paymentData.length);
    console.log(
      "📊 Pending:",
      paymentData.filter((p) => p.status === "pending").length
    );
    console.log(
      "📊 Verified:",
      paymentData.filter((p) => p.status === "verified").length
    );

    setPayments(paymentData);
  };

  const getTypeBadge = (type) => {
    const config = {
      rental: { text: "Phí thuê", class: "type-rental", icon: "💰" },
    };
    const c = config[type] || config.rental;
    return (
      <span className={`type-badge ${c.class}`}>
        {c.icon} {c.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { text: "Chờ xác nhận", class: "status-pending", icon: "⏳" },
      verified: { text: "Đã xác nhận", class: "status-completed", icon: "✅" },
      cancelled: { text: "Đã từ chối", class: "status-cancelled", icon: "❌" },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`status-badge ${c.class}`}>
        {c.icon} {c.text}
      </span>
    );
  };

  const handleProcessPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleVerifyPayment = (paymentId) => {
    const staffName = user?.fullName || user?.name || "Staff";
    verifyPayment(paymentId, staffName);
    loadPendingPayments();
    setShowPaymentModal(false);
    setSelectedPayment(null);
    alert("✅ Đã xác nhận thanh toán! Booking chuyển sang tab Giao nhận xe.");
  };

  const handleRejectPayment = (paymentId, reason) => {
    const staffName = user?.fullName || user?.name || "Staff";
    rejectPayment(paymentId, reason, staffName);
    loadPendingPayments();
    setShowPaymentModal(false);
    setSelectedPayment(null);
    alert("❌ Đã từ chối thanh toán!");
  };

  const handleDeletePayment = (payment) => {
    if (
      window.confirm(
        `⚠️ Bạn có chắc muốn xóa đơn hàng #${payment.bookingId}?\nXe: ${payment.vehicleName}\nKhách hàng: ${payment.customerName}`
      )
    ) {
      try {
        // Lấy tất cả bookings
        const allBookings = getAllBookings();

        // Xóa booking này
        const updatedBookings = allBookings.filter((b) => b.id !== payment.id);

        // Lưu lại
        localStorage.setItem(
          "ev_rental_bookings",
          JSON.stringify(updatedBookings)
        );

        // Reload danh sách
        loadPendingPayments();

        alert("🗑️ Đã xóa đơn hàng thành công!");
      } catch (error) {
        console.error("❌ Lỗi khi xóa booking:", error);
        alert("❌ Có lỗi xảy ra khi xóa đơn hàng!");
      }
    }
  };

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalVerified = payments
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>💰 Xác Nhận Thanh Toán</h2>
        <div className="section-stats">
          <div className="stat-card">
            <span className="stat-number">
              {totalPending.toLocaleString()} đ
            </span>
            <span className="stat-label">Chờ xác nhận</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {totalVerified.toLocaleString()} đ
            </span>
            <span className="stat-label">Đã xác nhận</span>
          </div>
        </div>
      </div>

      <div className="payment-list">
        {payments.length === 0 && (
          <div className="empty-state">
            <p>📭 Chưa có booking nào cần xác nhận thanh toán</p>
          </div>
        )}

        {payments.map((payment) => (
          <div key={payment.id} className="payment-card">
            <div className="payment-header">
              <div className="payment-info">
                <h3>
                  #{payment.bookingId} - {payment.customerName}
                </h3>
                <p className="vehicle-info">
                  🏍️ {payment.vehicleName} ({payment.licensePlate})
                </p>
                <span className="payment-date">
                  📅 {new Date(payment.date).toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="payment-badges">
                {getTypeBadge(payment.type)}
                {getStatusBadge(payment.status)}
              </div>
            </div>

            <div className="payment-details">
              <div className="payment-amount">
                <span className="amount-label">Số tiền:</span>
                <span className="amount-value">
                  {payment.amount.toLocaleString()} VNĐ
                </span>
              </div>
              <div className="payment-method">
                <span className="method-label">Phương thức:</span>
                <span className="method-value">
                  {payment.method === "card" && "� Thẻ tín dụng"}
                  {payment.method === "transfer" && "🏦 Chuyển khoản"}
                  {payment.method === "ewallet" && "📱 Ví điện tử"}
                  {payment.method === "cash" && "💵 Tiền mặt"}
                </span>
              </div>
              <div className="rental-period">
                <span className="period-label">Thời gian thuê:</span>
                <span className="period-value">{payment.days} ngày</span>
              </div>
            </div>

            {payment.paymentVerified && payment.paymentVerifiedAt && (
              <div className="verification-info">
                <p>
                  ✅ Xác nhận bởi: <strong>{payment.paymentVerifiedBy}</strong>
                </p>
                <p>
                  🕐 Thời gian:{" "}
                  {new Date(payment.paymentVerifiedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            )}

            {payment.status === "cancelled" && payment.rejectionReason && (
              <div className="rejection-info">
                <p>
                  ❌ Từ chối bởi: <strong>{payment.rejectedBy}</strong>
                </p>
                <p>
                  🕐 Thời gian:{" "}
                  {new Date(payment.rejectedAt).toLocaleString("vi-VN")}
                </p>
                <p>📝 Lý do: {payment.rejectionReason}</p>
              </div>
            )}

            <div className="payment-actions">
              {payment.status === "pending" && (
                <button
                  className="btn-action btn-pay"
                  onClick={() => handleProcessPayment(payment)}
                >
                  ✅ Xác nhận thanh toán
                </button>
              )}
              <button
                className="btn-action btn-view"
                onClick={() => handleProcessPayment(payment)}
              >
                👁️ Xem thông tin
              </button>
              <button
                className="btn-action btn-delete"
                onClick={() => handleDeletePayment(payment)}
              >
                🗑️ Xóa đơn
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPaymentModal && selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
          onVerify={handleVerifyPayment}
          onReject={handleRejectPayment}
        />
      )}
    </div>
  );
}

// Modal xác nhận thanh toán
function PaymentModal({ payment, onClose, onVerify, onReject }) {
  const [notes, setNotes] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleVerify = () => {
    if (payment.method === "transfer" && !receiptPhoto) {
      alert("⚠️ Vui lòng xác nhận đã kiểm tra biên lai chuyển khoản!");
      return;
    }
    onVerify(payment.id);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("⚠️ Vui lòng nhập lý do từ chối!");
      return;
    }
    onReject(payment.id, rejectionReason);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 Xác nhận Thanh toán</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="payment-info-box">
            <h3>Thông tin thanh toán</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã booking:</label>
                <span>{payment.bookingId}</span>
              </div>
              <div className="info-item">
                <label>Khách hàng:</label>
                <span>{payment.customerName}</span>
              </div>
              <div className="info-item">
                <label>Số điện thoại:</label>
                <span>{payment.customerPhone}</span>
              </div>
              <div className="info-item">
                <label>Xe thuê:</label>
                <span>
                  🏍️ {payment.vehicleName} ({payment.licensePlate})
                </span>
              </div>
              <div className="info-item">
                <label>Thời gian thuê:</label>
                <span>{payment.days} ngày</span>
              </div>
              <div className="info-item">
                <label>Nhận xe:</label>
                <span>{payment.pickupDate}</span>
              </div>
              <div className="info-item">
                <label>Trả xe:</label>
                <span>{payment.returnDate}</span>
              </div>
              <div className="info-item">
                <label>Điểm nhận:</label>
                <span>📍 {payment.pickupStation}</span>
              </div>
              <div className="info-item">
                <label>Số tiền:</label>
                <span className="amount-highlight">
                  {payment.amount.toLocaleString()} VNĐ
                </span>
              </div>
              <div className="info-item">
                <label>Phương thức:</label>
                <span>
                  {payment.method === "card" && "� Thẻ tín dụng"}
                  {payment.method === "transfer" && "🏦 Chuyển khoản"}
                  {payment.method === "ewallet" && "📱 Ví điện tử"}
                  {payment.method === "cash" && "💵 Tiền mặt"}
                </span>
              </div>
            </div>
          </div>

          {(payment.method === "transfer" || payment.method === "ewallet") && (
            <div className="photo-section">
              <label className="photo-item">
                <input
                  type="checkbox"
                  checked={receiptPhoto}
                  onChange={() => setReceiptPhoto(!receiptPhoto)}
                />
                <span>📸 Đã kiểm tra biên lai chuyển khoản/ví điện tử</span>
              </label>
            </div>
          )}

          {!showRejectForm && (
            <div className="notes-section">
              <label>Ghi chú:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú nếu có..."
                rows="3"
              />
            </div>
          )}

          {showRejectForm && (
            <div className="rejection-section">
              <label>⚠️ Lý do từ chối thanh toán:</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối (bắt buộc)..."
                rows="3"
                className="rejection-textarea"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>

          {!showRejectForm ? (
            <>
              <button
                className="btn-danger"
                onClick={() => setShowRejectForm(true)}
              >
                ❌ Từ chối
              </button>
              <button
                className="btn-confirm"
                onClick={handleVerify}
                disabled={
                  (payment.method === "transfer" ||
                    payment.method === "ewallet") &&
                  !receiptPhoto
                }
              >
                ✅ Xác nhận thanh toán
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason("");
                }}
              >
                ← Quay lại
              </button>
              <button className="btn-danger" onClick={handleReject}>
                ❌ Xác nhận từ chối
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Component Quản lý xe tại điểm
function VehicleManagement() {
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      name: "VinFast Klara S",
      licensePlate: "59A-12345",
      battery: 95,
      technicalStatus: "good",
      lastMaintenance: "2025-09-15",
      mileage: 1250,
      status: "available",
      issues: [],
    },
    {
      id: 2,
      name: "DatBike Weaver 200",
      licensePlate: "59B-67890",
      battery: 60,
      technicalStatus: "good",
      lastMaintenance: "2025-09-20",
      mileage: 980,
      status: "renting",
      issues: [],
    },
    {
      id: 3,
      name: "VinFast Feliz S",
      licensePlate: "59C-11111",
      battery: 20,
      technicalStatus: "issue",
      lastMaintenance: "2025-08-10",
      mileage: 2100,
      status: "maintenance",
      issues: ["Phanh trước yếu", "Đèn pha phải không sáng"],
    },
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const getTechnicalBadge = (status) => {
    const config = {
      good: { text: "Tốt", class: "tech-good", icon: "✅" },
      issue: { text: "Có vấn đề", class: "tech-issue", icon: "⚠️" },
      broken: { text: "Hỏng hóc", class: "tech-broken", icon: "❌" },
    };
    const c = config[status] || config.good;
    return (
      <span className={`tech-badge ${c.class}`}>
        {c.icon} {c.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      available: { text: "Sẵn sàng", class: "status-available", icon: "✅" },
      renting: { text: "Đang cho thuê", class: "status-renting", icon: "🚗" },
      maintenance: { text: "Bảo trì", class: "status-maintenance", icon: "�" },
    };
    const c = config[status] || config.available;
    return (
      <span className={`status-badge ${c.class}`}>
        {c.icon} {c.text}
      </span>
    );
  };

  const getBatteryClass = (battery) => {
    if (battery >= 80) return "battery-high";
    if (battery >= 40) return "battery-medium";
    return "battery-low";
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>🏍️ Quản lý Xe tại Điểm</h2>
        <div className="header-stats">
          <div className="stat-mini">
            <span className="stat-icon">✅</span>
            <span className="stat-text">
              {vehicles.filter((v) => v.status === "available").length} xe sẵn
              sàng
            </span>
          </div>
          <div className="stat-mini">
            <span className="stat-icon">�</span>
            <span className="stat-text">
              {vehicles.filter((v) => v.status === "renting").length} đang cho
              thuê
            </span>
          </div>
          <div className="stat-mini">
            <span className="stat-icon">🔧</span>
            <span className="stat-text">
              {vehicles.filter((v) => v.status === "maintenance").length} bảo
              trì
            </span>
          </div>
        </div>
      </div>

      <div className="vehicles-grid-manage">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="vehicle-manage-card">
            <div className="vehicle-card-header">
              <div className="vehicle-title">
                <h3>{vehicle.name}</h3>
                <span className="license-plate">🏍️ {vehicle.licensePlate}</span>
              </div>
              <div className="vehicle-badges">
                {getStatusBadge(vehicle.status)}
                {getTechnicalBadge(vehicle.technicalStatus)}
              </div>
            </div>

            <div className="vehicle-stats">
              <div className="stat-row">
                <span className="label">🔋 Mức pin:</span>
                <div className="battery-container">
                  <div className="battery-bar">
                    <div
                      className={`battery-fill ${getBatteryClass(
                        vehicle.battery
                      )}`}
                      style={{ width: `${vehicle.battery}%` }}
                    />
                  </div>
                  <span className="battery-value">{vehicle.battery}%</span>
                </div>
              </div>
              <div className="stat-row">
                <span className="label">📏 Km đã đi:</span>
                <span className="value">{vehicle.mileage} km</span>
              </div>
              <div className="stat-row">
                <span className="label">🔧 Bảo trì cuối:</span>
                <span className="value">{vehicle.lastMaintenance}</span>
              </div>
            </div>

            {vehicle.issues.length > 0 && (
              <div className="issues-box">
                <h4>⚠️ Vấn đề kỹ thuật:</h4>
                <ul>
                  {vehicle.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="vehicle-actions">
              <button
                className="btn-action btn-update"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setShowUpdateModal(true);
                }}
              >
                🔄 Cập nhật
              </button>
              <button
                className="btn-action btn-report"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setShowReportModal(true);
                }}
              >
                📝 Báo cáo sự cố
              </button>
              <button className="btn-action btn-view">👁️ Chi tiết</button>
            </div>
          </div>
        ))}
      </div>

      {showUpdateModal && selectedVehicle && (
        <UpdateVehicleModal
          vehicle={selectedVehicle}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedVehicle(null);
          }}
          onUpdate={(updatedData) => {
            setVehicles(
              vehicles.map((v) =>
                v.id === selectedVehicle.id ? { ...v, ...updatedData } : v
              )
            );
            setShowUpdateModal(false);
            setSelectedVehicle(null);
          }}
        />
      )}

      {showReportModal && selectedVehicle && (
        <ReportIssueModal
          vehicle={selectedVehicle}
          onClose={() => {
            setShowReportModal(false);
            setSelectedVehicle(null);
          }}
          onReport={(issue) => {
            setVehicles(
              vehicles.map((v) =>
                v.id === selectedVehicle.id
                  ? {
                      ...v,
                      issues: [...v.issues, issue],
                      technicalStatus: "issue",
                    }
                  : v
              )
            );
            setShowReportModal(false);
            setSelectedVehicle(null);
          }}
        />
      )}
    </div>
  );
}

// Modal cập nhật trạng thái xe
function UpdateVehicleModal({ vehicle, onClose, onUpdate }) {
  const [battery, setBattery] = useState(vehicle.battery);
  const [technicalStatus, setTechnicalStatus] = useState(
    vehicle.technicalStatus
  );
  const [mileage, setMileage] = useState(vehicle.mileage);
  const [notes, setNotes] = useState("");

  const handleUpdate = () => {
    onUpdate({
      battery: parseInt(battery),
      technicalStatus,
      mileage: parseInt(mileage),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔄 Cập nhật Trạng thái Xe</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="vehicle-info-box">
            <h3>{vehicle.name}</h3>
            <p className="license-plate-display">
              🏍️ Biển số: <strong>{vehicle.licensePlate}</strong>
            </p>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>🔋 Mức pin (%):</label>
              <input
                type="range"
                min="0"
                max="100"
                value={battery}
                onChange={(e) => setBattery(e.target.value)}
                className="battery-slider"
              />
              <span className="battery-display">{battery}%</span>
            </div>

            <div className="form-group">
              <label>🔧 Tình trạng kỹ thuật:</label>
              <select
                value={technicalStatus}
                onChange={(e) => setTechnicalStatus(e.target.value)}
                className="status-select"
              >
                <option value="good">✅ Tốt</option>
                <option value="issue">⚠️ Có vấn đề</option>
                <option value="broken">❌ Hỏng hóc</option>
              </select>
            </div>

            <div className="form-group">
              <label>📏 Số km đã đi:</label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="mileage-input"
              />
            </div>

            <div className="form-group">
              <label>📝 Ghi chú:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú về tình trạng xe..."
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={handleUpdate}>
            ✅ Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal báo cáo sự cố
function ReportIssueModal({ vehicle, onClose, onReport }) {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [photos, setPhotos] = useState([]);

  const handleReport = () => {
    if (issueType && description) {
      onReport(description);
      alert("Đã gửi báo cáo sự cố lên Admin!");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Báo cáo Sự cố / Hỏng hóc</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="vehicle-info-box">
            <h3>{vehicle.name}</h3>
            <p className="license-plate-display">
              🏍️ Biển số: <strong>{vehicle.licensePlate}</strong>
            </p>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>🔧 Loại sự cố:</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="issue-select"
              >
                <option value="">-- Chọn loại sự cố --</option>
                <option value="battery">🔋 Pin / Sạc điện</option>
                <option value="brake">🛑 Phanh</option>
                <option value="light">� Đèn chiếu sáng</option>
                <option value="tire">🛞 Lốp xe</option>
                <option value="body">🏍️ Thân xe / Ngoại thất</option>
                <option value="other">❓ Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label>⚠️ Mức độ nghiêm trọng:</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="severity-select"
              >
                <option value="low">🟢 Nhẹ - Có thể tiếp tục sử dụng</option>
                <option value="medium">🟡 Trung bình - Cần sửa chữa sớm</option>
                <option value="high">
                  🔴 Nghiêm trọng - Dừng sử dụng ngay
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>📝 Mô tả chi tiết:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về sự cố, hỏng hóc..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>📸 Chụp ảnh sự cố:</label>
              <button className="btn-upload">📷 Chụp / Tải ảnh</button>
              <span className="photo-count">{photos.length} ảnh</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn-confirm btn-danger"
            onClick={handleReport}
            disabled={!issueType || !description}
          >
            🚨 Gửi báo cáo lên Admin
          </button>
        </div>
      </div>
    </div>
  );
}
