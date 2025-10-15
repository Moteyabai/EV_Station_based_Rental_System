import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { formatPrice, formatDate } from "../utils/helpers";
import { saveBooking } from "../utils/bookingStorage";
import "../styles/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Confirm, 2: Payment, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
  });

  if (!user) {
    return (
      <div className="checkout-container">
        <div className="auth-required">
          <h2>🔐 Yêu cầu đăng nhập</h2>
          <p>Bạn cần đăng nhập để tiến hành đặt xe</p>
          <button className="btn primary" onClick={() => navigate("/login")}>
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <h2>🛒 Giỏ hàng trống</h2>
          <p>Không có xe nào trong giỏ hàng để thanh toán</p>
          <button className="btn primary" onClick={() => navigate("/vehicles")}>
            Khám phá xe điện
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const total = subtotal;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    try {
      console.log('🔄 Bắt đầu xử lý thanh toán...');
      console.log('Phương thức thanh toán:', paymentMethod);
      console.log('User:', user);
      console.log('Cart items:', cartItems);

      // Validate data trước khi xử lý
      if (!user || !user.email) {
        throw new Error('Thông tin người dùng không hợp lệ');
      }

      if (cartItems.length === 0) {
        throw new Error('Giỏ hàng trống');
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate booking confirmation
      const bookingId = `BK${Date.now()}`;
      console.log('📋 Booking ID:', bookingId);

      // Prepare booking data for each cart item
      const savedBookings = [];
      let itemIndex = 1;
      
      for (const item of cartItems) {
        // Validate item data
        if (!item.vehicle || !item.rentalDetails) {
          console.error('❌ Invalid item:', item);
          continue;
        }

        // Tạo unique booking ID cho mỗi item: BK1234567890-1, BK1234567890-2, ...
        const itemBookingId = `${bookingId}-${itemIndex}`;

        const bookingData = {
          userId: user.id || user.email,
          userEmail: user.email,
          userName: user.fullName || user.name || user.email,
          userPhone: user.phone || 'Chưa cập nhật',
          vehicleName: item.vehicle.name,
          vehicleId: item.vehicle.id,
          licensePlate: item.vehicle.licensePlate || `59${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(10000 + Math.random() * 90000)}`,
          vehicleImage: item.vehicle.image,
          pickupDate: item.rentalDetails.pickupDate,
          returnDate: item.rentalDetails.returnDate,
          pickupTime: item.rentalDetails.pickupTime || '09:00',
          returnTime: item.rentalDetails.returnTime || '18:00',
          pickupStation: item.rentalDetails.pickupStation?.name || 'Chưa chọn',
          returnStation: item.rentalDetails.returnStation?.name || 'Chưa chọn',
          days: item.rentalDetails.days || 1,
          totalPrice: item.totalPrice || 0,
          additionalServices: item.rentalDetails.additionalServices || {},
          paymentMethod: paymentMethod,
          battery: '100%',
          lastCheck: new Date().toISOString(),
        };

        console.log('💾 Đang lưu booking với ID:', itemBookingId);

        try {
          // Save each booking với ID cụ thể
          const savedBooking = saveBooking(bookingData, itemBookingId);
          savedBookings.push(savedBooking);
          console.log('✅ Đã lưu booking:', savedBooking.id);
          itemIndex++;
        } catch (saveError) {
          console.error('❌ Lỗi khi lưu booking:', saveError);
          throw new Error(`Không thể lưu booking cho xe ${item.vehicle.name}`);
        }
      }

      if (savedBookings.length === 0) {
        throw new Error('Không có booking nào được lưu thành công');
      }

      console.log('🎉 Đã lưu tất cả bookings:', savedBookings);

      // Clear cart and redirect
      clearCart();
      
      // Show success message based on payment method
      if (paymentMethod === 'cash') {
        alert('✅ Đặt xe thành công! Vui lòng thanh toán khi nhận xe tại điểm.');
      } else {
        alert('✅ Thanh toán thành công! Đang chuyển đến trang xác nhận...');
      }
      
      navigate(`/booking-success/${bookingId}`);
    } catch (error) {
      console.error("❌ Payment error:", error);
      alert(`❌ Lỗi: ${error.message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại!'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>💳 Thanh Toán Đặt Xe</h1>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span>1</span> Xác nhận
          </div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span>2</span> Thanh toán
          </div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span>3</span> Hoàn thành
          </div>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          {step === 1 && (
            <div className="confirmation-step">
              <h3>📋 Xác Nhận Thông Tin Đặt Xe</h3>

              <div className="booking-summary">
                {cartItems.map((item) => (
                  <div key={item.id} className="booking-item">
                    <div className="item-image">
                      <img src={item.vehicle.image} alt={item.vehicle.name} />
                    </div>

                    <div className="item-details">
                      <h4>{item.vehicle.name}</h4>
                      <p className="rental-period">
                        📅 {formatDate(item.rentalDetails.pickupDate)} -{" "}
                        {formatDate(item.rentalDetails.returnDate)}
                      </p>
                      <p className="rental-duration">
                        ⏱️ {item.rentalDetails.days} ngày thuê
                      </p>
                      <p className="pickup-location">
                        📍 Nhận: {item.rentalDetails.pickupStation?.name}
                      </p>
                      <p className="return-location">
                        📍 Trả: {item.rentalDetails.returnStation?.name}
                      </p>

                      {/* Additional Services */}
                      {Object.entries(
                        item.rentalDetails.additionalServices || {}
                      ).filter(([_, selected]) => selected).length > 0 && (
                        <div className="additional-services">
                          <p>
                            <strong>Dịch vụ bổ sung:</strong>
                          </p>
                          <ul>
                            {Object.entries(
                              item.rentalDetails.additionalServices
                            )
                              .filter(([_, selected]) => selected)
                              .map(([service]) => (
                                <li key={service}>
                                  {service === "insurance" &&
                                    "🛡️ Bảo hiểm mở rộng"}
                                  {service === "gps" && "🗺️ Thiết bị GPS"}
                                  {service === "childSeat" && "👶 Ghế trẻ em"}
                                  {service === "wifi" && "📶 WiFi di động"}
                                  {service === "extraDriver" &&
                                    "👤 Thêm lái xe phụ"}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="item-price">
                      <div className="price-amount">
                        {formatPrice(item.totalPrice, "VNĐ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="confirmation-actions">
                <button
                  className="btn secondary"
                  onClick={() => navigate("/cart")}
                >
                  ← Quay lại giỏ hàng
                </button>
                <button className="btn primary" onClick={() => setStep(2)}>
                  Tiếp tục thanh toán →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="payment-step">
              <h3>💳 Phương Thức Thanh Toán</h3>

              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === "credit_card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">💳</span>
                    <span>Thẻ tín dụng/Ghi nợ</span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">🏦</span>
                    <span>Chuyển khoản ngân hàng</span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="e_wallet"
                    checked={paymentMethod === "e_wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">📱</span>
                    <span>Ví điện tử (Momo, ZaloPay)</span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">💵</span>
                    <span>Thanh toán tại điểm nhận xe</span>
                  </div>
                </label>
              </div>

              {paymentMethod === "credit_card" && (
                <form onSubmit={handlePaymentSubmit} className="payment-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Số thẻ *</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) =>
                          handleInputChange("cardNumber", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Tên chủ thẻ *</label>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        value={paymentData.cardName}
                        onChange={(e) =>
                          handleInputChange("cardName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Ngày hết hạn *</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) =>
                          handleInputChange("expiryDate", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) =>
                          handleInputChange("cvv", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="payment-actions">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setStep(1)}
                    >
                      ← Quay lại
                    </button>
                    <button
                      type="submit"
                      className="btn primary"
                      disabled={isProcessing}
                    >
                      {isProcessing
                        ? "🔄 Đang xử lý..."
                        : `💳 Thanh toán ${formatPrice(total, "VNĐ")}`}
                    </button>
                  </div>
                </form>
              )}

              {paymentMethod !== "credit_card" && paymentMethod !== "cash" && (
                <div className="alternative-payment">
                  <p>
                    Phương thức thanh toán này sẽ được hỗ trợ trong phiên bản
                    tiếp theo.
                  </p>
                  <div className="payment-actions">
                    <button
                      className="btn secondary"
                      onClick={() => setStep(1)}
                    >
                      ← Quay lại
                    </button>
                    <button
                      className="btn primary"
                      onClick={() => setPaymentMethod("credit_card")}
                    >
                      Chọn thẻ tín dụng
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="cash-payment-info">
                  <div className="info-box">
                    <h4>💵 Hướng dẫn thanh toán tại điểm</h4>
                    <ul>
                      <li>✅ Bạn sẽ thanh toán trực tiếp khi nhận xe tại điểm</li>
                      <li>✅ Vui lòng mang theo CMND/CCCD và bằng lái xe</li>
                      <li>✅ Số tiền cần thanh toán: <strong>{formatPrice(total, "VNĐ")}</strong></li>
                      <li>✅ Nhân viên sẽ xác nhận và giao xe cho bạn</li>
                    </ul>
                    <div className="note-box">
                      <p><strong>⚠️ Lưu ý:</strong></p>
                      <p>• Vui lòng đến đúng giờ đã đặt</p>
                      <p>• Chuẩn bị đầy đủ giấy tờ cần thiết</p>
                      <p>• Liên hệ hotline nếu cần hỗ trợ: <strong>1900-xxxx</strong></p>
                    </div>
                  </div>
                  <div className="payment-actions">
                    <button
                      className="btn secondary"
                      onClick={() => setStep(1)}
                    >
                      ← Quay lại
                    </button>
                    <button
                      className="btn primary"
                      onClick={handlePaymentSubmit}
                      disabled={isProcessing}
                    >
                      {isProcessing
                        ? "🔄 Đang xử lý..."
                        : `✅ Xác nhận đặt xe`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="checkout-sidebar">
          <div className="order-summary">
            <h3>💰 Tóm Tắt Đơn Hàng</h3>

            <div className="summary-details">
              <div className="summary-row">
                <span>Số lượng xe:</span>
                <span>{cartItems.length} xe</span>
              </div>

              <div className="summary-row">
                <span>Tổng tiền thuê:</span>
                <span>{formatPrice(subtotal, "VNĐ")}</span>
              </div>

              <div className="summary-row total">
                <span>Tổng thanh toán:</span>
                <span>{formatPrice(total, "VNĐ")}</span>
              </div>
            </div>

            <div className="security-info">
              <h4>🔒 Thanh toán an toàn</h4>
              <ul>
                <li>✅ Mã hóa SSL 256-bit</li>
                <li>✅ Không lưu trữ thông tin thẻ</li>
                <li>✅ Bảo vệ thông tin cá nhân</li>
                <li>✅ Hoàn tiền 100% nếu hủy trước 24h</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
