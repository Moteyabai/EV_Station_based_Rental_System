# Rental Status Management APIs for Staff

## Overview
Added endpoints to the `StationStaffController` that allow staff to manage rental statuses during the bike handover and return process.

## Rental Status Flow

```
Reserved (1) ? OnGoing (2) ? Completed (4)
              ?
         Cancelled (3)
```

### Status Enum Values:
- **0: Pending** - Initial state (not used in this flow)
- **1: Reserved** - Customer has paid and reserved the bike
- **2: OnGoing** - Staff has confirmed handover, bike is being rented
- **3: Cancelled** - Rental was cancelled
- **4: Completed** - Staff has confirmed return, rental complete

---

## New API Endpoints

### 1. Get Assigned Rentals
**Endpoint:** `GET /api/StationStaff/GetAssignedRentals/{staffId}`

**Description:** Get all rentals assigned to a specific staff member.

**Authorization:** Staff (viewing own) or Admin

**Query Parameters:**
- `status` (optional): Filter by rental status (0-4)

**Example:**
```http
GET /api/StationStaff/GetAssignedRentals/5?status=1
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "rentalID": 123,
    "bikeID": 45,
    "renterID": 67,
    "stationID": 2,
    "assignedStaff": 5,
    "initialBattery": 100,
    "status": 1,
    "rentalDate": "2025-01-15T08:00:00",
    "deposit": 500000
  }
]
```

---

### 2. Confirm Rental Start (Reserved ? OnGoing)
**Endpoint:** `PUT /api/StationStaff/ConfirmRentalStart`

**Description:** Staff confirms bike handover to customer. Changes status from Reserved to OnGoing.

**Authorization:** Staff or Admin

**Request Body:**
```json
{
  "rentalID": 123,
  "staffID": 5,
  "initialBattery": 95,
  "initBikeCondition": "Xe trong tình tr?ng t?t, không tr?y x??c",
  "notes": "?ã ki?m tra gi?y t? và h??ng d?n khách hàng"
}
```

**Validations:**
- ? Rental must exist
- ? Staff must exist
- ? Current status must be "Reserved"
- ? Staff can only confirm for themselves (unless Admin)
- ? Battery must be 0-100

**Success Response:**
```json
{
  "message": "?ã xác nh?n giao xe thành công! Tr?ng thái ??n thuê chuy?n sang '?ang thuê'."
}
```

**Side Effects:**
- Rental status: Reserved ? OnGoing
- Rental.AssignedStaff = staffID
- Rental.InitialBattery = value from request
- Rental.InitBikeCondition = value from request
- Rental.RentalDate = current timestamp
- Staff.HandoverTimes += 1

---

### 3. Complete Rental (OnGoing ? Completed)
**Endpoint:** `PUT /api/StationStaff/CompleteRental`

**Description:** Staff confirms bike return from customer. Changes status from OnGoing to Completed.

**Authorization:** Staff or Admin

**Request Body:**
```json
{
  "rentalID": 123,
  "staffID": 5,
  "finalBattery": 45,
  "finalBikeCondition": "Xe tr? v? trong tình tr?ng t?t, không h? h?ng",
  "fee": 350000,
  "notes": "Khách hàng tr? xe ?úng h?n"
}
```

**Validations:**
- ? Rental must exist
- ? Staff must exist
- ? Current status must be "OnGoing"
- ? Rental must not already have a return date
- ? Staff can only confirm for themselves (unless Admin)
- ? Battery must be 0-100

**Success Response:**
```json
{
  "message": "?ã xác nh?n thu h?i xe thành công! Tr?ng thái ??n thuê chuy?n sang 'Hoàn thành'."
}
```

**Side Effects:**
- Rental status: OnGoing ? Completed
- Rental.FinalBattery = value from request
- Rental.FinalBikeCondition = value from request
- Rental.ReturnDate = current timestamp
- Rental.Fee = value from request (if provided)
- Staff.ReceiveTimes += 1

---

### 4. Get Station Rentals
**Endpoint:** `GET /api/StationStaff/GetStationRentals/{stationId}`

**Description:** Get all rentals for a specific station.

**Authorization:** Staff or Admin

**Query Parameters:**
- `status` (optional): Filter by rental status (0-4)

**Example:**
```http
GET /api/StationStaff/GetStationRentals/2?status=2
Authorization: Bearer {token}
```

---

### 5. Get Pending Handovers
**Endpoint:** `GET /api/StationStaff/GetPendingHandovers`

**Description:** Get all rentals with "Reserved" status that need to be handed over.

**Authorization:** Staff or Admin

**Query Parameters:**
- `stationId` (optional): Filter by station

**Example:**
```http
GET /api/StationStaff/GetPendingHandovers?stationId=2
Authorization: Bearer {token}
```

**Use Case:** Staff dashboard showing bikes ready to be handed over to customers.

---

### 6. Get Pending Returns
**Endpoint:** `GET /api/StationStaff/GetPendingReturns`

**Description:** Get all rentals with "OnGoing" status that are expected to be returned.

**Authorization:** Staff or Admin

**Query Parameters:**
- `stationId` (optional): Filter by station

**Example:**
```http
GET /api/StationStaff/GetPendingReturns?stationId=2
Authorization: Bearer {token}
```

**Use Case:** Staff dashboard showing bikes currently out on rental that need to be returned.

---

## Updated DTOs

