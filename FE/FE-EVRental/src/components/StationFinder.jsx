import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import stationsData from "../data/stations";
import "../styles/StationFinder.css";

export default function StationFinder({ stations: stationsProp }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  // Load stations data
  useEffect(() => {
    try {
      setLoading(true);
      // Sử dụng danh sách trạm được truyền vào từ prop nếu có
      if (stationsProp && Array.isArray(stationsProp)) {
        setStations(stationsProp);
        setError(null);
        setLoading(false);
      } else {
        // Nếu không có prop trạm, sử dụng dữ liệu cứng
        setTimeout(() => {
          if (stationsData && Array.isArray(stationsData)) {
            setStations(stationsData);
            setError(null);
          } else {
            setError("Dữ liệu trạm không hợp lệ");
          }
          setLoading(false);
        }, 500);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu trạm: " + err.message);
      setLoading(false);
    }
  }, [stationsProp]);

  // Handle station selection
  const handleStationSelect = (station) => {
    setSelectedStation(station);
  };

  // Filter stations based on search query
  const filteredStations = stations.filter(
    (station) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="station-finder-container">
        <div className="loading-message">
          <p>🔄 Đang tải danh sách trạm thuê xe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="station-finder-container">
        <div className="error-message">
          <h3>❌ Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button
            className="btn primary"
            onClick={() => window.location.reload()}
          >
            🔄 Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="station-finder-container">
      <div className="station-finder-header">
        <h2>🏍️ Tìm Điểm Thuê Xe</h2>
        <p>Khám phá {stations.length} điểm thuê xe điện gần bạn</p>
      </div>

      <div className="search-form">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên trạm hoặc địa chỉ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="station-finder-content">
        <div className="stations-list-fullwidth">
          <h3>📍 Danh sách trạm ({filteredStations.length})</h3>

          {filteredStations.length === 0 ? (
            <div className="no-results">
              <p>
                😔 Không tìm thấy trạm nào phù hợp với từ khóa "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="station-cards">
              {filteredStations.map((station) => (
                <div
                  key={station.id}
                  className={`station-card ${
                    selectedStation?.id === station.id ? "selected" : ""
                  }`}
                  onClick={() => handleStationSelect(station)}
                >
                  <div className="station-image">
                    <img src={station.image} alt={station.name} />
                    <div className="available-badge">
                      {station.availableVehicles} xe có sẵn
                    </div>
                  </div>

                  <div className="station-info">
                    <h4>{station.name}</h4>
                    <p className="address">📍 {station.address}</p>
                    {station.distance && (
                      <p className="distance">
                        📏 Cách bạn {station.distance.toFixed(1)} km
                      </p>
                    )}
                    <p className="hours">🕒 {station.openingHours}</p>
                    <p className="contact">📞 {station.contactNumber}</p>

                    <div className="station-rating">
                      ⭐ {station.rating} ({station.reviews} đánh giá)
                    </div>

                    <div className="amenities">
                      {station.amenities.map((amenity, index) => (
                        <span key={index} className="amenity-tag">
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="station-actions">
                      <Link
                        to={`/stations/${station.id}`}
                        className="btn primary"
                      >
                        Xem chi tiết
                      </Link>
                      <button className="btn secondary">Đặt xe ngay</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
