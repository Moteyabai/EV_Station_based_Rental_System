# ?? Station API Documentation

## ?? Overview
Complete API documentation for Station management in the EV Rental System. These APIs handle all station operations including creating stations, updating station information, managing station status, capacity management, and generating station analytics.

## ?? Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## ?? User Roles & Permissions
- **Public Access**: Can view active stations and search stations
- **Renter (RoleID: 1)**: Can view active stations and search
- **Staff (RoleID: 2)**: Can view active stations and search
- **Admin (RoleID: 3)**: Full access to all station operations

---

## ?? API Endpoints

### 1. **GET** `/api/Station/GetAllStations`
**Description**: Get all stations in the system (including inactive ones)  
**Permission**: Public access  
**Response**: Array of Station objects

#### Example Response:
```json
[
  {
    "stationID": 1,
    "name": "Tr?m Qu?n 1",
    "address": "123 Nguy?n Hu?, Qu?n 1, TP.HCM",
    "description": "Tr?m xe ?i?n trung tâm thành ph?",
    "bikeCapacity": 50,
    "openingHours": "24/7",
    "contactNumber": "0901234567",
    "imageUrl": "https://example.com/station1.jpg",
    "exteriorImageUrl": "https://example.com/station1_exterior.jpg",
    "thumbnailImageUrl": "https://example.com/station1_thumb.jpg",
    "isActive": true,
    "createdAt": "2024-12-01T08:00:00",
    "updatedAt": "2024-12-15T14:30:00"
  }
]
```

---

### 2. **GET** `/api/Station/GetActiveStations`
**Description**: Get only active stations  
**Permission**: Public access  
**Response**: Array of active Station objects

#### Example Response:
```json
[
  {
    "stationID": 1,
    "name": "Tr?m Qu?n 1",
    "address": "123 Nguy?n Hu?, Qu?n 1, TP.HCM",
    "isActive": true,
    "bikeCapacity": 50
    // ... other station details
  }
]
```

---

### 3. **GET** `/api/Station/GetStationById/{id}`
**Description**: Get specific station by ID  
**Permission**: Public access  

**Parameters**:
- `id` (int): Station ID

#### Example Response:
```json
{
  "stationID": 1,
  "name": "Tr?m Qu?n 1",
  "address": "123 Nguy?n Hu?, Qu?n 1, TP.HCM",
  "description": "Tr?m xe ?i?n trung tâm thành ph?",
  "bikeCapacity": 50,
  "openingHours": "24/7",
  "contactNumber": "0901234567",
  "isActive": true,
  "createdAt": "2024-12-01T08:00:00",
  "updatedAt": "2024-12-15T14:30:00"
}
```

---

### 4. **POST** `/api/Station/CreateStation`
**Description**: Create a new station  
**Permission**: Admin only  

#### Request Body:
```json
{
  "name": "Tr?m Qu?n 2",
  "address": "456 ???ng Th? Thiêm, Qu?n 2, TP.HCM",
  "description": "Tr?m xe ?i?n khu v?c Th? Thiêm",
  "bikeCapacity": 30,
  "openingHours": "06:00 - 22:00",
  "contactNumber": "0907654321",
  "imageUrl": "https://example.com/station2.jpg",
  "exteriorImageUrl": "https://example.com/station2_exterior.jpg",
  "thumbnailImageUrl": "https://example.com/station2_thumb.jpg",
  "isActive": true
}
```

#### Example Response:
```json
{
  "message": "T?o tr?m thành công!"
}
```

---

### 5. **PUT** `/api/Station/UpdateStation`
**Description**: Update station information  
**Permission**: Admin only  

#### Request Body:
```json
{
  "stationID": 1,
  "name": "Tr?m Qu?n 1 - C?p nh?t",
  "address": "123 Nguy?n Hu?, Qu?n 1, TP.HCM",
  "description": "Tr?m xe ?i?n trung tâm thành ph? - ?ã nâng c?p",
  "bikeCapacity": 60,
  "openingHours": "24/7",
  "contactNumber": "0901234567",
  "isActive": true
}
```

#### Example Response:
```json
{
  "message": "C?p nh?t thông tin tr?m thành công!"
}
```

---

### 6. **PUT** `/api/Station/UpdateStationStatus`
**Description**: Update station status (activate/deactivate)  
**Permission**: Admin only  