### RentalConfirmStartDTO
```csharp
public class RentalConfirmStartDTO
{
    [Required]
    public int RentalID { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int StaffID { get; set; }
    
    [Required]
    [Range(0, 100)]
    public decimal InitialBattery { get; set; }
    
    [StringLength(500)]
    public string? InitBikeCondition { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
}
```

### RentalCompleteDTO
```csharp
public class RentalCompleteDTO
{
    [Required]
    public int RentalID { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int StaffID { get; set; }
    
    [Required]
    [Range(0, 100)]
    public decimal FinalBattery { get; set; }
    
    [Required]
    [StringLength(500)]
    public string FinalBikeCondition { get; set; }
    
    [Range(0, 50000000)]
    public decimal? Fee { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
}
```

---

## Workflow Example

### Scenario: Customer Rents a Bike

#### Step 1: Customer Makes Reservation
- Customer selects bike and makes payment
- System creates Rental with status = **Reserved (1)**

#### Step 2: Staff Confirms Handover
Staff calls:
```http
PUT /api/StationStaff/ConfirmRentalStart
Content-Type: application/json
Authorization: Bearer {staff_token}

{
  "rentalID": 123,
  "staffID": 5,
  "initialBattery": 95,
  "initBikeCondition": "Tình tr?ng t?t",
  "notes": "?ã ki?m tra gi?y t?"
}
```

**Result:**
- Rental status: Reserved ? **OnGoing (2)**
- Customer can now use the bike
- Staff.HandoverTimes incremented

#### Step 3: Customer Returns Bike
Staff calls:
```http
PUT /api/StationStaff/CompleteRental
Content-Type: application/json
Authorization: Bearer {staff_token}

{
  "rentalID": 123,
  "staffID": 5,
  "finalBattery": 45,
  "finalBikeCondition": "Tr? v? t?t",
  "fee": 350000,
  "notes": "Khách tr? ?úng h?n"
}
```

**Result:**
- Rental status: OnGoing ? **Completed (4)**
- Bike is available for next rental
- Staff.ReceiveTimes incremented

---

## Error Handling

### Common Error Responses

**Invalid Status Transition:**
```json
{
  "message": "Ch? có th? xác nh?n giao xe khi tr?ng thái là 'Reserved'. Tr?ng thái hi?n t?i: OnGoing"
}
```

**Unauthorized Staff:**
```json
{
  "message": "B?n ch? có th? xác nh?n giao xe cho chính mình!"
}
```

**Rental Not Found:**
```json
{
  "message": "Không tìm th?y thông tin thuê xe!"
}
```

**Already Returned:**
```json
{
  "message": "??n thuê này ?ã ???c tr? xe!"
}
```

---

## Authorization Matrix

| Endpoint | Renter | Staff (Own) | Staff (Others) | Admin |
|----------|--------|-------------|----------------|-------|
| GetAssignedRentals | ? | ? | ? | ? |
| ConfirmRentalStart | ? | ? | ? | ? |
| CompleteRental | ? | ? | ? | ? |
| GetStationRentals | ? | ? | ? | ? |
| GetPendingHandovers | ? | ? | ? | ? |
| GetPendingReturns | ? | ? | ? | ? |

---

## Testing Checklist

### ConfirmRentalStart Tests:
- ? Can confirm when status is Reserved
- ? Cannot confirm when status is OnGoing
- ? Cannot confirm when status is Completed
- ? Staff can only confirm for themselves
- ? Admin can confirm for any staff
- ? HandoverTimes increments correctly
- ? Battery validation (0-100)

### CompleteRental Tests:
- ? Can complete when status is OnGoing
- ? Cannot complete when status is Reserved
- ? Cannot complete when status is Completed
- ? Cannot complete if already returned
- ? Staff can only complete for themselves
- ? Admin can complete for any staff
- ? ReceiveTimes increments correctly
- ? Battery validation (0-100)

### General Tests:
- ? Non-staff users cannot access endpoints
- ? Invalid rental ID returns 404
- ? Invalid staff ID returns 404
- ? Model validation works correctly

---

## Database Changes

### Rental Table Updates on ConfirmRentalStart:
- `Status`: 1 ? 2
- `AssignedStaff`: Set to staffID
- `InitialBattery`: Set from request
- `InitBikeCondition`: Set from request
- `RentalDate`: Set to current timestamp

### Rental Table Updates on CompleteRental:
- `Status`: 2 ? 4
- `FinalBattery`: Set from request
- `FinalBikeCondition`: Set from request
- `ReturnDate`: Set to current timestamp
- `Fee`: Set from request (if provided)

### StationStaff Table Updates:
- `HandoverTimes`: Incremented on ConfirmRentalStart
- `ReceiveTimes`: Incremented on CompleteRental

---

## Integration Notes

### Frontend Integration:
1. **Staff Dashboard** should call `GetPendingHandovers` to show bikes ready for handover
2. **Staff Dashboard** should call `GetPendingReturns` to show bikes expected back
3. **Handover Modal** should call `ConfirmRentalStart` when staff confirms handover
4. **Return Modal** should call `CompleteRental` when staff confirms return

### Performance Tracking:
- Staff performance can be tracked using `HandoverTimes` and `ReceiveTimes`
- Use `GetAssignedRentals` to see all rentals a staff member has handled

---

## Build Status

? All code compiles successfully
? No breaking changes to existing functionality
? Follows existing controller patterns
? Ready for immediate deployment
