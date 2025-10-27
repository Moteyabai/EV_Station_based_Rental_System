# 🎯 PayOS Payment Integration - Simple Implementation

## Tổng quan

Tích hợp PayOS với backend APIs có sẵn. Hệ thống gọi 2 endpoints của backend để xử lý thanh toán.

---

## 🔄 Luồng hoạt động

```
1. User checkout → Redirect đến PayOS
                 ↓
2. PayOS callback → /payment-callback?code=00&id={transactionId}&cancel=true&status=CANCELLED&orderCode={paymentId}
                 ↓
3. Frontend xử lý parameters:
   - code: 00 = success, other = failed
   - id: transaction ID từ PayOS
   - cancel: true = user cancelled
   - status: PAID, CANCELLED, etc.
   - orderCode: PaymentID trong database
                 ↓
4. Frontend gọi BE API:
   Success: code=00 AND status=PAID AND cancel!=true
   → PUT /api/Payment/success?orderID={orderCode}

   Failed: code!=00 OR status=CANCELLED OR cancel=true
   → PUT /api/Payment/failed?orderID={orderCode}
                 ↓
5. BE trả về status (int):
   - Success: status = 1 (Completed)
   - Failed:  status = -1 (Failed)
                 ↓
6. Frontend redirect:
   - Success: /payment-success?orderCode={id}&transactionId={id}
   - Failed:  /payment-failure?orderCode={id}&reason={status}
```

---

## 📝 Backend Callback URL Format

**Example từ BE:**

```
http://localhost:5168/api/Payment/cancel?code=00&id=021ff3586825400490288d431820583d&cancel=true&status=CANCELLED&orderCode=432043
```

**Parameters:**

- `code`: Mã kết quả (00 = success)
- `id`: Transaction ID từ PayOS
- `cancel`: true/false (user đã cancel hay chưa)
- `status`: PAID, CANCELLED, SUCCESS, etc.
- `orderCode`: PaymentID trong database (432043)

**Frontend cần config:**

```
Success URL: http://localhost:5173/payment-callback
Cancel URL:  http://localhost:5173/payment-callback
```

PayOS sẽ append các parameters vào URL này.

---

## 📝 Files Created

### 1. API Functions (`payment.js`)

```javascript
// Gọi BE API để mark payment success
markPaymentSuccess(orderID, token)
→ PUT /api/Payment/success?orderID={id}
→ Returns: { message: "...", status: 1 }

// Gọi BE API để mark payment failed
markPaymentFailed(orderID, token)
→ PUT /api/Payment/failed?orderID={id}
→ Returns: { message: "...", status: -1 }
```

### 2. PaymentCallback.jsx

- Nhận callback từ PayOS
- Lấy orderID từ URL
- Gọi BE API success/failed dựa trên status
- Redirect đến success/failure page

### 3. PaymentSuccess.jsx

- Hiển thị thông báo thanh toán thành công
- Buttons: Xem lịch sử, Về trang chủ

### 4. PaymentFailure.jsx

- Hiển thị thông báo thanh toán thất bại
- Dynamic error message dựa trên reason
- Buttons: Thử lại, Xem lịch sử, Về trang chủ

### 5. App.jsx Routes

```jsx
/payment-callback  → PaymentCallback (xử lý PayOS callback)
/payment-success   → PaymentSuccess (hiển thị success)
/payment-failure   → PaymentFailure (hiển thị failure)
```

---

## 🔌 Backend APIs (Đã có sẵn)

### Success API

```
PUT /api/Payment/success?orderID={id}
Headers: Authorization: Bearer {token}

Backend xử lý:
- Update Payment.Status = 1 (Completed)
- Update Rental.Status = Reserved
- Return: { message: "Thanh toán thành công!" }
```

### Failed API

```
PUT /api/Payment/failed?orderID={id}
Headers: Authorization: Bearer {token}

Backend xử lý:
- Update Payment.Status = -1 (Failed)
- Update Rental.Status = Cancelled
- Return: { message: "Thanh toán thất bại!" }
```

---

## 🧪 Test Flow

### Success:

1. Checkout với PayOS
2. PayOS redirect:
   ```
   http://localhost:5173/payment-callback?code=00&id=021ff358&cancel=false&status=PAID&orderCode=432043
   ```
3. Frontend check: `code === '00' && status === 'PAID' && cancel !== 'true'`
4. Frontend gọi: `PUT /api/Payment/success?orderID=432043`
5. Redirect: `http://localhost:5173/payment-success?orderCode=432043&transactionId=021ff358`

### Failure (Cancelled):

1. Checkout với PayOS
2. User cancel
3. PayOS redirect:
   ```
   http://localhost:5173/payment-callback?code=00&id=021ff358&cancel=true&status=CANCELLED&orderCode=432043
   ```
4. Frontend check: `cancel === 'true'` → Failed
5. Frontend gọi: `PUT /api/Payment/failed?orderID=432043`
6. Redirect: `http://localhost:5173/payment-failure?orderCode=432043&reason=cancelled`

### Failure (Error):

1. Checkout với PayOS
2. Payment error occurs
3. PayOS redirect:
   ```
   http://localhost:5173/payment-callback?code=99&id=021ff358&cancel=false&status=FAILED&orderCode=432043
   ```
4. Frontend check: `code !== '00'` → Failed
5. Frontend gọi: `PUT /api/Payment/failed?orderID=432043`
6. Redirect: `http://localhost:5173/payment-failure?orderCode=432043&reason=FAILED`

---

## ⚙️ Configuration Needed

### Backend PaymentService.cs cần config:

```csharp
// Line ~50 trong CreatePaymentLink method
string successUrl = "http://localhost:5173/payment-callback";
string canceledUrl = "http://localhost:5173/payment-callback";

// PayOS sẽ tự động append parameters:
// Success: ?code=00&id={transactionId}&cancel=false&status=PAID&orderCode={paymentId}
// Cancel:  ?code=00&id={transactionId}&cancel=true&status=CANCELLED&orderCode={paymentId}
```

### Frontend logic (đã implement):

```javascript
// PaymentCallback.jsx
const isSuccess = code === "00" && status === "PAID" && cancel !== "true";

if (isSuccess) {
  await markPaymentSuccess(parseInt(orderCode), token);
  navigate(`/payment-success?orderCode=${orderCode}&transactionId=${id}`);
} else {
  await markPaymentFailed(parseInt(orderCode), token);
  const reason = cancel === "true" ? "cancelled" : status || "unknown";
  navigate(`/payment-failure?orderCode=${orderCode}&reason=${reason}`);
}
```

---

## ✅ Completion Status

**Frontend:**

- [x] payment.js - Added markPaymentSuccess() & markPaymentFailed()
- [x] PaymentCallback.jsx - Handle PayOS callback
- [x] PaymentSuccess.jsx - Display success page
- [x] PaymentFailure.jsx - Display failure page
- [x] App.jsx - Added 3 routes
- [x] No compilation errors

**Backend:**

- [x] PUT /api/Payment/success endpoint (already exists)
- [x] PUT /api/Payment/failed endpoint (already exists)

**Integration:**

- [ ] Config PayOS callback URLs in backend
- [ ] Test end-to-end flow

---

## 🚀 Ready to Test

Hệ thống đã sẵn sàng! Chỉ cần:

1. Backend config PayOS return URLs
2. Test payment flow từ Checkout page

**Test URLs:**

```
Callback: http://localhost:5173/payment-callback?orderCode=1&status=PAID
Success:  http://localhost:5173/payment-success?orderCode=1
Failure:  http://localhost:5173/payment-failure?orderCode=1&reason=cancelled
```
