# User History API Integration Summary

## Overview
Removed mock data from `UserHistory.jsx` and integrated the backend API endpoint `/api/Rental/GetRentalsByAccountID/{accountID}` to fetch real user rental history.

## Changes Made

### 1. **Added New API Function** (`src/api/rentals.js`)
```javascript
export async function getRentalsByAccountID(accountID, token)
```
- Fetches all rentals for a specific user account
- Uses the endpoint: `GET /api/Rental/GetRentalsByAccountID/{accountID}`
- Requires JWT authentication token

### 2. **Updated UserHistory Component** (`src/pages/UserHistory.jsx`)

#### Added Imports:
- `getRentalsByAccountID` from `../api/rentals`
- `getBikeById` from `../api/bikes`
- `fetchStationById` from `../api/stations`
- `getToken` from `../utils/auth`
- `Spin, LoadingOutlined` from Ant Design for loading states

#### Removed:
- localStorage-based mock data fetching
- Dependency on email-based booking filtering

#### Added Features:
- **Loading State**: Shows spinner while fetching data
- **Error Handling**: Displays error message with retry button
- **Real-time Data Fetching**: Calls API on component mount
- **Enhanced Data Mapping**: Enriches rental data with bike and station information

## API Response Mapping

### API Response Structure (from endpoint):
```json
{
  "rentalID": 0,
  "bikeName": "string",
  "licensePlate": "string",
  "phoneNumber": "string",
  "email": "string",
  "startDate": "2025-11-09T06:32:50.160Z",
  "endDate": "2025-11-09T06:32:50.160Z",
  "handoverDate": "2025-11-09T06:32:50.160Z",
  "returnDate": "2025-11-09T06:32:50.160Z",
  "assignedStaff": 0,
  "initialBattery": 0,
  "finalBattery": 0,
  "deposit": 0,
  "fee": 0,
  "status": 0
}
```

### Mapped to Booking Object:
```javascript
{
  bookingId: rental.rentalID.toString(),
  rentalID: rental.rentalID,
  vehicleName: bikeName,              // Fetched from getBikeById()
  vehicleImage: bikeImage,            // Fetched from getBikeById()
  pickupDate: rental.startDate,
  returnDate: rental.endDate,
  pickupStation: pickupStationName,   // Fetched from fetchStationById()
  returnStation: returnStationName,   // Fetched from fetchStationById()
  status: status,                     // Mapped from rental.status
  totalPrice: rental.fee,
  createdAt: rental.startDate,
  handoverAt: rental.handoverDate,
  returnedAt: rental.returnDate,
  payment: {
    amount: rental.fee,
    method: 'online'
  },
  // Additional API fields
  licensePlate: rental.licensePlate,
  phoneNumber: rental.phoneNumber,
  email: rental.email,
  initialBattery: rental.initialBattery,
  finalBattery: rental.finalBattery,
  deposit: rental.deposit,
  assignedStaff: rental.assignedStaff
}
```

## Status Mapping

API status codes are mapped to user-friendly status:

| API Status | Condition | Display Status |
|------------|-----------|----------------|
| 0 | Pending | `pending_payment` |
| 1 | No handoverDate | `confirmed` |
| 1 | Has handoverDate, no returnDate | `renting` |
| 1 | Has both handoverDate & returnDate | `completed` |

## Data Enrichment

The component fetches additional data to provide a complete user experience:

1. **Bike Details** (`getBikeById`):
   - Bike name
   - Bike image URL

2. **Station Details** (`fetchStationById`):
   - Pickup station name
   - Return station name

3. **Graceful Fallbacks**:
   - If bike/station fetch fails, uses default values
   - Ensures UI renders even with partial data

## User Flow

1. User navigates to `/user-history` page
2. Component checks authentication and role
3. Fetches rentals using user's `accountID`
4. For each rental:
   - Fetches bike details
   - Fetches pickup station details
   - Fetches return station details
5. Maps all data to display format
6. Renders rental history cards with statistics

## Error Handling

- **No Authentication**: Redirects to login page
- **Wrong Role**: Redirects Staff/Admin to appropriate pages
- **API Errors**: Shows error message with retry button
- **Network Errors**: Graceful degradation with default values
- **Missing Data**: Uses fallback values (e.g., "Chưa xác định")

## Testing Checklist

- [ ] User with rentals sees their history
- [ ] User without rentals sees empty state
- [ ] Loading spinner appears during fetch
- [ ] Error message shows on API failure
- [ ] Retry button works after error
- [ ] Status badges display correctly
- [ ] Vehicle images load properly
- [ ] Station names display correctly
- [ ] Date formatting is correct
- [ ] Price formatting is correct
- [ ] Tabs filter rentals correctly
- [ ] Statistics calculate correctly

## Dependencies

- `src/api/rentals.js` - Rental API functions
- `src/api/bikes.js` - Bike API functions
- `src/api/stations.js` - Station API functions
- `src/utils/auth.js` - Token management
- `src/contexts/AuthContext.jsx` - User authentication context

## Future Enhancements

1. Add refresh button to manually reload data
2. Implement real-time updates via WebSocket
3. Add export/print functionality for rental history
4. Include downloadable receipts per rental
5. Add filtering by date range
6. Add search functionality
7. Implement pagination for large histories
8. Cache bike/station data to reduce API calls
