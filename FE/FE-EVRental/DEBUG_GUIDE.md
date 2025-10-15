# 🔍 HƯỚNG DẪN DEBUG HỆ THỐNG BOOKING

## Vấn đề: Data từ User không hiển thị ở Staff

## Các bước kiểm tra chi tiết:

### BƯỚC 1: Kiểm tra User có thanh toán thành công không

1. **Đăng nhập tài khoản Customer**
2. **Chọn xe và thanh toán**
3. **MỞ CONSOLE (F12) khi thanh toán**
4. **Phải thấy các log sau:**

```
🔄 Bắt đầu xử lý thanh toán...
Phương thức thanh toán: cash
User: {id: "...", email: "...", ...}
Cart items: [{vehicle: {...}, rentalDetails: {...}}]
📋 Booking ID: BK1729xxx
💾 Đang lưu booking với ID: BK1729xxx-1
💾 Đã lưu booking: BK1729xxx-1
✅ Đã lưu booking: BK1729xxx-1
🎉 Đã lưu tất cả bookings: [...]
```

**❌ NẾU KHÔNG THẤY LOG** → Lỗi ở bước thanh toán

- Kiểm tra file: `Checkout.jsx` line 57-145
- Kiểm tra function: `handlePaymentSubmit`

**✅ NẾU THẤY LOG** → Chuyển sang bước 2

---

### BƯỚC 2: Kiểm tra Data có lưu vào localStorage không

1. **Sau khi thanh toán thành công**
2. **MỞ CONSOLE, chạy lệnh:**

```javascript
console.log(JSON.parse(localStorage.getItem("ev_rental_bookings")));
```

**Kết quả mong đợi:**

```javascript
[
  {
    id: "BK1729xxx-1",
    userId: "customer@email.com",
    userName: "Tên khách hàng",
    vehicleName: "VinFast VF e34",
    status: "pending_payment",
    paymentMethod: "cash",
    totalPrice: 5000000,
    ...
  }
]
```

**❌ NẾU NULL hoặc []** → Lỗi khi lưu vào localStorage

- Kiểm tra file: `bookingStorage.js` line 21-48
- Kiểm tra function: `saveBooking`
- Có thể localStorage bị full hoặc blocked

**✅ NẾU CÓ DATA** → Chuyển sang bước 3

---

### BƯỚC 3: Kiểm tra cấu trúc Booking đúng chưa

**Chạy trong Console:**

```javascript
const bookings = JSON.parse(localStorage.getItem("ev_rental_bookings"));
const latest = bookings[bookings.length - 1];
console.log("Booking mới nhất:", latest);

// Kiểm tra các field bắt buộc
const required = [
  "id",
  "userId",
  "userName",
  "vehicleName",
  "status",
  "paymentMethod",
];
const missing = required.filter((f) => !latest[f]);
console.log("Missing fields:", missing);
```

**Fields bắt buộc:**

- ✅ `id`: "BK1729xxx-1"
- ✅ `userId`: email hoặc ID user
- ✅ `userName`: Tên khách hàng
- ✅ `userEmail`: Email
- ✅ `userPhone`: SĐT
- ✅ `vehicleName`: Tên xe
- ✅ `licensePlate`: Biển số
- ✅ `pickupDate`, `returnDate`: Ngày thuê/trả
- ✅ `pickupStation`, `returnStation`: Tên trạm (STRING)
- ✅ `totalPrice`: Giá
- ✅ `paymentMethod`: "cash", "credit_card", etc.
- ✅ `status`: "pending_payment"
- ✅ `paymentVerified`: false
- ✅ `createdAt`: Timestamp

**❌ NẾU THIẾU FIELD** → Sửa trong `Checkout.jsx` line 94-124

**✅ NẾU ĐẦY ĐỦ** → Chuyển sang bước 4

---

### BƯỚC 4: Đăng xuất User, đăng nhập Staff

1. **Đăng xuất tài khoản Customer**
2. **Đăng nhập tài khoản Staff**
   - Email: `staff@example.com`
   - Password: (mật khẩu của bạn)
3. **Kiểm tra User trong Console:**

```javascript
const user = JSON.parse(localStorage.getItem("user"));
console.log("User:", user);
console.log("Role ID:", user.roleID); // PHẢI = 2
```

**❌ NẾU roleID !== 2** → Không phải Staff

- Kiểm tra database: User phải có `roleID = 2`
- Hoặc tạo tài khoản Staff mới

**✅ NẾU roleID = 2** → Chuyển sang bước 5

---

### BƯỚC 5: Vào trang Staff, tab "Quản lý thanh toán"

1. **Vào trang Staff**
2. **Click tab "Quản lý thanh toán"**
3. **MỞ CONSOLE, xem log:**

```
🔍 PaymentManagement: Loading bookings... X
📦 All bookings: [...]
✅ PaymentManagement: Loaded payments: X
📊 Pending: X
📊 Verified: X
```

**❌ NẾU "Loading bookings... 0"** → LocalStorage bị xóa hoặc key sai

- Kiểm tra: `Staff.jsx` line 747 - Key phải là `'ev_rental_bookings'`
- Kiểm tra: LocalStorage có bị clear không

**❌ NẾU "Loaded payments: 0"** nhưng có bookings

- Kiểm tra filter logic ở `Staff.jsx` line 752-783
- Có thể mapping sai

