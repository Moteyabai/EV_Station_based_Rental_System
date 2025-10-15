# ?? Payment API Documentation

## ?? Overview
Complete API documentation for Payment management in the EV Rental System. These APIs handle all payment operations including creating payments, updating payment information, tracking payment status, and generating payment statistics.

## ?? Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## ?? User Roles & Permissions
- **Renter (RoleID: 1)**: Can view their own payments
- **Staff (RoleID: 2)**: Can view all payments, update payments, process payment status
- **Admin (RoleID: 3)**: Full access to all payment operations

---

## ?? API Endpoints

### 1. **GET** `/api/Payment/GetAllPayments`
**Description**: Get all payments in the system  
**Permission**: Admin only  
**Response**: Array of Payment objects

#### Example Response:
```json
[
  {
    "paymentID": 1,
    "renterID": 3,
    "amount": 500000.00,
    "rentalID": 5,
    "paymentMethod": 2,
    "paymentType": 1,
    "status": 1,
    "createdAt": "2024-12-16T09:00:00",
    "updatedAt": "2024-12-16T09:15:00"
  }
]
```

---

### 2. **GET** `/api/Payment/GetPaymentById/{id}`
**Description**: Get specific payment by ID  
**Permission**: 
- Renters: Can only view their own payments
- Staff/Admin: Can view any payment  

**Parameters**:
- `id` (int): Payment ID

#### Example Response:
```json
{
  "paymentID": 1,
  "renterID": 3,
  "amount": 500000.00,
  "rentalID": 5,
  "paymentMethod": 2,
  "paymentType": 1,
  "status": 1,
  "createdAt": "2024-12-16T09:00:00",
  "updatedAt": "2024-12-16T09:15:00"
}
```

---

### 3. **POST** `/api/Payment/CreatePayment`
**Description**: Create a new payment  
**Permission**: All authenticated users  

#### Request Body:
```json
{
  "renterID": 3,
  "amount": 500000.00,
  "rentalID": 5,
  "paymentMethod": 2,
  "paymentType": 1,
  "status": 0
}
```

#### Example Response:
```json
{
  "message": "T?o giao d?ch thanh toán thành công!"
}
```

---

### 4. **PUT** `/api/Payment/UpdatePayment`
**Description**: Update payment information  
**Permission**: Staff and Admin only  

#### Request Body:
```json
{
  "paymentID": 1,
  "renterID": 3,
  "amount": 550000.00,
  "rentalID": 5,
  "paymentMethod": 2,
  "paymentType": 1,
  "status": 1
}
```

#### Example Response:
```json
{
  "message": "C?p nh?t thông tin thanh toán thành công!"
}
```

---

### 5. **PUT** `/api/Payment/UpdatePaymentStatus`
**Description**: Update payment status  
**Permission**: Staff and Admin only  

#### Request Body:
```json
{
  "paymentID": 1,
  "status": 1,
  "note": "Payment verified and completed"
}
```

#### Example Response:
```json
{
  "message": "C?p nh?t tr?ng thái thanh toán thành công!"
}
```

---

### 6. **DELETE** `/api/Payment/DeletePayment/{id}`
**Description**: Delete a payment record  
**Permission**: Admin only  

**Parameters**:
- `id` (int): Payment ID to delete

#### Example Response:
```json
{
  "message": "Xóa thông tin thanh toán thành công!"
}
```

---

### 7. **GET** `/api/Payment/GetPaymentsByRenter/{renterId}`
**Description**: Get all payments for a specific renter  
**Permission**: 
- Renters: Can only view their own payments
- Staff/Admin: Can view any renter's payments  

**Parameters**:
- `renterId` (int): Renter ID

#### Example Response:
```json
[
  {
    "paymentID": 1,
    "renterID": 3,
    "amount": 500000.00,
    "paymentMethod": 2,
    "status": 1
    // ... other payment details
  }
]
```

---

### 8. **GET** `/api/Payment/GetPaymentsByRental/{rentalId}`
**Description**: Get all payments for a specific rental  
**Permission**: Staff and Admin only  

**Parameters**:
- `rentalId` (int): Rental ID

#### Example Response:
```json
[
  {
    "paymentID": 1,
    "renterID": 3,
    "rentalID": 5,
    "amount": 500000.00,
    "paymentType": 1
    // ... other payment details
  }
]
```

---

### 9. **GET** `/api/Payment/GetPaymentsByMethod/{method}`
**Description**: Get payments by payment method  
**Permission**: Staff and Admin only  

**Parameters**:
- `method` (int): Payment method (1: Credit Card, 2: VNPay, 3: Cash)

#### Example Response:
```json
[
  {
    "paymentID": 1,
    "paymentMethod": 2,
    "amount": 500000.00
    // ... other payment details
  }
]
```

---

### 10. **GET** `/api/Payment/GetPaymentsByType/{type}`
**Description**: Get payments by payment type  
**Permission**: Staff and Admin only  

**Parameters**:
- `type` (int): Payment type (1: Deposit, 2: Fee, 3: Refund)

