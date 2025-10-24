# PayOS Payment Integration Guide

## ✅ Đã hoàn thành

### 1. Frontend Implementation

#### Files Created/Modified:

- ✅ `src/api/payment.js` - PayOS API service
- ✅ `src/pages/Checkout.jsx` - Updated payment flow
- ✅ `.env` - Environment configuration
- ✅ `.env.example` - Environment template

#### Payment Flow:

1. User selects "Thanh toán Online qua PayOS"
2. Clicks payment button
3. System calls `createPayOSPayment()` API
4. Backend creates PayOS payment link
5. User redirected to PayOS checkout page
6. PayOS processes payment (QR Code, Bank Transfer, E-Wallet)
7. User redirected back with payment status

### 2. API Endpoints Required (Backend)

#### POST `/api/Payment/CreatePayment`

**Request Body:**

```json
{
  "orderCode": "BK1234567890",
  "amount": 500000,
  "description": "Thanh toán thuê xe - user@email.com",
  "cancelUrl": "http://localhost:3000/checkout?status=cancel",
  "returnUrl": "http://localhost:3000/checkout?status=success",
  "items": [
    {
      "name": "VinFast VF e34",
      "quantity": 2,
      "price": 250000
    }
  ],
  "buyerName": "Nguyen Van A",
  "buyerEmail": "user@email.com",
  "buyerPhone": "0123456789"
}
```

**Response:**

```json
{
  "success": true,
  "checkoutUrl": "https://pay.payos.vn/web/abc123",
  "orderId": "BK1234567890"
}
```

#### GET `/api/Payment/VerifyPayment/{orderId}`

**Response:**

```json
{
  "success": true,
  "status": "paid",
  "amount": 500000,
  "transactionId": "TXN123456"
}
```

#### POST `/api/Payment/CancelPayment/{orderId}`

**Response:**

```json
{
  "success": true,
  "message": "Payment cancelled successfully"
}
```

## 🔧 Backend Setup Instructions

### 1. Install PayOS SDK (.NET)

```bash
dotnet add package Net.payOS
```

### 2. Add PayOS Configuration (appsettings.json)

```json
{
  "PayOS": {
    "ClientId": "your_client_id",
    "ApiKey": "your_api_key",
    "ChecksumKey": "your_checksum_key"
  }
}
```

### 3. Create PaymentController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Net.payOS;
using Net.payOS.Types;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly PayOS _payOS;

    public PaymentController(IConfiguration configuration)
    {
        _payOS = new PayOS(
            configuration["PayOS:ClientId"],
            configuration["PayOS:ApiKey"],
            configuration["PayOS:ChecksumKey"]
        );
    }

    [HttpPost("CreatePayment")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        try
        {
            var paymentData = new PaymentData(
                orderCode: long.Parse(request.OrderCode.Replace("BK", "")),
                amount: request.Amount,
                description: request.Description,
                items: request.Items.Select(i => new ItemData(i.Name, i.Quantity, i.Price)).ToList(),
                cancelUrl: request.CancelUrl,
                returnUrl: request.ReturnUrl,
                buyerName: request.BuyerName,
                buyerEmail: request.BuyerEmail,
                buyerPhone: request.BuyerPhone
            );

            var result = await _payOS.createPaymentLink(paymentData);

            return Ok(new
            {
                success = true,
                checkoutUrl = result.checkoutUrl,
                orderId = request.OrderCode
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    [HttpGet("VerifyPayment/{orderId}")]
    public async Task<IActionResult> VerifyPayment(string orderId)
    {
        try
        {
            var orderCode = long.Parse(orderId.Replace("BK", ""));
            var paymentInfo = await _payOS.getPaymentLinkInformation(orderCode);

            return Ok(new
            {
                success = true,
                status = paymentInfo.status,
                amount = paymentInfo.amount,
                transactionId = paymentInfo.id
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    [HttpPost("CancelPayment/{orderId}")]
    public async Task<IActionResult> CancelPayment(string orderId)
    {
        try
        {
            var orderCode = long.Parse(orderId.Replace("BK", ""));
            var result = await _payOS.cancelPaymentLink(orderCode);

            return Ok(new
            {
                success = true,
                message = "Payment cancelled successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }
}

public class CreatePaymentRequest
{
    public string OrderCode { get; set; }
    public int Amount { get; set; }
    public string Description { get; set; }
    public string CancelUrl { get; set; }
    public string ReturnUrl { get; set; }
    public List<PaymentItem> Items { get; set; }
    public string BuyerName { get; set; }
    public string BuyerEmail { get; set; }
    public string BuyerPhone { get; set; }
}

public class PaymentItem
{
    public string Name { get; set; }
    public int Quantity { get; set; }
    public int Price { get; set; }
}
```

## 🧪 Testing

### Test Payment Flow:

1. Start backend: `dotnet run`
2. Start frontend: `npm run dev`
3. Add vehicle to cart
4. Go to checkout
5. Select "Thanh toán Online qua PayOS"
6. Click payment button
7. Should redirect to PayOS page

### Test Cases:

- ✅ Cash payment (existing flow)
- ✅ PayOS payment redirect
- ✅ Payment success callback
- ✅ Payment cancel callback
- ✅ Error handling

## 📝 Environment Variables

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Backend (appsettings.json)

```json
{
  "PayOS": {
    "ClientId": "your_client_id_here",
    "ApiKey": "your_api_key_here",
    "ChecksumKey": "your_checksum_key_here"
  }
}
```

## 🔐 Get PayOS Credentials

1. Visit: https://payos.vn/
2. Register/Login
3. Go to Dashboard → API Keys
4. Copy: Client ID, API Key, Checksum Key
5. Add to backend configuration

## 🚀 Deployment Checklist

- [ ] Update `VITE_API_BASE_URL` in production `.env`
- [ ] Update PayOS credentials in backend
- [ ] Update `cancelUrl` and `returnUrl` to production URLs
- [ ] Test payment flow end-to-end
- [ ] Verify webhook handling (if needed)
- [ ] Check error logging

## 📞 Support

- PayOS Documentation: https://payos.vn/docs/
- PayOS API Reference: https://payos.vn/docs/api/
