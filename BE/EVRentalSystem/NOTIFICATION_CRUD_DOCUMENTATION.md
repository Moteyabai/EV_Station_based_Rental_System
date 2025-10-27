# Notification CRUD Implementation

## Overview
Complete CRUD (Create, Read, Update, Delete) implementation for the Notification system with comprehensive features for managing user notifications.

---

## Files Created

### 1. DTOs
**File:** `BusinessObject/Models/DTOs/NotificationDTOs.cs`
- `NotificationCreateDTO` - Create single notification
- `NotificationUpdateDTO` - Update notification
- `NotificationMarkAsReadDTO` - Mark as read
- `NotificationSearchDTO` - Search filters
- `NotificationSummaryDTO` - Display summary
- `NotificationStatisticsDTO` - Analytics data
- `BulkNotificationCreateDTO` - Create multiple notifications

### 2. Repository
**File:** `Repositories/NotificationRepository.cs`
- Basic CRUD operations
- Get notifications by account ID
- Get unread notifications
- Mark as read/Mark all as read
- Get unread count
- Delete old notifications

### 3. Service
**File:** `Services/NotificationService.cs`
- Business logic layer
- Notification creation helpers
- Bulk notification creation

### 4. Controller
**File:** `API/Controllers/NotificationController.cs`
- 16 API endpoints
- Full CRUD + advanced features

---

## API Endpoints

### Basic CRUD

#### 1. Get All Notifications (Admin Only)
```http
GET /api/Notification/GetAllNotifications
Authorization: Bearer {admin_token}
```

#### 2. Get Notification by ID
```http
GET /api/Notification/GetNotificationById/{id}
Authorization: Bearer {token}
```
- **Access:** Admin or notification owner

#### 3. Create Notification (Admin Only)
```http
POST /api/Notification/CreateNotification
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "accountID": 5,
  "message": "Your rental has been confirmed!"
}
```

#### 4. Update Notification (Admin Only)
```http
PUT /api/Notification/UpdateNotification
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "notificationID": 10,
  "message": "Updated notification message",
  "isRead": false
}
```

#### 5. Delete Notification
```http
DELETE /api/Notification/DeleteNotification/{id}
Authorization: Bearer {token}
```
- **Access:** Admin or notification owner

---

### User Endpoints

#### 6. Get My Notifications
```http
GET /api/Notification/GetMyNotifications
Authorization: Bearer {user_token}
```
**Response:**
```json
[
  {
    "notificationID": 1,
    "accountID": 5,
    "message": "Your rental has been confirmed!",
    "isRead": false,
    "createdAt": "2025-01-15T10:30:00",
    "account": {
      "accountId": 5,
      "fullName": "Nguyen Van A",
      "email": "user@example.com"
    }
  }
]
```

#### 7. Get Notifications by Account ID
```http
GET /api/Notification/GetNotificationsByAccount/{accountId}
Authorization: Bearer {token}
```
- **Access:** Admin or account owner

#### 8. Get Unread Notifications
```http
GET /api/Notification/GetUnreadNotifications
Authorization: Bearer {user_token}
```

#### 9. Get Unread Count
```http
GET /api/Notification/GetUnreadCount
Authorization: Bearer {user_token}
```
**Response:**
```json
{
  "unreadCount": 3
}
```

---

### Mark as Read

#### 10. Mark Notification as Read
```http
PUT /api/Notification/MarkAsRead/{id}
Authorization: Bearer {token}
```
- **Access:** Admin or notification owner

**Response:**
```json
{
  "message": "?ã ?ánh d?u thông báo là ?ã ??c!"
}
```

#### 11. Mark All as Read
```http
PUT /api/Notification/MarkAllAsRead
Authorization: Bearer {user_token}
```
**Response:**
```json
{
  "message": "?ã ?ánh d?u 5 thông báo là ?ã ??c!"
}
```

---

### Bulk Operations

#### 12. Create Bulk Notifications (Admin Only)
```http
POST /api/Notification/CreateBulkNotifications
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "accountIDs": [1, 2, 3, 4, 5],
  "message": "System maintenance scheduled for tomorrow at 2 AM"
}
```
**Response:**
```json
{
  "message": "?ã g?i thông báo ??n 5 ng??i dùng!"
}
```

