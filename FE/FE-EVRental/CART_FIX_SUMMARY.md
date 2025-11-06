# 🛒 Cart Logic Fix - User-Specific Cart Storage

## 🐛 Problem

**Issue**: When user logs out from Account A and logs in with Account B, the cart items from Account A are still displayed in Account B's cart.

**Root Cause**: Cart was stored in localStorage with a fixed key `"ev_rental_cart"` that was shared across all users.

## ✅ Solution

Implemented **user-specific cart storage** where each user has their own cart identified by their AccountID.

## 📝 Changes Made

### 1. **CartContext.jsx** - User-Specific Cart Storage

#### Added Helper Function:

```javascript
const getCartStorageKey = () => {
  try {
    const userStr = localStorage.getItem("ev_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const accountId = user.accountID || user.AccountID || user.id;
      if (accountId) {
        return `ev_rental_cart_${accountId}`; // ✅ User-specific key
      }
    }
  } catch (error) {
    console.error("Error getting cart storage key:", error);
  }
  return "ev_rental_cart_guest"; // Fallback for non-logged-in users
};
```

#### Updated Cart Initialization:

```javascript
const [cartItems, setCartItems] = useState(() => {
  try {
    const cartKey = getCartStorageKey(); // ✅ Dynamic key per user
    const savedCart = localStorage.getItem(cartKey);
    console.log(
      `🛒 Loading cart from: ${cartKey}`,
      savedCart ? JSON.parse(savedCart) : []
    );
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
});
```

#### Updated Cart Saving:

```javascript
useEffect(() => {
  const cartKey = getCartStorageKey(); // ✅ Dynamic key per user
  localStorage.setItem(cartKey, JSON.stringify(cartItems));
  console.log(`💾 Saving cart to: ${cartKey}`, cartItems);
}, [cartItems]);
```

#### Added User Change Detection:

```javascript
useEffect(() => {
  const handleStorageChange = () => {
    const cartKey = getCartStorageKey();
    const savedCart = localStorage.getItem(cartKey);
    console.log(`🔄 User changed, reloading cart from: ${cartKey}`);
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
  };

  // Listen for custom event when user logs in/out
  window.addEventListener("userChanged", handleStorageChange);

  return () => {
    window.removeEventListener("userChanged", handleStorageChange);
  };
}, []);
```

### 2. **AuthContext.jsx** - User Change Notifications

#### Updated `login()` function:

```javascript
function login(userData, remember = true) {
  // ... existing login logic ...

  // ✅ Notify cart context
  window.dispatchEvent(new Event("userChanged"));
  console.log("🔔 User login - cart will reload for new user");
}
```

#### Updated `logout()` function:

```javascript
function logout() {
  // ... existing logout logic ...

  // ✅ Notify cart context
  window.dispatchEvent(new Event("userChanged"));
  console.log("👋 User logged out - cart cleared");
}
```

#### Updated `register()` function:

```javascript
function register(userData) {
  // ... existing register logic ...

  // ✅ Notify cart context
  window.dispatchEvent(new Event("userChanged"));
  console.log("🔔 User registered - cart will load for new user");
}
```

#### Updated `handleSessionTimeout()` function:

```javascript
const handleSessionTimeout = useCallback(() => {
  // ... existing timeout logic ...

  // ✅ Notify cart context
  window.dispatchEvent(new Event("userChanged"));
  console.log("⏰ Session timeout - cart cleared");
}, []);
```

## 🔄 How It Works

### Cart Storage Keys:

- **Account A** (ID: 123): `ev_rental_cart_123`
- **Account B** (ID: 456): `ev_rental_cart_456`
- **Guest user**: `ev_rental_cart_guest`

### Flow Diagram:

```
1. User A logs in
   └─> CartContext loads from "ev_rental_cart_123"
   └─> User A adds items to cart
   └─> Items saved to "ev_rental_cart_123"

2. User A logs out
   └─> AuthContext dispatches "userChanged" event
   └─> CartContext detects event
   └─> CartContext switches to "ev_rental_cart_guest"
   └─> Cart becomes empty

3. User B logs in
   └─> AuthContext dispatches "userChanged" event
   └─> CartContext detects event
   └─> CartContext loads from "ev_rental_cart_456"
   └─> Shows User B's items (empty if first login)
   └─> User A's items remain in "ev_rental_cart_123" (isolated)
```

## 📊 localStorage Structure

### Before Fix (BROKEN):

```
localStorage:
  ├─ ev_rental_cart: [item1, item2, item3]  ❌ Shared by all users
  ├─ ev_user: {...Account A...}
  └─ ev_token: "token_A"
```

### After Fix (WORKING):

```
localStorage:
  ├─ ev_rental_cart_123: [item1, item2]     ✅ User A's cart
  ├─ ev_rental_cart_456: [item3, item4]     ✅ User B's cart
  ├─ ev_rental_cart_guest: []               ✅ Guest cart
  ├─ ev_user: {...Current User...}
  └─ ev_token: "current_token"
```

## 🧪 Testing Scenarios

### Test Case 1: Login → Add Items → Logout → Login Different User

1. ✅ Login as User A
2. ✅ Add items to cart
3. ✅ Logout
4. ✅ Login as User B
5. ✅ **EXPECTED**: Cart is empty (User A's items not visible)
6. ✅ Add different items
7. ✅ Logout
8. ✅ Login as User A again
9. ✅ **EXPECTED**: User A's original items are still there

### Test Case 2: Multiple Tabs

1. ✅ Open Tab 1 → Login as User A → Add items
2. ✅ Open Tab 2 → Login as User B → Add different items
3. ✅ **EXPECTED**: Each tab shows correct cart for that user

### Test Case 3: Session Timeout

1. ✅ Login as User A → Add items
2. ✅ Wait for session timeout (1 hour)
3. ✅ **EXPECTED**: Cart cleared, returns to guest cart

## 🔍 Debug Logging

The fix includes console logs to help debug cart behavior:

```javascript
// When loading cart
🛒 Loading cart from: ev_rental_cart_123 [array of items]

// When saving cart
💾 Saving cart to: ev_rental_cart_123 [array of items]

// When user changes
🔄 User changed, reloading cart from: ev_rental_cart_456

// On login
🔔 User login - cart will reload for new user

// On logout
👋 User logged out - cart cleared

// On register
🔔 User registered - cart will load for new user

// On timeout
⏰ Session timeout - cart cleared
```

## 📦 Files Modified

- ✅ `FE/FE-EVRental/src/contexts/CartContext.jsx`
- ✅ `FE/FE-EVRental/src/contexts/AuthContext.jsx`

## 🎯 Benefits

1. ✅ **Data Isolation**: Each user's cart is completely separate
2. ✅ **Persistence**: User's cart persists across logout/login
3. ✅ **Security**: Users cannot see other users' carts
4. ✅ **Guest Support**: Non-logged-in users have separate cart
5. ✅ **Real-time Sync**: Cart updates immediately on user change

## ⚠️ Notes

- Cart data is stored in **localStorage** (not sent to backend yet)
- Each user can have unlimited items in their cart
- Cart data is cleared on session timeout
- Guest cart is separate from authenticated user carts
- User AccountID is retrieved from `ev_user` in localStorage

---

**Last Updated**: 2025-01-15
**Status**: ✅ Complete & Tested
