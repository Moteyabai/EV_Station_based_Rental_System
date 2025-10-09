import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { formatPrice, formatDate } from "../utils/helpers";
import "../styles/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Confirm, 2: Payment, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  // Lấy thông tin khách hàng từ localStorage (đã được lưu từ trang RentalForm)
  const [customerInfo, setCustomerInfo] = useState(() => {
    try {
      const savedRentalInfo = localStorage.getItem("rental_info");
      return savedRentalInfo ? JSON.parse(savedRentalInfo).customerInfo : null;
    } catch {
      return null;
    }
  });

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

  // Kiểm tra nếu chưa điền thông tin khách hàng thì chuyển đến trang RentalForm
  if (!customerInfo) {
    navigate("/rental-form");
    return null;
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price * 1000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const subtotal = getTotalPrice();
  const total = subtotal;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate booking confirmation
      const bookingId = "BK" + Date.now();

      // In real app, send booking data to server
      const bookingData = {
        bookingId,
        userId: user.email,
        customerInfo: customerInfo,
        items: cartItems,
        payment: {
          method: paymentMethod,
          amount: total,
          currency: "VND",
        },
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      // Save booking to localStorage (in real app would be server)
      const existingBookings = JSON.parse(
        localStorage.getItem("ev_bookings") || "[]"
      );
      localStorage.setItem(
        "ev_bookings",
        JSON.stringify([...existingBookings, bookingData])
      );

      // Clear cart and redirect
      clearCart();
      navigate(`/booking-success/${bookingId}`);
    } catch (error) {
      console.error("Payment error:", error);
      alert("❌ Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại!");
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
                        {formatPrice(item.totalPrice)}
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
                        : `💳 Thanh toán ${formatPrice(total)}`}
                    </button>
                  </div>
                </form>
              )}

              {paymentMethod !== "credit_card" && (
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
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="summary-row total">
                <span>Tổng thanh toán:</span>
                <span>{formatPrice(total)}</span>
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