#### 13. Delete Old Notifications (Admin Only)
```http
DELETE /api/Notification/DeleteOldNotifications/30
Authorization: Bearer {admin_token}
```
Deletes read notifications older than 30 days.

**Response:**
```json
{
  "message": "?ã xóa 45 thông báo c? h?n 30 ngày!"
}
```

---

### Analytics

#### 14. Get Statistics (Admin Only)
```http
GET /api/Notification/GetStatistics
Authorization: Bearer {admin_token}
```
**Response:**
```json
{
  "totalNotifications": 150,
  "unreadNotifications": 35,
  "readNotifications": 115,
  "readRate": 76.67,
  "notificationsByAccount": {
    "1": 25,
    "2": 18,
    "3": 30
  },
  "latestNotificationDate": "2025-01-15T14:30:00"
}
```

#### 15. Search Notifications (Admin Only)
```http
POST /api/Notification/SearchNotifications
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "accountID": 5,
  "isRead": false,
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

---

## Data Model

### Notification Entity
```csharp
public class Notification
{
    public int NotificationID { get; set; }
    public int AccountID { get; set; }
    public string Message { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public virtual Account Account { get; set; }
}
```

---

## Repository Methods

### NotificationRepository.cs

```csharp
// Get notifications by account with navigation property
Task<IEnumerable<Notification>> GetNotificationsByAccountIDAsync(int accountId)

// Get unread notifications
Task<IEnumerable<Notification>> GetUnreadNotificationsByAccountIDAsync(int accountId)

// Mark single notification as read
Task<bool> MarkAsReadAsync(int notificationId)

// Mark all notifications as read for an account
Task<int> MarkAllAsReadAsync(int accountId)

// Get unread count
Task<int> GetUnreadCountAsync(int accountId)

// Delete old read notifications
Task<int> DeleteOldNotificationsAsync(int days)
```

---

## Service Methods

### NotificationService.cs

```csharp
// Create notification for a specific account
Task<Notification> CreateNotificationAsync(int accountId, string message)

// Create notifications for multiple accounts
Task CreateBulkNotificationsAsync(List<int> accountIds, string message)
```

---

## Authorization Matrix

| Endpoint | Renter | Staff | Admin |
|----------|--------|-------|-------|
| GetAllNotifications | ? | ? | ? |
| GetNotificationById | Own | Own | ? |
| GetMyNotifications | ? | ? | ? |
| GetNotificationsByAccount | Own | Own | ? |
| GetUnreadNotifications | ? | ? | ? |
| GetUnreadCount | ? | ? | ? |
| CreateNotification | ? | ? | ? |
| CreateBulkNotifications | ? | ? | ? |
| UpdateNotification | ? | ? | ? |
| MarkAsRead | Own | Own | ? |
| MarkAllAsRead | ? | ? | ? |
| DeleteNotification | Own | Own | ? |
| DeleteOldNotifications | ? | ? | ? |
| GetStatistics | ? | ? | ? |
| SearchNotifications | ? | ? | ? |

---

## Use Cases

### 1. User Views Their Notifications
```javascript
// Get all notifications
GET /api/Notification/GetMyNotifications

// Get unread count for badge
GET /api/Notification/GetUnreadCount

// Mark notification as read when clicked
PUT /api/Notification/MarkAsRead/5
```

### 2. Admin Sends System Notification
```javascript
// Send to all users (get all account IDs first)
POST /api/Notification/CreateBulkNotifications
{
  "accountIDs": [1, 2, 3, ...],
  "message": "New bikes available at Station A!"
}
```

### 3. Automated Rental Confirmation
```csharp
// In RentalController after rental is confirmed
await _notificationService.CreateNotificationAsync(
    rental.RenterID,
    $"Your rental #{rental.RentalID} has been confirmed!"
);
```

### 4. Payment Notification
```csharp
// After payment success
await _notificationService.CreateNotificationAsync(
    payment.AccountID,
    $"Payment of {payment.Amount} VN? received. Thank you!"
);
```

### 5. Cleanup Old Notifications
```javascript
// Run monthly cleanup job
DELETE /api/Notification/DeleteOldNotifications/90
// Deletes read notifications older than 90 days
```

---

## Integration Examples

### Frontend - React Notification Bell
```javascript
const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchUnreadCount = async () => {
    const response = await fetch('/api/Notification/GetUnreadCount', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setUnreadCount(data.unreadCount);
  };
  
  return (
    <div className="notification-bell">
      ??
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
    </div>
  );
};
```

### Frontend - Notification List
```javascript
const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    const response = await fetch('/api/Notification/GetMyNotifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setNotifications(data);
  };
  
