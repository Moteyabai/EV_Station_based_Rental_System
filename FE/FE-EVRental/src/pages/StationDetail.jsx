import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import stations from "../data/stations";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useReviews } from "../contexts/ReviewContext";
import ReviewDisplay from "../components/ReviewDisplay";
import ReviewForm from "../components/ReviewForm";
import "../styles/StationDetail.css";
import "../styles/Reviews.css";
import "../styles/ReviewStations.css";

export default function StationDetail() {
  const { id } = useParams();
  const station = stations.find((s) => s.id === id);
  const { user, verificationStatus } = useAuth();
  const { addToCart } = useCart();
  const { getStationReviews, addReview } = useReviews();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingData, setBookingData] = useState({
    pickupDate: "",
    pickupTime: "",
    returnDate: "",
    returnTime: "",
    additionalServices: [],
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [activeImage, setActiveImage] = useState("main");
  const [showReviewForm, setShowReviewForm] = useState(false);

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
    // Scroll to booking form
    setTimeout(() => {
      document
        .getElementById("booking-form")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleCheckboxChange(e) {
    const { name, checked } = e.target;
    setBookingData((prev) => {
      if (checked) {
        return {
          ...prev,
          additionalServices: [...prev.additionalServices, name],
        };
      } else {
        return {
          ...prev,
          additionalServices: prev.additionalServices.filter(
            (service) => service !== name
          ),
        };
      }
    });
  }

  function handleBookingSubmit(e) {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    // Check verification status
    if (verificationStatus && !verificationStatus.documentsVerified) {
      navigate("/verification-pending");
      return;
    }

    // In a real app, this would call an API to create the booking
    setBookingConfirmed(true);

    // Scroll to confirmation message
    setTimeout(() => {
      document
        .getElementById("booking-confirmation")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  // Generate a booking ID (in a real app, this would come from the backend)
  const bookingId = "BK" + Math.floor(100000 + Math.random() * 900000);

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
              <span className="label">Trạm sạc:</span>
              <span className="value">{station.chargingStations}</span>
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
            {activeImage === "main" && station.image && (
              <img
                src={station.image}
                alt={`${station.name}`}
              />
            )}
            {activeImage === "exterior" && station.images?.exterior && (
              <img
                src={station.images.exterior}
                alt={`${station.name} bên ngoài`}
              />
            )}
            {activeImage === "chargers" && station.images?.chargers && (
              <img
                src={station.images.chargers}
                alt={`${station.name} trạm sạc`}
              />
            )}
            {activeImage === "thumbnail" && station.images?.thumbnail && (
              <img
                src={station.images.thumbnail}
                alt={`${station.name} tổng quan`}
              />
            )}
          </div>

          <div className="gallery-thumbnails">
            {station.image && (
              <div
                className={`thumbnail ${
                  activeImage === "main" ? "active" : ""
                }`}
                onClick={() => setActiveImage("main")}
              >
                <img src={station.image} alt="Hình ảnh chính" />
              </div>
            )}

            {station.images?.exterior && (
              <div
                className={`thumbnail ${
                  activeImage === "exterior" ? "active" : ""
                }`}
                onClick={() => setActiveImage("exterior")}
              >
                <img src={station.images.exterior} alt="Hình ảnh bên ngoài" />
              </div>
            )}

            {station.images?.chargers && (
              <div
                className={`thumbnail ${
                  activeImage === "chargers" ? "active" : ""
                }`}
                onClick={() => setActiveImage("chargers")}
              >
                <img src={station.images.chargers} alt="Charging stations" />
              </div>
            )}

            {station.images?.thumbnail && (
              <div
                className={`thumbnail ${
                  activeImage === "thumbnail" ? "active" : ""
                }`}
                onClick={() => setActiveImage("thumbnail")}
              >
                <img src={station.images.thumbnail} alt="Overview" />
              </div>
            )}
          </div>
        </div>

        {/* Station Description */}
        <div className="station-description">
          <h2>About This Location</h2>
          <p>{station.description}</p>

          <div className="amenities">
            <h3>Amenities</h3>
            <div className="amenities-list">
              {station.amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  <div className="amenity-icon">✓</div>
                  <div className="amenity-name">{amenity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Vehicles */}
        <div className="available-vehicles">
          <h2>Xe máy điện hiện có</h2>

          <div className="vehicles-list">
            {station.vehicles
              .filter((vehicle) => vehicle.available)
              .map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`vehicle-card ${
                    selectedVehicle?.id === vehicle.id ? "selected" : ""
                  }`}
                  onClick={() => handleVehicleSelect(vehicle)}
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
                    <h3 className="vehicle-name">{vehicle.name}</h3>
                    <div className="vehicle-meta">
                      <span className="vehicle-type">{vehicle.type}</span>
                      <span className="vehicle-price">
                        {vehicle.price}k/ngày
                      </span>
                    </div>

                    <div className="vehicle-specs">
                      <div className="spec">
                        <span className="spec-label">Pin:</span>
                        <span className="spec-value">
                          {vehicle.batteryCapacity}
                        </span>
                      </div>
                      <div className="spec">
                        <span className="spec-label">Quãng đường:</span>
                        <span className="spec-value">{vehicle.range}</span>
                      </div>
                    </div>

                    <div className="vehicle-actions">
                      <button
                        className="btn secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(vehicle, {
                            pickupDate: new Date().toISOString().split("T")[0],
                            returnDate: new Date(Date.now() + 86400000)
                              .toISOString()
                              .split("T")[0],
                            pickupTime: "09:00",
                            returnTime: "18:00",
                            pickupStation: station.name,
                            returnStation: station.name,
                            days: 1,
                          });
                          alert("✅ Đã thêm xe vào giỏ hàng!");
                        }}
                      >
                        Thêm vào giỏ hàng
                      </button>
                      <button
                        className="btn primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(vehicle, {
                            pickupDate: new Date().toISOString().split("T")[0],
                            returnDate: new Date(Date.now() + 86400000)
                              .toISOString()
                              .split("T")[0],
                            pickupTime: "09:00",
                            returnTime: "18:00",
                            pickupStation: station.name,
                            returnStation: station.name,
                            days: 1,
                          });
                          navigate("/cart");
                        }}
                      >
                        Thuê ngay
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
              ))}

            {station.vehicles.filter((vehicle) => vehicle.available).length ===
              0 && (
              <div className="no-vehicles">
                <p>Hiện không có xe nào tại trạm này.</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        {showBookingForm && selectedVehicle && !bookingConfirmed && (
          <div id="booking-form" className="booking-form-container">
            <h2>Đặt thuê {selectedVehicle.name}</h2>

            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-section">
                <h3>Thời gian thuê</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pickupDate">Ngày nhận</label>
                    <input
                      type="date"
                      id="pickupDate"
                      name="pickupDate"
                      value={bookingData.pickupDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pickupTime">Giờ nhận</label>
                    <input
                      type="time"
                      id="pickupTime"
                      name="pickupTime"
                      value={bookingData.pickupTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="returnDate">Ngày trả</label>
                    <input
                      type="date"
                      id="returnDate"
                      name="returnDate"
                      value={bookingData.returnDate}
                      onChange={handleInputChange}
                      min={
                        bookingData.pickupDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="returnTime">Giờ trả</label>
                    <input
                      type="time"
                      id="returnTime"
                      name="returnTime"
                      value={bookingData.returnTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Dịch vụ bổ sung</h3>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="insurance"
                      checked={bookingData.additionalServices.includes(
                        "insurance"
                      )}
                      onChange={handleCheckboxChange}
                    />
                    Bảo hiểm (+15k/ngày)
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="charger"
                      checked={bookingData.additionalServices.includes(
                        "charger"
                      )}
                      onChange={handleCheckboxChange}
                    />
                    Bộ sạc di động (+10k/ngày)
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="gps"
                      checked={bookingData.additionalServices.includes("gps")}
                      onChange={handleCheckboxChange}
                    />
                    Hệ thống định vị GPS (+5k/ngày)
                  </label>
                </div>
              </div>

              <div className="booking-summary">
                <h3>Thông tin đặt xe</h3>
                <div className="summary-item">
                  <span>Thuê xe:</span>
                  <span>{selectedVehicle.price}k/ngày</span>
                </div>{" "}
                {bookingData.additionalServices.includes("insurance") && (
                  <div className="summary-item">
                    <span>Bảo hiểm:</span>
                    <span>15k/ngày</span>
                  </div>
                )}
                {bookingData.additionalServices.includes("charger") && (
                  <div className="summary-item">
                    <span>Bộ sạc di động:</span>
                    <span>10k/ngày</span>
                  </div>
                )}
                {bookingData.additionalServices.includes("gps") && (
                  <div className="summary-item">
                    <span>Định vị GPS:</span>
                    <span>5k/ngày</span>
                  </div>
                )}
                <div className="summary-total">
                  <span>Tổng tiền dự tính:</span>
                  <span>Tính khi thanh toán</span>
                </div>
              </div>

              <div className="booking-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowBookingForm(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn primary">
                  Xác nhận đặt xe
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Booking Confirmation */}
        {bookingConfirmed && (
          <div id="booking-confirmation" className="booking-confirmation">
            <div className="confirmation-icon">✓</div>
            <h2>Đã xác nhận đặt xe!</h2>

            <div className="confirmation-details">
              <p>
                Your booking has been confirmed. Please see the details below:
              </p>

              <div className="confirmation-data">
                <div className="confirmation-item">
                  <span className="label">Booking ID:</span>
                  <span className="value">{bookingId}</span>
                </div>

                <div className="confirmation-item">
                  <span className="label">Xe:</span>
                  <span className="value">{selectedVehicle.name}</span>
                </div>

                <div className="confirmation-item">
                  <span className="label">Nhận xe:</span>
                  <span className="value">
                    {new Date(bookingData.pickupDate).toLocaleDateString()} lúc{" "}
                    {bookingData.pickupTime}
                  </span>
                </div>

                <div className="confirmation-item">
                  <span className="label">Trả xe:</span>
                  <span className="value">
                    {new Date(bookingData.returnDate).toLocaleDateString()} lúc{" "}
                    {bookingData.returnTime}
                  </span>
                </div>

                <div className="confirmation-item">
                  <span className="label">Địa điểm:</span>
                  <span className="value">{station.name}</span>
                </div>
              </div>

              <div className="next-steps">
                <h3>Các bước tiếp theo</h3>
                <ol>
                  <li>Đến trạm đúng giờ đã hẹn</li>
                  <li>Xuất trình CMND/CCCD và giấy phép lái xe tại quầy</li>
                  <li>Hoàn tất thủ tục đăng ký với nhân viên</li>
                  <li>Kiểm tra xe cùng nhân viên và ghi nhận tình trạng</li>
                  <li>Ký hợp đồng thuê xe điện tử</li>
                  <li>Bắt đầu hành trình với xe máy điện!</li>
                </ol>
              </div>
            </div>

            <div className="confirmation-actions">
              <Link to="/stations" className="btn secondary">
                Xem các trạm khác
              </Link>
              <Link to="/" className="btn primary">
                Trở về trang chủ
              </Link>
            </div>
          </div>
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
