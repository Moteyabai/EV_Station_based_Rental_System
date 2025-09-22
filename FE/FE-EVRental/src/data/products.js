import { vehicleImages } from '../assets/images/imageData';

const products = [
  {
    id: 'p1',
    name: 'Tesla Model 3',
    price: 75,
    priceUnit: 'per day',
    short: 'Luxury & Performance',
    description: 'The Tesla Model 3 is an electric four-door sedan with minimalist design and cutting-edge technology. Features include Autopilot capability, a 15-inch touchscreen, and up to 358 miles of range.',
    image: vehicleImages.teslaModel3.thumbnail,
    images: [
      vehicleImages.teslaModel3.front,
      vehicleImages.teslaModel3.back,
      vehicleImages.teslaModel3.interior
    ],
    specs: {
      range: '358 miles',
      acceleration: '0-60 mph in 3.1s',
      topSpeed: '162 mph',
      batteryCapacity: '82 kWh',
      seating: 5,
      chargingTime: '15 min for 175 miles (Supercharger)'
    },
    features: ['Autopilot', 'Glass Roof', '15" Touchscreen', 'Premium Sound System', 'Heated Seats']
  },
  {
    id: 'p2',
    name: 'Nissan Leaf',
    price: 50,
    priceUnit: 'per day',
    short: 'Economical & Reliable',
    description: 'The Nissan Leaf is a compact five-door hatchback electric car known for its reliability and efficiency. Perfect for city driving with zero emissions and low operating costs.',
    image: vehicleImages.nissanLeaf.thumbnail,
    images: [
      vehicleImages.nissanLeaf.front,
      vehicleImages.nissanLeaf.back,
      vehicleImages.nissanLeaf.interior
    ],
    specs: {
      range: '226 miles',
      acceleration: '0-60 mph in 7.4s',
      topSpeed: '90 mph',
      batteryCapacity: '62 kWh',
      seating: 5,
      chargingTime: '40 min for 80% (Fast Charger)'
    },
    features: ['e-Pedal', 'ProPILOT Assist', 'Smartphone Integration', 'Heated Seats & Steering Wheel', 'Bose Premium Audio']
  },
  {
    id: 'p3',
    name: 'Chevrolet Bolt',
    price: 55,
    priceUnit: 'per day',
    short: 'Versatile & Spacious',
    description: 'The Chevrolet Bolt EV combines practicality with electric efficiency in a compact crossover design. Offering impressive range and cargo space for versatile daily use.',
    image: vehicleImages.chevroletBolt.thumbnail,
    images: [
      vehicleImages.chevroletBolt.front,
      vehicleImages.chevroletBolt.back,
      vehicleImages.chevroletBolt.interior
    ],
    specs: {
      range: '259 miles',
      acceleration: '0-60 mph in 6.5s',
      topSpeed: '93 mph',
      batteryCapacity: '66 kWh',
      seating: 5,
      chargingTime: '30 min for 100 miles (DC Fast Charge)'
    },
    features: ['One-Pedal Driving', '10.2" Touchscreen', 'Apple CarPlay & Android Auto', 'Regen On Demand', 'HD Surround Vision']
  },
  {
    id: 'p4',
    name: 'Audi e-tron',
    price: 95,
    priceUnit: 'per day',
    short: 'Luxury SUV & Comfort',
    description: 'The Audi e-tron is a premium all-electric SUV combining luxury, performance and cutting-edge technology. Featuring Quattro all-wheel drive and exceptional interior quality.',
    image: vehicleImages.audiEtron.thumbnail,
    images: [
      vehicleImages.audiEtron.front,
      vehicleImages.audiEtron.back,
      vehicleImages.audiEtron.interior
    ],
    specs: {
      range: '222 miles',
      acceleration: '0-60 mph in 5.5s',
      topSpeed: '124 mph',
      batteryCapacity: '95 kWh',
      seating: 5,
      chargingTime: '30 min for 80% (150kW DC Charging)'
    },
    features: ['Quattro All-Wheel Drive', 'MMI Touch Response System', 'Virtual Cockpit', 'Bang & Olufsen Sound', 'Adaptive Air Suspension']
  },
  {
    id: 'p5',
    name: 'Hyundai Kona Electric',
    price: 60,
    priceUnit: 'per day',
    short: 'Efficient & Practical',
    description: 'The Hyundai Kona Electric is a compact SUV with impressive range and modern amenities. Perfect for both urban commuting and weekend getaways with zero emissions.',
    image: vehicleImages.hyundaiKona.thumbnail,
    images: [
      vehicleImages.hyundaiKona.front,
      vehicleImages.hyundaiKona.back,
      vehicleImages.hyundaiKona.interior
    ],
    specs: {
      range: '258 miles',
      acceleration: '0-60 mph in 6.4s',
      topSpeed: '104 mph',
      batteryCapacity: '64 kWh',
      seating: 5,
      chargingTime: '54 min for 80% (100kW DC Fast Charging)'
    },
    features: ['Heated & Ventilated Seats', '10.25" Touchscreen', 'Blind-Spot Collision Warning', 'Smart Cruise Control', 'Lane Following Assist']
  },
  {
    id: 'p6',
    name: 'VinFast Klara S',
    price: 100000,
    priceUnit: 'VND per day',
    short: 'Stylish & Affordable',
    description: 'The VinFast Klara S is a stylish electric scooter with modern design and impressive range. Perfect for urban commuting with zero emissions and low operating costs.',
    image: 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwfa20426f/images/klaras/klaras-banner.png',
    images: [
      'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwcd3a4e66/images/klaras/KlaraS-blue.png',
      'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw6a2d3f48/images/klaras/KlaraS-red.png',
      'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw61b9ca76/images/klaras/KlaraS-white.png'
    ],
    specs: {
      range: '90 km',
      acceleration: '0-50 km/h in 6s',
      topSpeed: '60 km/h',
      batteryCapacity: '1.8 kWh',
      seating: 2,
      chargingTime: '4 hours for 100%'
    },
    features: ['LED Lights', 'Digital Dashboard', 'Smartphone Integration', 'Lightweight Frame', 'USB Charging Port']
  },
  {
    id: 'p7',
    name: 'VinFast Theon S',
    price: 120000,
    priceUnit: 'VND per day',
    short: 'Power & Elegance',
    description: 'The VinFast Theon S is a high-performance electric scooter with premium features and superior build quality. Ideal for both city commuting and longer trips.',
    image: 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw89d0f2a4/images/theons/theons-banner.png',
    images: [
      'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw91e75100/images/theons/TheonS-blue.png',
      'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw39ab82d7/images/theons/TheonS-red.png',
      'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw7e35c1b5/images/theons/TheonS-gray.png'
    ],
    specs: {
      range: '100 km',
      acceleration: '0-50 km/h in 5s',
      topSpeed: '90 km/h',
      batteryCapacity: '2.5 kWh',
      seating: 2,
      chargingTime: '3 hours for 100%'
    },
    features: ['ABS System', 'Smart Key', 'Full LED Lighting', 'Color LCD Display', 'Multiple Riding Modes']
  },
  {
    id: 'p8',
    name: 'Datbike Weaver',
    price: 110000,
    priceUnit: 'VND per day',
    short: 'Modern & Reliable',
    description: 'The Datbike Weaver is a modern electric scooter designed and manufactured in Vietnam. With a sleek design and reliable performance, it\'s perfect for daily commuting.',
    image: vehicleImages.datbikeWeaver.thumbnail,
    images: [
      vehicleImages.datbikeWeaver.front,
      vehicleImages.datbikeWeaver.back,
      vehicleImages.datbikeWeaver.interior
    ],
    specs: {
      range: '80 km',
      acceleration: '0-50 km/h in 7s',
      topSpeed: '55 km/h',
      batteryCapacity: '1.7 kWh',
      seating: 2,
      chargingTime: '4.5 hours for 100%'
    },
    features: ['LED Display', 'Disc Brakes', 'USB Charging', 'App Connectivity', 'Keyless Start']
  },
  {
    id: 'p9',
    name: 'Datbike Weaver 200',
    price: 150000,
    priceUnit: 'VND per day',
    short: 'Premium & Powerful',
    description: 'The Datbike Weaver 200 is the premium version of the Weaver with enhanced performance and features. Its powerful motor and extended range make it suitable for longer trips.',
    image: vehicleImages.datbikeWeaver200.thumbnail,
    images: [
      vehicleImages.datbikeWeaver200.front,
      vehicleImages.datbikeWeaver200.back,
      vehicleImages.datbikeWeaver200.interior
    ],
    specs: {
      range: '120 km',
      acceleration: '0-50 km/h in 5.5s',
      topSpeed: '75 km/h',
      batteryCapacity: '2.2 kWh',
      seating: 2,
      chargingTime: '3.5 hours for 100%'
    },
    features: ['Enhanced Motor', 'Advanced Display', 'Dual Disc Brakes', 'Smart Connectivity', 'Premium Seat']
  }
];

export default products;
