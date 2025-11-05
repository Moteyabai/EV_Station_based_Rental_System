import vehicles from "../data/vehicles";

/**
 * Lấy thông tin đầy đủ của xe từ vehicleId
 * @param {string} vehicleId - ID của xe
 * @returns {object|null} - Thông tin xe hoặc null nếu không tìm thấy
 */
export const getVehicleById = (vehicleId) => {
  return vehicles.find((v) => v.id === vehicleId) || null;
};

/**
 * Lấy danh sách xe đầy đủ từ danh sách vehicleIds
 * @param {Array<string>} vehicleIds - Mảng ID xe
 * @returns {Array<object>} - Mảng thông tin xe đầy đủ
 */
export const getVehiclesByIds = (vehicleIds) => {
  if (!vehicleIds || !Array.isArray(vehicleIds)) {
    return [];
  }
  
  return vehicleIds
    .map((id) => getVehicleById(id))
    .filter((vehicle) => vehicle !== null);
};

/**
 * Lấy danh sách xe có sẵn tại trạm
 * @param {object} station - Thông tin trạm
 * @returns {Array<object>} - Mảng xe có available = true
 */
export const getAvailableVehiclesAtStation = (station) => {
  if (!station || !station.vehicleIds) {
    return [];
  }
  
  const stationVehicles = getVehiclesByIds(station.vehicleIds);
  return stationVehicles.filter((vehicle) => vehicle.available);
};

/**
 * Format vehicle data để hiển thị trong StationDetail
 * Chuyển đổi từ format trong vehicles.js sang format cũ
 * @param {object} vehicle - Vehicle object từ vehicles.js
 * @returns {object} - Vehicle object với format cũ
 */
export const formatVehicleForStation = (vehicle) => {
  if (!vehicle) return null;
  
  return {
    id: vehicle.id,
    name: vehicle.name,
    type: vehicle.short, // Dùng 'short' làm type
    batteryCapacity: vehicle.specs?.battery || 'N/A',
    range: vehicle.specs?.range || 'N/A',
    price: vehicle.price / 1000, // Convert từ VNĐ sang k (120000 -> 120)
    available: vehicle.available,
    image: vehicle.image
  };
};

/**
 * Format nhiều vehicles cho station
 * @param {Array<string>} vehicleIds - Mảng ID xe
 * @returns {Array<object>} - Mảng xe với format cũ
 */
export const formatVehiclesForStation = (vehicleIds) => {
  return getVehiclesByIds(vehicleIds)
    .map(formatVehicleForStation)
    .filter((v) => v !== null);
};
