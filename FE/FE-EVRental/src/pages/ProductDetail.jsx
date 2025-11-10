import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "antd";
import { StarOutlined } from "@ant-design/icons";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { getBikeById, getAvailableBikes } from "../api/bikes";
import BookingForm from "../components/BookingForm";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";
import { formatPrice } from "../utils/helpers";
import "../styles/ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getItemCount } = useCart();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [availableBikesCount, setAvailableBikesCount] = useState(0);
  const [loadingBikes, setLoadingBikes] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check role access - Block Staff and Admin
  useEffect(() => {
    if (user) {
      const userRoleId = user?.roleID || user?.RoleID;
      if (userRoleId === 2 || userRoleId === 3) {
        console.log("ProductDetail: Access denied for Staff/Admin, redirecting...");
        if (userRoleId === 2) {
          navigate("/staff");
        } else {
          navigate("/admin");
        }
      }
    }
  }, [user, navigate]);

  // Fetch vehicle details from API
  useEffect(() => {
    let isMounted = true;
    async function loadVehicle() {
      try {
        setLoading(true);
        setError(null); // Reset error state
        console.log("🚲 [DETAIL] Fetching bike with ID:", id);

        const bikeData = await getBikeById(id);

        if (!isMounted) return;

        console.log("🚲 Bike detail from API:", bikeData);

        // Map backend data to frontend format
        const quantity = bikeData.quantity || 0;
        const isAvailable = quantity > 0;

        const mappedVehicle = {
          id: bikeData.bikeID || bikeData.BikeID,
          name:
            bikeData.bikeName || bikeData.model || bikeData.Model || "Xe điện",
          brand: bikeData.brandName || bikeData.BrandName || "Unknown",
          image:
            bikeData.thumbnailImageUrl ||
            bikeData.ThumbnailImageUrl ||
            bikeData.frontImg ||
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60",
          backImage: bikeData.backImg || bikeData.thumbnailImageUrl,
          price: bikeData.pricePerDay || bikeData.PricePerDay || 0,
          priceUnit: "/ngày",
          category: "scooter",
          short: `${bikeData.brandName || bikeData.BrandName || "Xe điện"} - Số lượng có sẵn: ${quantity}`,
          description:
            bikeData.description ||
            bikeData.Description ||
            "Không có mô tả chi tiết.",
          quantity: quantity,
          available: isAvailable,
          specs: {
            battery:
              bikeData.batteryCapacity != null ||
              bikeData.BatteryCapacity != null
                ? `${bikeData.batteryCapacity ?? bikeData.BatteryCapacity} kWh`
                : "N/A",
            batteryCapacity:
              bikeData.batteryCapacity != null ||
              bikeData.BatteryCapacity != null
                ? `${bikeData.batteryCapacity ?? bikeData.BatteryCapacity} kWh`
                : "N/A",
            range: `${bikeData.maxDistance || "N/A"} km`,
            maxSpeed: `${bikeData.maxSpeed || "N/A"} km/h`,
            chargingTime:
              bikeData.chargingTime || bikeData.ChargingTime || "N/A",
            weight: bikeData.weight || "N/A",
          },
          status: isAvailable ? "available" : "out-of-stock",
          statusText: isAvailable ? "Có sẵn" : "Hết xe",
          statusColor: isAvailable ? "green" : "red",
        };

        console.log("✅ Mapped vehicle:", mappedVehicle);

        setVehicle(mappedVehicle);
        setError(null);
        console.log("✅ [DETAIL] Vehicle loaded successfully");
      } catch (err) {
        console.error("❌ [DETAIL] Error loading vehicle:", err);
        if (isMounted) {
          setError("Không thể tải thông tin xe. Vui lòng thử lại sau.");
          setVehicle(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadVehicle();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Fetch available bikes count from API
  useEffect(() => {
    const fetchAvailableBikes = async () => {
      try {
        setLoadingBikes(true);
        const token = localStorage.getItem("ev_token");
        const allBikes = await getAvailableBikes(token);

        // Filter bikes by brand matching current vehicle
        if (vehicle) {
          const matchingBikes = allBikes.filter(
            (bike) => bike.brandName === vehicle.brand && bike.status === true,
          );

          setAvailableBikesCount(matchingBikes.length);
          console.log(
            `Found ${matchingBikes.length} available ${vehicle.brand} bikes`,
          );
        }
      } catch (error) {
        console.error("Error fetching bikes:", error);
        setAvailableBikesCount(0);
      } finally {
        setLoadingBikes(false);
      }
    };

    if (vehicle) {
      fetchAvailableBikes();
    }
  }, [vehicle]);

  // Loading state
  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="loading-message">
            <h2>🔄 Đang tải thông tin xe...</h2>
            <p>Vui lòng đợi trong giây lát.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h2>❌ Có lỗi xảy ra</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button
              className="btn primary"
              onClick={() => window.location.reload()}
            >
              🔄 Thử lại
            </button>
            <Link to="/vehicles" className="btn secondary">
              Quay lại danh sách xe
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not found state (only show after loading is done and no vehicle)
  if (!vehicle) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h2>Không tìm thấy xe</h2>
          <p>Xe bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/vehicles" className="btn primary">
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
            key={currentImageIndex}
            src={
              currentImageIndex === 0
                ? vehicle.image
                : vehicle.backImage || vehicle.image
            }
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
          {/* Image Navigation Dots */}
          {vehicle.backImage && (
            <div className="image-navigation">
              <button
                className={`nav-dot ${currentImageIndex === 0 ? "active" : ""}`}
                onClick={() => setCurrentImageIndex(0)}
                aria-label="Front view"
              >
                Trước
              </button>
              <button
                className={`nav-dot ${currentImageIndex === 1 ? "active" : ""}`}
                onClick={() => setCurrentImageIndex(1)}
                aria-label="Back view"
              >
                Sau
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="product-info">
          <div className="vehicle-header">
            <h1 className="vehicle-name">{vehicle.name}</h1>
            <p className="vehicle-category">{vehicle.short}</p>
          </div>

          <div className="price-section">
            <h2 className="current-price">
              {formatPrice(vehicle.price, vehicle.priceUnit)}
            </h2>
            <span className="price-unit">
              / {vehicle.priceUnit.split("/")[1]}
            </span>
          </div>

          <div className="vehicle-status">
            <div className="status-item">
              <span className="status-icon">●</span>
              <span className="status-label">Trạng thái:</span>
              <span
                className={`status-value ${vehicle.status}`}
                style={{ color: vehicle.statusColor, fontWeight: "bold" }}
              >
                {vehicle.statusText}
              </span>
            </div>
            <div className="status-item">
              <span className="status-icon">🏷️</span>
              <span className="status-label">Hãng:</span>
              <span className="status-value">{vehicle.brand}</span>
            </div>
            <div className="status-item">
              <span className="status-icon">📦</span>
              <span className="status-label">Số lượng:</span>
              <span className="status-value">{vehicle.quantity} xe</span>
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
                <span className="spec-label">Quảng đường tối đa</span>
                <span className="spec-value">{vehicle.specs.range}</span>
              </div>
              <div className="spec-item">
                <span className="spec-icon">⚡</span>
                <span className="spec-label">Tốc độ tối đa</span>
                <span className="spec-value">{vehicle.specs.maxSpeed}</span>
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

        {/* Reviews Section */}
        <div className="vehicle-content">
          <ReviewList vehicleId={vehicle.id} />
        </div>
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
