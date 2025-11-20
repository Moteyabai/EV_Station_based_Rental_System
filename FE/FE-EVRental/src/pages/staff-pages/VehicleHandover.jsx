import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getToken } from '../../utils/auth';
import { updateBookingStatus } from '../../utils/bookingStorage';
import Pagination from './components/Pagination';
import HandoverModal from './modals/HandoverModal';
import RentalDetailModal from './modals/RentalDetailModal';
import ReturnBikeModal from './modals/ReturnBikeModal';

export default function VehicleHandover() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("preparing");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchQuery]);

  const loadBookings = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn('⚠️ [HANDOVER] No token found');
        setVehicles([]);
        return;
      }

      const staffAccountID = user?.accountID || user?.AccountID;
      if (!staffAccountID) {
        console.error('❌ [HANDOVER] Staff accountID not found!');
        setVehicles([]);
        return;
      }

      console.log(`🔄 [HANDOVER] Loading rentals at station for staff accountID: ${staffAccountID}`);
      
      const response = await fetch(`http://localhost:5168/api/Rental/GetRentalsAtStation/${staffAccountID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const allRentals = await response.json();
      
      const transformedVehicles = allRentals.map((rental) => {
        const returnDateTime = new Date(rental.endDate);
        const now = new Date();
        const isOverdue = rental.status === 2 && returnDateTime < now;

        let statusText = "preparing";
        if (rental.status === 1) statusText = "preparing";
        else if (rental.status === 2) statusText = "ongoing";
        else if (rental.status === 3) statusText = "cancelled";
        else if (rental.status === 4) statusText = "completed";

        return {
          id: rental.rentalID,
          rentalID: rental.rentalID,
          vehicleName: rental.bikeName || "N/A",
          licensePlate: rental.licensePlate || "N/A",
          customerName: rental.renterName || "N/A",
          userId: rental.accountID,
          userPhone: rental.phoneNumber || "Chưa cập nhật",
          userEmail: rental.email || "N/A",
          bookingId: rental.rentalID,
          status: statusText,
          rentalStatus: rental.status,
          pickupDate: rental.startDate ? new Date(rental.startDate).toLocaleString('vi-VN') : "N/A",
          returnDate: rental.endDate ? new Date(rental.endDate).toLocaleString('vi-VN') : "N/A",
          pickupStation: "Điểm nhận xe",
          returnStation: "Điểm trả xe",
          battery: "100%",
          lastCheck: new Date().toLocaleString('vi-VN'),
          completedDate: rental.handoverDate ? new Date(rental.handoverDate).toLocaleString('vi-VN') : null,
          days: Math.ceil((new Date(rental.endDate) - new Date(rental.startDate)) / (1000 * 60 * 60 * 24)),
          totalPrice: rental.totalAmount || 0,
          vehicleImage: null,
          paymentVerified: rental.status >= 1,
          paymentVerifiedAt: rental.startDate,
          isOverdue: isOverdue,
          overdueHours: isOverdue ? Math.floor((now - returnDateTime) / (1000 * 60 * 60)) : 0,
          station: rental.station || null,
          paymentMethod: rental.paymentMethod || 0,
          dailyRate: rental.dailyRate || rental.pricePerDay || 0,
          additionalFees: rental.additionalFees || 0,
          totalCost: rental.totalAmount || 0,
          startDate: rental.startDate,
          endDate: rental.endDate,
          renterID: rental.renterID || rental.renterId || null,
        };
      });

      setVehicles(transformedVehicles);
      console.log('✅ [HANDOVER] Vehicles loaded:', transformedVehicles.length);
    } catch (error) {
      console.error('❌ [HANDOVER] Error loading rentals:', error);
      setVehicles([]);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    let statusMatch = true;
    if (selectedFilter !== "all") {
      statusMatch = v.status === selectedFilter;
    }

    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const rentalIdStr = v.rentalID?.toString().toLowerCase() || "";
      const customerName = v.customerName?.toLowerCase() || "";
      const userPhone = v.userPhone?.toLowerCase() || "";
      searchMatch = rentalIdStr.includes(query) || customerName.includes(query) || userPhone.includes(query);
    }

    return statusMatch && searchMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  const preparingCount = vehicles.filter((v) => v.status === "preparing").length;
  const ongoingCount = vehicles.filter((v) => v.status === "ongoing").length;
  const completedCount = vehicles.filter((v) => v.status === "completed").length;
  const cancelledCount = vehicles.filter((v) => v.status === "cancelled").length;

  const getStatusBadge = (rentalStatus) => {
    const config = {
      0: { text: "Đang chờ", class: "status-pending", icon: "⏳" },
      1: { text: "Chuẩn bị bàn giao", class: "status-reserved", icon: "📅" },
      2: { text: "Đang hoạt động", class: "status-ongoing", icon: "🚗" },
      3: { text: "Đã hủy", class: "status-cancelled", icon: "❌" },
      4: { text: "Đã hoàn tất", class: "status-completed", icon: "✅" },
    };
    const c = config[rentalStatus] || config[0];
    return (
      <span className={`status-badge ${c.class}`}>
        {c.icon} {c.text}
      </span>
    );
  };

  const handleHandOverBikeFromCard = async (vehicle) => {
    if (!vehicle.rentalID) {
      alert('❌ Không tìm thấy thông tin Rental ID!');
      return;
    }

    if (!window.confirm(`Xác nhận bàn giao xe cho khách hàng ${vehicle.customerName}?`)) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        alert('❌ Không tìm thấy token xác thực!');
        return;
      }

      const response = await fetch(`http://localhost:5168/api/Rental/HandOverBike?rentalID=${vehicle.rentalID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [HANDOVER] API Error:', response.status, errorText);
        alert(`❌ Lỗi bàn giao xe: ${response.status}`);
        return;
      }

      const result = await response.json();
      console.log('✅ [HANDOVER] Bike handed over successfully:', result);

      alert('✅ Bàn giao xe thành công!');
      loadBookings();
    } catch (error) {
      console.error('❌ [HANDOVER] Error handing over bike:', error);
      alert('❌ Có lỗi xảy ra khi bàn giao xe!');
    }
  };

  const handleCancelRental = async (vehicle) => {
    if (!vehicle.rentalID) {
      alert('❌ Không tìm thấy thông tin Rental ID!');
      return;
    }

    if (vehicle.rentalStatus !== 1) {
      alert('⚠️ Chỉ có thể hủy đơn đang chuẩn bị bàn giao!');
      return;
    }

    if (!window.confirm(`⚠️ Xác nhận hủy đơn thuê xe #${vehicle.rentalID}?\n\nKhách hàng: ${vehicle.customerName}\nXe: ${vehicle.vehicleName} (${vehicle.licensePlate})\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        alert('❌ Không tìm thấy token xác thực!');
        return;
      }

      const response = await fetch(`http://localhost:5168/api/Rental/DeleteRental/${vehicle.rentalID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [CANCEL] API Error:', response.status, errorText);
        alert(`❌ Lỗi hủy đơn: ${response.status}`);
        return;
      }

      const result = await response.json();
      console.log('✅ [CANCEL] Rental cancelled successfully:', result);

      alert('✅ Hủy đơn thuê xe thành công!');
      loadBookings();
    } catch (error) {
      console.error('❌ [CANCEL] Error cancelling rental:', error);
      alert('❌ Có lỗi xảy ra khi hủy đơn!');
    }
  };

  const handleReturnBike = (vehicle) => {
    if (!vehicle.rentalID) {
      alert('❌ Không tìm thấy thông tin Rental ID!');
      return;
    }

    if (vehicle.rentalStatus !== 2) {
      alert('⚠️ Chỉ có thể thu hồi xe đang hoạt động!');
      return;
    }

    setSelectedVehicle(vehicle);
    setShowReturnModal(true);
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>🔄 Quản lý Giao - Nhận Xe</h2>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${selectedFilter === "preparing" ? "active" : ""}`}
          onClick={() => setSelectedFilter("preparing")}
        >
          📅 Đơn chuẩn bị bàn giao ({preparingCount})
        </button>
        <button
          className={`filter-tab ${selectedFilter === "ongoing" ? "active" : ""}`}
          onClick={() => setSelectedFilter("ongoing")}
        >
          🚗 Đơn đang hoạt động ({ongoingCount})
        </button>
        <button
          className={`filter-tab ${selectedFilter === "completed" ? "active" : ""}`}
          onClick={() => setSelectedFilter("completed")}
        >
          ✅ Đơn đã hoàn tất ({completedCount})
        </button>
        <button
          className={`filter-tab ${selectedFilter === "cancelled" ? "active" : ""}`}
          onClick={() => setSelectedFilter("cancelled")}
        >
          ❌ Đơn bị hủy ({cancelledCount})
        </button>
      </div>

      <div className="search-bar" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <span style={{ fontSize: '20px' }}>🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng hoặc số điện thoại..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: 'white'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            ✕ Xóa
          </button>
        )}
      </div>

      <div className="vehicles-list">
        {paginatedVehicles.length === 0 && (
          <div className="empty-state">
            {searchQuery ? (
              <p>🔍 Không tìm thấy đơn với từ khóa: "{searchQuery}"</p>
            ) : (
              <>
                {selectedFilter === "preparing" && <p>📭 Chưa có đơn nào cần bàn giao</p>}
                {selectedFilter === "ongoing" && <p>📭 Chưa có đơn nào đang hoạt động</p>}
                {selectedFilter === "completed" && <p>📭 Chưa có đơn nào đã hoàn tất</p>}
                {selectedFilter === "cancelled" && <p>📭 Chưa có đơn nào bị hủy</p>}
              </>
            )}
          </div>
        )}

        {paginatedVehicles.map((vehicle) => (
          <div key={vehicle.id} className={`handover-vehicle-card ${vehicle.isOverdue ? "overdue-warning" : ""}`}>
            <div className="vehicle-header">
              <div className="vehicle-title">
                <h3>📋 Mã Booking: {vehicle.rentalID || "N/A"}</h3>
              </div>
              <div className="status-badges">
                {vehicle.isOverdue && (
                  <span className="overdue-badge">
                    ⚠️ QUÁ HẠN {vehicle.overdueHours}h
                  </span>
                )}
                {getStatusBadge(vehicle.rentalStatus)}
              </div>
            </div>

            {vehicle.isOverdue && (
              <div className="overdue-alert">
                <span className="alert-icon">🚨</span>
                <span className="alert-text">
                  Xe đã quá thời hạn trả <strong>{vehicle.overdueHours} giờ</strong>! Vui lòng liên hệ khách hàng ngay.
                </span>
              </div>
            )}

            <div className="vehicle-details">
              <div className="detail-row-group">
                <div className="detail-item">
                  <span className="label">📅 Ngày bàn giao xe:</span>
                  <span className="value">{vehicle.pickupDate}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📅 Ngày kết thúc:</span>
                  <span className="value">{vehicle.returnDate}</span>
                </div>
              </div>

              <div className="detail-row-group">
                <div className="detail-item">
                  <span className="label">👤 Tên khách hàng:</span>
                  <span className="value">{vehicle.customerName || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📱 Số điện thoại:</span>
                  <span className="value">{vehicle.userPhone || "Chưa cập nhật"}</span>
                </div>
              </div>

              <div className="detail-row-group">
                <div className="detail-item">
                  <span className="label">🏍️ Loại xe:</span>
                  <span className="value">{vehicle.vehicleName || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">🔢 Biển số xe:</span>
                  <span className="value">{vehicle.licensePlate || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="vehicle-actions">
              {vehicle.rentalStatus === 1 && (
                <>
                  <button 
                    className="btn-action btn-handover"
                    onClick={() => handleHandOverBikeFromCard(vehicle)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: '600',
                    }}
                  >
                    🚗 Bàn giao xe
                  </button>
                  <button 
                    className="btn-action btn-cancel"
                    onClick={() => handleCancelRental(vehicle)}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      fontWeight: '600',
                    }}
                  >
                    ❌ Hủy đơn
                  </button>
                </>
              )}
              {vehicle.rentalStatus === 2 && (
                <button 
                  className="btn-action btn-return"
                  onClick={() => handleReturnBike(vehicle)}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    fontWeight: '600',
                  }}
                >
                  🔄 Thu hồi xe
                </button>
              )}
              <button 
                className="btn-action btn-view"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setShowDetailModal(true);
                }}
              >
                👁️ Chi tiết xe
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredVehicles.length}
        />
      )}

      {showHandoverModal && selectedVehicle && (
        <HandoverModal
          vehicle={selectedVehicle}
          onClose={() => {
            setShowHandoverModal(false);
            setSelectedVehicle(null);
          }}
          onComplete={(vehicleId, newStatus) => {
            updateBookingStatus(vehicleId, newStatus);
            loadBookings();
            setShowHandoverModal(false);
            setSelectedVehicle(null);
          }}
        />
      )}

      {showDetailModal && selectedVehicle && (
        <RentalDetailModal
          vehicle={selectedVehicle}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedVehicle(null);
          }}
          onReturnBike={(vehicle) => {
            setShowDetailModal(false);
            setShowReturnModal(true);
            setSelectedVehicle(vehicle);
          }}
        />
      )}

      {showReturnModal && selectedVehicle && (
        <ReturnBikeModal
          vehicle={selectedVehicle}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedVehicle(null);
          }}
          onComplete={() => {
            loadBookings();
          }}
        />
      )}
    </div>
  );
}
