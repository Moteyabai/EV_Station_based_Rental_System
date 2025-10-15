import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatPrice, formatDate } from "../utils/helpers";
import { getAllBookings } from "../utils/bookingStorage";
import "../styles/BookingSuccess.css";

export default function BookingSuccess() {
  const { bookingId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Tìm kiếm booking với ID:', bookingId);
    
    // Fetch booking details from localStorage
    const allBookings = getAllBookings();
    console.log('📦 Tất cả bookings:', allBookings);
    
    // Tìm các bookings có ID bắt đầu với bookingId (vì mỗi item có ID riêng)
    const foundBookings = allBookings.filter(b => b.id.startsWith(bookingId));
    console.log('✅ Bookings tìm thấy:', foundBookings);
    
    setBookings(foundBookings);
    setLoading(false);
  }, [bookingId]);

  if (loading) {
    return (
      <div className="booking-success-container">
        <div className="loading-message">
          <h2>🔄 Đang tải thông tin...</h2>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="booking-success-container">
        <div className="error-message">
          <h2>❌ Không tìm thấy thông tin đặt xe</h2>
          <p>Mã đặt xe: <strong>{bookingId}</strong></p>
          <p>Booking không hợp lệ hoặc đã bị xóa</p>
          <div className="error-actions">
            <Link to="/" className="btn secondary">
              Về trang chủ
            </Link>
            <Link to="/vehicles" className="btn primary">
              Đặt xe mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Lấy thông tin chung từ booking đầu tiên
  const firstBooking = bookings[0];
  const totalAmount = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="booking-success-container">
      <div className="success-content">
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1>Đặt xe thành công!</h1>
          <p>
            Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ thuê xe điện của chúng tôi
          </p>
        </div>

        <div className="booking-details">
          <div className="booking-info">
            <h3>📋 Thông tin đặt xe</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Mã đặt xe:</span>
                <span className="value booking-id">{bookingId}</span>
              </div>

              <div className="info-item">
                <span className="label">Ngày đặt:</span>
                <span className="value">{formatDate(firstBooking.createdAt)}</span>
              </div>

              <div className="info-item">
                <span className="label">Trạng thái:</span>
                <span className="value status pending">
                  {firstBooking.paymentMethod === 'cash' 
                    ? '⏳ Chờ thanh toán tại điểm'
                    : '✅ Đã thanh toán'}
                </span>
              </div>

              <div className="info-item">
                <span className="label">Khách hàng:</span>
                <span className="value">{firstBooking.userName}</span>
              </div>

              <div className="info-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{firstBooking.userPhone}</span>
              </div>

              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{firstBooking.userEmail}</span>
              </div>

              <div className="info-item">
                <span className="label">Phương thức thanh toán:</span>
                <span className="value">
                  {firstBooking.paymentMethod === 'credit_card' && '💳 Thẻ tín dụng'}
                  {firstBooking.paymentMethod === 'bank_transfer' && '🏦 Chuyển khoản'}
                  {firstBooking.paymentMethod === 'e_wallet' && '📱 Ví điện tử'}
                  {firstBooking.paymentMethod === 'cash' && '💵 Thanh toán tại điểm'}
                </span>
              </div>

              <div className="info-item total">
                <span className="label">Tổng tiền:</span>
                <span className="value price">{formatPrice(totalAmount, "VNĐ")}</span>
              </div>
            </div>
          </div>

          <div className="vehicles-booked">
            <h3>🏍️ Chi tiết xe đã đặt ({bookings.length} xe)</h3>
            {bookings.map((booking, index) => (
              <div key={index} className="vehicle-item">
                <div className="vehicle-image">
                  <img src={booking.vehicleImage} alt={booking.vehicleName} />
                </div>

                <div className="vehicle-info">
                  <h4>{booking.vehicleName}</h4>
                  <p className="vehicle-license">Biển số: {booking.licensePlate}</p>

                  <div className="rental-details">
                    <div className="detail-row">
                      <span>📅 Ngày thuê:</span>
                      <span>
                        {new Date(booking.pickupDate).toLocaleDateString("vi-VN")}{" "}
                        -{" "}
                        {new Date(booking.returnDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span>🕒 Thời gian:</span>
                      <span>
                        {booking.pickupTime} - {booking.returnTime}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span>📍 Điểm nhận:</span>
                      <span>{booking.pickupStation}</span>
                    </div>

                    <div className="detail-row">
                      <span>📍 Điểm trả:</span>
                      <span>{booking.returnStation}</span>
                    </div>

                    <div className="detail-row">
                      <span>⏱️ Thời gian thuê:</span>
                      <span>{booking.days} ngày</span>
                    </div>

                    <div className="detail-row price-row">
                      <span>💰 Giá:</span>
                      <span className="price">{formatPrice(booking.totalPrice, "VNĐ")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="next-steps">
          <h3>📝 Các bước tiếp theo</h3>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Chuẩn bị giấy tờ</h4>
                <p>Mang theo CMND/CCCD và bằng lái xe hợp lệ khi đến nhận xe</p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Đến điểm thuê</h4>
                <p>
                  Có mặt tại điểm thuê đúng ngày giờ đã đặt để làm thủ tục nhận xe
                </p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Kiểm tra xe</h4>
                <p>
                  Kiểm tra kỹ xe trước khi nhận và ký xác nhận biên bản giao xe
                </p>
              </div>
            </div>

            {firstBooking.paymentMethod === 'cash' && (
              <div className="step-item highlight">
                <span className="step-number">💵</span>
                <div className="step-content">
                  <h4>Thanh toán tại điểm</h4>
                  <p>
                    Vui lòng chuẩn bị số tiền <strong>{formatPrice(totalAmount, "VNĐ")}</strong> để thanh toán khi nhận xe
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/" className="btn secondary">
            🏠 Về trang chủ
          </Link>
          <Link to="/vehicles" className="btn primary">
            🚗 Tiếp tục thuê xe
          </Link>
        </div>

        <div className="support-info">
          <h4>💬 Cần hỗ trợ?</h4>
          <p>Liên hệ với chúng tôi qua:</p>
          <div className="contact-methods">
            <a href="tel:1900xxxx">📞 1900-xxxx</a>
            <a href="mailto:support@evrental.com">✉️ support@evrental.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}
