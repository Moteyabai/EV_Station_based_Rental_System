// Mock booking data - Simulated data for development
export const mockBookings = {
  'BK100001': {
    id: 'BK100001',
    vehicleName: 'Tesla Model 3',
    vehicleType: 'Sedan',
    stationName: 'Trạm EV Công Viên Tao Đàn',
    pickupDate: '2025-09-22',
    pickupTime: '10:00',
    returnDate: '2025-09-24',
    returnTime: '18:00',
    status: 'confirmed',
    price: 225, // $75/day for 3 days
    initialOdometer: 12450,
    finalOdometer: 12780,
    distanceTraveled: 330,
    initialBatteryLevel: 95,
    finalBatteryLevel: 45,
    additionalServices: ['insurance', 'gps']
  },
  'BK100002': {
    id: 'BK100002',
    vehicleName: 'Nissan Leaf',
    vehicleType: 'Hatchback',
    stationName: 'Trạm EV Bờ Sông Sài Gòn',
    pickupDate: '2025-09-25',
    pickupTime: '09:30',
    returnDate: '2025-09-26',
    returnTime: '17:00',
    status: 'active',
    price: 100, // $50/day for 2 days
    initialOdometer: 8950,
    finalOdometer: 9125,
    distanceTraveled: 175,
    initialBatteryLevel: 85,
    finalBatteryLevel: 62,
    additionalServices: []
  }
};

// Service options for booking
export const serviceOptions = [
  {
    id: "insurance",
    name: "Bảo hiểm mở rộng",
    price: 50000,
    description: "Bảo hiểm toàn diện cho xe và hành khách",
  },
  {
    id: "gps",
    name: "Thiết bị định vị GPS",
    price: 30000,
    description: "Hỗ trợ dẫn đường và theo dõi hành trình",
  },
  {
    id: "childSeat",
    name: "Ghế trẻ em",
    price: 20000,
    description: "Ghế an toàn cho trẻ em dưới 10 tuổi",
  },
  {
    id: "wifi",
    name: "Bộ phát WiFi di động",
    price: 40000,
    description: "Kết nối internet tốc độ cao",
  },
  {
    id: "extraDriver",
    name: "Tài xế phụ",
    price: 100000,
    description: "Thêm tài xế phụ được ủy quyền",
  },
];

// Mock stations data for booking form
export const mockStations = [
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

// Mock rental history
export const mockRentalHistory = [
  {
    id: 'BK100001',
    vehicleName: 'Tesla Model 3',
    vehicleType: 'Sedan',
    stationName: 'Trạm EV Công viên Trung tâm',
    pickupDate: '2025-08-15',
    pickupTime: '10:00',
    returnDate: '2025-08-17',
    returnTime: '18:00',
    status: 'completed',
    totalAmount: 225,
    distanceTraveled: 320,
    avgBatteryUsage: 28
  },
  {
    id: 'BK100002',
    vehicleName: 'Nissan Leaf',
    vehicleType: 'Hatchback',
    stationName: 'Trạm EV Khu Thương mại',
    pickupDate: '2025-09-01',
    pickupTime: '09:00',
    returnDate: '2025-09-03',
    returnTime: '17:00',
    status: 'completed',
    totalAmount: 150,
    distanceTraveled: 245,
    avgBatteryUsage: 32
  },
  {
    id: 'BK100003',
    vehicleName: 'Chevrolet Bolt',
    vehicleType: 'Hatchback',
    stationName: 'Trạm EV Ga Metro',
    pickupDate: '2025-09-10',
    pickupTime: '14:00',
    returnDate: '2025-09-11',
    returnTime: '14:00',
    status: 'completed',
    totalAmount: 75,
    distanceTraveled: 85,
    avgBatteryUsage: 25
  }
];
