import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

// Helper function to get cart storage key for current user
const getCartStorageKey = () => {
  try {
    // Try both "ev_user" and "user" keys for compatibility
    const userStr = localStorage.getItem("ev_user") || localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const accountId = user.accountID || user.AccountID || user.id;
      console.log("🔑 [CART] Getting cart key for AccountID:", accountId);
      if (accountId) {
        return `ev_rental_cart_${accountId}`;
      }
    }

    // Fallback: Try to get AccountID from token
    const token = localStorage.getItem("ev_token") || sessionStorage.getItem("ev_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const accountId = payload.accountID || payload.AccountID || payload.sub || payload.nameid;
        console.log("🔑 [CART] Getting cart key from token for AccountID:", accountId);
        if (accountId) {
          return `ev_rental_cart_${accountId}`;
        }
      } catch (tokenError) {
        console.warn("⚠️ [CART] Could not decode token:", tokenError);
      }
    }
  } catch (error) {
    console.error("❌ [CART] Error getting cart storage key:", error);
  }
  // Fallback to generic key if no user
  console.log("🔑 [CART] No user found, using guest cart");
  return "ev_rental_cart_guest";
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const cartKey = getCartStorageKey();
      const savedCart = localStorage.getItem(cartKey);
      console.log(`🛒 Loading cart from: ${cartKey}`, savedCart ? JSON.parse(savedCart) : []);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartKey = getCartStorageKey();
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
    console.log(`💾 Saving cart to: ${cartKey}`, cartItems);
  }, [cartItems]);

  // Clear cart when user changes (logout/login)
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

  // Add vehicle to cart
  const addToCart = (vehicle, rentalDetails = null) => {
    const defaultRentalDetails = {
      pickupDate: new Date().toISOString().split("T")[0],
      returnDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // +1 day
      pickupTime: "09:00",
      returnTime: "18:00",
      pickupStation: "Default Station",
      returnStation: "Default Station",
      days: 1,
    };

    const finalRentalDetails = rentalDetails || defaultRentalDetails;

    // Debug: Log giá trị
    console.log("🔍 DEBUG addToCart:");
    console.log("vehicle.price:", vehicle.price);
    console.log("days:", finalRentalDetails.days);
    const calculatedPrice = calculateItemPrice(
      vehicle.price,
      finalRentalDetails.days
    );
    console.log("totalPrice:", calculatedPrice);

    const cartItem = {
      id: Date.now(), // Unique cart item ID
      vehicleId: vehicle.id,
      vehicle: vehicle,
      rentalDetails: finalRentalDetails,
      totalPrice: calculatedPrice,
      addedAt: new Date().toISOString(),
    };

    setCartItems((prevItems) => [...prevItems, cartItem]);
  };

  // Remove item from cart
  const removeFromCart = (cartItemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== cartItemId)
    );
  };

  // Update cart item
  const updateCartItem = (cartItemId, updates) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              ...updates,
              totalPrice: updates.rentalDetails
                ? calculateItemPrice(
                    item.vehicle.price,
                    updates.rentalDetails.days
                  )
                : item.totalPrice,
            }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate price for a single item
  const calculateItemPrice = (pricePerDay, days) => {
    return pricePerDay * days;
  };

  // Calculate total cart value
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  // Get cart item count
  const getItemCount = () => {
    return cartItems.length;
  };

  // Check if vehicle is already in cart for specific dates
  const isVehicleInCart = (vehicleId, pickupDate, returnDate) => {
    return cartItems.some(
      (item) =>
        item.vehicleId === vehicleId &&
        item.rentalDetails.pickupDate === pickupDate &&
        item.rentalDetails.returnDate === returnDate
    );
  };

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getTotalPrice,
    getItemCount,
    isVehicleInCart,
    calculateItemPrice,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

export default CartContext;
