import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getToken } from "../utils/auth";
import {
  getAllBookings,
  updateBookingStatus,
  verifyPayment,
  rejectPayment,
} from "../utils/bookingStorage";
import { getPendingRentals } from "../api/rentals";
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
          � Giao nhận xe
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

// Component Quản lý Giao - Nhận xe
function VehicleHandover() {
  const [selectedFilter, setSelectedFilter] = useState("booked"); // 'booked', 'renting', 'completed'
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

  // Fetch user phone from backend API
  const fetchUserPhone = async (userId) => {
    try {
      const token = getToken();
      if (!token || !userId) return null;

      // Nếu userId là email hoặc không phải số, skip
      if (
        typeof userId === "string" &&
        (userId.includes("@") || isNaN(userId))
      ) {
        console.log("⚠️ UserId không phải accountId (số):", userId);
        return null;
      }

      const accountId = parseInt(userId);
      if (isNaN(accountId)) {
        console.log("⚠️ Không thể parse userId thành số:", userId);
        return null;
      }

      const response = await fetch(
        `http://localhost:5168/api/Account/GetAccountById/${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("❌ Token hết hạn hoặc không hợp lệ");
        } else {
          console.error("❌ Lỗi fetch user phone:", response.status);
        }
        return null;
      }

      const userData = await response.json();
      console.log(
        "✅ Fetched user phone for accountId",
        accountId,
        ":",
        userData.phone
      );
      return userData.phone || userData.Phone || null;
    } catch (error) {
      console.error("❌ Error fetching user phone:", error);
      return null;
    }
  };

  const loadBookings = async () => {
    const allBookings = getAllBookings();

    // CHỈ LẤY BOOKINGS ĐÃ XÁC THỰC THANH TOÁN (status !== 'pending_payment')
    const verifiedBookings = allBookings.filter(
      (booking) =>
        booking.status !== "pending_payment" && booking.status !== "cancelled"
    );

    // Transform bookings to vehicle format for display
    const transformedVehicles = await Promise.all(
      verifiedBookings.map(async (booking) => {
        // Kiểm tra xe đã quá hạn chưa
        const returnDateTime = new Date(
          `${booking.returnDate} ${booking.returnTime}`
        );
        const now = new Date();
        const isOverdue = booking.status === "renting" && returnDateTime < now;

        // Fetch phone from backend if not available or is placeholder
        let userPhone = booking.userPhone;

        if (
          !userPhone ||
          userPhone === "Chưa cập nhật" ||
          userPhone === "N/A"
        ) {
          const fetchedPhone = await fetchUserPhone(booking.userId);
          if (fetchedPhone) {
            userPhone = fetchedPhone;
          }
        }

        return {
          id: booking.id,
          vehicleName: booking.vehicleName,
          licensePlate: booking.licensePlate,
          customerName: booking.userName,
          userId: booking.userId,
          userPhone: userPhone,
          userEmail: booking.userEmail,
          bookingId: booking.bookingId || booking.id,
          status: booking.status,
          pickupDate: `${booking.pickupDate} ${booking.pickupTime}`,
          returnDate: `${booking.returnDate} ${booking.returnTime}`,
          pickupStation: booking.pickupStation || "Chưa xác định",
          returnStation: booking.returnStation || "Chưa xác định",
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
      })
    );

    setVehicles(transformedVehicles);
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (selectedFilter === "all") return true;
    return v.status === selectedFilter;
  });

  // Count vehicles by status
  const bookedCount = vehicles.filter((v) => v.status === "booked").length;
  const rentingCount = vehicles.filter((v) => v.status === "renting").length;
  const completedCount = vehicles.filter(
    (v) => v.status === "completed"
  ).length;

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
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${
            selectedFilter === "booked" ? "active" : ""
          }`}
          onClick={() => setSelectedFilter("booked")}
        >
          📅 Chuẩn bị bàn giao ({bookedCount})
        </button>
        <button
          className={`filter-tab ${
            selectedFilter === "renting" ? "active" : ""
          }`}
          onClick={() => setSelectedFilter("renting")}
        >
          🚗 Đang cho thuê ({rentingCount})
        </button>
        <button
          className={`filter-tab ${
            selectedFilter === "completed" ? "active" : ""
          }`}
          onClick={() => setSelectedFilter("completed")}
        >
          ✅ Đã thu hồi ({completedCount})
        </button>
      </div>

      <div className="vehicles-list">
        {filteredVehicles.length === 0 && (
          <div className="empty-state">
            {selectedFilter === "booked" && (
              <p>📭 Chưa có xe nào cần bàn giao</p>
            )}
            {selectedFilter === "renting" && (
              <p>📭 Chưa có xe nào đang cho thuê</p>
            )}
            {selectedFilter === "completed" && (
              <p>📭 Chưa có xe nào đã hoàn thành</p>
            )}
          </div>
        )}

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
                  <div className="detail-row">
                    <span className="label">� Mã booking:</span>
                    <span className="value booking-id">
                      {vehicle.bookingId || "N/A"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📱 Số điện thoại:</span>
                    <span className="value">
                      {vehicle.userPhone || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">� Email:</span>
                    <span className="value">
                      {vehicle.userEmail || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">� Điểm nhận xe:</span>
                    <span className="value pickup-location">
                      {vehicle.pickupStation || "Chưa xác định"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">� Điểm trả xe:</span>
                    <span className="value return-location">
                      {vehicle.returnStation || "Chưa xác định"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">� Ngày nhận xe:</span>
                    <span className="value">{vehicle.pickupDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">� Ngày trả xe:</span>
                    <span className="value">{vehicle.returnDate}</span>
                  </div>
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

  const handleSendToVehicleManagement = () => {
    // Tạo danh sách các vấn đề từ checklist
    const issues = [];
    if (!checklist.bodyCondition) issues.push("Thân xe trầy xước, móp méo");
    if (!checklist.tireCondition) issues.push("Lốp xe có vấn đề");
    if (!checklist.lightsWorking) issues.push("Đèn chiếu sáng không hoạt động");
    if (!checklist.brakeWorking) issues.push("Phanh có vấn đề");
    if (!checklist.batteryCharged) issues.push("Pin không đầy hoặc sạc kém");
    if (!checklist.documentsChecked) issues.push("Giấy tờ xe thiếu");

    // Lưu thông tin xe cần bảo trì vào localStorage
    const maintenanceData = {
      vehicleId: vehicle.id,
      vehicleName: vehicle.vehicleName,
      licensePlate: vehicle.licensePlate,
      bookingId: vehicle.bookingId,
      issues: issues,
      reportedAt: new Date().toISOString(),
      status: "pending_maintenance",
      reportedBy: "Staff",
    };

    // Lấy danh sách xe cần bảo trì hiện có
    const maintenanceList = JSON.parse(
      localStorage.getItem("ev_maintenance_vehicles") || "[]"
    );
    maintenanceList.push(maintenanceData);
    localStorage.setItem(
      "ev_maintenance_vehicles",
      JSON.stringify(maintenanceList)
    );

    alert(
      `🔧 Đã gửi xe ${
        vehicle.licensePlate
      } về mục Quản lý xe!\n\nVấn đề phát hiện:\n${issues.join("\n")}`
    );
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

          {!allChecked && (
            <div className="checklist-warning">
              <p className="warning-text">
                ⚠️ Một số hạng mục chưa đạt yêu cầu. Xe có thể cần bảo trì hoặc
                sửa chữa.
              </p>
            </div>
          )}

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
          {!allChecked && (
            <button
              className="btn-maintenance"
              onClick={handleSendToVehicleManagement}
            >
              🔧 Gửi về Quản lý xe
            </button>
          )}
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
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Load pending ID documents from API
  useEffect(() => {
    const loadPendingIDDocuments = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.warn("No token found, skipping API call");
          return;
        }

        const response = await fetch(
          "http://localhost:5168/api/IDDocument/IDDocumentPendingList",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch pending ID documents:",
            response.status
          );
          return;
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const mappedCustomers = data.map((item, idx) => ({
            id: item.documentID ?? idx,
            fullName: item.fullName ?? "N/A",
            userName: item.userName ?? "N/A",
            phone: item.phone ?? item.phoneNumber ?? "N/A",
            email: item.email ?? "N/A",
            dateOfBirth: item.dateOfBirth ?? "N/A",
            idCard: item.idNumber ?? item.idCard ?? "N/A",
            driverLicense: item.licenseNumber ?? item.driverLicense ?? "N/A",
            licenseExpiry:
              item.licenseExpiry ?? item.licenseExpiryDate ?? "N/A",
            status: item.status,
            idCardFrontImage: item.idCardFront ?? null,
            idCardBackImage: item.idCardBack ?? null,
            licenseFrontImage: item.licenseCardFront ?? null,
            licenseBackImage: item.licenseCardBack ?? null,
          }));

          setCustomers(mappedCustomers);
          console.log("Loaded pending ID documents:", mappedCustomers.length);
        }
      } catch (error) {
        console.error("Error fetching pending ID documents:", error);
      }
    };

    loadPendingIDDocuments();

    // Refresh every 30 seconds
    const interval = setInterval(loadPendingIDDocuments, 30000);

    return () => clearInterval(interval);
  }, []);

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

  const handleViewProfile = (customer) => {
    setSelectedCustomer(customer);
    setShowProfileModal(true);
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
                <h3>{customer.userName}</h3>
                <span className="booking-badge">📋 {customer.bookingId}</span>
              </div>
              <span
                className={`verify-badge ${
                  customer.status == 1 ? "verified" : "pending"
                }`}
              >
                {customer.status == 1 ? "✅ Đã xác thực" : "⏳ Chưa xác thực"}
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
              </div>
            </div>

            <div className="customer-actions">
              <button
                className="btn-action btn-verify"
                onClick={() => handleVerify(customer)}
              >
                {customer.verified ? "✅ Xem hồ sơ" : "✅ Xác nhận hồ sơ"}
              </button>
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

      {showProfileModal && selectedCustomer && (
        <ProfileViewModal
          customer={selectedCustomer}
          onClose={(updatedData) => {
            if (updatedData) {
              setCustomers(
                customers.map((c) =>
                  c.id === selectedCustomer.id ? { ...c, ...updatedData } : c
                )
              );
            }
            setShowProfileModal(false);
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
    idCardMatch: false,
    licenseValid: false,
  });

  const [documentInfo, setDocumentInfo] = useState({
    idCard: customer.idCard || "",
    driverLicense: customer.driverLicense || "",
    licenseExpiry: customer.licenseExpiry || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState("");
  
  // State để chọn mặt trước/sau
  const [showIDFront, setShowIDFront] = useState(true);
  const [showLicenseFront, setShowLicenseFront] = useState(true);

  // Chỉ kiểm tra 2 checkbox quan trọng
  const allVerified = verification.idCardMatch && verification.licenseValid;

  const handleInputChange = (field, value) => {
    setDocumentInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVerifySubmit = async () => {
    if (!allVerified) {
      alert("⚠️ Vui lòng hoàn thành tất cả các bước xác thực!");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        alert("❌ Không tìm thấy token xác thực!");
        setIsSubmitting(false);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const staffID = user.accountID || user.AccountID || user.id || 0;

      const verificationData = {
        documentID: parseInt(customer.id),
        status: 1,
        note: note || "Verified by staff",
        verifiedByStaffID: parseInt(staffID),
        name: customer.fullName || customer.userName || "",
        licenseNumber:
          documentInfo.driverLicense || customer.driverLicense || "",
        idNumber: documentInfo.idCard || customer.idCard || "",
      };

      console.log("Sending verification data:", verificationData);

      const response = await fetch(
        "http://localhost:5168/api/IDDocument/VerifyDocument",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(verificationData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to verify document:", response.status, errorText);
        alert(`❌ Lỗi xác thực: ${response.status}`);
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      console.log("✅ Document verified successfully:", result);

      alert("✅ Xác thực thành công!");
      onVerify();
    } catch (error) {
      console.error("Error verifying document:", error);
      alert("❌ Có lỗi xảy ra khi xác thực!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDenySubmit = async () => {
    if (!note.trim()) {
      alert("⚠️ Vui lòng nhập lý do từ chối!");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        alert("❌ Không tìm thấy token xác thực!");
        setIsSubmitting(false);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const staffID = user.accountID || user.AccountID || user.id || 0;

      const verificationData = {
        documentID: parseInt(customer.id),
        status: 2,
        note: note,
        verifiedByStaffID: parseInt(staffID),
        name: customer.fullName || customer.userName || "",
        licenseNumber:
          documentInfo.driverLicense || customer.driverLicense || "",
        idNumber: documentInfo.idCard || customer.idCard || "",
      };

      console.log("Sending deny data:", verificationData);

      const response = await fetch(
        "http://localhost:5168/api/IDDocument/VerifyDocument",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(verificationData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to deny document:", response.status, errorText);
        alert(`❌ Lỗi từ chối: ${response.status}`);
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      console.log("✅ Document denied successfully:", result);

      alert("✅ Đã từ chối xác thực!");
      onVerify();
    } catch (error) {
      console.error("Error denying document:", error);
      alert("❌ Có lỗi xảy ra khi từ chối!");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="customer-info-box" style={{
            background: '#ffffff',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '24px', fontWeight: 'bold' }}>
              👤 {customer.userName || customer.fullName || "N/A"}
            </h3>
            <div style={{ display: 'grid', gap: '10px', fontSize: '16px' }}>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ opacity: 0.9 }}>📧 Email:</span>
                <strong>{customer.email || "N/A"}</strong>
              </p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ opacity: 0.9 }}>📱 Số điện thoại:</span>
                <strong>{customer.phone || customer.phoneNumber || "N/A"}</strong>
              </p>
            </div>
          </div>

          {/* Hiển thị hình ảnh giấy tờ */}
          <div className="document-images-section" style={{ marginBottom: '20px' }}>
            <h3>📸 Hình ảnh giấy tờ</h3>
            
            {/* CMND/CCCD Images */}
            <div className="image-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>🆔 CMND/CCCD</h4>
                <select
                  value={showIDFront ? "front" : "back"}
                  onChange={(e) => setShowIDFront(e.target.value === "front")}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="front">📄 Mặt trước</option>
                  <option value="back">📄 Mặt sau</option>
                </select>
              </div>
              <div className="image-container" style={{ 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px', 
                overflow: 'hidden',
                aspectRatio: '16/10',
                background: '#f5f5f5'
              }}>
                {showIDFront ? (
                  customer.idCardFrontImage ? (
                    <img
                      src={customer.idCardFrontImage}
                      alt="CCCD Mặt trước"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      color: '#999',
                      fontSize: '16px'
                    }}>
                      📷 Chưa có ảnh mặt trước
                    </div>
                  )
                ) : (
                  customer.idCardBackImage ? (
                    <img
                      src={customer.idCardBackImage}
                      alt="CCCD Mặt sau"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      color: '#999',
                      fontSize: '16px'
                    }}>
                      📷 Chưa có ảnh mặt sau
                    </div>
                  )
                )}
              </div>
            </div>

            {/* GPLX Images */}
            <div className="image-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>🪪 Giấy phép lái xe</h4>
                <select
                  value={showLicenseFront ? "front" : "back"}
                  onChange={(e) => setShowLicenseFront(e.target.value === "front")}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="front">📄 Mặt trước</option>
                  <option value="back">📄 Mặt sau</option>
                </select>
              </div>
              <div className="image-container" style={{ 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px', 
                overflow: 'hidden',
                aspectRatio: '16/10',
                background: '#f5f5f5'
              }}>
                {showLicenseFront ? (
                  customer.licenseFrontImage ? (
                    <img
                      src={customer.licenseFrontImage}
                      alt="GPLX Mặt trước"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      color: '#999',
                      fontSize: '16px'
                    }}>
                      📷 Chưa có ảnh mặt trước
                    </div>
                  )
                ) : (
                  customer.licenseBackImage ? (
                    <img
                      src={customer.licenseBackImage}
                      alt="GPLX Mặt sau"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      color: '#999',
                      fontSize: '16px'
                    }}>
                      📷 Chưa có ảnh mặt sau
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="verification-section">
            <h3>📋 Checklist xác thực</h3>
            <div className="verification-items">
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
                <span>✅ Xác nhận CMND/CCCD</span>
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
                <span>✅ Xác nhận Giấy phép lái xe</span>
              </label>
            </div>
          </div>

          <div className="note-section">
            <h3>📝 Ghi chú</h3>
            <textarea
              className="note-textarea"
              placeholder="Nhập ghi chú hoặc lý do từ chối..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn-deny"
            disabled={isSubmitting}
            onClick={handleDenySubmit}
          >
            {isSubmitting ? "⏳ Đang xử lý..." : "❌ Từ chối"}
          </button>
          <button
            className="btn-confirm"
            disabled={!allVerified || isSubmitting}
            onClick={handleVerifySubmit}
          >
            {isSubmitting ? "⏳ Đang xác thực..." : "✅ Xác thực"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal xem hồ sơ khách hàng
function ProfileViewModal({ customer, onClose }) {
  const [showIDFront, setShowIDFront] = useState(true);
  const [showLicenseFront, setShowLicenseFront] = useState(true);
  const [documentInfo, setDocumentInfo] = useState({
    idNumber: customer.idCard || "",
    licenseNumber: customer.driverLicense || "",
  });

  const handleInputChange = (field, value) => {
    setDocumentInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>👤 Giấy tờ khách hàng - {customer.userName}</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="profile-images-section">
            <h3>📸 Hình ảnh giấy tờ</h3>

            {/* ID Card Images */}
            <div className="image-group">
              <div className="image-header">
                <h4>🆔 CMND/CCCD</h4>
                <select
                  className="image-selector"
                  value={showIDFront ? "front" : "back"}
                  onChange={(e) => setShowIDFront(e.target.value === "front")}
                >
                  <option value="front">Mặt trước</option>
                  <option value="back">Mặt sau</option>
                </select>
              </div>
              <div className="input-field-group">
                <label>Số CMND/CCCD:</label>
                <input
                  type="text"
                  value={documentInfo.idNumber}
                  onChange={(e) =>
                    handleInputChange("idNumber", e.target.value)
                  }
                  placeholder="Nhập số CMND/CCCD"
                  className="document-input"
                />
              </div>
              <div className="image-container">
                {showIDFront ? (
                  customer.idCardFrontImage ? (
                    <img
                      src={customer.idCardFrontImage}
                      alt="ID Card Front"
                      className="document-image"
                    />
                  ) : (
                    <div className="no-image">📷 Chưa có ảnh mặt trước</div>
                  )
                ) : customer.idCardBackImage ? (
                  <img
                    src={customer.idCardBackImage}
                    alt="ID Card Back"
                    className="document-image"
                  />
                ) : (
                  <div className="no-image">📷 Chưa có ảnh mặt sau</div>
                )}
              </div>
            </div>

            {/* License Images */}
            <div className="image-group">
              <div className="image-header">
                <h4>🪪 Giấy phép lái xe</h4>
                <select
                  className="image-selector"
                  value={showLicenseFront ? "front" : "back"}
                  onChange={(e) =>
                    setShowLicenseFront(e.target.value === "front")
                  }
                >
                  <option value="front">Mặt trước</option>
                  <option value="back">Mặt sau</option>
                </select>
              </div>
              <div className="input-field-group">
                <label>Số GPLX:</label>
                <input
                  type="text"
                  value={documentInfo.licenseNumber}
                  onChange={(e) =>
                    handleInputChange("licenseNumber", e.target.value)
                  }
                  placeholder="Nhập số GPLX"
                  className="document-input"
                />
              </div>
              <div className="image-container">
                {showLicenseFront ? (
                  customer.licenseFrontImage ? (
                    <img
                      src={customer.licenseFrontImage}
                      alt="License Front"
                      className="document-image"
                    />
                  ) : (
                    <div className="no-image">📷 Chưa có ảnh mặt trước</div>
                  )
                ) : customer.licenseBackImage ? (
                  <img
                    src={customer.licenseBackImage}
                    alt="License Back"
                    className="document-image"
                  />
                ) : (
                  <div className="no-image">📷 Chưa có ảnh mặt sau</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={() => onClose()}>
            Hủy
          </button>
          <button
            className="btn-confirm"
            onClick={() =>
              onClose({
                idCard: documentInfo.idNumber,
                driverLicense: documentInfo.licenseNumber,
              })
            }
          >
            💾 Lưu thay đổi
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
  const [showRentalInfoModal, setShowRentalInfoModal] = useState(false);
  const [rentalInfo, setRentalInfo] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingPayment, setCancellingPayment] = useState(null);
  const [paymentType, setPaymentType] = useState("cash"); // 'cash' (paymentMethod=2), 'online' (paymentMethod=1)
  const [paymentFilter, setPaymentFilter] = useState("pending"); // 'pending' (status=0), 'verified' (status=1), 'cancelled' (status=-1)
  const [loading, setLoading] = useState(false);
  const [loadingRental, setLoadingRental] = useState(false);
  const [error, setError] = useState(null);

  // Load payments from API when component mounts
  useEffect(() => {
    console.log("🔄 [PAYMENTS] Component mounted - Loading payments...");
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        console.warn("⚠️ [PAYMENTS] No token found");
        setPayments([]);
        return [];
      }

      console.log("📋 [PAYMENTS] Fetching pending payments from API...");
      
      // Call API to get pending payments (status = 0 or 2)
      const response = await fetch('http://localhost:5168/api/Payment/GetPendingPayments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        console.log("🔍 [PAYMENTS] Sample payment data:", data[0]);
        console.log("🔍 [PAYMENTS] First payment accountID:", data[0]?.accountID);
        console.log("🔍 [PAYMENTS] All payment keys:", data[0] ? Object.keys(data[0]) : []);
        
        setPayments(data);
        console.log(`✅ [PAYMENTS] Loaded ${data.length} pending payments from API`);
        console.log(`📊 Status=0 (Cash - Chưa thanh toán): ${data.filter(p => p.status === 0).length}`);
        console.log(`📊 Status=2 (PayOS - Đã thanh toán): ${data.filter(p => p.status === 2).length}`);
        return data; // Return data for use in onClick
      } else {
        setPayments([]);
        console.warn("⚠️ [PAYMENTS] Invalid response format");
        return [];
      }
    } catch (err) {
      console.error("❌ [PAYMENTS] Error:", err);
      setError(err.message || "Không thể tải dữ liệu thanh toán");
      setPayments([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadRentalInfo = async (rentalId) => {
    try {
      setLoadingRental(true);
      const token = getToken();
      
      console.log(`📋 [RENTAL INFO] Fetching rental ${rentalId}...`);
      
      // Chỉ gọi 1 API GetRentalById - đã trả về tất cả thông tin cần thiết
      const rentalResponse = await fetch(`http://localhost:5168/api/Rental/GetRentalById/${rentalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!rentalResponse.ok) {
        throw new Error(`Rental API Error: ${rentalResponse.status}`);
      }

      const rentalData = await rentalResponse.json();
      console.log("✅ [RENTAL INFO] Complete rental data from API:", rentalData);
      
      // GetRentalById đã trả về đầy đủ:
      // - bikeName, licensePlate
      // - renterName, phoneNumber, email
      // - startDate, endDate, handoverDate
      // - paymentMethod
      
      setRentalInfo(rentalData);
      setShowRentalInfoModal(true);
      console.log("✅ [RENTAL INFO] Data loaded successfully");
    } catch (err) {
      console.error("❌ [RENTAL INFO] Error:", err);
      alert(`Không thể tải thông tin rental: ${err.message}`);
    } finally {
      setLoadingRental(false);
    }
  };

  // Xác nhận thanh toán
  const handleConfirmPayment = async (payment) => {
    if (!window.confirm(`Xác nhận thanh toán #${payment.paymentID}?`)) {
      return;
    }

    try {
      const token = getToken();
      
      console.log("✅ [CONFIRM] Calling API success for payment:", payment.paymentID);
      
      const response = await fetch(`http://localhost:5168/api/Payment/success?paymentID=${payment.paymentID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ [CONFIRM] Success response:", result);
      
      alert("✅ Đã xác nhận thanh toán thành công!");
      loadPayments(); // Reload danh sách
    } catch (err) {
      console.error("❌ [CONFIRM] Error:", err);
      alert(`❌ Có lỗi xảy ra khi xác nhận: ${err.message}`);
    }
  };

  // Mở modal hủy đơn
  const handleOpenCancelModal = (payment) => {
    setCancellingPayment(payment);
    setCancelReason("");
    setShowCancelModal(true);
  };

  // Xử lý hủy đơn
  const handleCancelPayment = async () => {
    if (!cancelReason.trim()) {
      alert("⚠️ Vui lòng nhập lý do hủy đơn!");
      return;
    }

    try {
      const token = getToken();
      
      console.log("❌ [CANCEL] Calling API failed for payment:", cancellingPayment.paymentID);
      console.log("📝 [CANCEL] Reason:", cancelReason);

      const response = await fetch(`http://localhost:5168/api/Payment/failed?paymentID=${cancellingPayment.paymentID}&reason=${encodeURIComponent(cancelReason)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ [CANCEL] Success response:", result);
      
      alert("✅ Đã hủy đơn thanh toán thành công!");
      setShowCancelModal(false);
      setCancelReason("");
      setCancellingPayment(null);
      loadPayments(); // Reload danh sách
    } catch (err) {
      console.error("❌ [CANCEL] Error:", err);
      alert(`❌ Có lỗi xảy ra khi hủy đơn: ${err.message}`);
    }
  };

  // Filter payments based on payment type and status
  const filteredPayments = payments.filter((p) => {
    // First filter by payment type
    const matchesType = paymentType === "cash" ? p.paymentMethod === 2 : p.paymentMethod === 1;
    
    if (!matchesType) return false;
    
    // Then filter by status
    if (paymentFilter === "pending") {
      return p.status === 0 || p.status === 2;
    }
    if (paymentFilter === "verified") return p.status === 1;
    if (paymentFilter === "cancelled") return p.status === -1;
    return true;
  });

  // Calculate totals
  const totalPending = payments
    .filter((p) => p.status === 0)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalVerified = payments
    .filter((p) => p.status === 1)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalCancelled = payments
    .filter((p) => p.status === -1)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const getStatusBadge = (payment) => {
    const status = payment.status;
    const method = (payment.paymentMethod || '').toString().toLowerCase();
    
    // Status = 0: Cash - Chưa thanh toán (Yellow)
    if (status === 0 && method.includes('cash')) {
      return <span className="status-badge status-cash-unpaid">💵 Chưa thanh toán (Cash)</span>;
    }
    
    // Status = 2: PayOS - Đã thanh toán (Blue)
    if (status === 2 && method.includes('payos')) {
      return <span className="status-badge status-payos-paid">✅ Đã thanh toán (PayOS)</span>;
    }
    
    // Other statuses
    switch (status) {
      case 0:
        return <span className="status-badge status-pending">⏳ Chưa thanh toán</span>;
      case 1:
        return <span className="status-badge status-verified">✅ Đã xác nhận</span>;
      case 2:
        return <span className="status-badge status-payos-paid">✅ Đã thanh toán</span>;
      case -1:
        return <span className="status-badge status-cancelled">❌ Đã hủy</span>;
      default:
        return <span className="status-badge">❓ Không xác định</span>;
    }
  };

  const getPaymentCardClass = (payment) => {
    const status = payment.status;
    const method = (payment.paymentMethod || '').toString().toLowerCase();
    
    // Status = 0 with Cash: Yellow border
    if (status === 0 && method.includes('cash')) {
      return 'payment-card payment-card-cash-unpaid';
    }
    
    // Status = 2 with PayOS: Blue border
    if (status === 2 && method.includes('payos')) {
      return 'payment-card payment-card-payos-paid';
    }
    
    return 'payment-card';
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>💰 Quản Lý Thanh Toán</h2>
      </div>

      {/* Payment Type Tabs - Main Navigation */}
      <div className="payment-type-tabs" style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '10px'
      }}>
        <button
          className={`payment-type-tab ${paymentType === "cash" ? "active" : ""}`}
          onClick={() => setPaymentType("cash")}
          style={{
            flex: 1,
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            background: paymentType === "cash" ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
            color: paymentType === "cash" ? 'white' : '#666',
            transition: 'all 0.3s ease',
            boxShadow: paymentType === "cash" ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none'
          }}
        >
          💵 Thanh toán trực tiếp ({payments.filter((p) => p.paymentMethod === 2).length})
        </button>
        <button
          className={`payment-type-tab ${paymentType === "online" ? "active" : ""}`}
          onClick={() => setPaymentType("online")}
          style={{
            flex: 1,
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            background: paymentType === "online" ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
            color: paymentType === "online" ? 'white' : '#666',
            transition: 'all 0.3s ease',
            boxShadow: paymentType === "online" ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none'
          }}
        >
          💳 Thanh toán online ({payments.filter((p) => p.paymentMethod === 1).length})
        </button>
      </div>

      {/* Filter Tabs - Status Filters */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${
            paymentFilter === "pending" ? "active" : ""
          }`}
          onClick={() => setPaymentFilter("pending")}
        >
          ⏳ Chưa xác nhận ({payments.filter((p) => p.status === 0 || p.status === 2).length})
        </button>
        <button
          className={`filter-tab ${
            paymentFilter === "verified" ? "active" : ""
          }`}
          onClick={() => setPaymentFilter("verified")}
        >
          ✅ Đã xác nhận ({payments.filter((p) => p.status === 1).length})
        </button>
        <button
          className={`filter-tab ${
            paymentFilter === "cancelled" ? "active" : ""
          }`}
          onClick={() => setPaymentFilter("cancelled")}
        >
          ❌ Đã hủy ({payments.filter((p) => p.status === -1).length})
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="payment-list">
        {filteredPayments.length === 0 && (
          <div className="empty-state">
            {paymentFilter === "pending" && <p>📭 Chưa có thanh toán nào cần xác nhận</p>}
            {paymentFilter === "verified" && <p>📭 Chưa có thanh toán nào đã xác nhận</p>}
            {paymentFilter === "cancelled" && <p>📭 Chưa có thanh toán nào bị hủy</p>}
          </div>
        )}

        {filteredPayments.map((payment) => (
          <div key={payment.paymentID} className={getPaymentCardClass(payment)}>
            <div className="payment-header">
              <div className="payment-info">
                <h3>🆔 Payment #{payment.paymentID}</h3>
                <span className="payment-date">
                  🕐 Ngày tạo đơn: {formatDate(payment.createdAt)}
                </span>
              </div>
              <div className="payment-badges">
                {getStatusBadge(payment)}
              </div>
            </div>

            <div className="payment-details">
              <div className="payment-amount">
                <span className="amount-label">💰 Số tiền:</span>
                <span className="amount-value">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <div className="payment-method">
                <span className="method-label">💳 Phương thức:</span>
                <span className="method-value">
                  {payment.paymentMethod === 2 ? "💵 Tiền mặt" : 
                   payment.paymentMethod === 1 ? "💳 PayOS" : "N/A"}
                </span>
              </div>
            </div>

            <div className="payment-actions">
              <button
                className="btn-action btn-view"
                onClick={async () => {
                  const freshPayments = await loadPayments();
                  const updatedPayment = freshPayments.find(p => p.paymentID === payment.paymentID);
                  
                  const rentalID = updatedPayment?.rentalID || payment.rentalID;
                  
                  console.log("[BUTTON] Loading rental info for rentalID:", rentalID);
                  
                  // Chỉ cần rentalID - API GetRentalById sẽ trả về tất cả thông tin
                  loadRentalInfo(rentalID);
                }}
                disabled={loadingRental}
              >
                {loadingRental ? "⏳ Đang tải..." : "👁️ Xem thông tin"}
              </button>
              
              {/* Chỉ hiển thị nút Xác nhận và Hủy cho đơn chưa xác nhận */}
              {(payment.status === 0 || payment.status === 2) && (
                <>
                  <button
                    className="btn-action btn-confirm"
                    onClick={() => handleConfirmPayment(payment)}
                    style={{
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      color: 'white'
                    }}
                  >
                    ✅ Xác nhận
                  </button>
                  <button
                    className="btn-action btn-cancel"
                    onClick={() => handleOpenCancelModal(payment)}
                    style={{
                      background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                      color: 'white'
                    }}
                  >
                    ❌ Hủy đơn
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rental Info Modal */}
      {showRentalInfoModal && rentalInfo && (
        <div className="modal-overlay" onClick={() => setShowRentalInfoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Thông Tin Rental #{rentalInfo.rentalID}</h2>
              <button
                className="modal-close"
                onClick={() => setShowRentalInfoModal(false)}
              >
                ✖️
              </button>
            </div>
            <div className="modal-body">
              <div className="info-section">
                <h3>🏍️ Thông Tin Xe</h3>
                <p><strong>Tên loại xe:</strong> {rentalInfo.bikeName || "N/A"}</p>
                <p><strong>Biển số:</strong> {rentalInfo.licensePlate || "N/A"}</p>
              </div>
              <div className="info-section">
                <h3>👤 Thông Tin Khách Hàng</h3>
                <p><strong>Tên:</strong> {rentalInfo.renterName || "N/A"}</p>
                <p><strong>SĐT:</strong> {rentalInfo.phoneNumber || "N/A"}</p>
                <p><strong>Email:</strong> {rentalInfo.email || "N/A"}</p>
              </div>
              <div className="info-section">
                <h3>📅 Thời Gian</h3>
                <p><strong>Ngày thanh toán:</strong> {formatDate(rentalInfo.startDate)}</p>
                <p><strong>Ngày bàn giao xe:</strong> {formatDate(rentalInfo.handoverDate)}</p>
                <p><strong>Ngày kết thúc đơn:</strong> {formatDate(rentalInfo.endDate)}</p>
                <p><strong>Thời gian thuê:</strong> {
                  (() => {
                    if (!rentalInfo.startDate || !rentalInfo.endDate) return "N/A";
                    const start = new Date(rentalInfo.startDate);
                    const end = new Date(rentalInfo.endDate);
                    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                    return `${days} ngày`;
                  })()
                }</p>
              </div>
              <div className="info-section">
                <h3>💵 Tài Chính</h3>
                <p><strong>Phương thức thanh toán:</strong> {
                  rentalInfo.paymentMethod === 2 ? "💵 Tiền mặt (Cash)" :
                  rentalInfo.paymentMethod === 1 ? "💳 Chuyển khoản" : "N/A"
                }</p>
                <p><strong>Tiền cọc:</strong> {formatCurrency(rentalInfo.deposit)}</p>
                <p><strong>Tổng tiền thuê:</strong> {formatCurrency(rentalInfo.totalAmount)}</p>
                <p><strong>Trạng thái:</strong> {
                  rentalInfo.status === 0 ? "⏳ Chưa xác nhận" :
                  rentalInfo.status === 1 ? "✅ Đã xác nhận" :
                  rentalInfo.status === 2 ? "🚗 Đang thuê" :
                  rentalInfo.status === 3 ? "✅ Đã hoàn thành" :
                  rentalInfo.status === -1 ? "❌ Đã hủy" : "N/A"
                }</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowRentalInfoModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Payment Modal */}
      {showCancelModal && cancellingPayment && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>❌ Hủy Đơn Thanh Toán</h2>
              <button
                className="btn-close"
                onClick={() => setShowCancelModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Payment ID:</strong> #{cancellingPayment.paymentID}</p>
                <p><strong>Số tiền:</strong> {formatCurrency(cancellingPayment.amount)}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="cancelReason" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#333'
                }}>
                  📝 Lý do hủy đơn: <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy đơn (bắt buộc)..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
              >
                Đóng
              </button>
              <button
                className="btn-primary"
                onClick={handleCancelPayment}
                disabled={!cancelReason.trim()}
                style={{
                  background: !cancelReason.trim() ? '#ccc' : 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                  cursor: !cancelReason.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                ❌ Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
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

// Component: Staff list fetched from API
// StaffList removed — staff listing and CRUD belong in Admin page

// (StaffList component removed — reverting API-integration UI change)

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
