import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { formatPrice, formatDate } from "../utils/helpers";
import "../styles/Cart.css";

export default function Cart() {
  const { cartItems, removeFromCart, getTotalPrice, getItemCount, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Role-based access control: Block Staff and Admin
  React.useEffect(() => {
    if (user) {
      const userRoleId = user?.roleID || user?.RoleID;
      if (userRoleId === 2 || userRoleId === 3) {
        console.log("Cart: Access denied for Staff/Admin, redirecting...");
        if (userRoleId === 2) {
          navigate("/staff");
        } else {
          navigate("/admin");
        }
      }
    }
  }, [user, navigate]);

  // Debug: Log cart items to see station data structure
  React.useEffect(() => {
    console.log('🛒 [CART] Cart items:', cartItems);
    cartItems.forEach((item, index) => {
      console.log(`🛒 [CART] Item ${index + 1}:`, {
        vehicleName: item.vehicle?.name,
        pickupStation: item.rentalDetails?.pickupStation,
        returnStation: item.rentalDetails?.returnStation,
      });
    });
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h2>🛒 Giỏ Hàng</h2>
        </div>

        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h3>Giỏ hàng của bạn đang trống</h3>
          <p>Hãy khám phá các xe điện và thêm vào giỏ hàng để thuê xe!</p>
          <Link to="/vehicles" className="btn primary">
            🏍️ Xem Danh Sách Xe
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>🛒 Giỏ Hàng ({getItemCount()} xe)</h2>
        <button
          className="btn secondary clear-cart-btn"
          onClick={clearCart}
          disabled={cartItems.length === 0}
        >
          🗑️ Xóa tất cả
        </button>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img
                  src={item.vehicle.image}
                  alt={item.vehicle.name}
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1549317336-206569e8475c?auto=format&fit=crop&w=300&q=60";
                  }}
                />
              </div>

              <div className="cart-item-details">
                <div className="vehicle-header">
                  <h4>{item.vehicle.name}</h4>
                  <p className="vehicle-type">{item.vehicle.short}</p>
                </div>

                <div className="rental-details">
                  {/* Ngày thuê */}
                  <div className="rental-info-row">
                    <div className="info-label">
                      <span className="icon">📅</span>
                      <span className="text">Ngày thuê</span>
                    </div>
                    <div className="info-value">
                      <div>{formatDate(item.rentalDetails.pickupDate)}</div>
                      <div className="separator">→</div>
                      <div>{formatDate(item.rentalDetails.returnDate)}</div>
                      <div className="duration-badge">
                        {item.rentalDetails.days} ngày
                      </div>
                    </div>
                  </div>

                  {/* Thời gian */}
                  <div className="rental-info-row">
                    <div className="info-label">
                      <span className="icon">🕒</span>
                      <span className="text">Thời gian</span>
                    </div>
                    <div className="info-value">
                      <div>Nhận: {item.rentalDetails.pickupTime}</div>
                      <div className="separator">•</div>
                      <div>Trả: {item.rentalDetails.returnTime}</div>
                    </div>
                  </div>

                  {/* Điểm nhận xe */}
                  <div className="rental-info-row">
                    <div className="info-label">
                      <span className="icon">📍</span>
                      <span className="text">Điểm nhận/trả</span>
                    </div>
                    <div className="info-value">
                      {(() => {
                        const station = item.rentalDetails?.pickupStation;
                        if (!station) return <span className="not-selected">Chưa chọn điểm nhận/trả</span>;
                        if (typeof station === 'object' && station.name) {
                          return (
                            <div className="station-info">
                              <div className="station-name">{station.name}</div>
                              {station.address && (
                                <div className="station-address">{station.address}</div>
                              )}
                            </div>
                          );
                        }
                        if (typeof station === 'string') return <span>{station}</span>;
                        return <span className="not-selected">Chưa chọn điểm nhận/trả</span>;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="cart-item-price">
                <div className="price-breakdown">
                  <div className="daily-price">
                    {formatPrice(item.vehicle.price)}/ngày
                  </div>
                  <div className="total-price">
                    = {formatPrice(item.totalPrice)}
                  </div>
                </div>

                <button
                  className="btn danger remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>💰 Tổng Kết Đơn Hàng</h3>

            <div className="summary-details">
              <div className="summary-row">
                <span>Số lượng xe:</span>
                <span>{getItemCount()} xe</span>
              </div>

              <div className="summary-row">
                <span>Tổng tiền thuê:</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <div className="checkout-actions">
              <Link to="/vehicles" className="btn secondary continue-shopping">
                ← Tiếp tục chọn xe
              </Link>

              <Link to="/checkout" className="btn primary checkout-btn">
                � Thanh toán
              </Link>
            </div>
          </div>

          <div className="cart-notes">
            <h4>📝 Lưu ý quan trọng:</h4>
            <ul>
              <li>✅ Giá đã bao gồm bảo hiểm cơ bản</li>
              <li>
                ⛽ Xe được giao với pin đầy, vui lòng trả xe với mức pin tối
                thiểu 20%
              </li>
              <li>🆔 Cần có bằng lái xe hợp lệ khi nhận xe</li>
              <li>💳 Cần thẻ tín dụng để đặt cọc bảo đảm</li>
              <li>📞 Hỗ trợ 24/7: 1900-EV-RENTAL</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
