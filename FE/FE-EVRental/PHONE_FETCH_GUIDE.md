# 📱 Hướng dẫn Test Chức năng Fetch Số điện thoại từ Backend

## 🎯 Mục đích

Tự động lấy số điện thoại khách hàng từ Backend API khi hiển thị thông tin booking trong trang Staff.

## 🔧 Cách hoạt động

### 1. **Khi tạo booking (Checkout.jsx)**

```javascript
userId: user.accountID || user.AccountID || user.id || user.email;
```

- Ưu tiên lưu `accountID` (số) từ user object sau khi login
- Fallback: id hoặc email nếu không có accountID

### 2. **Khi hiển thị trong Staff page (Staff.jsx)**

```javascript
// Nếu phone không có hoặc = "Chưa cập nhật"
if (!userPhone || userPhone === "Chưa cập nhật") {
  // Gọi API: GET /api/Account/GetAccountById/{userId}
  const fetchedPhone = await fetchUserPhone(booking.userId);
}
```

## 🧪 Test Cases

### Test 1: Booking mới với accountID hợp lệ

**Bước thực hiện:**

1. Đăng nhập với tài khoản customer có phone trong DB
2. Tạo booking mới (đặt xe)
3. Thanh toán
4. Đăng nhập Staff
5. Vào tab "Giao nhận xe"

**Kết quả mong đợi:**

- Console log: `✅ Successfully fetched phone for [Tên KH]: [SĐT]`
- UI hiển thị số điện thoại chính xác

### Test 2: Booking cũ không có phone (userId = email)

**Bước thực hiện:**

1. Có booking cũ với userId là email (không phải số)
2. Vào Staff page tab "Giao nhận xe"

**Kết quả mong đợi:**

- Console log: `⚠️ UserId không phải accountId (số): [email]`
- UI hiển thị: "Chưa cập nhật"

### Test 3: Token hết hạn

**Bước thực hiện:**

1. Xóa token hoặc để token hết hạn
2. Vào Staff page

**Kết quả mong đợi:**

- Console log: `❌ Token hết hạn hoặc không hợp lệ`
- UI hiển thị: "Chưa cập nhật"

## 🐛 Debug

### Mở Chrome DevTools Console

Kiểm tra các log sau:

```javascript
// 1. Check userId type
🔍 Booking BK123-1 - userId: 5, current phone: Chưa cập nhật

// 2. API call attempt
📞 Attempting to fetch phone for userId: 5

// 3. Success
✅ Fetched user phone for accountId 5: 0987654321
✅ Successfully fetched phone for Nguyễn Văn A: 0987654321

// OR Failure
❌ Token hết hạn hoặc không hợp lệ
❌ Failed to fetch phone for Nguyễn Văn A
```

## 📝 Kiểm tra Database

### SQL Query để xem phone trong DB:

```sql
SELECT AccountId, FullName, Phone, Email
FROM Account
WHERE AccountId = 5;
```

## 🔑 Backend API Required

### Endpoint: GET /api/Account/GetAccountById/{id}

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**

```json
{
  "accountId": 5,
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0987654321",
  "roleID": 1,
  "status": 1,
  ...
}
```

## ⚙️ Configuration

### Backend API URL (Staff.jsx line ~107)

```javascript
const response = await fetch(
  `http://localhost:5168/api/Account/GetAccountById/${accountId}`,
  ...
);
```

### Điều kiện fetch phone (Staff.jsx line ~168)

```javascript
if (!userPhone || userPhone === "Chưa cập nhật" || userPhone === "N/A") {
  // Fetch from backend
}
```

## 🎨 UI Display

### Thông tin hiển thị:

```
📱 Số điện thoại: [SĐT fetched từ API]
```

### CSS styling (Staff.css):

- Background: Không có (text thường)
- Font weight: 600
- Color: #1e293b

### Nếu không fetch được:

```
📱 Số điện thoại: Chưa cập nhật
```

## 🚀 Optimization

### Caching (Future improvement)

```javascript
const phoneCache = {};

const fetchUserPhone = async (userId) => {
  // Check cache first
  if (phoneCache[userId]) {
    return phoneCache[userId];
  }

  // Fetch from API
  const phone = await ...;

  // Save to cache
  if (phone) phoneCache[userId] = phone;

  return phone;
};
```

## ⚠️ Lưu ý

1. **Performance**: Mỗi booking sẽ gọi 1 API call nếu không có phone

   - Để tối ưu, nên implement caching
   - Hoặc gọi batch API để lấy nhiều user cùng lúc

2. **Authorization**: Staff cần token hợp lệ với roleID=2

   - API GetAccountById yêu cầu user phải là Admin (roleID=3) HOẶC là chính user đó
   - Staff (roleID=2) không thể fetch phone của customer khác

3. **Solution**:
   - Cần backend tạo endpoint riêng cho Staff: `GET /api/Account/GetCustomerInfo/{id}`
   - Hoặc modify permission trong GetAccountById để cho phép Staff (roleID=2)

## 🔧 Sửa Backend Permission (Recommended)

### File: AccountController.cs

```csharp
[HttpGet("GetAccountById/{id}")]
[Authorize]
public async Task<ActionResult<Account>> GetAccountById(int id)
{
    var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
    var userID = int.Parse(User.FindFirst(UserClaimTypes.AccountID).Value);

    // Cho phép Admin (3), Staff (2), hoặc chính user đó
    if (permission != "3" && permission != "2" && userID != id)
    {
        return Unauthorized("Không có quyền truy cập!");
    }

    var account = await _accountService.GetByIdAsync(id);
    if (account == null)
    {
        return NotFound("Tài khoản không tồn tại!");
    }
    return Ok(account);
}
```

## 📊 Test Result Checklist

- [ ] Phone hiển thị đúng cho booking mới
- [ ] Console log hiển thị các bước fetch
- [ ] Xử lý lỗi khi token hết hạn
- [ ] Xử lý khi userId không hợp lệ (email)
- [ ] UI hiển thị "Chưa cập nhật" khi không fetch được
- [ ] Backend permission cho phép Staff fetch phone
- [ ] Performance: Không quá chậm khi có nhiều booking

---

**Last updated:** October 16, 2025
**Developer:** GitHub Copilot