  const markAsRead = async (id) => {
    await fetch(`/api/Notification/MarkAsRead/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchNotifications(); // Refresh
  };
  
  return (
    <div className="notification-list">
      {notifications.map(notif => (
        <div 
          key={notif.notificationID}
          className={`notification ${notif.isRead ? 'read' : 'unread'}`}
          onClick={() => markAsRead(notif.notificationID)}
        >
          <p>{notif.message}</p>
          <span>{new Date(notif.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};
```

---

## Error Handling

### Common Errors

**Unauthorized Access:**
```json
{
  "message": "Không có quy?n truy c?p!"
}
```

**Notification Not Found:**
```json
{
  "message": "Không tìm th?y thông báo!"
}
```

**Account Not Found:**
```json
{
  "message": "Tài kho?n không t?n t?i!"
}
```

**Empty List:**
```json
{
  "message": "Danh sách thông báo tr?ng"
}
```

---

## Database Schema

Already exists in `EVRenterDBContext`:
```csharp
public DbSet<Notification> Notifications { get; set; }
```

### Relationships:
- **Notification ? Account** (Many-to-One)
  - Each notification belongs to one account
  - One account can have many notifications

---

## Best Practices

### 1. Notification Cleanup
Run periodic cleanup to prevent database bloat:
```csharp
// In a background job
await _notificationService.DeleteOldNotificationsAsync(90);
```

### 2. Bulk Sending
Use bulk creation for system-wide notifications:
```csharp
var allUserIds = await _accountService.GetAllUserIdsAsync();
await _notificationService.CreateBulkNotificationsAsync(
    allUserIds, 
    "System maintenance scheduled"
);
```

### 3. Real-time Updates
Consider integrating SignalR for real-time notifications:
```csharp
// After creating notification
await _hubContext.Clients.User(accountId.ToString())
    .SendAsync("ReceiveNotification", notification);
```

### 4. Mark as Read on View
Automatically mark as read when user views:
```javascript
const viewNotification = async (id) => {
  await markAsRead(id);
  // Show notification details
};
```

---

## Testing Checklist

### CRUD Operations
- ? Create notification
- ? Read notification by ID
- ? Read all notifications
- ? Update notification
- ? Delete notification

### User Features
- ? Get user's own notifications
- ? Get unread notifications
- ? Get unread count
- ? Mark as read
- ? Mark all as read

### Admin Features
- ? Create bulk notifications
- ? View all notifications
- ? Delete old notifications
- ? View statistics
- ? Search notifications

### Authorization
- ? Users can only access own notifications
- ? Admin can access all
- ? Proper error messages for unauthorized access

---

## Build Status

? **All code compiles successfully!**
? **No breaking changes**
? **Ready for immediate use**

---

## Future Enhancements

1. **Notification Types/Categories**
   - Payment notifications
   - Rental notifications
   - System notifications
   - Promotional notifications

2. **Notification Preferences**
   - Allow users to customize notification types
   - Email notification option
   - SMS notification option

3. **Rich Notifications**
   - Add title field
   - Add action buttons
   - Add images/icons

4. **Read Receipts**
   - Track when notification was read
   - Track notification delivery status

5. **Notification Templates**
   - Reusable templates for common notifications
   - Variable substitution

6. **Push Notifications**
   - Web push notifications
   - Mobile app push notifications
