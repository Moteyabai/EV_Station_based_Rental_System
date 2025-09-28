import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import "../styles/RentalForm.css";

export default function RentalForm() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  // State cho thông tin người thuê
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    idCard: "",
    address: "",
    driverLicense: "",
  });

  // State cho thông tin thuê xe
  const [rentalDetails, setRentalDetails] = useState({
    pickupDate: new Date().toISOString().split("T")[0],
    returnDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // +1 ngày
    pickupTime: "09:00",
    returnTime: "18:00",
    days: 1,
  });

  // State cho các lỗi validate
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý khi không có xe trong giỏ hàng
  if (cartItems.length === 0) {
    return (
      <div className="rental-form-container">
        <div className="empty-cart-message">
          <h2>🛒 Giỏ hàng trống</h2>
          <p>Bạn chưa có xe nào trong giỏ hàng để tiến hành thuê</p>
          <Link to="/vehicles" className="btn primary">
            Xem danh sách xe
          </Link>
        </div>
      </div>
    );
  }

  // Xử lý thay đổi form input thông tin khách hàng
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({
      ...customerInfo,
      [name]: value,
    });

    // Xóa thông báo lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Xử lý thay đổi form input thông tin thuê xe
  const handleRentalChange = (e) => {
    const { name, value } = e.target;

    setRentalDetails((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Tính số ngày thuê khi thay đổi ngày nhận hoặc ngày trả
      if (name === "pickupDate" || name === "returnDate") {
        const pickupDate =
          name === "pickupDate" ? new Date(value) : new Date(prev.pickupDate);
        const returnDate =
          name === "returnDate" ? new Date(value) : new Date(prev.returnDate);

        // Tính số ngày chênh lệch
        const diffTime = Math.abs(returnDate - pickupDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        updated.days = diffDays || 1; // Tối thiểu 1 ngày
      }

      return updated;
    });

    // Xóa thông báo lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Xác thực form
  const validateForm = () => {
    const newErrors = {};

    // Xác thực thông tin cá nhân
    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên đầy đủ";
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(customerInfo.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!customerInfo.idCard.trim()) {
      newErrors.idCard = "Vui lòng nhập số CMND/CCCD";
    } else if (!/^[0-9]{9,12}$/.test(customerInfo.idCard.replace(/\s/g, ""))) {
      newErrors.idCard = "Số CMND/CCCD không hợp lệ";
    }

    if (!customerInfo.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    if (!customerInfo.driverLicense.trim()) {
      newErrors.driverLicense = "Vui lòng nhập số bằng lái xe";
    }

    // Xác thực thông tin thuê xe
    if (!rentalDetails.pickupDate) {
      newErrors.pickupDate = "Vui lòng chọn ngày nhận xe";
    }

    if (!rentalDetails.returnDate) {
      newErrors.returnDate = "Vui lòng chọn ngày trả xe";
    }

    if (
      new Date(rentalDetails.returnDate) <= new Date(rentalDetails.pickupDate)
    ) {
      newErrors.returnDate = "Ngày trả xe phải sau ngày nhận xe";
    }

    if (!rentalDetails.pickupTime) {
      newErrors.pickupTime = "Vui lòng chọn giờ nhận xe";
    }

    if (!rentalDetails.returnTime) {
      newErrors.returnTime = "Vui lòng chọn giờ trả xe";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form trước khi submit
    if (validateForm()) {
      setIsSubmitting(true);

      // Lưu thông tin vào localStorage (trong app thực tế sẽ gửi lên server)
      try {
        // Cập nhật cartItems với thông tin thuê mới
        const updatedCartItems = cartItems.map((item) => ({
          ...item,
          rentalDetails: {
            ...item.rentalDetails,
            ...rentalDetails,
          },
          // Cập nhật tổng giá dựa trên số ngày mới
          totalPrice: item.vehicle.price * rentalDetails.days,
        }));

        const rentalInfo = {
          customerInfo,
          rentalDetails,
          cartItems: updatedCartItems,
          totalPrice:
            getTotalPrice() *
            (rentalDetails.days / cartItems[0].rentalDetails.days),
          orderDate: new Date().toISOString(),
          status: "pending",
        };

        localStorage.setItem("rental_info", JSON.stringify(rentalInfo));

        // Chuyển đến trang xác nhận sau 1 giây
        setTimeout(() => {
          navigate("/checkout");
        }, 1000);
      } catch (error) {
        console.error("Error saving rental information:", error);
        setIsSubmitting(false);
      }
    } else {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      document.getElementsByName(firstError)[0]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  return (
    <div className="rental-form-container">
      <h1>Thông tin thuê xe</h1>

      <div className="rental-form-content">
        <div className="rental-form-left">
          <h2>Điền thông tin thuê xe</h2>

          <form onSubmit={handleSubmit} className="rental-form">
            <h3 className="section-title">📆 Thông tin ngày giờ thuê</h3>

            <div className="rental-date-time">
              <div className="date-time-row">
                <div className="form-group">
                  <label htmlFor="pickupDate">Ngày nhận xe *</label>
                  <input
                    type="date"
                    id="pickupDate"
                    name="pickupDate"
                    value={rentalDetails.pickupDate}
                    onChange={handleRentalChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={errors.pickupDate ? "error" : ""}
                  />
                  {errors.pickupDate && (
                    <span className="error-message">{errors.pickupDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="pickupTime">Giờ nhận xe *</label>
                  <input
                    type="time"
                    id="pickupTime"
                    name="pickupTime"
                    value={rentalDetails.pickupTime}
                    onChange={handleRentalChange}
                    className={errors.pickupTime ? "error" : ""}
                  />
                  {errors.pickupTime && (
                    <span className="error-message">{errors.pickupTime}</span>
                  )}
                </div>
              </div>

              <div className="date-time-row">
                <div className="form-group">
                  <label htmlFor="returnDate">Ngày trả xe *</label>
                  <input
                    type="date"
                    id="returnDate"
                    name="returnDate"
                    value={rentalDetails.returnDate}
                    onChange={handleRentalChange}
                    min={rentalDetails.pickupDate}
                    className={errors.returnDate ? "error" : ""}
                  />
                  {errors.returnDate && (
                    <span className="error-message">{errors.returnDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="returnTime">Giờ trả xe *</label>
                  <input
                    type="time"
                    id="returnTime"
                    name="returnTime"
                    value={rentalDetails.returnTime}
                    onChange={handleRentalChange}
                    className={errors.returnTime ? "error" : ""}
                  />
                  {errors.returnTime && (
                    <span className="error-message">{errors.returnTime}</span>
                  )}
                </div>
              </div>

              <div className="rental-duration">
                <div className="duration-tag">
                  <span>Thời gian thuê: </span>
                  <strong>{rentalDetails.days} ngày</strong>
                </div>
              </div>
            </div>

            <h3 className="section-title">👤 Thông tin cá nhân</h3>

            <div className="form-group">
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={customerInfo.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? "error" : ""}
              />
              {errors.fullName && (
                <span className="error-message">{errors.fullName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={customerInfo.email}
                onChange={handleInputChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                className={errors.phone ? "error" : ""}
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="idCard">Số CMND/CCCD *</label>
              <input
                type="text"
                id="idCard"
                name="idCard"
                value={customerInfo.idCard}
                onChange={handleInputChange}
                className={errors.idCard ? "error" : ""}
              />
              {errors.idCard && (
                <span className="error-message">{errors.idCard}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">Địa chỉ *</label>
              <textarea
                id="address"
                name="address"
                value={customerInfo.address}
                onChange={handleInputChange}
                className={errors.address ? "error" : ""}
                rows="3"
              ></textarea>
              {errors.address && (
                <span className="error-message">{errors.address}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="driverLicense">Số giấy phép lái xe *</label>
              <input
                type="text"
                id="driverLicense"
                name="driverLicense"
                value={customerInfo.driverLicense}
                onChange={handleInputChange}
                className={errors.driverLicense ? "error" : ""}
              />
              {errors.driverLicense && (
                <span className="error-message">{errors.driverLicense}</span>
              )}
            </div>

            <div className="rental-note">
              <p>
                <strong>Lưu ý:</strong> Các giấy tờ gốc sẽ cần được xuất trình
                khi nhận xe
              </p>
            </div>

            <div className="form-actions">
              <Link to="/cart" className="btn secondary">
                Quay lại giỏ hàng
              </Link>
              <button
                type="submit"
                className="btn primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Tiếp tục"}
              </button>
            </div>
          </form>
        </div>

        <div className="rental-form-right">
          <div className="order-summary">
            <h3>Thông tin đặt hàng</h3>

            <div className="cart-summary">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <div className="summary-item-image">
                    <img src={item.vehicle.image} alt={item.vehicle.name} />
                  </div>
                  <div className="summary-item-info">
                    <h4>{item.vehicle.name}</h4>
                    <p>Thời gian thuê: {item.rentalDetails.days} ngày</p>
                    <p>
                      Giá: {item.vehicle.price}
                      {item.vehicle.priceUnit}
                    </p>
                  </div>
                  <div className="summary-item-price">
                    {formatPrice(item.totalPrice * 1000)}
                  </div>
                </div>
              ))}
            </div>

            <div className="total-summary">
              <div className="summary-row total">
                <span>Tổng tiền thuê ({rentalDetails.days} ngày):</span>
                <span>
                  {formatPrice(getTotalPrice() * rentalDetails.days * 1000)}
                </span>
              </div>
            </div>
          </div>

          <div className="rental-requirements">
            <h3>Điều kiện thuê xe</h3>
            <ul>
              <li>Tuổi từ 18 tuổi trở lên</li>
              <li>Có giấy phép lái xe hợp lệ</li>
              <li>CMND/CCCD còn hiệu lực</li>
              <li>Đặt cọc 30% giá trị xe</li>
              <li>Hoàn trả xe đúng hạn và trong tình trạng tốt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