#### Example Response:
```json
[
  {
    "paymentID": 1,
    "paymentType": 1,
    "amount": 500000.00
    // ... other payment details
  }
]
```

---

### 11. **GET** `/api/Payment/GetPendingPayments`
**Description**: Get all pending payments (status = 0)  
**Permission**: Staff and Admin only  

#### Example Response:
```json
[
  {
    "paymentID": 1,
    "status": 0,
    "amount": 500000.00
    // ... other payment details
  }
]
```

---

### 12. **GET** `/api/Payment/GetCompletedPayments`
**Description**: Get all completed payments (status = 1)  
**Permission**: Staff and Admin only  

#### Example Response:
```json
[
  {
    "paymentID": 1,
    "status": 1,
    "amount": 500000.00
    // ... other payment details
  }
]
```

---

### 13. **GET** `/api/Payment/GetFailedPayments`
**Description**: Get all failed payments (status = -1)  
**Permission**: Staff and Admin only  

#### Example Response:
```json
[
  {
    "paymentID": 1,
    "status": -1,
    "amount": 500000.00
    // ... other payment details
  }
]
```

---

### 14. **POST** `/api/Payment/SearchPayments`
**Description**: Search and filter payments  
**Permission**: Staff and Admin only  

#### Request Body:
```json
{
  "renterID": 3,
  "rentalID": 5,
  "paymentMethod": 2,
  "paymentType": 1,
  "status": 1,
  "startDate": "2024-12-01T00:00:00",
  "endDate": "2024-12-31T23:59:59",
  "minAmount": 100000,
  "maxAmount": 1000000
}
```

#### Example Response:
```json
[
  {
    "paymentID": 1,
    "renterID": 3,
    "rentalID": 5,
    "amount": 500000.00,
    "paymentMethod": 2,
    "status": 1
    // ... other payment details
  }
]
```

---

### 15. **GET** `/api/Payment/GetPaymentStatistics`
**Description**: Get payment statistics and analytics  
**Permission**: Staff and Admin only  

#### Example Response:
```json
{
  "totalAmount": 5000000.00,
  "totalCount": 25,
  "completedCount": 20,
  "pendingCount": 3,
  "failedCount": 2,
  "completedAmount": 4500000.00,
  "pendingAmount": 400000.00,
  "failedAmount": 100000.00,
  "amountByMethod": {
    "1": 1500000.00,
    "2": 2500000.00,
    "3": 500000.00
  },
  "amountByType": {
    "1": 3000000.00,
    "2": 1800000.00,
    "3": 200000.00
  }
}
```

---

### 16. **GET** `/api/Payment/GetTotalAmountByRenter/{renterId}`
**Description**: Get total completed payment amount for a renter  
**Permission**: 
- Renters: Can only view their own totals
- Staff/Admin: Can view any renter's totals  

**Parameters**:
- `renterId` (int): Renter ID

#### Example Response:
```json
{
  "renterID": 3,
  "totalAmount": 1500000.00
}
```

---

## ?? Data Models

### Payment Model
```json
{
  "paymentID": "integer - Primary key",
  "renterID": "integer - Foreign key to Renter",
  "amount": "decimal - Payment amount (VND, precision 18,2)",
  "rentalID": "integer - Foreign key to Rental",
  "paymentMethod": "integer - Payment method (1: Credit Card, 2: VNPay, 3: Cash)",
  "paymentType": "integer - Payment type (1: Deposit, 2: Fee, 3: Refund)",
  "status": "integer - Payment status (-1: Failed, 0: Pending, 1: Completed)",
  "createdAt": "datetime - When payment was created",
  "updatedAt": "datetime - When payment was last updated"
}
```

### PaymentCreateDTO
```json
{
  "renterID": "integer - Required",
  "amount": "decimal - Required (0.01 to 999,999,999.99)",
  "rentalID": "integer - Required",
  "paymentMethod": "integer - Required (1-3)",
  "paymentType": "integer - Required (1-3)",
  "status": "integer - Optional, defaults to 0 (-1 to 1)"
}
```

### PaymentUpdateDTO
```json
{
  "paymentID": "integer - Required",
  "renterID": "integer? - Optional",
  "amount": "decimal? - Optional (0.01 to 999,999,999.99)",
  "rentalID": "integer? - Optional",
  "paymentMethod": "integer? - Optional (1-3)",
  "paymentType": "integer? - Optional (1-3)",
  "status": "integer? - Optional (-1 to 1)"
}
```

### PaymentSearchDTO
```json
{
  "renterID": "integer? - Optional filter",
  "rentalID": "integer? - Optional filter",
  "paymentMethod": "integer? - Optional filter (1-3)",
  "paymentType": "integer? - Optional filter (1-3)",
  "status": "integer? - Optional filter (-1 to 1)",
  "startDate": "datetime? - Optional date range start",
  "endDate": "datetime? - Optional date range end",
  "minAmount": "decimal? - Optional minimum amount",
  "maxAmount": "decimal? - Optional maximum amount"
}
```

---

## ?? Payment Constants

### Payment Methods
- `1`: Credit Card (Th? tín d?ng)
- `2`: VNPay
- `3`: Cash (Ti?n m?t)

