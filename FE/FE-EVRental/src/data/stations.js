const stations = [
  {
    id: 's1',
    name: 'Trạm EV Công Viên Tao Đàn',
    address: '123 Trương Định, Phường Bến Thành, Quận 1, TP.HCM',
    description: 'Trạm thuê xe điện lớn nhất với nhiều lựa chọn xe và trạm sạc hiện đại. Nằm gần công viên Tao Đàn, dễ dàng di chuyển đến các tuyến đường chính.',
    image: '/images/stations/station1.jpg',
    location: {
      lat: 10.773996,
      lng: 106.704468
    },
    availableVehicles: 15,
    chargingStations: 8,
    openingHours: '24/7',
    amenities: ['Nhà vệ sinh', 'Quán cà phê', 'Phòng chờ', 'WiFi miễn phí'],
    images: {
      exterior: "/images/stations/station1-exterior.jpg",
      chargers: "/images/stations/station1-chargers.jpg",
      thumbnail: "/images/stations/station1.jpg"
    },
    vehicleIds: ['v1', 'v2', 'v3'] // Chỉ lưu ID xe có sẵn tại trạm này
  },
  {
    id: 's2',
    name: 'Trạm EV Bờ Sông Sài Gòn',
    address: '456 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP.HCM',
    description: 'Vị trí đẹp bên bờ sông Sài Gòn với các lựa chọn xe điện cao cấp. Điểm khởi đầu hoàn hảo cho các chuyến đi cuối tuần.',
    image: '/images/stations/station2.jpg',
    location: {
      lat: 10.787932,
      lng: 106.705169
    },
    availableVehicles: 8,
    chargingStations: 4,
    openingHours: '7:00 - 22:00',
    amenities: ['Nhà vệ sinh', 'Cửa hàng tiện lợi', 'WiFi miễn phí'],
    images: {
      exterior: "/images/stations/station2-exterior.jpg",
      chargers: "/images/stations/station2-chargers.jpg",
      thumbnail: "/images/stations/station2.jpg"
    },
    vehicleIds: ['v1', 'v2', 'v3'] // Chỉ lưu ID xe có sẵn tại trạm này
  },
  {
    id: 's3',
    name: 'Trạm EV Trung Tâm Quận 1',
    address: '789 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    description: 'Tọa lạc tại trung tâm thành phố sầm uất. Lý tưởng cho khách du lịch công tác và người khám phá đô thị.',
    image: '/images/stations/station3.jpg',
    location: {
      lat: 10.774929,
      lng: 106.701736
    },
    availableVehicles: 12,
    chargingStations: 6,
    openingHours: '6:00 - 24:00',
    amenities: ['Nhà vệ sinh', 'Trung tâm dịch vụ', 'Quán cà phê', 'WiFi miễn phí'],
    images: {
      exterior: "/images/stations/station3-exterior.jpg",
      chargers: "/images/stations/station3-chargers.jpg", 
      thumbnail: "/images/stations/station3.jpg"
    },
    vehicleIds: ['v1', 'v2', 'v3'] // Chỉ lưu ID xe có sẵn tại trạm này
  },
  {
    id: 's4',
    name: 'Trạm EV Khu Công Nghệ Cao',
    address: '101 Đường D1, Khu Công Nghệ Cao, Quận 9, TP.HCM',
    description: 'Tọa lạc tại trung tâm khu công nghệ cao, với các mẫu xe điện mới nhất và công nghệ sạc tiên tiến.',
    image: '/images/stations/station4.jpg',
    location: {
      lat: 10.850799,
      lng: 106.762587
    },
    availableVehicles: 10,
    chargingStations: 8,
    openingHours: '24/7',
    amenities: ['Nhà vệ sinh', 'Không gian làm việc chung', 'Quầy cà phê', 'WiFi miễn phí'],
    images: {
      exterior: "/images/stations/station4-exterior.jpg",
      chargers: "/images/stations/station4-chargers.jpg",
      thumbnail: "/images/stations/station4.jpg"
    },
    vehicleIds: ['v1', 'v2'] // Chỉ lưu ID xe có sẵn tại trạm này
  },
  {
    id: 's5',
    name: 'Trạm EV Sân Bay Tân Sơn Nhất',
    address: '200 Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM',
    description: 'Vị trí thuận tiện gần sân bay cho khách du lịch cần phương tiện di chuyển ngay lập tức.',
    image: '/images/stations/station5.jpg',
    location: {
      lat: 10.818463,
      lng: 106.658676
    },
    availableVehicles: 20,
    chargingStations: 10,
    openingHours: '24/7',
    amenities: ['Nhà vệ sinh', 'Lưu trữ hành lý', 'Dịch vụ đưa đón', 'WiFi miễn phí'],
    images: {
      exterior: "/images/stations/station5-exterior.jpg",
      chargers: "/images/stations/station5-chargers.jpg",
      thumbnail: "/images/stations/station5.jpg"
    },
    vehicleIds: ['v1', 'v2', 'v3'] // Chỉ lưu ID xe có sẵn tại trạm này
  }
];

export default stations;