#### Request Body:
```json
{
  "stationID": 1,
  "isActive": false,
  "note": "T?m th?i ?óng c?a ?? b?o trì"
}
```

#### Example Response:
```json
{
  "message": "?ã vô hi?u hóa tr?m thành công!"
}
```

---

### 7. **PUT** `/api/Station/UpdateStationCapacity`
**Description**: Update station bike capacity  
**Permission**: Admin only  

#### Request Body:
```json
{
  "stationID": 1,
  "bikeCapacity": 75,
  "reason": "M? r?ng khu v?c ??u xe"
}
```

#### Example Response:
```json
{
  "message": "C?p nh?t s?c ch?a tr?m thành công!"
}
```

---

### 8. **DELETE** `/api/Station/DeleteStation/{id}`
**Description**: Delete a station  
**Permission**: Admin only  

**Parameters**:
- `id` (int): Station ID to delete

#### Example Response:
```json
{
  "message": "Xóa tr?m thành công!"
}
```

---

### 9. **GET** `/api/Station/SearchByName/{name}`
**Description**: Search stations by name  
**Permission**: Public access  

**Parameters**:
- `name` (string): Station name to search for

#### Example Response:
```json
[
  {
    "stationID": 1,
    "name": "Tr?m Qu?n 1",
    "address": "123 Nguy?n Hu?, Qu?n 1, TP.HCM"
    // ... other station details
  }
]
```

---

### 10. **GET** `/api/Station/SearchByAddress/{address}`
**Description**: Search stations by address  
**Permission**: Public access  

**Parameters**:
- `address` (string): Address to search for

#### Example Response:
```json
[
  {
    "stationID": 1,
    "name": "Tr?m Qu?n 1",
    "address": "123 Nguy?n Hu?, Qu?n 1, TP.HCM"
    // ... other station details
  }
]
```

---

### 11. **GET** `/api/Station/GetByCapacityRange`
**Description**: Get stations within capacity range  
**Permission**: Public access  

**Query Parameters**:
- `minCapacity` (int): Minimum capacity
- `maxCapacity` (int): Maximum capacity

#### Example URL:
```
GET /api/Station/GetByCapacityRange?minCapacity=20&maxCapacity=50
```

#### Example Response:
```json
[
  {
    "stationID": 1,
    "name": "Tr?m Qu?n 1",
    "bikeCapacity": 30
    // ... other station details
  }
]
```

---

### 12. **GET** `/api/Station/GetInactiveStations`
**Description**: Get all inactive stations  
**Permission**: Admin only  

#### Example Response:
```json
[
  {
    "stationID": 2,
    "name": "Tr?m Qu?n 3",
    "isActive": false
    // ... other station details
  }
]
```

---

### 13. **POST** `/api/Station/SearchStations`
**Description**: Advanced search with multiple filters  
**Permission**: Public access  

#### Request Body:
```json
{
  "name": "Qu?n 1",
  "address": "TP.HCM",
  "isActive": true,
  "minCapacity": 20,
  "maxCapacity": 100,
  "createdAfter": "2024-01-01T00:00:00",
  "createdBefore": "2024-12-31T23:59:59",
  "openingHours": "24/7"
}
```

#### Example Response:
```json
[
  {
    "stationID": 1,
    "name": "Tr?m Qu?n 1",
    "address": "123 Nguy?n Hu?, Qu?n 1, TP.HCM",
    "bikeCapacity": 50,
    "isActive": true
    // ... other station details
  }
]
```

---

### 14. **GET** `/api/Station/GetStationStatistics`
**Description**: Get station statistics and analytics  
**Permission**: Admin only  

#### Example Response:
```json
{
  "totalStations": 15,
  "activeStations": 12,
  "inactiveStations": 3,
  "totalBikeCapacity": 450,
  "averageCapacityPerStation": 30,
  "latestStationCreated": "2024-12-15T10:00:00",
  "latestStationUpdated": "2024-12-16T14:30:00",
  "stationsByOpeningHours": {
    "24/7": 8,
    "06:00 - 22:00": 4,
    "08:00 - 20:00": 3
  },
  "stationsByCapacityRange": {
    "20": 5,
    "30": 7,
    "40": 2,
    "50": 1
  }
}
```

---

### 15. **GET** `/api/Station/GetTotalCapacity`
**Description**: Get total bike capacity across all active stations  
**Permission**: Public access  

