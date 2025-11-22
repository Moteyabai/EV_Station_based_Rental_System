import React, { useState, useEffect } from "react";
import StationFinder from "../../components/StationFinder";
import StationMap from "../../components/StationMap";
import { fetchActiveStations } from "../../api/stations";
import { calculateDistance } from "../../utils/helpers";
import "../../styles/Stations.css";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaClock, FaMotorcycle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

export default function Stations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("map"); // 'map' or 'list'
  const [stations, setStations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [locationPermission, setLocationPermission] = useState("pending"); // 'pending', 'granted', 'denied'
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Role-based access control: Block Staff and Admin
  useEffect(() => {
    if (user) {
      const userRoleId = user?.roleID || user?.RoleID;
      if (userRoleId === 2 || userRoleId === 3) {
        console.log("Stations: Access denied for Staff/Admin, redirecting...");
        if (userRoleId === 2) {
          navigate("/staff");
        } else {
          navigate("/admin");
        }
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    let isMounted = true;
    async function loadStations() {
      try {
        setLoading(true);
        setError(null); // Reset error state
        console.log('🚀 Calling fetchActiveStations API... (Reload safe)');
        const apiStations = await fetchActiveStations();
        if (!isMounted) return;
        console.log('✅ Stations data received:', apiStations);
        // Map backend fields to frontend expected shape minimally
        const mapped = apiStations.map((s) => ({
          id: s.stationID || s.StationID || s.id,
          name: s.name || s.Name,
          address: s.address || s.Address,
          description: s.description || s.Description,
          openingHours: s.openingHours || s.OpeningHours || "24/7",
          image: s.thumbnailImageUrl || s.ThumbnailImageUrl || s.imageUrl || s.ImageUrl,
          location: { 
            lat: parseFloat(s.latitude || s.Latitude || 10.762622), 
            lng: parseFloat(s.longitude || s.Longitude || 106.660172) 
          },
          availableVehicles: s.bikeCapacity || 0,
          chargingStations: 0,
          amenities: [],
          rating: 5,
          reviews: 0
        }));
        setStations(mapped);
      } catch (e) {
        console.error("❌ Error loading stations:", e);
        if (isMounted) {
          setError("Không tải được dữ liệu trạm. Vui lòng thử lại sau.");
          setStations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('✅ Stations page loaded successfully');
        }
      }
    }
    // Always call loadStations on mount/reload
    loadStations();
    return () => { isMounted = false; };
  }, []);

  // Yêu cầu quyền truy cập vị trí từ người dùng
  const requestLocationPermission = () => {
    setIsRequestingLocation(true);
    
    if (!navigator.geolocation) {
      alert("❌ Trình duyệt của bạn không hỗ trợ định vị.\nVui lòng sử dụng trình duyệt khác hoặc cập nhật lên phiên bản mới nhất.");
      setLocationPermission("denied");
      setIsRequestingLocation(false);
      const defaultLocation = { lat: 10.762622, lng: 106.660172 };
      setUserLocation(defaultLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationPermission("granted");
        setIsRequestingLocation(false);

        // Tính khoảng cách và sắp xếp trạm theo khoảng cách gần nhất
        const stationsWithDistance = stations
          .map((station) => {
            const distance = calculateDistance(
              location.lat,
              location.lng,
              station.location.lat,
              station.location.lng
            );
            return { ...station, distance };
          })
          .sort((a, b) => a.distance - b.distance);

        setStations(stationsWithDistance);
        const nearby = stationsWithDistance.slice(0, 5);
        setNearbyStations(nearby);

        // Thông báo thành công và hiển thị trạm gần nhất
        if (nearby.length > 0) {
          console.log(`✅ Đã tìm thấy ${nearby.length} trạm gần bạn. Trạm gần nhất: ${nearby[0].name} (${nearby[0].distance.toFixed(1)} km)`);
        }
      },
      (error) => {
        console.error("❌ Lỗi khi lấy vị trí:", error);
        setLocationPermission("denied");
        setIsRequestingLocation(false);
        
        // Thông báo lỗi chi tiết
        let errorMessage = "❌ Không thể lấy vị trí của bạn.\n\n";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Bạn đã từ chối quyền truy cập vị trí.\nVui lòng bật quyền trong cài đặt trình duyệt.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Thông tin vị trí không khả dụng.\nVui lòng kiểm tra kết nối mạng.";
            break;
          case error.TIMEOUT:
            errorMessage += "Yêu cầu lấy vị trí đã hết thời gian.\nVui lòng thử lại.";
            break;
          default:
            errorMessage += "Đã xảy ra lỗi không xác định.\nVui lòng thử lại sau.";
        }
        alert(errorMessage);
        
        // Giữ nguyên stations từ API
        const defaultLocation = { lat: 10.762622, lng: 106.660172 };
        setUserLocation(defaultLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleStationSelect = (station) => {
    navigate(`/stations/${station.id}`);
  };

  // Hàm tìm trạm gần nhất - tự động yêu cầu vị trí nếu chưa có
  const findNearestStation = () => {
    // Nếu chưa có vị trí, yêu cầu quyền truy cập
    if (locationPermission !== "granted") {
      requestLocationPermission();
      return;
    }
    
    // Nếu đã có vị trí và có trạm gần, chuyển đến trạm gần nhất
    if (nearbyStations.length > 0) {
      navigate(`/stations/${nearbyStations[0].id}`);
    }
  };

  const filteredStations = stations.filter(
    (station) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStationClick = (stationId) => {
    navigate(`/stations/${stationId}`);
  };

  return (
    <div className="page-container stations-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">🏍️</div>
          <h1>Điểm Thuê Xe Điện</h1>
          <p>Tìm điểm thuê gần nhất để bắt đầu hành trình xanh của bạn</p>
        </div>

        {loading && (
          <div className="location-request-banner">
            <div className="banner-content">
              <div className="banner-icon">⏳</div>
              <div className="banner-text">
                <h3>Đang tải dữ liệu trạm...</h3>
              </div>
            </div>
          </div>
        )}

        {/* Location Permission Request */}
        {locationPermission === "pending" && (
          <div className="location-request-banner">
            <div className="banner-content">
              <div className="banner-icon">📍</div>
              <div className="banner-text">
                <h3>Cho phép truy cập vị trí</h3>
                <p>
                  Chúng tôi cần quyền truy cập vị trí để hiển thị các trạm gần
                  bạn nhất
                </p>
              </div>
              <button
                className="btn btn-primary location-btn"
                onClick={requestLocationPermission}
                disabled={isRequestingLocation}
              >
                {isRequestingLocation
                  ? "⏳ Đang xử lý..."
                  : "📍 Chia sẻ vị trí"}
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
          {locationPermission !== "granted" && !loading && (
            <button
              className="toggle-btn nearest-station-btn"
              onClick={findNearestStation}
              disabled={isRequestingLocation}
            >
              {isRequestingLocation ? "⏳ Đang lấy vị trí..." : "🎯 Tìm trạm gần nhất"}
            </button>
          )}
        </div>

        {/* Thông tin vị trí và trạm gần nhất */}
        {locationPermission === "granted" && (
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
                      className={`nearby-card ${index === 0 ? "featured" : ""}`}
                      onClick={() => handleStationSelect(station)}
                    >
                      {index === 0 && (
                        <div className="featured-badge">Gần nhất</div>
                      )}
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
                          <span className="info-text">
                            {station.availableVehicles} xe có sẵn
                          </span>
                        </div>
                        <div className="card-info">
                          <span className="info-icon">⭐</span>
                          <span className="info-text">
                            {station.rating} ({station.reviews} đánh giá)
                          </span>
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
              <span className="count-text">
                Tổng cộng: <strong>{stations.length}</strong> điểm thuê
              </span>
            </div>
          </div>
        )}
      </div>

      {viewMode === "map" ? (
        <StationMap
          stations={stations}
          onStationSelect={handleStationSelect}
          selectedStation={null}
          userLocation={userLocation}
        />
      ) : (
        <div className="stations-list-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm điểm thuê..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="nearby-label">
            <FaMapMarkerAlt className="nearby-icon" />
            <span>Trạm gần bạn</span>
          </div>

          <div className="stations-list">
            {filteredStations.map((station) => (
              <div
                key={station.id}
                className="station-item"
                onClick={() => handleStationClick(station.id)}
              >
                <div className="station-item-header">
                  <h3>{station.name}</h3>
                  <button
                    className="direction-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStationClick(station.id);
                    }}
                  >
                    Chỉ đường
                  </button>
                </div>

                <p className="station-address">{station.address}</p>

                <div className="station-meta">
                  <span className="distance">
                    <FaMapMarkerAlt /> {station.distance}
                  </span>
                  <span className="travel-time">
                    <FaClock /> {station.travelTime}
                  </span>
                </div>

                <div className="station-availability">
                  <FaMotorcycle className="bike-icon" />
                  <span>{station.availableBikes} xe có sẵn</span>
                </div>
              </div>
            ))}
          </div>

          {filteredStations.length === 0 && (
            <div className="no-results">
              <p>Không tìm thấy điểm thuê phù hợp</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
