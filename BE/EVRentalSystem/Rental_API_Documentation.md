# ?? Rental API Documentation

## ?? Overview
Complete API documentation for Rental management in the EV Rental System. These APIs handle all rental operations including creating rentals, updating rental information, tracking rental status, and processing bike returns.

## ?? Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## ?? User Roles & Permissions
- **Renter (RoleID: 1)**: Can view their own rentals
- **Staff (RoleID: 2)**: Can view all rentals, update rentals, process returns
- **Admin (RoleID: 3)**: Full access to all rental operations

---

## ?? API Endpoints

### 1. **GET** `/api/Rental/GetAllRentals`
**Description**: Get all rentals in the system  
**Permission**: Admin only  
**Response**: Array of Rental objects

#### Example Response:
```json
[
  {
    "rentalID": 1,
    "bikeID": 5,
    "renterID": 3,
    "stationID": 2,
    "assignedStaff": 1,
    "initialBattery": 95.0,
    "finalBattery": 45.0,
    "initBikeCondition": "Excellent condition",
    "finalBikeCondition": "Good condition, minor scratches",
    "rentalDate": "2024-12-16T09:00:00",
    "reservedDate": "2024-12-15T14:00:00",
    "returnDate": "2024-12-16T18:00:00",
    "deposit": 500000,
    "fee": 200000
  }
]
```

---

### 2. **GET** `/api/Rental/GetRentalById/{id}`
**Description**: Get specific rental by ID  
**Permission**: 
- Renters: Can only view their own rentals
- Staff/Admin: Can view any rental  

**Parameters**:
- `id` (int): Rental ID

#### Example Response:
```json
{
  "rentalID": 1,
  "bikeID": 5,
  "renterID": 3,
  "stationID": 2,
  "assignedStaff": 1,
  "initialBattery": 95.0,
  "finalBattery": 0.0,
  "initBikeCondition": "Excellent condition",
  "finalBikeCondition": null,
  "rentalDate": "2024-12-16T09:00:00",
  "reservedDate": "2024-12-15T14:00:00",
  "returnDate": null,
  "deposit": 500000,
  "fee": null
}
```

---

### 3. **POST** `/api/Rental/CreateRental`
**Description**: Create a new rental  
**Permission**: All authenticated users  

#### Request Body:
```json
{
  "bikeID": 5,
  "renterID": 3,
  "stationID": 2,
  "assignedStaff": 1,
  "initialBattery": 95.0,
  "initBikeCondition": "Excellent condition",
  "rentalDate": "2024-12-16T09:00:00",
  "reservedDate": "2024-12-15T14:00:00",
  "returnDate": "2024-12-16T18:00:00",
  "deposit": 500000,
  "fee": 200000
}
```

#### Example Response:
```json
{
  "message": "T?o ??n thuê xe thành công!"
}
```

---

### 4. **PUT** `/api/Rental/UpdateRental`
**Description**: Update rental information  
**Permission**: Staff and Admin only  

#### Request Body:
```json
{
  "rentalID": 1,
  "bikeID": 5,
  "renterID": 3,
  "stationID": 2,
  "assignedStaff": 2,
  "initialBattery": 95.0,
  "finalBattery": 45.0,
  "initBikeCondition": "Excellent condition",
  "finalBikeCondition": "Good condition",
  "rentalDate": "2024-12-16T09:00:00",
  "reservedDate": "2024-12-15T14:00:00",
  "returnDate": "2024-12-16T18:00:00",
  "deposit": 500000,
  "fee": 200000
}
```

#### Example Response:
```json
{
  "message": "C?p nh?t thông tin thuê xe thành công!"
}
```

---

### 5. **PUT** `/api/Rental/ReturnBike`
**Description**: Process bike return (complete rental)  
**Permission**: Staff and Admin only  

#### Request Body:
```json
{
  "rentalID": 1,
  "finalBattery": 45.0,
  "finalBikeCondition": "Good condition, minor scratches on left side",
  "returnDate": "2024-12-16T18:30:00",
  "fee": 200000
}
```

#### Example Response:
```json
{
  "message": "Tr? xe thành công!"
}
```

---

### 6. **DELETE** `/api/Rental/DeleteRental/{id}`
**Description**: Delete a rental record  
**Permission**: Admin only  

**Parameters**:
- `id` (int): Rental ID to delete

#### Example Response:
```json
{
  "message": "Xóa thông tin thuê xe thành công!"
}
```

---

### 7. **GET** `/api/Rental/GetRentalsByRenter/{renterId}`
**Description**: Get all rentals for a specific renter  
**Permission**: 
- Renters: Can only view their own rentals
- Staff/Admin: Can view any renter's rentals  

**Parameters**:
- `renterId` (int): Renter ID

#### Example Response:
```json
[
  {
    "rentalID": 1,
    "bikeID": 5,
    "renterID": 3,
    // ... other rental details
  },
  {
    "rentalID": 2,
    "bikeID": 7,
    "renterID": 3,
    // ... other rental details
  }
]
```

---

### 8. **GET** `/api/Rental/GetRentalsByBike/{bikeId}`
**Description**: Get rental history for a specific bike  
**Permission**: Staff and Admin only  

**Parameters**:
- `bikeId` (int): Bike ID

#### Example Response:
```json
[
  {
    "rentalID": 1,
    "bikeID": 5,
    "renterID": 3,
    "rentalDate": "2024-12-16T09:00:00",
    "returnDate": "2024-12-16T18:00:00"
    // ... other rental details
  }
]
```