#### Example Response:
```json
{
  "totalCapacity": 450
}
```

---

### 16. **GET** `/api/Station/GetStationsWithAvailableBikes`
**Description**: Get stations that have available bikes  
**Permission**: Public access  
**Note**: Currently returns active stations (would need actual bike availability integration)

#### Example Response:
```json
[
  {
    "stationID": 1,
    "name": "Tr?m Qu?n 1",
    "bikeCapacity": 50,
    "isActive": true
    // ... other station details
  }
]
```

---

## ?? Data Models

### Station Model
```json
{
  "stationID": "integer - Primary key",
  "name": "string - Station name (max 255 characters)",
  "address": "string - Station address (max 500 characters)",
  "description": "string? - Station description (max 500 characters)",
  "bikeCapacity": "integer - Maximum number of bikes (1-1000)",
  "openingHours": "string - Operating hours (max 100 characters, default '24/7')",
  "contactNumber": "string? - Vietnamese phone number (max 20 characters)",
  "imageUrl": "string? - Main image URL (max 500 characters)",
  "exteriorImageUrl": "string? - Exterior image URL (max 500 characters)",
  "thumbnailImageUrl": "string? - Thumbnail image URL (max 500 characters)",
  "isActive": "boolean - Station status (default true)",
  "createdAt": "datetime - When station was created",
  "updatedAt": "datetime - When station was last updated"
}
```

### StationCreateDTO
```json
{
  "name": "string - Required, max 255 characters",
  "address": "string - Required, max 500 characters",
  "description": "string? - Optional, max 500 characters",
  "bikeCapacity": "integer - Required, 1-1000",
  "openingHours": "string - Optional, max 100 characters, default '24/7'",
  "contactNumber": "string? - Optional, Vietnamese phone format",
  "imageUrl": "string? - Optional, max 500 characters",
  "exteriorImageUrl": "string? - Optional, max 500 characters",
  "thumbnailImageUrl": "string? - Optional, max 500 characters",
  "isActive": "boolean - Optional, default true"
}
```

### StationUpdateDTO
```json
{
  "stationID": "integer - Required",
  "name": "string? - Optional, max 255 characters",
  "address": "string? - Optional, max 500 characters",
  "description": "string? - Optional, max 500 characters",
  "bikeCapacity": "integer? - Optional, 1-1000",
  "openingHours": "string? - Optional, max 100 characters",
  "contactNumber": "string? - Optional, Vietnamese phone format",
  "imageUrl": "string? - Optional, max 500 characters",
  "exteriorImageUrl": "string? - Optional, max 500 characters",
  "thumbnailImageUrl": "string? - Optional, max 500 characters",
  "isActive": "boolean? - Optional"
}
```

### StationSearchDTO
```json
{
  "name": "string? - Optional name filter",
  "address": "string? - Optional address filter",
  "isActive": "boolean? - Optional status filter",
  "minCapacity": "integer? - Optional minimum capacity (1-1000)",
  "maxCapacity": "integer? - Optional maximum capacity (1-1000)",
  "createdAfter": "datetime? - Optional creation date filter",
  "createdBefore": "datetime? - Optional creation date filter",
  "openingHours": "string? - Optional opening hours filter"
}
```

---

## ?? Station Constants

### Status Values
- `true`: Active (?ang ho?t ??ng)
- `false`: Inactive (T?m ng?ng)

### Common Opening Hours
- `"24/7"`: Available 24/7
- `"06:00 - 22:00"`: 6 AM to 10 PM
- `"08:00 - 20:00"`: 8 AM to 8 PM

