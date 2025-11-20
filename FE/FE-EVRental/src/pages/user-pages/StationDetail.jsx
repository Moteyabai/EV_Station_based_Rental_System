import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchStationById } from "../../api/stations";
import { getAvailableBikesByStationID } from "../../api/bikes";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useReviews } from "../../contexts/ReviewContext";
import { formatPrice } from "../../utils/helpers";
import ReviewDisplay from "../../components/ReviewDisplay";
import ReviewForm from "../../components/ReviewForm";
import BookingForm from "../../components/BookingForm";
import "../../styles/Stations.css";
import "../../styles/Reviews.css";
import "../../styles/ReviewStations.css";

export default function StationDetail() {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const { user, verificationStatus } = useAuth();
  const { addToCart } = useCart();
  const { getStationReviews, addReview } = useReviews();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeImage, setActiveImage] = useState("main");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Role-based access control: Block Staff and Admin
  useEffect(() => {
    if (user) {
      const userRoleId = user?.roleID || user?.RoleID;
      if (userRoleId === 2 || userRoleId === 3) {
        console.log(
          "StationDetail: Access denied for Staff/Admin, redirecting...",
        );
        if (userRoleId === 2) {
          navigate("/staff");
        } else {
          navigate("/admin");
        }
      }
    }
  }, [user, navigate]);

  // Fetch station data from API
  useEffect(() => {
    const loadStationData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        console.log("🏪 Fetching station with ID:", id);

        const token = localStorage.getItem("ev_token");
        const stationData = await fetchStationById(id, token);

        console.log("✅ Station data received:", stationData);

        // Map backend data to frontend format
        const mappedStation = {
          id: stationData.stationID || stationData.StationID,
          name: stationData.name || stationData.Name,
          address: stationData.address || stationData.Address,
          description: stationData.description || stationData.Description || "",
          openingHours:
            stationData.openingHours || stationData.OpeningHours || "24/7",
          image:
            stationData.thumbnailImageUrl ||
            stationData.ThumbnailImageUrl ||
            "/images/stations/default.jpg",
          location: {
            lat: stationData.latitude || 10.762622,
            lng: stationData.longitude || 106.660172,
          },
          availableVehicles: stationData.bikeCapacity || 0,
          chargingStations: 0,
          amenities: stationData.amenities || [],
          rating: 5,
          reviews: 0,
          status: stationData.status,
          images: {
            exterior: stationData.imageUrl || stationData.thumbnailImageUrl,
            chargers: stationData.thumbnailImageUrl,
            thumbnail: stationData.thumbnailImageUrl,
          },
        };

        setStation(mappedStation);
        setError(null);
        console.log("✅ Station loaded successfully");

        // Fetch available bikes for this station
        await loadStationVehicles(id);
      } catch (err) {
        console.error("❌ Error loading station:", err);
        setError("Không thể tải thông tin trạm.");
        setStation(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadStationData();
    }
  }, [id]);

  // Fetch vehicles for this station
  const loadStationVehicles = async (stationId) => {
    try {
      console.log("🚲 Fetching vehicles for station:", stationId);
      const bikesData = await getAvailableBikesByStationID(stationId);

      // Map API response to frontend format
      const mappedVehicles = bikesData.map((bike) => ({
        id: bike.bikeID,
        name: bike.bikeName || "Xe điện",
        type: bike.brand || "Electric",
        price: bike.pricePerDay || 0,
        batteryCapacity: bike.batteryCapacity
          ? `${bike.batteryCapacity}`
          : "N/A",
        quantity: bike.quantity || 0,
        range: bike.maxDistance ? `${bike.maxDistance}km` : "N/A",
        maxSpeed: `${bike.maxSpeed || 0} km/h`,
        brandName: bike.brandName || "Unknown",
        image: bike.frontImg || bike.backImg || "/images/vehicles/default.jpg",
        available: bike.status === 1,
        description: bike.description || "",
        timeRented: bike.timeRented || 0,
      }));

      console.log("✅ Mapped vehicles:", mappedVehicles);
      setVehicles(mappedVehicles);
    } catch (err) {
      console.error("❌ Error loading vehicles:", err);
      setVehicles([]);
    }
  };

  useEffect(() => {
    // Lấy đánh giá cho trạm này
    if (id) {
      setReviews(getStationReviews(id));
    }
  }, [id, getStationReviews]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      // Thêm đánh giá mới
      await addReview({
        ...reviewData,
        userName: localStorage.getItem("userName") || "Khách hàng",
      });

      // Cập nhật danh sách đánh giá
      setReviews(getStationReviews(id));

      return true;
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      return false;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <h2>🔄 Đang tải thông tin trạm...</h2>
          <p>Vui lòng đợi trong giây lát.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>❌ Có lỗi xảy ra</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button
              className="btn primary"
              onClick={() => window.location.reload()}
            >
              🔄 Thử lại
            </button>
            <Link to="/stations" className="btn secondary">
              Xem tất cả các trạm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not found state (only show after loading is done and no station)
  if (!station) {
    return (
      <div className="page-container">
        <div className="not-found-container">
          <h2>Không tìm thấy trạm</h2>
          <p>Xin lỗi, trạm bạn đang tìm kiếm không tồn tại.</p>
          <Link to="/stations" className="btn primary">
            Xem tất cả các trạm
          </Link>
        </div>
      </div>
    );
  }

  function handleVehicleSelect(vehicle) {
    setSelectedVehicle(vehicle);
    setShowBookingForm(true);
    // Scroll to top when modal opens
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  function handleBookingSubmit() {
    setShowBookingForm(false);
    setSelectedVehicle(null);
  }

  function handleCloseModal() {
    setShowBookingForm(false);
    setSelectedVehicle(null);
  }

  return (
    <div className="page-container">
      <div className="station-detail-container">
        {/* Station Header */}
        <div className="station-header">
          <div className="breadcrumbs">
            <Link to="/stations">Các điểm trạm</Link> / {station.name}
          </div>

          <h1>{station.name}</h1>
          <p className="station-address">{station.address}</p>

          <div className="station-quick-info">
            <div className="info-item">
              <span className="label">Xe hiện có:</span>
              <span className="value">{station.availableVehicles}</span>
            </div>
            <div className="info-item">
              <span className="label">Giờ mở cửa:</span>
              <span className="value">{station.openingHours}</span>
            </div>
          </div>
        </div>

        {/* Station Gallery */}
        <div className="station-gallery">
          <div className="main-image">
            {station.images?.exterior ? (
              <img
                src={station.images.exterior}
                alt={`${station.name} bên ngoài`}
              />
            ) : station.image ? (
              <img src={station.image} alt={`${station.name}`} />
            ) : null}
          </div>
        </div>

        {/* Station Description */}
        <div className="station-description">
          <h2>Chi tiết trạm</h2>
          <p>{station.description}</p>
        </div>

        {/* Available Vehicles */}
        <div className="available-vehicles">
          <h2>Xe máy điện hiện có</h2>

          <div className="vehicles-list">
            {!vehicles || vehicles.length === 0 ? (
              <div className="no-vehicles">
                <p>Hiện tại chưa có thông tin xe tại trạm này.</p>
                <p>Vui lòng liên hệ trực tiếp để biết thêm chi tiết.</p>
              </div>
            ) : (
              vehicles
                .filter((vehicle) => vehicle.available)
                .map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`station-vehicle-card ${
                      selectedVehicle?.id === vehicle.id ? "selected" : ""
                    }`}
                  >
                    <div className="vehicle-image">
                      {vehicle.image ? (
                        <img src={vehicle.image} alt={vehicle.name} />
                      ) : (
                        <div className="image-placeholder">
                          <span>{vehicle.name.split(" ")[0]}</span>
                        </div>
                      )}
                    </div>

                    <div className="vehicle-details">
                      <h3 className="vehicle-name">
                        {vehicle.name}
                      </h3>
                      <div className="vehicle-meta">
                        <span className="vehicle-type">{vehicle.brandName}</span>
                        <span className="vehicle-price">
                          {formatPrice(vehicle.price)}/ngày
                        </span>
                      </div>

                        <div className="vehicle-specs">
                          <div className="spec">
                            <span className="spec-label">PIN:</span>
                            <span className="spec-value">
                              {vehicle.batteryCapacity} kWh
                            </span>
                          </div>
                          <div className="spec">
                            <span className="spec-label">QUÃNG ĐƯỜNG:</span>
                            <span className="spec-value">{vehicle.range}</span>
                          </div>
                          <div className="spec">
                            <span className="spec-label">TỐC ĐỘ TỐI ĐA:</span>
                            <span className="spec-value">{vehicle.maxSpeed}</span>
                          </div>
                        </div>

                        <div className="vehicle-actions">
                          <button
                            className="btn secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/vehicles/${vehicle.id}`);
                            }}
                          >
                            Chi tiết xe
                          </button>
                          <button
                            className="btn primary btn-select"
                            onClick={() => handleVehicleSelect(vehicle)}
                          >
                            {selectedVehicle?.id === vehicle.id
                              ? "Đã chọn"
                              : "Chọn xe"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
            )}
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && selectedVehicle && (
          <BookingForm
            vehicle={selectedVehicle}
            stationId={station.id}
            onSubmit={handleBookingSubmit}
            onCancel={handleCloseModal}
          />
        )}
        {/* Phần đánh giá trạm */}
        <div className="station-reviews">
          <div className="review-header">
            <h2>Đánh giá trạm</h2>
            <button
              className="btn secondary"
              onClick={() => setShowReviewForm(true)}
            >
              ⭐ Đánh giá trạm
            </button>
          </div>
          <ReviewDisplay reviews={reviews} />
        </div>

        {/* Form đánh giá */}
        {showReviewForm && (
          <ReviewForm
            vehicleId={null}
            stationId={id}
            onSubmit={handleReviewSubmit}
            onClose={() => setShowReviewForm(false)}
          />
        )}
      </div>
    </div>
  );
}
