import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import "../styles/BookingForm.css";

export default function BookingForm({ vehicle, onSubmit, onCancel }) {
  const { addToCart } = useCart();

  const [formData, setFormData] = useState({
    // Thông tin khách hàng
    customerInfo: {
      fullName: "",
      email: "",
      phone: "",
      idNumber: "",
      driverLicense: "",
    },

    // Thông tin thuê xe
    rentalInfo: {
      pickupDate: "",
      returnDate: "",
      pickupTime: "09:00",
      returnTime: "18:00",
      pickupStationId: "",
      returnStationId: "",
      specialRequests: "",
    },

    // Dịch vụ bổ sung
    additionalServices: {
      insurance: false,
      gps: false,
      childSeat: false,
      wifi: false,
      extraDriver: false,
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock station data - in real app would come from API
  const stations = [
    {
      id: "s1",
      name: "Điểm thuê Quận 1",
      address: "123 Nguyễn Huệ, Q1, TP.HCM",
    },
    {
      id: "s2",
      name: "Điểm thuê Quận 3",
      address: "45 Võ Văn Tần, Q3, TP.HCM",
    },
    {
      id: "s3",
      name: "Điểm thuê Quận 7",
      address: "789 Nguyễn Thị Thập, Q7, TP.HCM",
    },
    {
      id: "s4",
      name: "Điểm thuê Tân Bình",
      address: "101 Hoàng Văn Thụ, TB, TP.HCM",
    },
  ];

  const serviceOptions = [
    {
      id: "insurance",
      name: "Bảo hiểm mở rộng",
      price: 50000,
      description: "Bảo hiểm toàn diện cho xe và hành khách",
    },
    {
      id: "gps",
      name: "Thiết bị GPS",
      price: 30000,
      description: "Định vị và chỉ đường thông minh",
    },
    {
      id: "childSeat",
      name: "Ghế trẻ em",
      price: 40000,
      description: "Ghế an toàn cho trẻ dưới 12 tuổi",
    },
    {
      id: "wifi",
      name: "WiFi di động",
      price: 25000,
      description: "Kết nối internet tốc độ cao trong xe",
    },
    {
      id: "extraDriver",
      name: "Thêm lái xe phụ",
      price: 100000,
      description: "Cho phép thêm 1 người lái khác",
    },
  ];

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`${section}.${field}`]: "",
      }));
    }
  };

  const handleServiceChange = (serviceId, checked) => {
    setFormData((prev) => ({
      ...prev,
      additionalServices: {
        ...prev.additionalServices,
        [serviceId]: checked,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate customer info
    if (!formData.customerInfo.fullName.trim()) {
      newErrors["customerInfo.fullName"] = "Họ tên là bắt buộc";
    }

    if (!formData.customerInfo.email.trim()) {
      newErrors["customerInfo.email"] = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.customerInfo.email)) {
      newErrors["customerInfo.email"] = "Email không hợp lệ";
    }

    if (!formData.customerInfo.phone.trim()) {
      newErrors["customerInfo.phone"] = "Số điện thoại là bắt buộc";
    } else if (
      !/^[0-9]{10,11}$/.test(formData.customerInfo.phone.replace(/\s/g, ""))
    ) {
      newErrors["customerInfo.phone"] = "Số điện thoại không hợp lệ";
    }

    if (!formData.customerInfo.idNumber.trim()) {
      newErrors["customerInfo.idNumber"] = "Số CMND/CCCD là bắt buộc";
    }

    if (!formData.customerInfo.driverLicense.trim()) {
      newErrors["customerInfo.driverLicense"] = "Số bằng lái xe là bắt buộc";
    }

    // Validate rental info
    if (!formData.rentalInfo.pickupDate) {
      newErrors["rentalInfo.pickupDate"] = "Ngày nhận xe là bắt buộc";
    }

    if (!formData.rentalInfo.returnDate) {
      newErrors["rentalInfo.returnDate"] = "Ngày trả xe là bắt buộc";
    }

    if (formData.rentalInfo.pickupDate && formData.rentalInfo.returnDate) {
      const pickupDate = new Date(formData.rentalInfo.pickupDate);
      const returnDate = new Date(formData.rentalInfo.returnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (pickupDate < today) {
        newErrors["rentalInfo.pickupDate"] =
          "Ngày nhận xe không thể là quá khứ";
      }

      if (returnDate <= pickupDate) {
        newErrors["rentalInfo.returnDate"] =
          "Ngày trả xe phải sau ngày nhận xe";
      }
    }

    if (!formData.rentalInfo.pickupStationId) {
      newErrors["rentalInfo.pickupStationId"] = "Vui lòng chọn điểm nhận xe";
    }

    if (!formData.rentalInfo.returnStationId) {
      newErrors["rentalInfo.returnStationId"] = "Vui lòng chọn điểm trả xe";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateRentalDays = () => {
    if (!formData.rentalInfo.pickupDate || !formData.rentalInfo.returnDate)
      return 0;

    const pickup = new Date(formData.rentalInfo.pickupDate);
    const returnDate = new Date(formData.rentalInfo.returnDate);
    const diffTime = Math.abs(returnDate - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays || 1; // Minimum 1 day
  };

  const calculateTotalPrice = () => {
    const days = calculateRentalDays();
    const basePrice = vehicle.price * days;

    const servicesPrice = Object.entries(formData.additionalServices)
      .filter(([_, selected]) => selected)
      .reduce((total, [serviceId]) => {
        const service = serviceOptions.find((s) => s.id === serviceId);
        return total + (service ? service.price * days : 0);
      }, 0);

    return basePrice + servicesPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const rentalDetails = {
        ...formData.rentalInfo,
        pickupStation: stations.find(
          (s) => s.id === formData.rentalInfo.pickupStationId
        ),
        returnStation: stations.find(
          (s) => s.id === formData.rentalInfo.returnStationId
        ),
        days: calculateRentalDays(),
        additionalServices: formData.additionalServices,
        customerInfo: formData.customerInfo,
        totalPrice: calculateTotalPrice(),
      };

      // Add to cart
      addToCart(vehicle, rentalDetails);

      // Call onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(formData, rentalDetails);
      }

      alert("✅ Đã thêm xe vào giỏ hàng thành công!");
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("❌ Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="booking-form-container">
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-header">
          <h3>📋 Thông Tin Đặt Xe</h3>
          <p>Vui lòng điền đầy đủ thông tin để hoàn tất việc thuê xe</p>
        </div>

        {/* Thông tin khách hàng */}
        <div className="form-section">
          <h4>👤 Thông Tin Khách Hàng</h4>

          <div className="form-group">
            <label htmlFor="fullName">Họ và tên *</label>
            <input
              type="text"
              id="fullName"
              value={formData.customerInfo.fullName}
              onChange={(e) =>
                handleInputChange("customerInfo", "fullName", e.target.value)
              }
              placeholder="Nguyễn Văn A"
              className={errors["customerInfo.fullName"] ? "error" : ""}
            />
            {errors["customerInfo.fullName"] && (
              <span className="error-message">
                {errors["customerInfo.fullName"]}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={formData.customerInfo.email}
                onChange={(e) =>
                  handleInputChange("customerInfo", "email", e.target.value)
                }
                placeholder="example@email.com"
                className={errors["customerInfo.email"] ? "error" : ""}
              />
              {errors["customerInfo.email"] && (
                <span className="error-message">
                  {errors["customerInfo.email"]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                value={formData.customerInfo.phone}
                onChange={(e) =>
                  handleInputChange("customerInfo", "phone", e.target.value)
                }
                placeholder="0901234567"
                className={errors["customerInfo.phone"] ? "error" : ""}
              />
              {errors["customerInfo.phone"] && (
                <span className="error-message">
                  {errors["customerInfo.phone"]}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idNumber">Số CMND/CCCD *</label>
              <input
                type="text"
                id="idNumber"
                value={formData.customerInfo.idNumber}
                onChange={(e) =>
                  handleInputChange("customerInfo", "idNumber", e.target.value)
                }
                placeholder="123456789"
                className={errors["customerInfo.idNumber"] ? "error" : ""}
              />
              {errors["customerInfo.idNumber"] && (
                <span className="error-message">
                  {errors["customerInfo.idNumber"]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="driverLicense">Số bằng lái xe *</label>
              <input
                type="text"
                id="driverLicense"
                value={formData.customerInfo.driverLicense}
                onChange={(e) =>
                  handleInputChange(
                    "customerInfo",
                    "driverLicense",
                    e.target.value
                  )
                }
                placeholder="B123456789"
                className={errors["customerInfo.driverLicense"] ? "error" : ""}
              />
              {errors["customerInfo.driverLicense"] && (
                <span className="error-message">
                  {errors["customerInfo.driverLicense"]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin thuê xe */}
        <div className="form-section">
          <h4>🚗 Thông Tin Thuê Xe</h4>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupDate">Ngày nhận xe *</label>
              <input
                type="date"
                id="pickupDate"
                value={formData.rentalInfo.pickupDate}
                onChange={(e) =>
                  handleInputChange("rentalInfo", "pickupDate", e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
                className={errors["rentalInfo.pickupDate"] ? "error" : ""}
              />
              {errors["rentalInfo.pickupDate"] && (
                <span className="error-message">
                  {errors["rentalInfo.pickupDate"]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="pickupTime">Giờ nhận xe</label>
              <select
                id="pickupTime"
                value={formData.rentalInfo.pickupTime}
                onChange={(e) =>
                  handleInputChange("rentalInfo", "pickupTime", e.target.value)
                }
              >
                {Array.from({ length: 14 }, (_, i) => {
                  const hour = i + 7; // 7:00 to 20:00
                  const time = `${hour.toString().padStart(2, "0")}:00`;
                  return (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="returnDate">Ngày trả xe *</label>
              <input
                type="date"
                id="returnDate"
                value={formData.rentalInfo.returnDate}
                onChange={(e) =>
                  handleInputChange("rentalInfo", "returnDate", e.target.value)
                }
                min={
                  formData.rentalInfo.pickupDate ||
                  new Date().toISOString().split("T")[0]
                }
                className={errors["rentalInfo.returnDate"] ? "error" : ""}
              />
              {errors["rentalInfo.returnDate"] && (
                <span className="error-message">
                  {errors["rentalInfo.returnDate"]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="returnTime">Giờ trả xe</label>
              <select
                id="returnTime"
                value={formData.rentalInfo.returnTime}
                onChange={(e) =>
                  handleInputChange("rentalInfo", "returnTime", e.target.value)
                }
              >
                {Array.from({ length: 14 }, (_, i) => {
                  const hour = i + 7; // 7:00 to 20:00
                  const time = `${hour.toString().padStart(2, "0")}:00`;
                  return (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupStation">Điểm nhận xe *</label>
              <select
                id="pickupStation"
                value={formData.rentalInfo.pickupStationId}
                onChange={(e) =>
                  handleInputChange(
                    "rentalInfo",
                    "pickupStationId",
                    e.target.value
                  )
                }
                className={errors["rentalInfo.pickupStationId"] ? "error" : ""}
              >
                <option value="">-- Chọn điểm nhận xe --</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} - {station.address}
                  </option>
                ))}
              </select>
              {errors["rentalInfo.pickupStationId"] && (
                <span className="error-message">
                  {errors["rentalInfo.pickupStationId"]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="returnStation">Điểm trả xe *</label>
              <select
                id="returnStation"
                value={formData.rentalInfo.returnStationId}
                onChange={(e) =>
                  handleInputChange(
                    "rentalInfo",
                    "returnStationId",
                    e.target.value
                  )
                }
                className={errors["rentalInfo.returnStationId"] ? "error" : ""}
              >
                <option value="">-- Chọn điểm trả xe --</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} - {station.address}
                  </option>
                ))}
              </select>
              {errors["rentalInfo.returnStationId"] && (
                <span className="error-message">
                  {errors["rentalInfo.returnStationId"]}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="specialRequests">Yêu cầu đặc biệt (tùy chọn)</label>
            <textarea
              id="specialRequests"
              rows="3"
              value={formData.rentalInfo.specialRequests}
              onChange={(e) =>
                handleInputChange(
                  "rentalInfo",
                  "specialRequests",
                  e.target.value
                )
              }
              placeholder="Ví dụ: Cần giao xe tận nơi, yêu cầu màu xe cụ thể..."
            />
          </div>
        </div>

        {/* Dịch vụ bổ sung */}
        <div className="form-section">
          <h4>⭐ Dịch Vụ Bổ Sung</h4>

          <div className="services-grid">
            {serviceOptions.map((service) => (
              <div key={service.id} className="service-option">
                <label className="service-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.additionalServices[service.id] || false}
                    onChange={(e) =>
                      handleServiceChange(service.id, e.target.checked)
                    }
                  />
                  <div className="service-info">
                    <div className="service-name">
                      {service.name}
                      <span className="service-price">
                        + {formatPrice(service.price)}/ngày
                      </span>
                    </div>
                    <div className="service-description">
                      {service.description}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tóm tắt giá */}
        <div className="price-summary">
          <h4>💰 Tóm Tắt Chi Phí</h4>

          <div className="price-breakdown">
            <div className="price-row">
              <span>Thuê xe ({calculateRentalDays()} ngày)</span>
              <span>{formatPrice(vehicle.price * calculateRentalDays())}</span>
            </div>

            {Object.entries(formData.additionalServices)
              .filter(([_, selected]) => selected)
              .map(([serviceId]) => {
                const service = serviceOptions.find((s) => s.id === serviceId);
                return service ? (
                  <div key={serviceId} className="price-row service-price">
                    <span>
                      {service.name} ({calculateRentalDays()} ngày)
                    </span>
                    <span>
                      {formatPrice(service.price * calculateRentalDays())}
                    </span>
                  </div>
                ) : null;
              })}

            <div className="price-row total">
              <span>Tổng cộng</span>
              <span>{formatPrice(calculateTotalPrice())}</span>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn secondary"
            disabled={isSubmitting}
          >
            ❌ Hủy bỏ
          </button>

          <button type="submit" className="btn primary" disabled={isSubmitting}>
            {isSubmitting ? "⏳ Đang xử lý..." : "🛒 Thêm vào giỏ hàng"}
          </button>
        </div>
      </form>
    </div>
  );
}
