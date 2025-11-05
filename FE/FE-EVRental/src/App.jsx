import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ReviewProvider } from "./contexts/ReviewContext";
import "leaflet/dist/leaflet.css";
import "./styles/leaflet-fix.css";

// Components
import NavBar from "./components/NavBar";
import Cart from "./components/Cart";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import SessionTimer from "./components/SessionTimer";

// Pages
import Home from "./pages/Home";
import Vehicles from "./pages/Vehicles";
import Stations from "./pages/Stations";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import StationDetail from "./pages/StationDetail";
import UserHistory from "./pages/UserHistory";
import VehiclePickup from "./pages/VehiclePickup";
import VehicleReturn from "./pages/VehicleReturn";
import PickupSuccess from "./pages/PickupSuccess";
import ReturnSuccess from "./pages/ReturnSuccess";
import Checkout from "./pages/Checkout";
import BookingSuccess from "./pages/BookingSuccess";
import PaymentCallback from "./pages/PaymentCallback";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import UserProfile from "./pages/UserProfile";
import Staff from "./pages/Staff";
import Admin from "./pages/Admin";

// Styles
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ReviewProvider>
          <Router>
            {/* Session Timer - hiển thị cảnh báo trước 5 phút */}
            <SessionTimer />

            <Routes>
              {/* Admin Route - Layout riêng không có NavBar/Footer */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={3}>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* Staff Route - Layout riêng không có NavBar/Footer */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={2}>
                    <Staff />
                  </ProtectedRoute>
                }
              />

              {/* User Routes - Layout có NavBar/Footer */}
              <Route
                path="*"
                element={
                  <div className="app-container">
                    <NavBar />
                    <main
                      className="main-content"
                      style={{ marginTop: "64px" }}
                    >
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/vehicles" element={<Vehicles />} />
                        <Route
                          path="/vehicles/:id"
                          element={<ProductDetail />}
                        />
                        <Route path="/stations" element={<Stations />} />
                        <Route
                          path="/stations/:id"
                          element={<StationDetail />}
                        />
                        <Route path="/about" element={<About />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Trang chỉ dành cho User (Customer), chặn Staff và Admin */}
                        <Route
                          path="/profile"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <UserProfile />
                            </RoleBasedRoute>
                          }
                        />
                        <Route
                          path="/history"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <UserHistory />
                            </RoleBasedRoute>
                          }
                        />
                        <Route
                          path="/user-history"
                          element={<Navigate to="/history" replace />}
                        />

                        <Route
                          path="/checkout"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <Checkout />
                            </RoleBasedRoute>
                          }
                        />
                        <Route
                          path="/booking-success/:bookingId"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <BookingSuccess />
                            </RoleBasedRoute>
                          }
                        />

                        {/* Payment Routes - PayOS callback và result pages */}
                        <Route
                          path="/payment-callback"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <PaymentCallback />
                            </RoleBasedRoute>
                          }
                        />
                        <Route
                          path="/payment-success"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <PaymentSuccess />
                            </RoleBasedRoute>
                          }
                        />
                        <Route
                          path="/payment-failure"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <PaymentFailure />
                            </RoleBasedRoute>
                          }
                        />

                        <Route
                          path="/pickup/:vehicleId/:stationId"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <VehiclePickup />
                            </RoleBasedRoute>
                          }
                        />
                        <Route
                          path="/return/:vehicleId/:stationId"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <VehicleReturn />
                            </RoleBasedRoute>
                          }
                        />
                        <Route
                          path="/pickup-success"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <PickupSuccess />
                            </RoleBasedRoute>
                          }
                        />
                        <Route
                          path="/return-success"
                          element={
                            <RoleBasedRoute blockedRoles={[2, 3]}>
                              <ReturnSuccess />
                            </RoleBasedRoute>
                          }
                        />
                        <Route path="/cart" element={<Cart />} />
                      </Routes>
                    </main>
                    <footer className="app-footer">
                      <div className="footer-content">
                        <p>
                          &copy; 2025 EV Rental System. All rights reserved.
                        </p>
                      </div>
                    </footer>
                  </div>
                }
              />
            </Routes>
          </Router>
        </ReviewProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
