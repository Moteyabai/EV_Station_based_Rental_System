# Hệ Thống Quản Lý Booking EV Rental

## Tổng Quan

Hệ thống quản lý booking cho phép:

- **Khách hàng (User)**: Đặt xe, thanh toán và lưu booking vào localStorage
- **Nhân viên (Staff)**: Xem và quản lý các booking, cập nhật trạng thái giao nhận xe

## Luồng Hoạt Động

### 1. Khách Hàng Đặt Xe

```
User chọn xe → Thêm vào giỏ hàng → Thanh toán
→ Booking được lưu vào localStorage
→ Booking hiển thị ở trang Staff
```

### 2. Nhân Viên Xử Lý

```
Staff xem danh sách booking → Xác nhận bàn giao xe
→ Status: booked → renting → completed
```

## Cấu Trúc Dữ Liệu

### Booking Object

```javascript
{
  id: 'BK1729123456789-1',           // Unique booking ID
  userId: 'user@email.com',          // User ID/Email
  userEmail: 'user@email.com',       // Email khách hàng
  userName: 'Nguyễn Văn A',          // Tên khách hàng
  userPhone: '0901234567',           // SĐT khách hàng
  vehicleName: 'VinFast Klara S',    // Tên xe
  vehicleId: 'v1',                   // ID xe
  licensePlate: '59A-12345',         // Biển số xe
  vehicleImage: 'https://...',       // Ảnh xe
  pickupDate: '2025-10-16',          // Ngày nhận xe
  returnDate: '2025-10-18',          // Ngày trả xe
  pickupTime: '09:00',               // Giờ nhận xe
  returnTime: '18:00',               // Giờ trả xe
  pickupStation: {                   // Điểm nhận xe
    id: 's1',
    name: 'Trạm EV Công Viên Tao Đàn',
    address: '...'
  },
  returnStation: {...},              // Điểm trả xe
  days: 2,                           // Số ngày thuê
  totalPrice: 240000,                // Tổng tiền
  additionalServices: {...},         // Dịch vụ bổ sung
  paymentMethod: 'credit_card',      // Phương thức thanh toán
  battery: '100%',                   // Mức pin
  status: 'booked',                  // Trạng thái
  createdAt: '2025-10-15T10:00:00Z', // Thời gian tạo
  lastCheck: '2025-10-15T10:00:00Z'  // Lần kiểm tra cuối
}
```

### Booking Status

- **booked**: Đã đặt xe (chờ nhận xe)
- **renting**: Đang cho thuê (đã giao xe)
- **completed**: Đã hoàn thành (đã trả xe)
- **cancelled**: Đã hủy

## API Functions

### bookingStorage.js

```javascript
// Lưu booking mới
saveBooking(bookingData);

// Lấy tất cả bookings
getAllBookings();

// Lấy bookings theo user
getBookingsByUser(userId);

// Lấy bookings theo trạng thái
getBookingsByStatus(status);

// Lấy booking theo ID
getBookingById(bookingId);

// Cập nhật trạng thái booking
updateBookingStatus(bookingId, newStatus);

// Xóa booking
deleteBooking(bookingId);

// Xóa tất cả bookings
clearAllBookings();
```

## Sử Dụng

### Tạo Dữ Liệu Mẫu

Để test hệ thống, mở Console trình duyệt và chạy:

```javascript
// Import và chạy hàm tạo data mẫu
window.initSampleBookings();
```

Hoặc trong code:

```javascript
import { initSampleBookings } from "./utils/sampleBookings";

// Tạo 3 booking mẫu
initSampleBookings();
```

### Kiểm Tra Dữ Liệu

```javascript
// Xem tất cả bookings trong localStorage
const bookings = localStorage.getItem("ev_rental_bookings");
console.log(JSON.parse(bookings));
```

### Xóa Dữ Liệu Test

```javascript
// Xóa tất cả bookings
localStorage.removeItem("ev_rental_bookings");

// Hoặc dùng function
import { clearAllBookings } from "./utils/bookingStorage";
clearAllBookings();
```

