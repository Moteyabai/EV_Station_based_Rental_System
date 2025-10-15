# DEBUG BOOKING SYSTEM

## Các Bước Kiểm Tra

### 1. Kiểm tra User thanh toán thành công

Mở Console (F12) khi thanh toán, bạn phải thấy:

```
🔄 Bắt đầu xử lý thanh toán...
Phương thức thanh toán: cash (hoặc credit_card)
User: {id, email, name...}
Cart items: [...]
📋 Booking ID: BK1234567890
💾 Đang lưu booking với ID: BK1234567890-1
💾 Đã lưu booking: BK1234567890-1
✅ Đã lưu booking: BK1234567890-1
🎉 Đã lưu tất cả bookings: [...]
```

### 2. Kiểm tra Data trong localStorage

Mở Console và chạy:

```javascript
// Xem tất cả bookings
console.log(JSON.parse(localStorage.getItem("ev_rental_bookings")));

// Đếm số bookings
const bookings = JSON.parse(localStorage.getItem("ev_rental_bookings")) || [];
console.log("Tổng số bookings:", bookings.length);

// Xem booking mới nhất
console.log("Booking mới nhất:", bookings[bookings.length - 1]);
```

### 3. Kiểm tra Staff Page Load Data

Mở trang Staff, vào tab "Quản lý thanh toán", xem Console:

```
🔍 PaymentManagement: Loading bookings... X
📦 All bookings: [...]
✅ PaymentManagement: Loaded payments: X
```

### 4. Kiểm tra Cấu Trúc Booking

Booking phải có structure:

```javascript
{
  id: "BK1234567890-1",
  userId: "user@email.com",
  userEmail: "user@email.com",
  userName: "Tên khách hàng",
  userPhone: "0123456789",
  vehicleName: "VinFast VF e34",
  vehicleId: "1",
  licensePlate: "59A-12345",
  pickupDate: "2025-10-15",
  returnDate: "2025-10-20",
  pickupTime: "09:00",
  returnTime: "18:00",
  pickupStation: "Tên trạm",
  returnStation: "Tên trạm",
  days: 5,
  totalPrice: 5000000,
  paymentMethod: "cash",
  status: "pending_payment",
  paymentVerified: false,
  createdAt: "2025-10-15T10:30:00.000Z"
}
```

### 5. Kiểm tra Filter Logic trong Staff

Staff page phải:

- Tab Payment: Hiển thị TẤT CẢ bookings (pending_payment, booked, cancelled, renting, completed)
- Tab Giao nhận xe: CHỈ hiển thị bookings đã verified (status !== 'pending_payment' && !== 'cancelled')

## Các Lỗi Thường Gặp

### Lỗi 1: LocalStorage Key sai

- Checkout lưu vào: `ev_rental_bookings`
- Staff đọc từ: `ev_rental_bookings`
- ✅ PHẢI GIỐNG NHAU!

### Lỗi 2: Data structure không khớp

- Checkout lưu: `pickupStation` (string)
- Staff đọc: `pickupStation.name` (object) ❌
- Fix: Chỉ dùng string

### Lỗi 3: Filter sai

- Staff đang filter: `status === 'pending'` ❌
- Phải là: `status === 'pending_payment'` ✅

### Lỗi 4: User chưa đăng nhập

- Checkout yêu cầu `user` object
- Nếu không có user → lỗi validation

## Test Commands

Mở Console và chạy các lệnh sau:

```javascript
// 1. Xóa tất cả bookings (để test từ đầu)
localStorage.removeItem("ev_rental_bookings");

// 2. Tạo test booking
const testBooking = {
  id: `BK${Date.now()}-1`,
  userId: "test@test.com",
  userEmail: "test@test.com",
  userName: "Test User",
  userPhone: "0123456789",
  vehicleName: "VinFast VF e34",
  vehicleId: "1",
  licensePlate: "59A-12345",
  pickupDate: "2025-10-20",
  returnDate: "2025-10-25",
  pickupTime: "09:00",
  returnTime: "18:00",
  pickupStation: "Trạm Quận 1",
  returnStation: "Trạm Quận 1",
  days: 5,
  totalPrice: 5000000,
  paymentMethod: "cash",
  status: "pending_payment",
  paymentVerified: false,
  createdAt: new Date().toISOString(),
};

const bookings = JSON.parse(localStorage.getItem("ev_rental_bookings")) || [];
bookings.push(testBooking);
localStorage.setItem("ev_rental_bookings", JSON.stringify(bookings));
console.log("✅ Đã tạo test booking:", testBooking.id);

// 3. Reload trang Staff để thấy booking
location.reload();
```

## Kiểm tra AuthContext

Staff cần đăng nhập với roleID = 2:

```javascript
// Xem user hiện tại
console.log(localStorage.getItem('user'));

// User phải có:
{
  "roleID": 2,
  "email": "staff@example.com",
  "fullName": "Staff Name"
}
```