### Payment Types
- `1`: Deposit (Ti?n c?c)
- `2`: Fee (Phí thuê)
- `3`: Refund (Hoàn ti?n)

### Payment Status
- `-1`: Failed (Th?t b?i)
- `0`: Pending (?ang ch?)
- `1`: Completed (Hoàn thành)

---

## ?? Error Responses

### 400 Bad Request
```json
{
  "message": "D? li?u không h?p l?!"
}
```

### 401 Unauthorized
```json
{
  "message": "Không có quy?n truy c?p!"
}
```

### 403 Forbidden
```json
{
  "message": "Không có quy?n truy c?p thông tin này!"
}
```

### 404 Not Found
```json
{
  "message": "Không tìm th?y thông tin thanh toán!"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error: [error details]"
}
```

---

## ?? Usage Examples

### JavaScript/TypeScript Examples

#### Create Payment
```javascript
const createPayment = async (paymentData) => {
  try {
    const response = await fetch('/api/Payment/CreatePayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log('Payment created:', result.message);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Example usage
createPayment({
  renterID: 3,
  amount: 500000.00,
  rentalID: 5,
  paymentMethod: 2, // VNPay
  paymentType: 1,   // Deposit
  status: 0         // Pending
});
```

#### Get User's Payments
```javascript
const getUserPayments = async (renterId) => {
  try {
    const response = await fetch(`/api/Payment/GetPaymentsByRenter/${renterId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const payments = await response.json();
      return payments;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};
```

#### Update Payment Status
```javascript
const updatePaymentStatus = async (paymentId, status, note = null) => {
  try {
    const response = await fetch('/api/Payment/UpdatePaymentStatus', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        paymentID: paymentId,
        status: status,
        note: note
      })
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log('Status updated:', result.message);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Mark payment as completed
updatePaymentStatus(1, 1, "Payment verified successfully");
```

#### Search Payments
```javascript
const searchPayments = async (searchCriteria) => {
  try {
    const response = await fetch('/api/Payment/SearchPayments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(searchCriteria)
    });
    
    if (response.ok) {
      const payments = await response.json();
      return payments;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error searching payments:', error);
    return [];
  }
};

// Example search for VNPay payments in December 2024
searchPayments({
  paymentMethod: 2,
  startDate: "2024-12-01T00:00:00",
  endDate: "2024-12-31T23:59:59",
  status: 1
});
```

#### Get Payment Statistics
```javascript
const getPaymentStatistics = async () => {
  try {
    const response = await fetch('/api/Payment/GetPaymentStatistics', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const stats = await response.json();
      return stats;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return null;
  }
};
```

---

## ?? Integration Tips

### 1. **Payment Workflow**
1. User initiates rental ? Create payment with status `0` (Pending)
2. Payment processing ? Update status based on payment gateway response
3. Staff verification ? Update to `1` (Completed) or `-1` (Failed)

### 2. **Status Management**
```javascript
const PaymentStatus = {
  FAILED: -1,
  PENDING: 0,
  COMPLETED: 1
};

const getStatusText = (status) => {
  switch(status) {
    case PaymentStatus.FAILED: return "Th?t b?i";
    case PaymentStatus.PENDING: return "?ang ch?";
    case PaymentStatus.COMPLETED: return "Hoàn thành";
    default: return "Không xác ??nh";
  }
};
```

### 3. **Payment Method Handling**
```javascript
const PaymentMethod = {
  CREDIT_CARD: 1,
  VNPAY: 2,
  CASH: 3
};

const getMethodText = (method) => {
  switch(method) {
    case PaymentMethod.CREDIT_CARD: return "Th? tín d?ng";
    case PaymentMethod.VNPAY: return "VNPay";
    case PaymentMethod.CASH: return "Ti?n m?t";
    default: return "Không xác ??nh";
  }
};
```

### 4. **Amount Formatting**
```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Example: 500000 ? "?500,000"
console.log(formatCurrency(500000));
```

### 5. **Permission Checking**
```javascript
const checkPaymentPermission = (user, payment) => {
  const isRenter = user.roleID === "1";
  const isStaff = user.roleID === "2";
  const isAdmin = user.roleID === "3";
  
  return {
    canView: isAdmin || isStaff || (isRenter && payment.renterID === user.accountId),
    canEdit: isAdmin || isStaff,
    canDelete: isAdmin,
    canUpdateStatus: isAdmin || isStaff
  };
};
```

---

## ?? Business Logic Notes

### Payment Validation Rules
- Amount must be between 0.01 and 999,999,999.99 VND
- Payment method must be valid (1-3)
- Payment type must be valid (1-3)
- Status must be valid (-1, 0, 1)
- Only staff and admin can update payment information
- Only staff and admin can change payment status

### Statistical Calculations
- Total amounts include only completed payments (status = 1)
- Statistics are calculated in real-time from current data
- Amount breakdowns are grouped by method and type

### Security Considerations
- Renters can only access their own payment information
- Sensitive operations require staff or admin privileges
- All payment modifications are logged with timestamps

This comprehensive Payment API provides complete payment management functionality for your EV rental system! ????