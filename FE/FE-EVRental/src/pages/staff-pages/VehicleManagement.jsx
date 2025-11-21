import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getToken } from '../../utils/auth';
import Pagination from './components/Pagination';
import UpdateVehicleModal from './modals/UpdateVehicleModal';
import ReportIssueModal from './modals/ReportIssueModal';

export default function VehicleManagement() {
  const { user } = useAuth();
  const [vehicleFilter, setVehicleFilter] = useState("available");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    console.log("🔄 [VEHICLE MANAGEMENT] Loading vehicles for filter:", vehicleFilter);
    loadVehicles(true); // Show loading on initial load

    // Auto-refresh every 5 seconds without showing loading state
    const intervalId = setInterval(() => {
      console.log("🔄 [VEHICLE MANAGEMENT] Auto-refreshing vehicles...");
      loadVehicles(false); // Don't show loading on auto-refresh
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const loadVehicles = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);

      const token = getToken();
      if (!token) {
        console.warn("⚠️ [VEHICLE MANAGEMENT] No token found");
        setVehicles([]);
        return;
      }

      const staffAccountID = user?.accountID || user?.AccountID;
      
      if (!staffAccountID) {
        console.error("❌ [VEHICLE MANAGEMENT] Staff accountID not found!");
        setVehicles([]);
        return;
      }

      console.log(`📋 [VEHICLE MANAGEMENT] Fetching stocks for staff accountID: ${staffAccountID}`);
      
      const response = await fetch(
        `http://localhost:5168/api/EVBike_Stocks/GetStocksAtStationByAccountID/${staffAccountID}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        console.log(`✅ [VEHICLE MANAGEMENT] Loaded ${data.length} vehicles at station`);
        setVehicles(data);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error("❌ [VEHICLE MANAGEMENT] Error:", err);
      setError(err.message || "Không thể tải dữ liệu xe");
      setVehicles([]);
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    // Status mapping: Unavailable = 0 (renting), Available = 1 (available), InMaintenance = 2 (maintenance)
    if (vehicleFilter === "available") {
      return v.status === 1;
    }
    if (vehicleFilter === "renting") {
      return v.status === 0;
    }
    if (vehicleFilter === "inspection-maintenance") {
      return v.status === 2;
    }
    return false;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Status mapping: Unavailable = 0, Available = 1, InMaintenance = 2
  const availableCount = vehicles.filter((v) => v.status === 1).length;
  const rentingCount = vehicles.filter((v) => v.status === 0).length;
  const inspectionMaintenanceCount = vehicles.filter((v) => v.status === 2).length;

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
    // Status mapping: Unavailable = 0, Available = 1, InMaintenance = 2
    const config = {
      0: { text: "Đang cho thuê", class: "status-renting", icon: "🚗" },
      1: { text: "Sẵn sàng", class: "status-available", icon: "✅" },
      2: { text: "Kiểm định/Bảo trì", class: "status-maintenance", icon: "🔧" },
    };
    const c = config[status] || config[1];
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
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${vehicleFilter === "available" ? "active" : ""}`}
          onClick={() => {
            setVehicleFilter("available");
            setCurrentPage(1);
          }}
        >
          ✅ Xe đang có sẵn ({availableCount})
        </button>
        <button
          className={`filter-tab ${vehicleFilter === "renting" ? "active" : ""}`}
          onClick={() => {
            setVehicleFilter("renting");
            setCurrentPage(1);
          }}
        >
          🚗 Xe đang cho thuê ({rentingCount})
        </button>
        <button
          className={`filter-tab ${vehicleFilter === "inspection-maintenance" ? "active" : ""}`}
          onClick={() => {
            setVehicleFilter("inspection-maintenance");
            setCurrentPage(1);
          }}
        >
          🔍🔧 Kiểm định và Bảo trì ({inspectionMaintenanceCount})
        </button>
      </div>

      {paginatedVehicles.length === 0 && (
        <div className="empty-state">
          {vehicleFilter === "available" && <p>📭 Không có xe nào sẵn sàng</p>}
          {vehicleFilter === "renting" && <p>📭 Không có xe nào đang cho thuê</p>}
          {vehicleFilter === "inspection-maintenance" && <p>📭 Không có xe nào đang kiểm định hoặc bảo trì</p>}
        </div>
      )}

      {loading && (
        <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
          <p>⏳ Đang tải dữ liệu xe...</p>
        </div>
      )}

      {error && (
        <div className="error-state" style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>❌ Lỗi: {error}</p>
          <button onClick={loadVehicles} style={{ marginTop: '10px', padding: '8px 16px' }}>
            🔄 Thử lại
          </button>
        </div>
      )}

      <div className="vehicles-grid-manage">
        {paginatedVehicles.map((vehicle) => (
          <div key={vehicle.evBikeStockID || vehicle.id} className="vehicle-manage-card">
            <div className="vehicle-card-header">
              <div className="vehicle-title">
                <h3>{vehicle.bikeName|| "N/A"}</h3>
                <span className="license-plate">🏍️ {vehicle.licensePlate || "N/A"}</span>
              </div>
              <div className="vehicle-badges">
                {getStatusBadge(vehicle.status)}
              </div>
            </div>

            <div className="vehicle-stats">
              <div className="stat-row">
                <span className="label">🆔 Stock ID:</span>
                <span className="value">{vehicle.stockID || "N/A"}</span>
              </div>
              <div className="stat-row">
                <span className="label">🏍️ Bike ID:</span>
                <span className="value">{vehicle.bikeID || "N/A"}</span>
              </div>
              <div className="stat-row">
                <span className="label">🏢 Station name:</span>
                <span className="value">{vehicle.stationName || "N/A"}</span>
              </div>
            </div>

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

      {filteredVehicles.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredVehicles.length}
        />
      )}

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
