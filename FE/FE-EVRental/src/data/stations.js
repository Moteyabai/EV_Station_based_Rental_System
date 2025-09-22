import { vehicleImages, stationImages } from '../assets/images/imageData';

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
      exterior: stationImages.central.exterior,
      chargers: stationImages.central.chargers,
      thumbnail: stationImages.central.thumbnail
    },
    vehicles: [
      {
        id: 'v1',
        name: 'Tesla Model 3',
        type: 'Sedan',
        batteryCapacity: '75 kWh',
        range: '350 km',
        price: 75,
        available: true,
        image: vehicleImages?.teslaModel3?.thumbnail || null
      },
      {
        id: 'v2',
        name: 'Nissan Leaf',
        type: 'Hatchback',
        batteryCapacity: '40 kWh',
        range: '240 km',
        price: 50,
        available: true,
        image: vehicleImages?.nissanLeaf?.thumbnail || null
      },
      {
        id: 'v3',
        name: 'Hyundai Kona Electric',
        type: 'SUV',
        batteryCapacity: '64 kWh',
        range: '415 km',
        price: 65,
        available: true,
        image: vehicleImages?.hyundaiKona?.thumbnail || null
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
      exterior: stationImages.riverside.exterior,
      chargers: stationImages.riverside.chargers,
      thumbnail: stationImages.riverside.thumbnail
    },
    vehicles: [
      {
        id: 'v4',
        name: 'Tesla Model Y',
        type: 'SUV',
        batteryCapacity: '82 kWh',
        range: '505 km',
        price: 85,
        available: true,
        image: vehicleImages?.teslaModelY?.thumbnail || null
      },
      {
        id: 'v5',
        name: 'BMW i4',
        type: 'Sedan',
        batteryCapacity: '83.9 kWh',
        range: '520 km',
        price: 90,
        available: true,
        image: vehicleImages?.bmwI4?.thumbnail || null
      },
      {
        id: 'v6',
        name: 'Volkswagen ID.4',
        type: 'SUV',
        batteryCapacity: '77 kWh',
        range: '400 km',
        price: 70,
        available: false,
        image: vehicleImages?.volkswagenID4?.thumbnail || null
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
      exterior: stationImages.downtown.exterior,
      chargers: stationImages.downtown.chargers,
      thumbnail: stationImages.downtown.thumbnail
    },
    vehicles: [
      {
        id: 'v7',
        name: 'Audi e-tron',
        type: 'SUV',
        batteryCapacity: '95 kWh',
        range: '360 km',
        price: 95,
        available: true,
        image: vehicleImages?.audiEtron?.thumbnail || null
      },
      {
        id: 'v8',
        name: 'Polestar 2',
        type: 'Fastback',
        batteryCapacity: '78 kWh',
        range: '400 km',
        price: 80,
        available: true,
        image: vehicleImages?.polestar2?.thumbnail || null
      },
      {
        id: 'v9',
        name: 'Kia EV6',
        type: 'Crossover',
        batteryCapacity: '77.4 kWh',
        range: '450 km',
        price: 75,
        available: true,
        image: vehicleImages?.kiaEV6?.thumbnail || null
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
      exterior: stationImages.techDistrict.exterior,
      chargers: stationImages.techDistrict.chargers,
      thumbnail: stationImages.techDistrict.thumbnail
    },
    vehicles: [
      {
        id: 'v10',
        name: 'Rivian R1T',
        type: 'Pickup Truck',
        batteryCapacity: '135 kWh',
        range: '500 km',
        price: 110,
        available: true,
        image: vehicleImages?.rivianR1T?.thumbnail || null
      },
      {
        id: 'v11',
        name: 'Lucid Air',
        type: 'Luxury Sedan',
        batteryCapacity: '112 kWh',
        range: '830 km',
        price: 130,
        available: true,
        image: vehicleImages?.lucidAir?.thumbnail || null
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
      exterior: stationImages.airport.exterior,
      chargers: stationImages.airport.chargers,
      thumbnail: stationImages.airport.thumbnail
    },
    vehicles: [
      {
        id: 'v12',
        name: 'Tesla Model S',
        type: 'Luxury Sedan',
        batteryCapacity: '100 kWh',
        range: '650 km',
        price: 120,
        available: true,
        image: vehicleImages?.teslaModelS?.thumbnail || null
      },
      {
        id: 'v13',
        name: 'Mercedes-Benz EQS',
        type: 'Luxury Sedan',
        batteryCapacity: '107.8 kWh',
        range: '770 km',
        price: 135,
        available: true,
        image: vehicleImages?.mercedesEQS?.thumbnail || null
      },
      {
        id: 'v14',
        name: 'Chevrolet Bolt EV',
        type: 'Compact',
        batteryCapacity: '65 kWh',
        range: '420 km',
        price: 60,
        available: true,
        image: vehicleImages?.chevroletBolt?.thumbnail || null
      }
    ]
  }
];

export default stations;