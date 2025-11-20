import React, { useState } from 'react';
import Pagination from './components/Pagination';
import UpdateVehicleModal from './modals/UpdateVehicleModal';
import ReportIssueModal from './modals/ReportIssueModal';

export default function VehicleManagement() {
  const [vehicleFilter, setVehicleFilter] = useState("available");
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredVehicles = vehicles.filter((v) => v.status === vehicleFilter);

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  const availableCount = vehicles.filter((v) => v.status === "available").length;
  const rentingCount = vehicles.filter((v) => v.status === "renting").length;
  const inspectionCount = vehicles.filter((v) => v.status === "inspection").length;
  const maintenanceCount = vehicles.filter((v) => v.status === "maintenance").length;

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
      inspection: { text: "Đang kiểm định", class: "status-inspection", icon: "🔍" },
      maintenance: { text: "Bảo trì", class: "status-maintenance", icon: "🔧" },
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
          className={`filter-tab ${vehicleFilter === "inspection" ? "active" : ""}`}
          onClick={() => {
            setVehicleFilter("inspection");
            setCurrentPage(1);
          }}
        >
          🔍 Xe đang kiểm định ({inspectionCount})
        </button>
        <button
          className={`filter-tab ${vehicleFilter === "maintenance" ? "active" : ""}`}
          onClick={() => {
            setVehicleFilter("maintenance");
            setCurrentPage(1);
          }}
        >
          🔧 Xe đang bảo trì ({maintenanceCount})
        </button>
      </div>

      {paginatedVehicles.length === 0 && (
        <div className="empty-state">
          {vehicleFilter === "available" && <p>📭 Không có xe nào sẵn sàng</p>}
          {vehicleFilter === "renting" && <p>📭 Không có xe nào đang cho thuê</p>}
          {vehicleFilter === "inspection" && <p>📭 Không có xe nào đang kiểm định</p>}
          {vehicleFilter === "maintenance" && <p>📭 Không có xe nào đang bảo trì</p>}
        </div>
      )}

      <div className="vehicles-grid-manage">
        {paginatedVehicles.map((vehicle) => (
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
                      className={`battery-fill ${getBatteryClass(vehicle.battery)}`}
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
