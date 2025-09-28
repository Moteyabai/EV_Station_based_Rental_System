import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("ev_rental_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ev_rental_cart", JSON.stringify(cartItems));
  }, [cartItems]);

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

    const cartItem = {
      id: Date.now(), // Unique cart item ID
      vehicleId: vehicle.id,
      vehicle: vehicle,
      rentalDetails: finalRentalDetails,
      totalPrice: calculateItemPrice(vehicle.price, finalRentalDetails.days),
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
