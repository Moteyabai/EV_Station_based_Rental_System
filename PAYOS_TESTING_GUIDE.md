# PayOS Payment Testing Guide

## ✅ Đã hoàn thành tích hợp

### Frontend Changes:

- ✅ Updated `src/api/payment.js` - Gọi đúng API backend với JWT token
- ✅ Updated `src/pages/Checkout.jsx` - Xử lý PayOS payment flow
- ✅ Updated `.env` - Cấu hình API URL: `http://localhost:5168`

### Backend API:

- ✅ `POST /api/Payment/CreatePayment` - Đã có sẵn
- ✅ Requires JWT authentication
- ✅ Returns `{ paymentUrl: "..." }`

## 🧪 Testing Instructions

### 1. Prerequisites

#### Backend Ready:

```bash
# Check backend is running
curl http://localhost:5168/api/Payment/CreatePayment
# Should return 401 Unauthorized (good - means endpoint exists)
```

#### Frontend Environment:

```env
# FE/FE-EVRental/.env
VITE_API_BASE_URL=http://localhost:5168
```

#### User Account:

- Phải đăng nhập với **Renter account** (roleID = 1)
- Staff (roleID = 2) và Admin (roleID = 3) không được phép checkout

### 2. Start Applications

```bash
# Terminal 1 - Backend
cd BE/EVRentalSystem/API
dotnet run
# Should see: Now listening on: http://localhost:5168

# Terminal 2 - Frontend
cd FE/FE-EVRental
npm run dev
# Should see: Local: http://localhost:5173
```

### 3. Test Payment Flow

#### Step 1: Login

1. Go to `http://localhost:5173`
2. Click "Đăng nhập"
3. Login với Renter account
4. Verify user data in console:

```javascript
// In Browser Console
const user = JSON.parse(localStorage.getItem("user"));
console.log("User:", user);
// Should see: { accountID: 1, email: "...", roleID: 1, ... }

const token = localStorage.getItem("token");
console.log("Token:", token);
// Should see: JWT token string
```

#### Step 2: Add Vehicle to Cart

1. Go to `/vehicles`
2. Click on any vehicle
3. Fill booking form:
   - **Ngày nhận xe**: Chọn ngày hôm nay hoặc sau
   - **Ngày trả xe**: Chọn ngày sau ngày nhận
   - **Điểm nhận xe**: Chọn station (quan trọng - backend cần stationID)
4. Click "Thêm vào giỏ"
5. Verify cart has item:

```javascript
// In Browser Console
const cart = JSON.parse(localStorage.getItem("cart"));
console.log("Cart:", cart);
// Should see array with vehicle data
```

#### Step 3: Go to Checkout

1. Click cart icon (top right)
2. Click "Thanh toán"
3. Should redirect to `/checkout`
4. Review order items

#### Step 4: Payment

1. Click "Tiếp tục thanh toán"
2. Select "💳 Thanh toán Online qua PayOS"
3. Click button "💳 Thanh toán [số tiền]"

#### Step 5: Monitor API Call

Open DevTools (F12) → Network tab:

**Expected Request:**

```
POST http://localhost:5168/api/Payment/CreatePayment
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json

Request Body:
{
  "accountID": 1,
  "amount": 250000,
  "bikeID": 5,
  "stationID": 2,
  "paymentMethod": 1,
  "paymentType": 1,
  "status": 0
}
```

**Expected Response (200 OK):**

```json
{
  "paymentUrl": "https://pay.payos.vn/web/abc123..."
}
```

**What happens next:**

- Frontend redirects to `paymentUrl`
- User completes payment on PayOS page
- PayOS redirects back to return URL

### 4. Test Cases

#### ✅ Test Case 1: Successful Payment

- Login → Add to cart → Checkout → Select PayOS → Click Pay
- **Expected**: Redirect to PayOS page
- **Status**: Payment created in database with status = 0 (Pending)

#### ✅ Test Case 2: No Token (Not Logged In)

- Logout → Try to access checkout
- **Expected**: Error "Vui lòng đăng nhập để thanh toán"

#### ✅ Test Case 3: Invalid Station ID

- Add vehicle without selecting pickup station
- **Expected**: Uses default stationID = 1

#### ✅ Test Case 4: Multiple Items in Cart

- Add 2-3 vehicles to cart
- **Expected**: Creates separate payment for each item (currently redirects to first payment URL)

#### ✅ Test Case 5: Backend API Error

- Stop backend → Try to pay
- **Expected**: Error message "Không thể kết nối với cổng thanh toán PayOS"

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch" error

**Cause**: Backend not running or wrong URL
**Solution**:

```bash
# Check backend is running
curl http://localhost:5168/api/Payment/CreatePayment

# Check .env file
cat FE/FE-EVRental/.env
# Should show: VITE_API_BASE_URL=http://localhost:5168

# Restart frontend after changing .env
npm run dev
```

### Issue 2: 401 Unauthorized

**Cause**: No token or expired token
**Solution**:

```javascript
// Check token in console
localStorage.getItem("token");

// If null, login again
// If expired, backend should return specific error
```

### Issue 3: "Không tìm thấy thông tin tài khoản"

**Cause**: `user.accountID` is undefined
**Solution**:

```javascript
// Check user object structure
const user = JSON.parse(localStorage.getItem("user"));
console.log("User keys:", Object.keys(user));

// Update Checkout.jsx if property name is different
// Current code checks: user?.accountID || user?.AccountID || user?.id
```

### Issue 4: "Không nhận được link thanh toán từ PayOS"

**Cause**: Backend returns error or wrong response format
**Solution**:

- Check Network tab for actual API response
- Backend should return: `{ paymentUrl: "..." }`
- If backend returns different format, update `payment.js`

### Issue 5: StationID error

**Cause**: `item.rentalDetails.pickupStation.id` is undefined
**Solution**:

```javascript
// Check cart item structure
const cart = JSON.parse(localStorage.getItem("cart"));
console.log("Station data:", cart[0].rentalDetails.pickupStation);

// Should have: { id: 2, name: "Station Name", ... }
// If property name different, update Checkout.jsx line 95
```

## 📋 Debugging Checklist

Before reporting issues, check:

- [ ] Backend running on port 5168
- [ ] Frontend `.env` has correct API URL
- [ ] User is logged in (token exists in localStorage)
- [ ] User is Renter (roleID = 1)
- [ ] Cart has items with valid data
- [ ] Cart item has `pickupStation` with `id` property
- [ ] DevTools Console shows no errors
- [ ] DevTools Network tab shows API call
- [ ] API response is 200 OK with `paymentUrl`

## 📞 Success Criteria

Payment integration is working when:

1. ✅ User can click "Thanh toán Online qua PayOS"
2. ✅ API call is made to backend with correct data
3. ✅ Backend returns `paymentUrl`
4. ✅ Browser redirects to PayOS page
5. ✅ Payment is saved in database with status Pending
6. ✅ After PayOS payment, user is redirected back

## 🎯 Next Steps

After basic flow works:

1. Handle payment success callback (`/checkout?status=success`)
2. Handle payment cancel callback (`/checkout?status=cancel`)
3. Update payment status in database
4. Send confirmation email
5. Update rental status to Active
6. Clear cart after successful payment
