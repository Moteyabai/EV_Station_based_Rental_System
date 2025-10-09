const vehicles = [
  {
    id: 'v1',
    name: 'VinFast Klara S',
    price: 120000,
    priceUnit: 'VNĐ/ngày',
    short: 'Premium Electric Scooter',
    description: 'VinFast Klara S là xe máy điện thông minh với thiết kế hiện đại và công nghệ IoT tiên tiến. Pin lithium có thể tháo rời, màn hình LCD thông minh và hệ thống định vị GPS.',
    image: 'https://thegioixedien.com.vn/datafiles/setone/thumb_1693289266_1692345263_KARASavt.jpg',
    category: 'scooter',
    brand: 'VinFast',
    specs: {
      battery: '1.2 kWh (có thể tháo rời)',
      range: '60 km',
      maxSpeed: '50 km/h',
      chargingTime: '3 giờ (sạc đầy)',
      weight: '85 kg'
    },
    available: true
  },
  {
    id: 'v2',
    name: 'DatBike Weaver 200',
    price: 150000,
    priceUnit: 'VNĐ/ngày',
    short: 'High-Performance Scooter',
    description: 'DatBike Weaver 200 là xe máy điện hiệu suất cao với động cơ mạnh mẽ và thiết kế thể thao. Pin có thể hoán đổi nhanh chóng và hệ thống phanh ABS an toàn.',
    image: 'https://phoxedien.com/wp-content/uploads/2022/11/xe_m_y_i_n_datbike_tr_i_nghi_m_c_c_nh_khi_tham_gia_giao_th_ng_1.jpg',
    category: 'scooter',
    brand: 'DatBike',
    specs: {
      battery: '2.5 kWh (có thể hoán đổi)',
      range: '120 km',
      maxSpeed: '85 km/h',
      chargingTime: '4 giờ (sạc đầy)',
      weight: '95 kg'
    },
    available: true
  },
  {
    id: 'v3',
    name: 'VinFast Feliz S',
    price: 100000,
    priceUnit: 'VNĐ/ngày',
    short: 'Compact Electric Scooter',
    description: 'VinFast Feliz S là xe máy điện compact tiết kiệm với thiết kế trẻ trung và hiện đại. Phù hợp cho học sinh, sinh viên với giá thuê phải chăng và vận hành êm ái.',
    image: 'https://vinfastphunhuan.com/thumbnail/480x540x1/upload/product/xe-may-dien-vinfast-feliz-sfdb7873b-6528.jpg',
    category: 'scooter',
    brand: 'VinFast',
    specs: {
      battery: '0.9 kWh (có thể tháo rời)',
      range: '50 km',
      maxSpeed: '40 km/h',
      chargingTime: '2.5 giờ (sạc đầy)',
      weight: '75 kg'
    },
    available: true
  }
];

export default vehicles;
