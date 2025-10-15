import React from "react";
import { Link } from "react-router-dom";
import { useReviews } from "../contexts/ReviewContext";
import "../styles/StationList.css";

export default function StationList({ stations }) {
  const { getStationReviews, getAverageRating } = useReviews();

  if (!stations || stations.length === 0)
    return <p>Không tìm thấy trạm nào.</p>;

  // Tính điểm đánh giá trung bình cho trạm
  const getStationRating = (stationId) => {
    const reviews = getStationReviews(stationId);
    if (reviews.length === 0) return null;
    return getAverageRating(stationId);
  };

  // Render stars
  const renderStars = (rating) => {
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
    return stars;
  };

  return (
    <div className="station-list">
      {stations.map((station) => {
        const rating = getStationRating(station.id);
        const reviews = getStationReviews(station.id);

        return (
          <article key={station.id} className="station">
            <div className="station-image">
              {station.images?.thumbnail || station.image ? (
                <img
                  src={station.images?.thumbnail || station.image}
                  alt={station.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="no-image">📷 Không có hình ảnh</div>
              )}
            </div>
            <div className="station-content">
              <h3>{station.name}</h3>

              {/* Phần đánh giá */}
              {rating ? (
                <div className="station-rating">
                  <div className="stars">{renderStars(rating)}</div>
                  <span className="rating-text">
                    {rating.toFixed(1)} ⭐ ({reviews.length} đánh giá)
                  </span>
                </div>
              ) : (
                <div className="station-rating">
                  <span className="no-rating">Chưa có đánh giá</span>
                </div>
              )}

              <p className="meta">
                🏍️ {station.availableVehicles || 0} xe • 🔌{" "}
                {station.chargingStations || 0} trạm sạc
              </p>
              <p className="location">
                📍 {station.address || "Chưa có địa chỉ"}
              </p>
              <p className="hours">
                � {station.openingHours || "Chưa có thông tin"}
              </p>
              <p className="desc">{station.description || "Chưa có mô tả"}</p>
              <div className="station-actions">
                <Link to={`/stations/${station.id}`} className="btn">
                  Xem chi tiết
                </Link>
                <Link to={`/stations/${station.id}`} className="btn primary">
                  Đặt ngay
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
