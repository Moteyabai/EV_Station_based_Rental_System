# Git Commit Message

## Feature: Fetch customer phone from backend API in Staff page

### Changes:

**Frontend:**

- ✅ Checkout.jsx: Save accountID as userId for API compatibility
- ✅ Staff.jsx: Add async fetchUserPhone() function with backend integration
- ✅ Staff.jsx: Update loadBookings() to fetch missing phone numbers from API
- ✅ Staff.jsx: Add debug console logs for troubleshooting

**Backend:**

- ✅ AccountController.cs: Allow Staff (roleID=2) to access GetAccountById endpoint

**Documentation:**

- ✅ PHONE_FETCH_GUIDE.md: Complete testing and debug guide
- ✅ PHONE_FETCH_SUMMARY.md: Implementation summary and flow diagram

### API Integration:

- Endpoint: GET /api/Account/GetAccountById/{id}
- Authorization: Bearer token (Staff/Admin)
- Response: User data including phone number

### Testing:

- ✅ Console logging for debugging
- ✅ Error handling for invalid userId
- ✅ Token expiration handling
- ✅ Permission validation

### Impact:

- Staff can now see customer phone numbers in "Giao nhận xe" tab
- Automatic fetch from backend when phone is missing
- Better customer service with complete contact information
