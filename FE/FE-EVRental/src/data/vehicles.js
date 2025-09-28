const vehicles = [
  {
    id: 'v1',
    name: 'VinFast Klara S',
    price: 50,
    priceUnit: 'k/ngày',
    short: 'Premium Electric Scooter',
    description: 'VinFast Klara S là xe máy điện thông minh với thiết kế hiện đại và công nghệ IoT tiên tiến. Pin lithium có thể tháo rời, màn hình LCD thông minh và hệ thống định vị GPS.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60',
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
    price: 65,
    priceUnit: 'k/ngày',
    short: 'High-Performance Scooter',
    description: 'DatBike Weaver 200 là xe máy điện hiệu suất cao với động cơ mạnh mẽ và thiết kế thể thao. Pin có thể hoán đổi nhanh chóng và hệ thống phanh ABS an toàn.',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=60',
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
    price: 40,
    priceUnit: 'k/ngày',
    short: 'Compact Electric Scooter',
    description: 'VinFast Feliz S là xe máy điện compact tiết kiệm với thiết kế trẻ trung và hiện đại. Phù hợp cho học sinh, sinh viên với giá thuê phải chăng và vận hành êm ái.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=60',
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