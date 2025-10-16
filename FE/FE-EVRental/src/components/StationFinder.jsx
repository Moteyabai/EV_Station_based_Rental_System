import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useReviews } from "../contexts/ReviewContext";
import stationsData from "../data/stations";
import "../styles/StationFinder.css";

export default function StationFinder({ stations: stationsProp }) {
  const { getStationReviews, getAverageRating } = useReviews();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  // Helper function để lấy rating và reviews
  const getStationRating = (stationId) => {
    const reviews = getStationReviews(stationId);
    const rating = reviews.length > 0 ? getAverageRating(stationId) : null;
    return { rating, reviewCount: reviews.length };
  };

  // Render stars
  const renderStars = (rating) => {
    if (!rating) return <span className="no-rating">Chưa có đánh giá</span>;

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="star filled">
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="star half">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="star empty">
            ☆
          </span>
        );
      }
    }
    return <>{stars}</>;
  };

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
          <h3>🔄 Đang tải danh sách trạm thuê xe...</h3>
          <p>Vui lòng chờ trong giây lát</p>
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
          <p>Số trạm: {stations.length}</p>
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

  // Debug: Kiểm tra nếu không có trạm
  if (!stations || stations.length === 0) {
    return (
      <div className="station-finder-container">
        <div className="error-message">
          <h3>⚠️ Không có dữ liệu trạm</h3>
          <p>Danh sách trạm đang trống. Stations: {JSON.stringify(stations)}</p>
          <button
            className="btn primary"
            onClick={() => window.location.reload()}
          >
            🔄 Tải lại trang
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
              {filteredStations.map((station) => {
                const { rating, reviewCount } = getStationRating(station.id);

                return (
                  <div
                    key={station.id}
                    className={`station-card ${
                      selectedStation?.id === station.id ? "selected" : ""
                    }`}
                    onClick={() => handleStationSelect(station)}
                  >
                    <div className="station-image">
                      <img
                        src={station.images?.thumbnail || station.image}
                        alt={station.name}
                      />
                      <div className="available-badge">
                        {station.availableVehicles} xe có sẵn
                      </div>
                    </div>

                    <div className="station-info">
                      <h4>{station.name}</h4>

                      {/* Rating - Luôn hiển thị */}
                      <div className="station-rating">
                        <div className="stars">{renderStars(rating)}</div>
                        {rating ? (
                          <span className="rating-text">
                            {rating.toFixed(1)} ⭐ ({reviewCount} đánh giá)
                          </span>
                        ) : (
                          <span className="no-rating">Chưa có đánh giá</span>
                        )}
                      </div>

                      <p className="address">📍 {station.address}</p>

                      {station.distance && (
                        <p className="distance">
                          📏 Cách bạn {station.distance.toFixed(1)} km
                        </p>
                      )}

                      <p className="hours">🕒 {station.openingHours}</p>

                      <div className="station-meta">
                        <span className="meta-item">
                          🏍️ {station.availableVehicles} xe
                        </span>
                        <span className="meta-item">
                          🔌 {station.chargingStations} trạm sạc
                        </span>
                      </div>

                      {station.amenities && station.amenities.length > 0 && (
                        <div className="amenities">
                          {station.amenities
                            .slice(0, 3)
                            .map((amenity, index) => (
                              <span key={index} className="amenity-tag">
                                {amenity}
                              </span>
                            ))}
                          {station.amenities.length > 3 && (
                            <span className="amenity-tag more">
                              +{station.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      )}

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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
