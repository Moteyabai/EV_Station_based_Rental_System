# 🔧 Hướng dẫn Fix Lỗi "renter was null"

## ❌ Lỗi hiện tại:

```
System.NullReferenceException: 'Object reference not set to an instance of an object.'
**renter** was null.
```

Tại dòng 146 của `PaymentController.cs`:

```csharp
rental.RenterID = renter.RenterID; // renter = null ở đây!
```

## 🔍 Nguyên nhân:

Backend không tìm thấy **Renter** trong database với **AccountID** được gửi từ FE.

Code Backend (line 142):

```csharp
var renter = await _renterService.GetRenterByAccountIDAsync(paymentDto.AccountID);
// renter = null nếu không có record trong bảng Renters
```

## ✅ Giải pháp (KHÔNG fix BE):

### Bước 1: Kiểm tra AccountID được gửi lên

1. Mở **Console Browser** (F12)
2. Thực hiện thanh toán
3. Tìm log: `📋 [CASH] Final AccountID extracted:`
4. Ghi nhớ AccountID (ví dụ: **5**)

### Bước 2: Kiểm tra Database

Chạy query sau trong SQL Server:

```sql
-- Kiểm tra Account có tồn tại không
SELECT * FROM Accounts WHERE AccountID = 5; -- Thay 5 bằng AccountID từ console log

-- Kiểm tra Renter có tồn tại không
SELECT * FROM Renters WHERE AccountID = 5; -- Thay 5 bằng AccountID từ console log
```

### Bước 3: Fix Database

#### Trường hợp 1: Chưa có Renter với AccountID này

**Thêm record vào bảng Renters:**

```sql
-- Lấy thông tin Account
DECLARE @AccountID INT = 5; -- Thay bằng AccountID thực tế
DECLARE @FullName NVARCHAR(100);
DECLARE @Email NVARCHAR(100);
DECLARE @PhoneNumber NVARCHAR(20);

-- Lấy thông tin từ Account
SELECT
    @FullName = FullName,
    @Email = Email,
    @PhoneNumber = PhoneNumber
FROM Accounts
WHERE AccountID = @AccountID;

-- Insert vào Renters
INSERT INTO Renters (AccountID, FullName, Email, PhoneNumber, CreatedAt, UpdatedAt)
VALUES (@AccountID, @FullName, @Email, @PhoneNumber, GETDATE(), GETDATE());

-- Verify
SELECT * FROM Renters WHERE AccountID = @AccountID;
```

#### Trường hợp 2: Chưa có Account

**Đăng ký tài khoản mới từ FE trước!**

### Bước 4: Test lại

1. Refresh browser
2. Thực hiện thanh toán lại
3. Kiểm tra Console log:
   - ✅ `Payment response` có giá trị
   - ✅ `Rental created with status = 0`

## 📊 Cấu trúc Database cần có:

```
Accounts Table:
├── AccountID (PK)
├── Email
├── Password
├── FullName
├── PhoneNumber
└── RoleID

Renters Table:
├── RenterID (PK, Identity)
├── AccountID (FK -> Accounts.AccountID) ⚠️ QUAN TRỌNG!
├── FullName
├── Email
├── PhoneNumber
├── CreatedAt
└── UpdatedAt

Rentals Table:
├── RentalID (PK)
├── BikeID (FK)
├── RenterID (FK -> Renters.RenterID) ⚠️ Cần RenterID từ Renters!
├── StationID (FK)
└── Status (0 = Pending)
```

## 🔑 Quan trọng:

1. **Mỗi Account phải có 1 Renter** nếu muốn thuê xe
2. **Backend không tự động tạo Renter** khi đăng ký Account
3. **Cần INSERT thủ công** hoặc tạo API đăng ký Renter

## 🚀 Script nhanh - Tạo Renter cho tất cả Account chưa có:

```sql
-- Tạo Renter cho tất cả Accounts với RoleID = 1 (Customer) chưa có Renter
INSERT INTO Renters (AccountID, FullName, Email, PhoneNumber, CreatedAt, UpdatedAt)
SELECT
    a.AccountID,
    a.FullName,
    a.Email,
    a.PhoneNumber,
    GETDATE(),
    GETDATE()
FROM Accounts a
LEFT JOIN Renters r ON a.AccountID = r.AccountID
WHERE r.RenterID IS NULL
  AND a.RoleID = 1; -- Chỉ tạo cho Customer (RoleID = 1)

-- Verify kết quả
SELECT
    a.AccountID,
    a.Email,
    r.RenterID,
    r.FullName AS RenterName
FROM Accounts a
LEFT JOIN Renters r ON a.AccountID = r.AccountID
WHERE a.RoleID = 1;
```

## 📝 Notes:

- FE đã được cập nhật với console log chi tiết để debug
- Mọi thay đổi chỉ ở **Database** và **Frontend**
- **Backend giữ nguyên** như yêu cầu
