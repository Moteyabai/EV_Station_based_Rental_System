const stations = [
  {
    id: 's1',
    name: 'Central Park EV Station',
    address: '123 Park Avenue, City Center, 10001',
    description: 'Our flagship station with the largest selection of EVs and charging facilities. Located near Central Park with easy access to major highways.',
    location: {
      lat: 40.785091,
      lng: -73.968285
    },
    availableVehicles: 15,
    chargingStations: 8,
    openingHours: '24/7',
    amenities: ['Restrooms', 'Cafe', 'Waiting Lounge', 'WiFi'],
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
    name: 'Riverside EV Hub',
    address: '456 Riverside Drive, Waterfront District, 10002',
    description: 'Scenic location by the river with premium EV options. Perfect starting point for weekend getaways.',
    location: {
      lat: 40.803749,
      lng: -73.947253
    },
    availableVehicles: 8,
    chargingStations: 4,
    openingHours: '7:00 AM - 10:00 PM',
    amenities: ['Restrooms', 'Convenience Store', 'WiFi'],
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
    name: 'Downtown EV Center',
    address: '789 Main Street, Downtown, 10003',
    description: 'Conveniently located in the heart of downtown. Perfect for business travelers and city explorers.',
    location: {
      lat: 40.712776,
      lng: -74.005974
    },
    availableVehicles: 12,
    chargingStations: 6,
    openingHours: '6:00 AM - 12:00 AM',
    amenities: ['Restrooms', 'Business Center', 'Coffee Shop', 'WiFi'],
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
    name: 'Tech District Station',
    address: '101 Innovation Way, Tech District, 10004',
    description: 'Located in the heart of the tech district, with the latest EV models and cutting-edge charging technology.',
    location: {
      lat: 40.741895,
      lng: -73.989308
    },
    availableVehicles: 10,
    chargingStations: 8,
    openingHours: '24/7',
    amenities: ['Restrooms', 'Coworking Space', 'Coffee Bar', 'WiFi'],
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
    name: 'Airport EV Terminal',
    address: '200 Airport Road, Airport District, 10005',
    description: 'Conveniently located near the airport for travelers needing immediate transportation.',
    location: {
      lat: 40.641312,
      lng: -73.778137
    },
    availableVehicles: 20,
    chargingStations: 10,
    openingHours: '24/7',
    amenities: ['Restrooms', 'Luggage Storage', 'Shuttle Service', 'WiFi'],
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