## Luồng Thanh Toán

### 1. User Checkout

```javascript
// File: Checkout.jsx
handlePaymentSubmit() {
  cartItems.forEach(item => {
    const bookingData = {
      userId: user.id,
      userName: user.fullName,
      vehicleName: item.vehicle.name,
      // ... các thông tin khác
    };

    saveBooking(bookingData); // Lưu vào localStorage
  });

  clearCart(); // Xóa giỏ hàng
  navigate('/booking-success'); // Redirect
}
```

### 2. Staff View

```javascript
// File: Staff.jsx
useEffect(() => {
  const loadBookings = () => {
    const allBookings = getAllBookings();
    setVehicles(transformBookingsToVehicles(allBookings));
  };

  loadBookings();

  // Auto refresh mỗi 5 giây
  const interval = setInterval(loadBookings, 5000);
  return () => clearInterval(interval);
}, []);
```

### 3. Staff Update Status

```javascript
// Khi staff bấm "Bàn giao xe"
handleCompleteHandover(vehicleId, "renting");

// Khi staff bấm "Thu hồi xe"
handleCompleteHandover(vehicleId, "completed");
```

## Testing

### Test Case 1: Đặt Xe Thành Công

1. Login với tài khoản user
2. Vào trang Vehicles
3. Chọn xe và thêm vào giỏ
4. Thanh toán
5. Kiểm tra localStorage có booking
6. Login với tài khoản staff
7. Kiểm tra booking hiển thị

### Test Case 2: Staff Xử Lý Booking

1. Login với tài khoản staff
2. Vào tab "Giao nhận xe"
3. Filter "Đã đặt"
4. Click "Bàn giao xe"
5. Hoàn thành checklist
6. Kiểm tra status chuyển sang "Đang thuê"

### Test Case 3: Hoàn Thành Đơn

1. Filter "Đang thuê"
2. Click "Thu hồi xe"
3. Hoàn thành checklist
4. Kiểm tra status chuyển sang "Đã hoàn thành"

## Lưu Ý

### LocalStorage vs Cookie

- **LocalStorage**: Lưu trữ dữ liệu phức tạp, không giới hạn kích thước nghiêm ngặt
- **Cookie**: Giới hạn 4KB, không phù hợp với data phức tạp

### Auto Refresh

Staff page tự động refresh bookings mỗi 5 giây để bắt các booking mới từ users.

### Data Persistence

Dữ liệu lưu trong localStorage sẽ tồn tại cho đến khi:

- User xóa cache trình duyệt
- Gọi `clearAllBookings()`
- Xóa thủ công trong DevTools

## Troubleshooting

### Không thấy booking

```javascript
// Kiểm tra localStorage
console.log(localStorage.getItem("ev_rental_bookings"));

// Tạo data mẫu
window.initSampleBookings();
```

### Booking không cập nhật

```javascript
// Reload bookings manually
location.reload();

// Hoặc clear và tạo lại
clearAllBookings();
initSampleBookings();
```

## File Structure

```
src/
├── utils/
│   ├── bookingStorage.js      # API quản lý bookings
│   ├── sampleBookings.js      # Dữ liệu mẫu
│   └── helpers.js             # Helper functions
├── pages/
│   ├── Checkout.jsx           # Trang thanh toán (lưu booking)
│   └── Staff.jsx              # Trang staff (hiển thị booking)
└── contexts/
    ├── CartContext.jsx        # Quản lý giỏ hàng
    └── AuthContext.jsx        # Quản lý authentication
```

## Future Improvements

1. **Backend Integration**: Chuyển từ localStorage sang API server
2. **Real-time Updates**: Sử dụng WebSocket cho updates real-time
3. **Notifications**: Thông báo cho staff khi có booking mới
4. **Image Upload**: Upload ảnh xe thực tế khi bàn giao
5. **Digital Signature**: Chữ ký điện tử thực sự thay vì text input