**✅ NẾU CÓ DATA** → Phải thấy payment cards

---

### BƯỚC 6: Kiểm tra hiển thị Payment Cards

**Nếu không thấy cards:**

1. Kiểm tra Console có lỗi React không
2. Kiểm tra CSS: `.payment-card` có đúng không
3. Kiểm tra mapping: `Staff.jsx` line 869-933

**Test mapping bằng Console:**

```javascript
const { getAllBookings } = require("./utils/bookingStorage");
const allBookings = getAllBookings();
console.log("Raw bookings:", allBookings);

const paymentData = allBookings.map((booking) => ({
  id: booking.id,
  status: booking.status === "pending_payment" ? "pending" : "verified",
}));
console.log("Mapped payments:", paymentData);
```

---

## CÁCH FIX NHANH - TẠO TEST DATA

**Mở Console và chạy:**

```javascript
// Xóa data cũ
localStorage.removeItem("ev_rental_bookings");

// Tạo test booking
const testBooking = {
  id: `BK${Date.now()}-1`,
  userId: "customer@test.com",
  userEmail: "customer@test.com",
  userName: "Nguyễn Văn Test",
  userPhone: "0987654321",
  vehicleName: "VinFast VF e34",
  vehicleId: "1",
  licensePlate: "59A-12345",
  vehicleImage: "/images/vinfast-vf-e34.jpg",
  pickupDate: "2025-10-20",
  returnDate: "2025-10-25",
  pickupTime: "09:00",
  returnTime: "18:00",
  pickupStation: "Trạm Quận 1, TPHCM",
  returnStation: "Trạm Quận 1, TPHCM",
  days: 5,
  totalPrice: 5000000,
  paymentMethod: "cash",
  battery: "100%",
  status: "pending_payment",
  paymentVerified: false,
  createdAt: new Date().toISOString(),
};

const bookings = [testBooking];
localStorage.setItem("ev_rental_bookings", JSON.stringify(bookings));

console.log("✅ Đã tạo test booking!");

// Reload trang
location.reload();
```

---

## KIỂM TRA LUỒNG ĐẦY ĐỦ

### Test End-to-End:

1. **User thanh toán** → Check Console log → Check localStorage
2. **Đăng nhập Staff** → Check roleID = 2
3. **Vào tab Payment** → Check Console load bookings → Check hiển thị cards
4. **Click "Xác nhận thanh toán"** → Check status chuyển → Check hiển thị modal
5. **Xác nhận** → Check status = 'booked' → Check paymentVerified = true
6. **Vào tab Giao nhận xe** → Check booking hiển thị (status !== 'pending_payment')

---

## CÔNG CỤ HỖ TRỢ

### 1. Test Booking Tool

Mở file: `test-booking.html` trong trình duyệt

### 2. Debug Console Script

Copy nội dung file: `debug-console.js` vào Console

### 3. Manual Test Commands

```javascript
// Xem tất cả bookings
JSON.parse(localStorage.getItem("ev_rental_bookings"));

// Đếm bookings theo status
const bookings = JSON.parse(localStorage.getItem("ev_rental_bookings")) || [];
console.table({
  total: bookings.length,
  pending: bookings.filter((b) => b.status === "pending_payment").length,
  booked: bookings.filter((b) => b.status === "booked").length,
  completed: bookings.filter((b) => b.status === "completed").length,
});

// Xem booking mới nhất
const latest = bookings[bookings.length - 1];
console.log(latest);
```

---

## CÁC LỖI THƯỜNG GẶP

### Lỗi 1: LocalStorage Key khác nhau

**Triệu chứng:** User lưu được nhưng Staff không thấy
**Nguyên nhân:** Checkout lưu vào key khác Staff đọc từ key khác
**Fix:** Đảm bảo cả 2 đều dùng `'ev_rental_bookings'`

### Lỗi 2: Cấu trúc dữ liệu sai

**Triệu chứng:** Staff load được nhưng không map được
**Nguyên nhân:** Thiếu field hoặc sai type
**Fix:** Kiểm tra mapping logic trong `Staff.jsx` line 752-783

### Lỗi 3: Filter sai

**Triệu chứng:** Load được data nhưng không hiển thị
**Nguyên nhân:** Filter quá strict hoặc điều kiện sai
**Fix:** Bỏ filter hoặc check status === 'pending_payment'

### Lỗi 4: User chưa đăng nhập

**Triệu chứng:** Checkout báo lỗi validation
**Nguyên nhân:** user = null hoặc undefined
**Fix:** Đảm bảo đăng nhập trước khi checkout

### Lỗi 5: LocalStorage bị block

**Triệu chứng:** Save không lỗi nhưng data không có
**Nguyên nhân:** Browser block localStorage
**Fix:** Check browser settings, dùng incognito mode

---

## KẾT LUẬN

Nếu làm đúng các bước trên, hệ thống phải hoạt động theo flow:

```
User Login → Select Vehicle → Checkout → Save to localStorage
  ↓
localStorage: ev_rental_bookings = [{booking1}, {booking2}]
  ↓
Staff Login → Payment Tab → Load from localStorage → Display Cards
  ↓
Click "Xác nhận thanh toán" → Update status → Move to Handover Tab
```

**Nếu vẫn lỗi, hãy:**

1. Chụp ảnh Console logs
2. Chụp ảnh localStorage data
3. Gửi cho tôi để debug cụ thể hơn
