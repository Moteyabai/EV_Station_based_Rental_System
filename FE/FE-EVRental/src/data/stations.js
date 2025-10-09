const stations = [
  {
    id: 's1',
    name: 'Trạm EV Công Viên Tao Đàn',
    address: '123 Trương Định, Phường Bến Thành, Quận 1, TP.HCM',
    description: 'Trạm thuê xe điện lớn nhất với nhiều lựa chọn xe và trạm sạc hiện đại. Nằm gần công viên Tao Đàn, dễ dàng di chuyển đến các tuyến đường chính.',
    location: {
      lat: 10.773996,
      lng: 106.704468
    },
    availableVehicles: 15,
    chargingStations: 8,
    openingHours: '24/7',
    amenities: ['Nhà vệ sinh', 'Quán cà phê', 'Phòng chờ', 'WiFi miễn phí'],
    images: {
      exterior: "https://images.unsplash.com/photo-1593941707285-aae966bad0cf?auto=format&fit=crop&w=800&q=60",
      chargers: "https://images.unsplash.com/photo-1635418421745-5e29b738d8e6?auto=format&fit=crop&w=800&q=60",
      thumbnail: "https://images.unsplash.com/photo-1647531257138-ff6ce2547643?auto=format&fit=crop&w=800&q=60"
    },
    vehicles: [
      {
        id: 'v1',
        name: 'VinFast Klara S',
        type: 'Xe máy điện cao cấp',
        batteryCapacity: '1.2 kWh',
        range: '60 km',
        price: 120,
        available: true,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 'v2',
        name: 'DatBike Weaver 200',
        type: 'Xe máy điện thể thao',
        batteryCapacity: '2.5 kWh',
        range: '120 km',
        price: 150,
        available: true,
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 'v3',
        name: 'VinFast Feliz S',
        type: 'Xe máy điện nhỏ gọn',
        batteryCapacity: '0.9 kWh',
        range: '50 km',
        price: 100,
        available: true,
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=60"
      }
    ]
  },
  {
    id: 's2',
    name: 'Trạm EV Bờ Sông Sài Gòn',
    address: '456 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP.HCM',
    description: 'Vị trí đẹp bên bờ sông Sài Gòn với các lựa chọn xe điện cao cấp. Điểm khởi đầu hoàn hảo cho các chuyến đi cuối tuần.',
    location: {
      lat: 10.787932,
      lng: 106.705169
    },
    availableVehicles: 8,
    chargingStations: 4,
    openingHours: '7:00 - 22:00',
    amenities: ['Nhà vệ sinh', 'Cửa hàng tiện lợi', 'WiFi miễn phí'],
    images: {
      exterior: "https://images.unsplash.com/photo-1594818379496-da1e345b812a?auto=format&fit=crop&w=800&q=60",
      chargers: "https://images.unsplash.com/photo-1637596331299-aa86e822f7bb?auto=format&fit=crop&w=800&q=60",
      thumbnail: "https://images.unsplash.com/photo-1683009427479-c7e36bbb7bca?auto=format&fit=crop&w=800&q=60"
    },
    vehicles: [
      {
        id: 'v1',
        name: 'VinFast Klara S',
        type: 'Xe máy điện cao cấp',
        batteryCapacity: '1.2 kWh',
        range: '60 km',
        price: 120,
        available: true,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 'v2',
        name: 'DatBike Weaver 200',
        type: 'Xe máy điện thể thao',
        batteryCapacity: '2.5 kWh',
        range: '120 km',
        price: 150,
        available: true,
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 'v3',
        name: 'VinFast Feliz S',
        type: 'Xe máy điện nhỏ gọn',
        batteryCapacity: '0.9 kWh',
        range: '50 km',
        price: 100,
        available: true,
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=60'
      }
    ]
  },
  {
    id: 's3',
    name: 'Trạm EV Trung Tâm Quận 1',
    address: '789 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    description: 'Tọa lạc tại trung tâm thành phố sầm uất. Lý tưởng cho khách du lịch công tác và người khám phá đô thị.',
    location: {
      lat: 10.774929,
      lng: 106.701736
    },
    availableVehicles: 12,
    chargingStations: 6,
    openingHours: '6:00 - 24:00',
    amenities: ['Nhà vệ sinh', 'Trung tâm dịch vụ', 'Quán cà phê', 'WiFi miễn phí'],
    images: {
      exterior: "https://images.unsplash.com/photo-1593941707882-a5bfb6f5343d?auto=format&fit=crop&w=800&q=60",
      chargers: "https://images.unsplash.com/photo-1662982592268-5b1f19359b99?auto=format&fit=crop&w=800&q=60", 
      thumbnail: "https://images.unsplash.com/photo-1647531257173-8c74b4c0093b?auto=format&fit=crop&w=800&q=60"
    },
    vehicles: [
      {
        id: 'v1',
        name: 'VinFast Klara S',
        type: 'Xe máy điện cao cấp',
        batteryCapacity: '1.2 kWh',
        range: '60 km',
        price: 120,
        available: true,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 'v2',
        name: 'DatBike Weaver 200',
        type: 'Xe máy điện thể thao',
        batteryCapacity: '2.5 kWh',
        range: '120 km',
        price: 150,
        available: true,
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 'v3',
        name: 'VinFast Feliz S',
        type: 'Xe máy điện nhỏ gọn',
        batteryCapacity: '0.9 kWh',
        range: '50 km',
        price: 100,
        available: true,
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=60'
      }
    ]
  },
  {
    id: 's4',
    name: 'Trạm EV Khu Công Nghệ Cao',
    address: '101 Đường D1, Khu Công Nghệ Cao, Quận 9, TP.HCM',
    description: 'Tọa lạc tại trung tâm khu công nghệ cao, với các mẫu xe điện mới nhất và công nghệ sạc tiên tiến.',
    location: {
      lat: 10.850799,
      lng: 106.762587
    },
    availableVehicles: 10,
    chargingStations: 8,
    openingHours: '24/7',
    amenities: ['Nhà vệ sinh', 'Không gian làm việc chung', 'Quầy cà phê', 'WiFi miễn phí'],
    images: {
      exterior: "https://images.unsplash.com/photo-1635769398371-78d717a1c06b?auto=format&fit=crop&w=800&q=60",
      chargers: "https://images.unsplash.com/photo-1580275266003-bfb5703a0376?auto=format&fit=crop&w=800&q=60",
      thumbnail: "https://images.unsplash.com/photo-1605627079912-97c3810a11a9?auto=format&fit=crop&w=800&q=60"
    },
    vehicles: [
      {
        id: 'v1',
        name: 'VinFast Klara S',
        type: 'Xe máy điện cao cấp',
        batteryCapacity: '1.2 kWh',
        range: '60 km',
        price: 120,
        available: true,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 'v2',
        name: 'DatBike Weaver 200',
        type: 'Xe máy điện thể thao',
        batteryCapacity: '2.5 kWh',
        range: '120 km',
        price: 150,
        available: true,
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=60'
      }
    ]
  },
  {
    id: 's5',
    name: 'Trạm EV Sân Bay Tân Sơn Nhất',
    address: '200 Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM',
    description: 'Vị trí thuận tiện gần sân bay cho khách du lịch cần phương tiện di chuyển ngay lập tức.',
    location: {
      lat: 10.818463,
      lng: 106.658676
    },
    availableVehicles: 20,
    chargingStations: 10,
    openingHours: '24/7',
    amenities: ['Nhà vệ sinh', 'Lưu trữ hành lý', 'Dịch vụ đưa đón', 'WiFi miễn phí'],
    images: {
      exterior: "https://images.unsplash.com/photo-1620494697507-606467e30056?auto=format&fit=crop&w=800&q=60",
      chargers: "https://images.unsplash.com/photo-1591770184880-0adc4b59a381?auto=format&fit=crop&w=800&q=60",
      thumbnail: "https://images.unsplash.com/photo-1635053419037-c3f6dab301b9?auto=format&fit=crop&w=800&q=60"
    },
    vehicles: [
      {
        id: 'v1',
        name: 'VinFast Klara S',
        type: 'Xe máy điện cao cấp',
        batteryCapacity: '1.2 kWh',
        range: '60 km',
        price: 120,
        available: true,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 'v2',
        name: 'DatBike Weaver 200',
        type: 'Xe máy điện thể thao',
        batteryCapacity: '2.5 kWh',
        range: '120 km',
        price: 150,
        available: true,
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 'v3',
        name: 'VinFast Feliz S',
        type: 'Xe máy điện nhỏ gọn',
        batteryCapacity: '0.9 kWh',
        range: '50 km',
        price: 100,
        available: true,
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=60'
      }
    ]
  }
];

export default stations;
