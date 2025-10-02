import React, { useState, useEffect } from "react";
import StationFinder from "../components/StationFinder";
import StationMap from "../components/StationMap";
import stationsData from "../data/stations_new";
import "../styles/Pages.css";

export default function Stations() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [viewMode, setViewMode] = useState("map"); // 'map' or 'list'
  const [stations, setStations] = useState(stationsData);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [locationPermission, setLocationPermission] = useState('pending'); // 'pending', 'granted', 'denied'
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Yêu cầu quyền truy cập vị trí từ người dùng
  const requestLocationPermission = () => {
    setIsRequestingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationPermission('granted');
          setIsRequestingLocation(false);
          
          // Tính khoảng cách và sắp xếp trạm theo khoảng cách gần nhất
          const stationsWithDistance = stationsData.map(station => {
            const distance = calculateDistance(
              location.lat, 
              location.lng, 
              station.coordinates.lat, 
              station.coordinates.lng
            );
            return { ...station, distance };
          }).sort((a, b) => a.distance - b.distance);
          
          setStations(stationsWithDistance);
          setNearbyStations(stationsWithDistance.slice(0, 5)); // 5 trạm gần nhất
        },
        (error) => {
          console.error("Lỗi khi lấy vị trí:", error);
          setLocationPermission('denied');
          setIsRequestingLocation(false);
          // Mặc định là vị trí TPHCM
          const defaultLocation = { lat: 10.762622, lng: 106.660172 };
          setUserLocation(defaultLocation);
          setStations(stationsData);
        }
      );
    } else {
      // Trình duyệt không hỗ trợ geolocation
      setLocationPermission('denied');
      setIsRequestingLocation(false);
      const defaultLocation = { lat: 10.762622, lng: 106.660172 };
      setUserLocation(defaultLocation);
      setStations(stationsData);
    }
  };

  // Hàm tính khoảng cách giữa 2 điểm (công thức Haversine)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Khoảng cách tính bằng km
  };

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    // Scroll đến phần chi tiết trạm khi người dùng chọn
    document.querySelector(".selected-station-info")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Hàm tìm trạm gần nhất
  const findNearestStation = () => {
    if (nearbyStations.length > 0) {
      setSelectedStation(nearbyStations[0]);
      document.querySelector(".selected-station-info")?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="page-container stations-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">🏍️</div>
          <h1>Điểm Thuê Xe Điện</h1>
          <p>Tìm điểm thuê gần nhất để bắt đầu hành trình xanh của bạn</p>
        </div>

        {/* Location Permission Request */}
        {locationPermission === 'pending' && (
          <div className="location-request-banner">
            <div className="banner-content">
              <div className="banner-icon">📍</div>
              <div className="banner-text">
                <h3>Cho phép truy cập vị trí</h3>
                <p>Chúng tôi cần quyền truy cập vị trí để hiển thị các trạm gần bạn nhất</p>
              </div>
              <button 
                className="btn btn-primary location-btn"
                onClick={requestLocationPermission}
                disabled={isRequestingLocation}
              >
                {isRequestingLocation ? '⏳ Đang xử lý...' : '📍 Chia sẻ vị trí'}
              </button>
            </div>
          </div>
        )}

        {locationPermission === 'denied' && (
          <div className="location-denied-banner">
            <div className="banner-content">
              <div className="banner-icon">⚠️</div>
              <div className="banner-text">
                <h3>Không có quyền truy cập vị trí</h3>
                <p>Bạn có thể bật lại quyền truy cập vị trí trong cài đặt trình duyệt</p>
              </div>
              <button 
                className="btn btn-outline"
                onClick={requestLocationPermission}
              >
                🔄 Thử lại
              </button>
            </div>
          </div>
        )}

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

        {/* Thông tin vị trí và trạm gần nhất */}
        {locationPermission === 'granted' && (
          <div className="location-info location-success">
            <div className="user-location-section">
              <div className="location-status success">
                <span className="status-icon">✅</span>
                <span className="status-text">Vị trí đã được xác định</span>
              </div>
              <div className="quick-actions">
                <button
                  className="btn btn-primary-outline"
                  onClick={findNearestStation}
                >
                  🎯 Tìm trạm gần nhất
                </button>
              </div>
            </div>

            {nearbyStations.length > 0 && (
              <div className="nearby-stations-section">
                <h3 className="section-title">
                  <span className="title-icon">🚀</span>
                  Trạm gần bạn nhất
                </h3>
                <div className="nearby-grid">
                  {nearbyStations.slice(0, 3).map((station, index) => (
                    <div
                      key={station.id}
                      className={`nearby-card ${index === 0 ? 'featured' : ''}`}
                      onClick={() => handleStationSelect(station)}
                    >
                      {index === 0 && <div className="featured-badge">Gần nhất</div>}
                      <div className="card-header">
                        <h4>{station.name}</h4>
                        <div className="distance-badge">
                          {station.distance?.toFixed(1)} km
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="card-info">
                          <span className="info-icon">📍</span>
                          <span className="info-text">{station.address}</span>
                        </div>
                        <div className="card-info">
                          <span className="info-icon">🏍️</span>
                          <span className="info-text">{station.availableVehicles} xe có sẵn</span>
                        </div>
                        <div className="card-info">
                          <span className="info-icon">⭐</span>
                          <span className="info-text">{station.rating} ({station.reviews} đánh giá)</span>
                        </div>
                      </div>
                      <button className="card-action-btn">
                        Xem chi tiết →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="stations-count-badge">
              <span className="count-icon">📊</span>
              <span className="count-text">Tổng cộng: <strong>{stations.length}</strong> điểm thuê</span>
            </div>
          </div>
        )}
      </div>

      {viewMode === "map" ? (
        <StationMap
          stations={stations}
          onStationSelect={handleStationSelect}
          selectedStation={selectedStation}
          userLocation={userLocation}
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
