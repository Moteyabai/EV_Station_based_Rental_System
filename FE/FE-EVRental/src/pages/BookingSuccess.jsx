import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatPrice, formatDate } from "../utils/helpers";
import { getBookingById } from "../utils/bookingStorage";
import { useCart } from "../contexts/CartContext";
import "../styles/BookingSuccess.css";

export default function BookingSuccess() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    console.log('🔍 Looking for booking with ID:', bookingId);
    
    // Try to get from new bookingStorage system by bookingId
    let foundBooking = getBookingById(bookingId);
    
    if (!foundBooking) {
      // Try to find by orderId (for cash payments)
      const allBookings = JSON.parse(localStorage.getItem("ev_rental_bookings") || "[]");
      foundBooking = allBookings.find((b) => 
        b.orderId && b.orderId.toString() === bookingId.toString()
      );
      
      if (foundBooking) {
        console.log('✅ Found booking by orderId:', foundBooking);
      }
    } else {
      console.log('✅ Found booking by bookingId:', foundBooking);
    }
    
    if (!foundBooking) {
      // Fallback: Try old ev_bookings storage
      const oldBookings = JSON.parse(localStorage.getItem("ev_bookings") || "[]");
      foundBooking = oldBookings.find((b) => b.bookingId === bookingId);
      
      if (foundBooking) {
        console.log('✅ Found booking from old storage:', foundBooking);
      } else {
        console.warn('⚠️ Booking not found in any storage');
      }
    }
    
    setBooking(foundBooking);

    // Clear cart after successful booking
    if (foundBooking) {
      console.log('🛒 Clearing cart after successful payment');
      clearCart();
    }
  }, [bookingId, clearCart]);

  if (!booking) {
    return (
      <div className="booking-success-container">
        <div className="error-message">
          <h2>❌ Không tìm thấy thông tin đặt xe</h2>
          <p>Mã đặt xe không hợp lệ hoặc đã bị xóa</p>
          <Link to="/" className="btn primary">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Check if it's the new booking structure (single vehicle) or old structure (multiple items)
  const isNewStructure = booking.vehicleName && !booking.items;
  
  return (
    <div className="booking-success-container">
      <div className="success-content">
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1>Đặt xe thành công!</h1>
          <p>
            Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ thuê xe điện của chúng
            tôi
          </p>
        </div>

        <div className="booking-details">
          <div className="booking-info">
            <h3>📋 Thông tin đặt xe</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Mã đơn hàng:</span>
                <span className="value booking-id">
                  {booking.orderId || booking.bookingId || booking.id}
                </span>
              </div>

              <div className="info-item">
                <span className="label">Ngày đặt:</span>
                <span className="value">{formatDate(booking.createdAt)}</span>
              </div>

              <div className="info-item">
                <span className="label">Trạng thái:</span>
                <span className="value status confirmed">
                  {booking.status === "confirmed" || booking.status === "booked"
                    ? "✅ Đã xác nhận"
                    : booking.status === "pending_payment" || booking.paymentStatus === "pending"
                    ? "⏳ Chờ xác nhận thanh toán tại trạm"
                    : booking.status}
                </span>
              </div>

              <div className="info-item">
                <span className="label">Khách hàng:</span>
                <span className="value">{booking.userName || booking.userEmail || booking.userId}</span>
              </div>

              <div className="info-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{booking.userPhone || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </div>

          <div className="vehicles-booked">
            <h3>🏍️ Chi tiết xe đã đặt</h3>
            
            {isNewStructure ? (
              // New structure - single vehicle booking
              <div className="vehicle-item">
                <div className="vehicle-image">
                  <img src={booking.vehicleImage} alt={booking.vehicleName} />
                </div>

                <div className="vehicle-info">
                  <h4>{booking.vehicleName}</h4>
                  <p className="vehicle-type">{booking.licensePlate || 'Đang cập nhật'}</p>

                  <div className="rental-details">
                    <div className="detail-row">
                      <span>📅 Ngày thuê:</span>
                      <span>
                        {new Date(booking.pickupDate).toLocaleDateString("vi-VN")} -{" "}
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
                  </div>
                </div>

                <div className="vehicle-price">
                  <div className="price-amount">
                    {formatPrice(booking.totalPrice)}
                  </div>
                </div>
              </div>
            ) : (
              // Old structure - multiple items
              booking.items?.map((item, index) => (
              <div key={index} className="vehicle-item">
                <div className="vehicle-image">
                  <img src={item.vehicle.image} alt={item.vehicle.name} />
                </div>

                <div className="vehicle-info">
                  <h4>{item.vehicle.name}</h4>
                  <p className="vehicle-type">{item.vehicle.short}</p>

                  <div className="rental-details">
                    <div className="detail-row">
                      <span>📅 Ngày thuê:</span>
                      <span>
                        {new Date(
                          item.rentalDetails.pickupDate
                        ).toLocaleDateString("vi-VN")}{" "}
                        -{" "}
                        {new Date(
                          item.rentalDetails.returnDate
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span>🕒 Thời gian:</span>
                      <span>
                        {item.rentalDetails.pickupTime} -{" "}
                        {item.rentalDetails.returnTime}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span>📍 Điểm nhận:</span>
                      <span>{item.rentalDetails.pickupStation?.name}</span>
                    </div>

                    <div className="detail-row">
                      <span>📍 Điểm trả:</span>
                      <span>{item.rentalDetails.returnStation?.name}</span>
                    </div>

                    <div className="detail-row">
                      <span>⏱️ Thời gian thuê:</span>
                      <span>{item.rentalDetails.days} ngày</span>
                    </div>
                  </div>
                </div>

                <div className="vehicle-price">
                  <div className="price-amount">
                    {formatPrice(item.totalPrice)}
                  </div>
                </div>
              </div>
            ))
            )}
          </div>

          <div className="payment-summary">
            <h3>💳 Thông tin thanh toán</h3>
            <div className="payment-info">
              <div className="payment-row">
                <span>Phương thức:</span>
                <span>
                  {isNewStructure ? (
                    <>
                      {booking.paymentMethod === "cash" && "💵 Tiền mặt (Thanh toán khi nhận xe)"}
                      {booking.paymentMethod === "payos" && "💳 PayOS (Thanh toán online)"}
                      {booking.paymentMethod === "credit_card" && "💳 Thẻ tín dụng"}
                      {booking.paymentMethod === "bank_transfer" && "🏦 Chuyển khoản"}
                      {booking.paymentMethod === "e_wallet" && "📱 Ví điện tử"}
                    </>
                  ) : (
                    <>
                      {booking.payment?.method === "credit_card" && "💳 Thẻ tín dụng"}
                      {booking.payment?.method === "bank_transfer" && "🏦 Chuyển khoản"}
                      {booking.payment?.method === "e_wallet" && "📱 Ví điện tử"}
                    </>
                  )}
                </span>
              </div>

              <div className="payment-row total">
                <span>Tổng thanh toán:</span>
                <span>{formatPrice(isNewStructure ? booking.totalPrice : booking.payment?.amount)}</span>
              </div>
            </div>
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
                  Có mặt tại điểm thuê đúng ngày giờ đã đặt để làm thủ tục nhận
                  xe
                </p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Kiểm tra xe</h4>
                <p>
                  Cùng nhân viên kiểm tra tình trạng xe và ký xác nhận bàn giao
                </p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">4</span>
              <div className="step-content">
                <h4>Tận hưởng hành trình</h4>
                <p>Sử dụng xe an toàn và trả xe đúng hạn tại điểm đã chọn</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-support">
          <h3>📞 Hỗ trợ khách hàng</h3>
          <div className="contact-info">
            <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ:</p>
            <div className="contact-methods">
              <div className="contact-item">
                <span>📞 Hotline:</span>
                <span>1900-EV-RENTAL (24/7)</span>
              </div>
              <div className="contact-item">
                <span>📧 Email:</span>
                <span>support@evrental.vn</span>
              </div>
              <div className="contact-item">
                <span>💬 Chat:</span>
                <span>Messenger Facebook</span>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn secondary" onClick={() => window.print()}>
            🖨️ In hóa đơn
          </button>

          <Link to="/vehicles" className="btn primary">
            🏍️ Thuê thêm xe
          </Link>

          <Link to="/history" className="btn secondary">
            📜 Xem lịch sử
          </Link>
        </div>
      </div>
    </div>
  );
}
