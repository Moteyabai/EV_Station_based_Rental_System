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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        padding: "20px 0",
      }}
    >
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "15px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
          }}
        >
          <Link to="/" style={{ color: "#6366f1", textDecoration: "none" }}>
            Trang chủ
          </Link>
          <span style={{ color: "#9ca3af" }}></span>
          <Link
            to="/vehicles"
            style={{ color: "#6366f1", textDecoration: "none" }}
          >
            Xe thuê
          </Link>
          <span style={{ color: "#9ca3af" }}></span>
          <span style={{ color: "#374151", fontWeight: "500" }}>
            {vehicle.name}
          </span>
        </div>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            padding: "40px 0",
            alignItems: "start",
          }}
        >
          <div className="vehicle-image-section">
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
          </div>
          <div className="vehicle-info-section">
            <div className="vehicle-header">
              <h1 className="vehicle-name">{vehicle.name}</h1>
              <p className="vehicle-category">{vehicle.short}</p>
              <div className="price-section">
                <span className="current-price">
                  {formatPrice(vehicle.price, vehicle.priceUnit)}
                </span>
                <span className="price-unit">
                  / {vehicle.priceUnit.split("/")[1]}
                </span>
              </div>
            </div>
            <div className="description-section">
              <h3>Mô tả xe</h3>
              <p>{vehicle.description}</p>
            </div>
            <div className="specs-section">
              <h3>Thông số kỹ thuật</h3>
              <div className="specs-grid">
                <div className="spec-item">
                  <div className="spec-icon"></div>
                  <div className="spec-content">
                    <span className="spec-label">Dung lượng pin</span>
                    <span className="spec-value">{vehicle.specs.battery}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"></div>
                  <div className="spec-content">
                    <span className="spec-label">Tầm xa</span>
                    <span className="spec-value">{vehicle.specs.range}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"></div>
                  <div className="spec-content">
                    <span className="spec-label">Tốc độ tối đa</span>
                    <span className="spec-value">{vehicle.specs.maxSpeed}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"></div>
                  <div className="spec-content">
                    <span className="spec-label">Thời gian sạc</span>
                    <span className="spec-value">
                      {vehicle.specs.chargingTime}
                    </span>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"></div>
                  <div className="spec-content">
                    <span className="spec-label">Trọng lượng</span>
                    <span className="spec-value">{vehicle.specs.weight}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button
                className="btn btn-primary rent-btn"
                onClick={handleRentNow}
                disabled={!vehicle.available}
              >
                {vehicle.available ? " Thuê ngay" : "Không có sẵn"}
              </button>
              <button
                className="btn btn-secondary cart-btn"
                onClick={() => navigate("/cart")}
              >
                {" "}
                Giỏ hàng ({getItemCount()})
              </button>
              <Button
                icon={<StarOutlined />}
                onClick={() => setShowReviewForm(true)}
                style={{
                  marginLeft: "12px",
                  color: "#4db6ac",
                  borderColor: "#4db6ac",
                }}
              >
                Viết đánh giá
              </Button>
            </div>
            <div className="vehicle-status">
              <div className="status-item">
                <span className="status-label">Trạng thái:</span>
                <span
                  className={`status-value ${
                    vehicle.available ? "available" : "unavailable"
                  }`}
                >
                  {vehicle.available ? " Có sẵn" : " Không có sẵn"}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Danh mục:</span>
                <span className="status-value">
                  {vehicle.category === "scooter"
                    ? " Xe máy điện"
                    : vehicle.category}
                </span>
              </div>
            </div>
          </div>
        </div>
        <ReviewList vehicleId={vehicle.id} />
      </div>
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
      {showBookingForm && (
        <BookingForm
          vehicle={vehicle}
          onSubmit={handleBookingSubmit}
          onCancel={() => setShowBookingForm(false)}
        />
      )}
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
