const stations = [
  {
    id: 's1',
    name: 'Điểm thuê Quận 1',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    coordinates: {
      lat: 10.773996,
      lng: 106.704468
    },
    location: {
      latitude: 10.773996,
      longitude: 106.704468
    },
    availableVehicles: 8,
    chargingStations: 5,
    openingHours: '07:00 - 22:00',
    contactNumber: '028-1234-5678',
    image: 'https://images.unsplash.com/photo-1599593752325-ffa41031056e?auto=format&fit=crop&w=800&q=60',
    images: {
      exterior: 'https://images.unsplash.com/photo-1599593752325-ffa41031056e?auto=format&fit=crop&w=800&q=60',
      chargers: 'https://images.unsplash.com/photo-1553815035-85d4d0a28ffc?auto=format&fit=crop&w=800&q=60',
      thumbnail: 'https://images.unsplash.com/photo-1599593752325-ffa41031056e?auto=format&fit=crop&w=400&q=60'
    },
    rating: 4.7,
    reviews: 120,
    amenities: ['Sạc điện', 'Bãi đỗ xe', 'Camera an ninh', 'Chỗ ngồi chờ']
  },
  {
    id: 's2',
    name: 'Điểm thuê Quận 3',
    address: '45 Võ Văn Tần, Quận 3, TP.HCM',
    coordinates: {
      lat: 10.779486,
      lng: 106.698777
    },
    location: {
      latitude: 10.779486,
      longitude: 106.698777
    },
    availableVehicles: 5,
    chargingStations: 3,
    openingHours: '06:30 - 21:30',
    contactNumber: '028-1234-9876',
    image: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=800&q=60',
    images: {
      exterior: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=800&q=60',
      chargers: 'https://images.unsplash.com/photo-1613741441846-9f1c304309f0?auto=format&fit=crop&w=800&q=60',
      thumbnail: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=400&q=60'
    },
    rating: 4.5,
    reviews: 85,
    amenities: ['Sạc điện', 'Camera an ninh', 'Wifi miễn phí']
  },
  {
    id: 's3',
    name: 'Điểm thuê Quận 7',
    address: '1234 Nguyễn Văn Linh, Quận 7, TP.HCM',
    coordinates: {
      lat: 10.728402,
      lng: 106.718376
    },
    location: {
      latitude: 10.728402,
      longitude: 106.718376
    },
    availableVehicles: 12,
    chargingStations: 8,
    openingHours: '07:00 - 22:00',
    contactNumber: '028-8765-4321',
    image: 'https://images.unsplash.com/photo-1574270981993-3b647123e3d1?auto=format&fit=crop&w=800&q=60',
    images: {
      exterior: 'https://images.unsplash.com/photo-1574270981993-3b647123e3d1?auto=format&fit=crop&w=800&q=60',
      chargers: 'https://images.unsplash.com/photo-1608048608144-e289807793e8?auto=format&fit=crop&w=800&q=60',
      thumbnail: 'https://images.unsplash.com/photo-1574270981993-3b647123e3d1?auto=format&fit=crop&w=400&q=60'
    },
    rating: 4.8,
    reviews: 150,
    amenities: ['Sạc điện', 'Bãi đỗ xe', 'Camera an ninh', 'Quầy nước miễn phí', 'Khu vực chờ có máy lạnh']
  },
  {
    id: 's4',
    name: 'Điểm thuê Bình Thạnh',
    address: '101 Điện Biên Phủ, Bình Thạnh, TP.HCM',
    coordinates: {
      lat: 10.796948,
      lng: 106.719265
    },
    location: {
      latitude: 10.796948,
      longitude: 106.719265
    },
    availableVehicles: 3,
    chargingStations: 2,
    openingHours: '07:30 - 21:00',
    contactNumber: '028-9876-5432',
    image: 'https://images.unsplash.com/photo-1635519183739-68adb5fb8673?auto=format&fit=crop&w=800&q=60',
    images: {
      exterior: 'https://images.unsplash.com/photo-1635519183739-68adb5fb8673?auto=format&fit=crop&w=800&q=60',
      chargers: 'https://images.unsplash.com/photo-1612699809226-c1f577269bda?auto=format&fit=crop&w=800&q=60',
      thumbnail: 'https://images.unsplash.com/photo-1635519183739-68adb5fb8673?auto=format&fit=crop&w=400&q=60'
    },
    rating: 4.2,
    reviews: 65,
    amenities: ['Sạc điện', 'Bãi đỗ xe', 'Camera an ninh']
  },
  {
    id: 's5',
    name: 'Điểm thuê Phú Nhuận',
    address: '78 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM',
    coordinates: {
      lat: 10.799602,
      lng: 106.673801
    },
    location: {
      latitude: 10.799602,
      longitude: 106.673801
    },
    availableVehicles: 7,
    chargingStations: 4,
    openingHours: '07:00 - 22:00',
    contactNumber: '028-2468-1357',
    image: 'https://images.unsplash.com/photo-1600623471616-8c1966c91ff6?auto=format&fit=crop&w=800&q=60',
    images: {
      exterior: 'https://images.unsplash.com/photo-1600623471616-8c1966c91ff6?auto=format&fit=crop&w=800&q=60',
      chargers: 'https://images.unsplash.com/photo-1553815035-85d4d0a28ffc?auto=format&fit=crop&w=800&q=60',
      thumbnail: 'https://images.unsplash.com/photo-1600623471616-8c1966c91ff6?auto=format&fit=crop&w=400&q=60'
    },
    rating: 4.6,
    reviews: 95,
    amenities: ['Sạc điện', 'Bãi đỗ xe', 'Camera an ninh', 'Khu vực chờ có máy lạnh']
  },
  {
    id: 's6',
    name: 'Điểm thuê Tân Bình',
    address: '250 Hoàng Văn Thụ, Tân Bình, TP.HCM',
    coordinates: {
      lat: 10.802468,
      lng: 106.664341
    },
    location: {
      latitude: 10.802468,
      longitude: 106.664341
    },
    availableVehicles: 9,
    chargingStations: 6,
    openingHours: '07:00 - 21:30',
    contactNumber: '028-1357-2468',
    image: 'https://images.unsplash.com/photo-1567361294252-eac218ada42e?auto=format&fit=crop&w=800&q=60',
    images: {
      exterior: 'https://images.unsplash.com/photo-1567361294252-eac218ada42e?auto=format&fit=crop&w=800&q=60',
      chargers: 'https://images.unsplash.com/photo-1613741441846-9f1c304309f0?auto=format&fit=crop&w=800&q=60',
      thumbnail: 'https://images.unsplash.com/photo-1567361294252-eac218ada42e?auto=format&fit=crop&w=400&q=60'
    },
    rating: 4.4,
    reviews: 78,
    amenities: ['Sạc điện', 'Bãi đỗ xe', 'Camera an ninh', 'Wifi miễn phí']
  }
];

export default stations;