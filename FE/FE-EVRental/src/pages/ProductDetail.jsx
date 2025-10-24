import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "antd";
import { StarOutlined } from "@ant-design/icons";
import vehicles from "../data/vehicles";
import { useCart } from "../contexts/CartContext";
import BookingForm from "../components/BookingForm";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";
import { formatPrice } from "../utils/helpers";
import "../styles/ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const vehicle = vehicles.find((v) => v.id === id);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (!vehicle) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h2>Không tìm thấy xe</h2>
          <p>Xe bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/vehicles" className="btn primary">
            {" "}
            Quay lại danh sách xe
          </Link>
        </div>
      </div>
    );
  }

  const handleRentNow = () => {
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (formData, rentalDetails) => {
    try {
      setShowBookingForm(false);
      setShowBookingSuccess(true);
      setTimeout(() => {
        setShowBookingSuccess(false);
        navigate("/cart");
      }, 2000);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
    }
  };

  const getBrandColor = (brand) => {
    switch (brand?.toLowerCase()) {
      case "vinfast":
        return "#1e40af";
      case "datbike":
        return "#059669";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="product-detail-container">
      <div className="product-layout">
          {/* Image Section */}
          <div className="main-image">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60";
              }}
            />
            <div
              className="brand-badge"
              style={{ backgroundColor: getBrandColor(vehicle.brand) }}
            >
              {vehicle.brand}
            </div>
            {!vehicle.available && (
              <div className="unavailable-overlay">
                <span>Hiện không có sẵn</span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="product-info">
            <div className="vehicle-header">
              <div className="vehicle-badge">{vehicle.category === "scooter" ? "Xe máy điện" : vehicle.category}</div>
              <h1 className="vehicle-name">{vehicle.name}</h1>
              <p className="vehicle-category">{vehicle.short}</p>
            </div>

            <div className="price-section">
              <h2 className="current-price">
                {formatPrice(vehicle.price, vehicle.priceUnit)}
              </h2>
              <span className="price-unit">/ {vehicle.priceUnit.split("/")[1]}</span>
            </div>

            <div className="vehicle-status">
              <div className="status-item">
                <span className="status-icon">●</span>
                <span className="status-label">Trạng thái:</span>
                <span className={`status-value ${vehicle.available ? "available" : "unavailable"}`}>
                  {vehicle.available ? "Có sẵn" : "Không có sẵn"}
                </span>
              </div>
              <div className="status-item">
                <span className="status-icon">🏷️</span>
                <span className="status-label">Hãng:</span>
                <span className="status-value">{vehicle.brand}</span>
              </div>
            </div>

            <div className="description-section">
              <h3 className="section-title">Mô tả sản phẩm</h3>
              <p className="section-content">{vehicle.description}</p>
            </div>

            <div className="specs-section">
              <h3 className="section-title">Thông số kỹ thuật</h3>
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-icon">🔋</span>
                  <span className="spec-label">Dung lượng pin</span>
                  <span className="spec-value">{vehicle.specs.battery}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">📏</span>
                  <span className="spec-label">Tầm xa</span>
                  <span className="spec-value">{vehicle.specs.range}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">⚡</span>
                  <span className="spec-label">Tốc độ tối đa</span>
                  <span className="spec-value">{vehicle.specs.maxSpeed}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">⏱️</span>
                  <span className="spec-label">Thời gian sạc</span>
                  <span className="spec-value">{vehicle.specs.chargingTime}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">⚖️</span>
                  <span className="spec-label">Trọng lượng</span>
                  <span className="spec-value">{vehicle.specs.weight}</span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-primary rent-btn"
                onClick={handleRentNow}
                disabled={!vehicle.available}
              >
                {vehicle.available ? "🚀 Thuê ngay" : "❌ Không có sẵn"}
              </button>
              <button
                className="btn btn-secondary cart-btn"
                onClick={() => navigate("/cart")}
              >
                🛒 Giỏ hàng ({getItemCount()})
              </button>
              <Button
                icon={<StarOutlined />}
                onClick={() => setShowReviewForm(true)}
                className="review-btn"
              >
                Viết đánh giá
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="vehicle-content">
          <ReviewList vehicleId={vehicle.id} />
        </div>

        {/* Success Notification */}
        {showBookingSuccess && (
          <div className="success-notification">
            <div className="success-content">
              <div className="success-icon"></div>
              <div className="success-message">
                <h4>Đã thêm vào giỏ hàng!</h4>
                <p>Xe {vehicle.name} đã được thêm vào giỏ hàng của bạn.</p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && (
          <BookingForm
            vehicle={vehicle}
            onSubmit={handleBookingSubmit}
            onCancel={() => setShowBookingForm(false)}
          />
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewForm
            visible={showReviewForm}
            onClose={() => setShowReviewForm(false)}
            vehicleId={vehicle.id}
            vehicleName={vehicle.name}
          />
        )}
      </div>
  );
}