---

### 9. **GET** `/api/Rental/GetActiveRentals`
**Description**: Get all currently active rentals (bikes currently being rented)  
**Permission**: Staff and Admin only  

#### Example Response:
```json
[
  {
    "rentalID": 1,
    "bikeID": 5,
    "renterID": 3,
    "rentalDate": "2024-12-16T09:00:00",
    "returnDate": null
    // ... other rental details
  }
]
```

---

### 10. **POST** `/api/Rental/SearchRentals`
**Description**: Search and filter rentals  
**Permission**: Staff and Admin only  

#### Request Body:
```json
{
  "renterID": 3,
  "bikeID": 5,
  "stationID": 2,
  "startDate": "2024-12-01T00:00:00",
  "endDate": "2024-12-31T23:59:59",
  "status": "active"
}
```

**Status Options**:
- `"active"`: Currently being rented
- `"pending"`: Future bookings
- `"completed"`: Returned bikes

#### Example Response:
```json
[
  {
    "rentalID": 1,
    "bikeID": 5,
    "renterID": 3,
    "stationID": 2,
    "status": "active"
    // ... other rental details
  }
]
```

---

## ?? Data Models

### Rental Model
```json
{
  "rentalID": "integer - Primary key",
  "bikeID": "integer - Foreign key to EVBike",
  "renterID": "integer - Foreign key to Renter", 
  "stationID": "integer - Foreign key to Station",
  "assignedStaff": "integer? - Foreign key to StationStaff (optional)",
  "initialBattery": "decimal - Battery level at rental start (0-100)",
  "finalBattery": "decimal - Battery level at return (0-100)",
  "initBikeCondition": "string? - Bike condition at rental start",
  "finalBikeCondition": "string? - Bike condition at return",
  "rentalDate": "datetime - When rental starts",
  "reservedDate": "datetime? - When reservation was made",
  "returnDate": "datetime? - When bike was returned",
  "deposit": "decimal - Deposit amount (VND)",
  "fee": "decimal? - Rental fee (VND)"
}
```

### RentalCreateDTO
```json
{
  "bikeID": "integer - Required",
  "renterID": "integer - Required",
  "stationID": "integer - Required", 
  "assignedStaff": "integer? - Optional",
  "initialBattery": "decimal - Required (0-100)",
  "initBikeCondition": "string? - Optional",
  "rentalDate": "datetime - Required",
  "reservedDate": "datetime? - Optional",
  "returnDate": "datetime? - Optional",
  "deposit": "decimal - Required",
  "fee": "decimal? - Optional"
}
```

### RentalReturnDTO
```json
{
  "rentalID": "integer - Required",
  "finalBattery": "decimal - Required (0-100)",
  "finalBikeCondition": "string - Required",
  "returnDate": "datetime - Required", 
  "fee": "decimal? - Optional"
}
```

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

### 404 Not Found
```json
{
  "message": "Không tìm th?y thông tin thuê xe!"
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

#### Create Rental
```javascript
const createRental = async (rentalData) => {
  try {
    const response = await fetch('/api/Rental/CreateRental', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(rentalData)
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log('Rental created:', result.message);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

#### Get User's Rentals
```javascript
const getUserRentals = async (renterId) => {
  try {
    const response = await fetch(`/api/Rental/GetRentalsByRenter/${renterId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const rentals = await response.json();
      return rentals;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return [];
  }
};
```

#### Return Bike
```javascript
const returnBike = async (returnData) => {
  try {
    const response = await fetch('/api/Rental/ReturnBike', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(returnData)
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log('Bike returned:', result.message);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

---

## ?? Integration Tips

### 1. **Rental Workflow**
1. User selects bike and creates rental ? `CreateRental`
2. Staff assigns bike and updates initial condition ? `UpdateRental`
3. Customer uses bike during rental period
4. Staff processes return ? `ReturnBike`

### 2. **Status Tracking**
- Use `GetActiveRentals` for currently rented bikes
- Use `SearchRentals` with status filters for dashboards
- Check rental dates to determine current status

### 3. **Permission Handling**
```javascript
const checkUserRole = (user) => {
  return {
    isRenter: user.roleID === "1",
    isStaff: user.roleID === "2", 
    isAdmin: user.roleID === "3",
    canManageRentals: user.roleID === "2" || user.roleID === "3"
  };
};
```

### 4. **Date Validation**
```javascript
const validateRentalDates = (rentalDate, returnDate, reservedDate) => {
  const now = new Date();
  const rental = new Date(rentalDate);
  const return = returnDate ? new Date(returnDate) : null;
  const reserved = reservedDate ? new Date(reservedDate) : null;
  
  if (rental < now) return "Rental date cannot be in the past";
  if (return && return <= rental) return "Return date must be after rental date";
  if (reserved && reserved > rental) return "Reserved date must be before rental date";
  
  return null; // No errors
};
```

---

## ?? Business Logic Notes

### Rental States
- **Pending**: `rentalDate` > current time
- **Active**: `rentalDate` ? current time AND (`returnDate` is null OR `returnDate` ? current time)
- **Completed**: `returnDate` < current time

### Validation Rules
- Initial battery must be between 0-100
- Deposit is required for all rentals
- Return date must be after rental date
- Reserved date must be before rental date
- Only staff can update rental information
- Only staff can process bike returns

This comprehensive API allows full rental lifecycle management in your EV rental system! ??