### Capacity Ranges
- Small stations: 1-20 bikes
- Medium stations: 21-50 bikes
- Large stations: 51+ bikes

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
  "message": "Không tìm th?y thông tin tr?m!"
}
```

### 409 Conflict
```json
{
  "message": "Tên tr?m ?ã t?n t?i!"
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

#### Get All Active Stations
```javascript
const getActiveStations = async () => {
  try {
    const response = await fetch('/api/Station/GetActiveStations');
    
    if (response.ok) {
      const stations = await response.json();
      return stations;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
};
```

#### Create New Station
```javascript
const createStation = async (stationData, authToken) => {
  try {
    const response = await fetch('/api/Station/CreateStation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(stationData)
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log('Station created:', result.message);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Example usage
createStation({
  name: "Tr?m Qu?n 2",
  address: "456 ???ng Th? Thiêm, Qu?n 2, TP.HCM",
  description: "Tr?m xe ?i?n khu v?c Th? Thiêm",
  bikeCapacity: 30,
  openingHours: "06:00 - 22:00",
  contactNumber: "0907654321",
  isActive: true
}, authToken);
```

#### Search Stations
```javascript
const searchStations = async (searchCriteria) => {
  try {
    const response = await fetch('/api/Station/SearchStations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchCriteria)
    });
    
    if (response.ok) {
      const stations = await response.json();
      return stations;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error searching stations:', error);
    return [];
  }
};

// Search for stations in District 1 with capacity > 20
searchStations({
  name: "Qu?n 1",
  isActive: true,
  minCapacity: 20
});
```

#### Update Station Status
```javascript
const updateStationStatus = async (stationId, isActive, authToken, note = null) => {
  try {
    const response = await fetch('/api/Station/UpdateStationStatus', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        stationID: stationId,
        isActive: isActive,
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

// Deactivate station for maintenance
updateStationStatus(1, false, authToken, "B?o trì ??nh k?");
```

#### Get Station Statistics
```javascript
const getStationStatistics = async (authToken) => {
  try {
    const response = await fetch('/api/Station/GetStationStatistics', {
      headers: {
        'Authorization': `Bearer ${authToken}`
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

### 1. **Station Display**
```javascript
const displayStationCard = (station) => {
  return `
    <div class="station-card ${station.isActive ? 'active' : 'inactive'}">
      <h3>${station.name}</h3>
      <p><i class="icon-location"></i> ${station.address}</p>
      <p><i class="icon-capacity"></i> S?c ch?a: ${station.bikeCapacity} xe</p>
      <p><i class="icon-time"></i> ${station.openingHours}</p>
      <span class="status ${station.isActive ? 'active' : 'inactive'}">
        ${station.isActive ? '?ang ho?t ??ng' : 'T?m ng?ng'}
      </span>
    </div>
  `;
};
```

### 2. **Station Filtering**
```javascript
const filterStations = (stations, filters) => {
  return stations.filter(station => {
    if (filters.isActive !== undefined && station.isActive !== filters.isActive) {
      return false;
    }
    
    if (filters.minCapacity && station.bikeCapacity < filters.minCapacity) {
      return false;
    }
    
    if (filters.maxCapacity && station.bikeCapacity > filters.maxCapacity) {
      return false;
    }
    
    if (filters.name && !station.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    
    return true;
  });
};
```

### 3. **Permission Checking**
```javascript
const checkStationPermission = (user) => {
  const isAdmin = user.roleID === "3";
  
  return {
    canView: true, // All users can view stations
    canCreate: isAdmin,
    canUpdate: isAdmin,
    canDelete: isAdmin,
    canManageStatus: isAdmin
  };
};
```

### 4. **Phone Number Validation**
```javascript
const validateVietnamesePhone = (phone) => {
  const phoneRegex = /^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8-9]|9[0-9])[0-9]{7}$/;
  return phoneRegex.test(phone);
};
```

### 5. **Station Status Management**
```javascript
const StationStatus = {
  ACTIVE: true,
  INACTIVE: false
};

const getStatusText = (isActive) => {
  return isActive ? "?ang ho?t ??ng" : "T?m ng?ng";
};

const getStatusClass = (isActive) => {
  return isActive ? "status-active" : "status-inactive";
};
```

---

## ?? Business Logic Notes

### Station Validation Rules
- Station name must be unique
- Capacity must be between 1 and 1000 bikes
- Phone number must follow Vietnamese format
- Only admins can create, update, or delete stations
- Address and name are required fields

### Station Status Management
- Inactive stations are not shown to regular users
- Only active stations appear in public searches
- Admin can view and manage all stations regardless of status

### Search and Filtering
- Name and address searches are case-insensitive
- Capacity filtering supports min/max ranges
- Date filtering for creation and update times
- All filters can be combined for advanced searches

### Analytics and Statistics
- Real-time calculations based on current data
- Capacity statistics include totals and averages  
- Opening hours analysis for operational insights
- Creation and update tracking for administration

This comprehensive Station API provides complete station management functionality for your EV rental system! ?????