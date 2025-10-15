// File này chứa data giả để test hệ thống booking
// Chạy hàm initSampleBookings() trong console để khởi tạo dữ liệu mẫu

import { saveBooking } from './bookingStorage';

/**
 * Dữ liệu booking mẫu
 */
export const sampleBookings = [
  {
    userId: 'user001@email.com',
    userEmail: 'user001@email.com',
    userName: 'Nguyễn Văn A',
    userPhone: '0901234567',
    vehicleName: 'VinFast Klara S',
    vehicleId: 'v1',
    licensePlate: '59A-12345',
    vehicleImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=60',
    pickupDate: '2025-10-16',
    returnDate: '2025-10-18',
    pickupTime: '09:00',
    returnTime: '18:00',
    pickupStation: {
      id: 's1',
      name: 'Trạm EV Công Viên Tao Đàn',
      address: '123 Trương Định, Phường Bến Thành, Quận 1, TP.HCM'
    },
    returnStation: {
      id: 's1',
      name: 'Trạm EV Công Viên Tao Đàn',
      address: '123 Trương Định, Phường Bến Thành, Quận 1, TP.HCM'
    },
    days: 2,
    totalPrice: 240000,
    additionalServices: {
      insurance: true,
      gps: false,
      childSeat: false,
      wifi: false,
      extraDriver: false
    },
    paymentMethod: 'credit_card',
    battery: '100%',
    lastCheck: new Date().toISOString(),
  },
  {
    userId: 'user002@email.com',
    userEmail: 'user002@email.com',
    userName: 'Trần Thị B',
    userPhone: '0912345678',
    vehicleName: 'DatBike Weaver 200',
    vehicleId: 'v2',
    licensePlate: '59B-67890',
    vehicleImage: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=60',
    pickupDate: '2025-10-15',
    returnDate: '2025-10-17',
    pickupTime: '08:00',
    returnTime: '17:00',
    pickupStation: {
      id: 's2',
      name: 'Trạm EV Phú Mỹ Hưng',
      address: '456 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM'
    },
    returnStation: {
      id: 's2',
      name: 'Trạm EV Phú Mỹ Hưng',
      address: '456 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM'
    },
    days: 2,
    totalPrice: 180000,
    additionalServices: {
      insurance: false,
      gps: true,
      childSeat: false,
      wifi: true,
      extraDriver: false
    },
    paymentMethod: 'e_wallet',
    battery: '98%',
    lastCheck: new Date().toISOString(),
  },
  {
    userId: 'user003@email.com',
    userEmail: 'user003@email.com',
    userName: 'Lê Văn C',
    userPhone: '0923456789',
    vehicleName: 'VinFast Feliz S',
    vehicleId: 'v3',
    licensePlate: '59C-11111',
    vehicleImage: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=60',
    pickupDate: '2025-10-17',
    returnDate: '2025-10-20',
    pickupTime: '10:00',
    returnTime: '16:00',
    pickupStation: {
      id: 's3',
      name: 'Trạm EV Sân Bay Tân Sơn Nhất',
      address: '789 Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM'
    },
    returnStation: {
      id: 's3',
      name: 'Trạm EV Sân Bay Tân Sơn Nhất',
      address: '789 Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM'
    },
    days: 3,
    totalPrice: 300000,
    additionalServices: {
      insurance: true,
      gps: true,
      childSeat: true,
      wifi: false,
      extraDriver: true
    },
    paymentMethod: 'bank_transfer',
    battery: '95%',
    lastCheck: new Date().toISOString(),
  },
];

/**
 * Hàm khởi tạo dữ liệu booking mẫu
 * Sử dụng: Gọi initSampleBookings() trong console để tạo data test
 */
export const initSampleBookings = () => {
  try {
    console.log('🔄 Đang khởi tạo dữ liệu booking mẫu...');
    
    sampleBookings.forEach((booking, index) => {
      saveBooking(booking);
      console.log(`✅ Đã tạo booking ${index + 1}/${sampleBookings.length}: ${booking.bookingId}`);
    });
    
    console.log('✨ Hoàn tất khởi tạo dữ liệu mẫu!');
    console.log('📋 Truy cập trang Staff để xem các booking mới');
    
    return {
      success: true,
      message: `Đã tạo ${sampleBookings.length} booking mẫu thành công`,
      count: sampleBookings.length
    };
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo dữ liệu mẫu:', error);
    return {
      success: false,
      message: error.message,
      count: 0
    };
  }
};

// Export để có thể sử dụng trong console
if (typeof window !== 'undefined') {
  window.initSampleBookings = initSampleBookings;
  console.log('💡 Tip: Gọi window.initSampleBookings() để tạo dữ liệu booking mẫu');
}
