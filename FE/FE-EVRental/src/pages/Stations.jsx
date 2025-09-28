import React, { useState, useEffect } from "react";
import StationFinder from "../components/StationFinder";
import StationMap from "../components/StationMap";
import stationsData from "../data/stations_new";
import "../styles/Pages.css";

export default function Stations() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [viewMode, setViewMode] = useState("map"); // 'map' or 'list'
  const [stations, setStations] = useState(stationsData);
  const [filters, setFilters] = useState({
    amenities: [],
    minAvailableVehicles: 0,
  });
  const [userLocation, setUserLocation] = useState(null);

  // Lấy vị trí hiện tại của người dùng
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Lỗi khi lấy vị trí:", error);
          // Mặc định là vị trí TPHCM
          setUserLocation({ lat: 10.762622, lng: 106.660172 });
        }
      );
    }
  }, []);

  // Lọc trạm dựa trên bộ lọc
  useEffect(() => {
    let filteredStations = [...stationsData];

    // Lọc theo tiện ích
    if (filters.amenities.length > 0) {
      filteredStations = filteredStations.filter((station) =>
        filters.amenities.every((amenity) =>
          station.amenities.includes(amenity)
        )
      );
    }

    // Lọc theo số xe có sẵn
    if (filters.minAvailableVehicles > 0) {
      filteredStations = filteredStations.filter(
        (station) => station.availableVehicles >= filters.minAvailableVehicles
      );
    }

    setStations(filteredStations);
  }, [filters]);

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    // Scroll đến phần chi tiết trạm khi người dùng chọn
    document.querySelector(".selected-station-info")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Danh sách các tiện ích phổ biến để lọc
  const commonAmenities = [
    "Sạc điện",
    "Bãi đỗ xe",
    "Camera an ninh",
    "Wifi miễn phí",
    "Khu vực chờ có máy lạnh",
  ];

  // Cập nhật bộ lọc khi người dùng chọn
  const handleFilterChange = (amenity) => {
    setFilters((prev) => {
      const updatedAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];

      return { ...prev, amenities: updatedAmenities };
    });
  };

  // Cập nhật lọc số xe có sẵn
  const handleVehicleCountChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setFilters((prev) => ({ ...prev, minAvailableVehicles: value }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🚗 Điểm Thuê Xe Điện</h1>
        <p>Tìm điểm thuê gần nhất để bắt đầu hành trình xanh của bạn</p>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === "map" ? "active" : ""}`}
            onClick={() => setViewMode("map")}
          >
            🗺️ Xem bản đồ
          </button>
          <button
            className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            📋 Xem danh sách
          </button>
        </div>

        {/* Bộ lọc trạm */}
        <div className="station-filters">
          <div className="filter-section">
            <h3>Lọc theo tiện ích:</h3>
            <div className="amenity-filters">
              {commonAmenities.map((amenity) => (
                <label key={amenity} className="amenity-filter-item">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleFilterChange(amenity)}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Số xe có sẵn tối thiểu:</h3>
            <input
              type="range"
              min="0"
              max="15"
              value={filters.minAvailableVehicles}
              onChange={handleVehicleCountChange}
            />
            <span className="filter-value">
              {filters.minAvailableVehicles} xe
            </span>
          </div>

          <div className="stations-count">
            {stations.length} trạm phù hợp với bộ lọc
          </div>
        </div>
      </div>

      {viewMode === "map" ? (
        <StationMap
          stations={stations}
          onStationSelect={handleStationSelect}
          selectedStation={selectedStation}
        />
      ) : (
        <StationFinder stations={stations} />
      )}

      {selectedStation && (
        <div className="selected-station-info">
          <h3>📍 Điểm thuê đã chọn: {selectedStation.name}</h3>
          <p>{selectedStation.address}</p>
          <div className="station-details-grid">
            <div className="detail-item">
              <span className="detail-label">Số xe có sẵn:</span>
              <span className="detail-value">
                {selectedStation.availableVehicles}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Trạm sạc:</span>
              <span className="detail-value">
                {selectedStation.chargingStations || "Đang cập nhật"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Giờ mở cửa:</span>
              <span className="detail-value">
                {selectedStation.openingHours}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Đánh giá:</span>
              <span className="detail-value">
                ⭐ {selectedStation.rating} ({selectedStation.reviews} đánh giá)
              </span>
            </div>
          </div>

          <div className="station-amenities">
            <h4>Tiện ích:</h4>
            <div className="amenity-tags">
              {selectedStation.amenities.map((amenity, index) => (
                <span key={index} className="amenity-tag">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="station-actions">
            <button
              className="btn primary"
              onClick={() =>
                (window.location.href = `/stations/${selectedStation.id}`)
              }
            >
              Xem chi tiết & đặt xe
            </button>
            <button
              className="btn secondary"
              onClick={() => setSelectedStation(null)}
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
