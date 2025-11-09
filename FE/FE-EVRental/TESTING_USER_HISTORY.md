# Testing User History API Integration

## Prerequisites
✅ Backend API running on `http://localhost:5168`  
✅ Frontend dev server running on `http://localhost:5173`  
✅ User account created and logged in

## Test Scenarios

### 1. **View User Rental History**

**Steps:**
1. Log in with a customer account (roleID = 1)
2. Navigate to User Profile → "Lịch sử thuê xe" tab OR go to `/user-history`
3. Wait for data to load

**Expected Results:**
- ✅ Loading spinner appears while fetching data
- ✅ Rental cards display with correct information
- ✅ Vehicle images load correctly
- ✅ Station names display properly
- ✅ Dates formatted correctly (DD/MM/YYYY)
- ✅ Prices formatted with VNĐ currency
- ✅ Status badges show correct colors and text

### 2. **Empty State (No Rentals)**

**Steps:**
1. Log in with a new customer account that has no rentals
2. Navigate to `/user-history`

**Expected Results:**
- ✅ "Chưa có đơn thuê xe nào" message appears
- ✅ "Thuê xe ngay" button is visible
- ✅ Clicking button navigates to `/vehicles`

### 3. **Filter by Status**

**Steps:**
1. Navigate to `/user-history` with rentals
2. Click on different tabs:
   - "Tất cả"
   - "Đã đặt xe"
   - "Đang thuê"
   - "Hoàn thành"

**Expected Results:**
- ✅ Rentals filter correctly based on status
- ✅ Count in tab label matches displayed rentals
- ✅ Empty state shows if no rentals in that category

### 4. **Statistics Cards**

**Steps:**
1. Navigate to `/user-history` with multiple rentals

**Expected Results:**
- ✅ "Tổng đơn thuê" shows correct count
- ✅ "Tổng số xe đã thuê" shows correct count
- ✅ "Tổng chi tiêu" calculates total correctly

### 5. **Status Display**

Check that each status displays correctly:

| API Status | Conditions | Display | Badge Color |
|------------|-----------|---------|-------------|
| 0 | Pending payment | "Chờ thanh toán" | Warning (yellow) |
| 1 | Confirmed, not picked up | "Đã xác nhận" | Processing (blue) |
| 1 | Picked up, not returned | "Đang thuê xe" | Success (green) |
| 1 | Returned | "Hoàn thành" | Success (green) |

### 6. **Error Handling**

**Test 6.1: API Down**
1. Stop the backend server
2. Navigate to `/user-history`

**Expected Results:**
- ✅ Error message displays
- ✅ "Thử lại" button is visible
- ✅ Clicking retry attempts to reload data

**Test 6.2: Invalid Token**
1. Clear localStorage/sessionStorage token
2. Navigate to `/user-history`

**Expected Results:**
- ✅ Redirects to login page

**Test 6.3: Network Error**
1. Disconnect from network
2. Navigate to `/user-history`

**Expected Results:**
- ✅ Error message displays
- ✅ Fallback values used where possible

### 7. **Role-Based Access**

**Test 7.1: Staff Access**
1. Log in as Staff (roleID = 2)
2. Try to access `/user-history`

**Expected Results:**
- ✅ Redirects to `/staff`

**Test 7.2: Admin Access**
1. Log in as Admin (roleID = 3)
2. Try to access `/user-history`

**Expected Results:**
- ✅ Redirects to `/admin`

## API Calls to Monitor

Open browser DevTools → Network tab and verify:

### 1. Initial Load
```
GET /api/Rental/GetRentalsByAccountID/{accountID}
Headers: Authorization: Bearer {token}
Status: 200 OK
```

### 2. For Each Rental
```
GET /api/EVBike/GetBikeByID/{bikeID}
Status: 200 OK

GET /api/Station/GetStationById/{stationID}
Status: 200 OK
```

## Console Logs to Check

Look for these logs in browser console:

```
📋 Fetching rentals for account: {accountID}
✅ Rentals from API: [...]
🔍 Fetching bike with ID: {bikeID}
✅ Bike data from API: {...}
🏪 Fetching station with ID: {stationID}
✅ Station data from API: {...}
```

## Common Issues & Solutions

### Issue 1: "Không thể tải lịch sử thuê xe"
**Cause:** Backend API not responding
**Solution:** Ensure backend is running on port 5168

### Issue 2: Loading spinner never stops
**Cause:** API request hanging or CORS issue
**Solution:** Check network tab for failed requests, verify CORS settings

### Issue 3: Images not loading
**Cause:** Invalid image URLs or CORS
**Solution:** Check image URLs in bike data, verify image hosting allows CORS

### Issue 4: Station names show "Chưa xác định"
**Cause:** Station API call failed or station not found
**Solution:** Verify station IDs exist in database

### Issue 5: Dates show "Invalid Date"
**Cause:** Date format from API not recognized
**Solution:** Check date format in API response (should be ISO 8601)

## Performance Considerations

- **Initial Load Time:** Should be < 3 seconds for 10 rentals
- **Data Enrichment:** Each rental makes 3 API calls (rental, bike, station)
- **Optimization Opportunity:** Consider caching bike/station data

## Success Criteria

✅ All rentals display correctly  
✅ No console errors  
✅ Loading states work properly  
✅ Error handling works gracefully  
✅ Role-based access enforced  
✅ Status filtering works correctly  
✅ Statistics calculate accurately  
✅ Images load successfully  
✅ Dates format correctly  
✅ Prices format correctly  

## Test Data Requirements

To fully test, ensure database has:
- At least one user account with `accountID`
- Multiple rentals with different statuses (0 and 1)
- Rentals with `handoverDate` (picked up)
- Rentals with both `handoverDate` and `returnDate` (completed)
- Valid `bikeID` references
- Valid `pickupStationID` and `returnStationID` references
