/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Format price based on currency unit
 * @param {number} price - Price value
 * @param {string} priceUnit - Price unit (VNĐ/ngày, k/ngày, etc.)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, priceUnit = "VNĐ") => {
  // Đảm bảo price là số
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  
  // Nếu price unit không có hoặc đã là VNĐ đầy đủ, không nhân thêm
  // Chỉ nhân × 1000 nếu priceUnit rõ ràng có chữ "k" VÀ giá < 10000 (tức là đơn vị nghìn)
  let finalPrice = numPrice;
  if (priceUnit && (priceUnit.toLowerCase().includes("k") || priceUnit.toLowerCase().includes("k/")) && numPrice < 10000) {
    finalPrice = numPrice * 1000;
  }
  
  // Format number with Vietnamese locale and add VNĐ
  const formattedNumber = new Intl.NumberFormat("vi-VN").format(finalPrice);
  return `${formattedNumber} VNĐ`;
};

/**
 * Format date to locale string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale string (default: vi-VN)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = "vi-VN") => {
  return new Date(date).toLocaleDateString(locale);
};

/**
 * Format date and time to locale string
 * @param {string|Date} date - Date to format
 * @param {string} time - Time string (HH:MM)
 * @param {string} locale - Locale string (default: vi-VN)
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date, time, locale = "vi-VN") => {
  const dateStr = new Date(date).toLocaleDateString(locale);
  return `${dateStr} lúc ${time}`;
};

/**
 * Calculate rental duration in days
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} Number of days
 */
export const calculateRentalDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1; // At least 1 day
};

/**
 * Calculate total price with services
 * @param {number} basePrice - Base price per day
 * @param {number} days - Number of days
 * @param {Array} services - Array of selected service objects
 * @returns {number} Total price
 */
export const calculateTotalPrice = (basePrice, days, services = []) => {
  const rentalTotal = basePrice * days;
  const servicesTotal = services.reduce(
    (sum, service) => sum + (service.price || 0),
    0
  );
  return rentalTotal + servicesTotal;
};

/**
 * Get brand tag color based on vehicle name
 * @param {string} vehicleName - Name of the vehicle
 * @returns {object} Tag configuration {color, text}
 */
export const getBrandTag = (vehicleName) => {
  if (vehicleName.includes("VinFast")) {
    return { color: "green", text: "VinFast" };
  }
  if (vehicleName.includes("DatBike")) {
    return { color: "blue", text: "DatBike" };
  }
  if (vehicleName.includes("Tesla")) {
    return { color: "red", text: "Tesla" };
  }
  if (vehicleName.includes("Nissan")) {
    return { color: "purple", text: "Nissan" };
  }
  return { color: "default", text: "Electric" };
};

/**
 * Get status badge configuration
 * @param {string} status - Status value (available, rented, maintenance, etc.)
 * @returns {object} Badge configuration {status, text, color}
 */
export const getStatusBadge = (status) => {
  const statusMap = {
    available: { status: "success", text: "Sẵn sàng", color: "green" },
    rented: { status: "processing", text: "Đang thuê", color: "orange" },
    maintenance: { status: "default", text: "Bảo trì", color: "red" },
    confirmed: { status: "success", text: "Đã xác nhận", color: "green" },
    active: { status: "processing", text: "Đang hoạt động", color: "blue" },
    completed: { status: "success", text: "Hoàn thành", color: "green" },
    cancelled: { status: "error", text: "Đã hủy", color: "red" },
  };
  return statusMap[status] || { status: "default", text: status, color: "default" };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  const re = /^(0|\+84)[0-9]{9,10}$/;
  return re.test(phone.replace(/\s/g, ""));
};
