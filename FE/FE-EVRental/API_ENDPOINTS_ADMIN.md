# 📋 Danh Sách API Endpoints Trong Admin.jsx

## 🏢 STATION APIs (Quản lý Trạm)

### 1. Lấy danh sách trạm

- **Endpoint**: `GET /api/Station/GetAllStations`
- **Vị trí**: `fetchStations()` - line ~257
- **Service**: `adminService.getAllStations()`
- **Mô tả**: Lấy danh sách tất cả các trạm thuê xe

---

## 🏭 BRAND APIs (Quản lý Hãng Xe)

### 2. Lấy danh sách hãng xe

- **Endpoint**: `GET /api/Brand/GetAllBrands`
- **Vị trí**: `fetchBrands()` - line ~1371
- **Mô tả**: Lấy tất cả các hãng xe (VinFast, DatBike,...)

### 3. Tạo hãng xe mới

- **Endpoint**: `POST /api/Brand/CreateBrand`
- **Vị trí**: `handleAddBrand()` - line ~302
- **Body**: `{ brandName, country, description }`
- **Mô tả**: Thêm hãng xe mới

### 4. Cập nhật hãng xe

- **Endpoint**: `PUT /api/Brand/UpdateBrand/{brandId}`
- **Vị trí**: `handleUpdateBrand()` - line ~357
- **Body**: `{ brandName, country, description }`
- **Mô tả**: Sửa thông tin hãng xe

### 5. Xóa hãng xe

- **Endpoint**: `DELETE /api/Brand/DeleteBrand/{brandId}`
- **Vị trí**: `handleDeleteBrand()` - line ~408
- **Mô tả**: Xóa hãng xe

---

## 🏍️ BIKE APIs (Quản lý Loại Xe)

### 6. Lấy loại xe theo hãng

- **Endpoint**: `GET /api/EVBike/GetBikesByBrandID/{brandId}`
- **Vị trí**: `fetchBikesByBrand()` - line ~1420
- **Mô tả**: Lấy tất cả loại xe thuộc một hãng

### 7. Thêm loại xe mới

- **Endpoint**: `POST /api/EVBike/AddBike`
- **Vị trí**: `handleAddBikeType()` - line ~667
- **Body**: FormData - `{ BikeName, BrandID, FrontImg, BackImg, MaxSpeed, MaxDistance, Description, PricePerDay }`
- **Mô tả**: Thêm loại xe mới (có upload ảnh)

### 8. Lấy xe cụ thể (stocks) theo loại xe

- **Endpoint**: `GET /api/EVBike_Stocks/GetStocksByBikeID/{bikeId}`
- **Vị trí**: `fetchBikeInstances()` - line ~1475
- **Mô tả**: Lấy danh sách xe cụ thể (theo biển số) của một loại xe

### 9. Thêm xe cụ thể (stock)

- **Endpoint**: `POST /api/EVBike_Stocks/AddEVBikeStock`
- **Vị trí**: `handleAddBikeInstance()` - line ~777
- **Body**: `{ bikeID, color, stationID, licensePlate }`
- **Mô tả**: Thêm xe cụ thể với biển số vào kho

---

## 👥 CUSTOMER APIs (Quản lý Khách Hàng)

### 10. Lấy danh sách khách hàng

- **Endpoint**: `GET /api/Account/GetAllAccounts`
- **Vị trí**: `fetchCustomers()` - line ~837
- **Service**: `adminService.getAllAccounts()`
- **Mô tả**: Lấy tất cả tài khoản khách hàng

---

## 👨‍💼 STAFF APIs (Quản lý Nhân Viên)

### 11. Lấy danh sách nhân viên

- **Endpoint**: `GET /api/StationStaff/GetAllStaff`
- **Vị trí**: `fetchStaff()` - line ~933
- **Mô tả**: Lấy danh sách tất cả nhân viên

### 12. Tạo nhân viên mới

- **Endpoint**: `POST /api/StationStaff/CreateStaff`
- **Vị trí**: `handleCreateStaff()` - line ~1172
- **Body**: FormData - `{ FullName, Email, Password, Phone, StationID, stationId, Role, AvatarPicture }`
- **Mô tả**: Tạo tài khoản nhân viên mới (có upload avatar)

### 13. Cập nhật nhân viên

- **Endpoint**: `PUT /api/StationStaff/UpdateStaff/{staffId}`
- **Vị trí**: `handleUpdateStaff()` - line ~584
- **Service**: `adminService.updateStaff(staffId, formData)`
- **Body**: FormData - `{ FullName, Email, Password (optional), Phone, StationID, stationId, Role, AvatarPicture (optional) }`
- **Mô tả**: Cập nhật thông tin nhân viên

### 14. Xóa nhân viên

- **Endpoint**: `DELETE /api/StationStaff/DeleteStaff/{staffId}`
- **Vị trí**: `handleDeleteStaff()` - line ~440
- **Service**: `adminService.deleteStaff(staffId)`
- **Mô tả**: Xóa nhân viên khỏi hệ thống

### 15. Phân trạm cho nhân viên

- **Endpoint**: `POST /api/StationStaff/AssignToStation`
- **Vị trí**: `handleAssignStation()` - line ~489
- **Body**: `{ staffID, stationID }`
- **Mô tả**: Phân công nhân viên vào trạm làm việc

---

## 📊 Tóm tắt theo Module

| Module   | Số lượng API | Ghi chú                         |
| -------- | ------------ | ------------------------------- |
| Station  | 1            | Chỉ có GET, chưa có CRUD        |
| Brand    | 4            | Full CRUD                       |
| Bike     | 4            | GET, POST (loại xe & xe cụ thể) |
| Customer | 1            | Chỉ có GET                      |
| Staff    | 5            | Full CRUD + Assign Station      |
| **TỔNG** | **15**       |                                 |

---

## 🔑 Authentication

Tất cả API đều yêu cầu token trong header:

```javascript
headers: {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json", // hoặc không set nếu dùng FormData
}
```

---

## 📝 Lưu ý Implementation

### FormData APIs (có upload file):

- CreateStaff (avatar)
- AddBike (frontImg, backImg)
- UpdateStaff (avatar - optional)

→ **Không** set `Content-Type` header, để browser tự set với boundary

### JSON APIs (không có file):

- CreateBrand, UpdateBrand, DeleteBrand
- AssignToStation
- AddEVBikeStock
- GetAll... endpoints

→ **Phải** set `Content-Type: application/json`

---

## 🚀 Services Helper Files

Một số API được gọi qua service helper:

- `adminService.getAllStations()` → `src/services/adminService.js`
- `adminService.getAllAccounts()` → `src/services/adminService.js`
- `adminService.deleteStaff()` → `src/services/adminService.js`
- `adminService.updateStaff()` → `src/services/adminService.js`

Các API khác gọi trực tiếp bằng `fetch()` trong component.
