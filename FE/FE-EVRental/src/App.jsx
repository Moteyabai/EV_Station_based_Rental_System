import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ReviewProvider } from "./contexts/ReviewContext";
import 'leaflet/dist/leaflet.css';
import './styles/leaflet-fix.css';

// Components
import NavBar from "./components/NavBar";
import Cart from "./components/Cart";
import ProtectedRoute from "./components/ProtectedRoute";

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
import RentalForm from "./pages/RentalForm";
import Checkout from "./pages/Checkout";
import BookingSuccess from "./pages/BookingSuccess";
import UserProfile from "./pages/UserProfile";
import Staff from "./pages/Staff";
import Admin from "./pages/Admin";

// Styles
import "./App.css";
import "./styles/scrollbar.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ReviewProvider>
          <Router>
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
              <Route path="*" element={
                <div className="app-container">
                  <NavBar />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/vehicles" element={<Vehicles />} />
                      <Route path="/vehicles/:id" element={<ProductDetail />} />
                      <Route path="/stations" element={<Stations />} />
                      <Route path="/stations/:id" element={<StationDetail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/history" element={<UserHistory />} />
                      
                      <Route
                        path="/pickup/:vehicleId/:stationId"
                        element={<VehiclePickup />}
                      />
                      <Route
                        path="/return/:vehicleId/:stationId"
                        element={<VehicleReturn />}
                      />
                      <Route path="/pickup-success" element={<PickupSuccess />} />
                      <Route path="/return-success" element={<ReturnSuccess />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/rental-form" element={<RentalForm />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route
                        path="/booking-success/:bookingId"
                        element={<BookingSuccess />}
                      />
                    </Routes>
                  </main>
                  <footer className="app-footer">
                    <div className="footer-content">
                      <p>&copy; 2025 EV Rental System. All rights reserved.</p>
                    </div>
                  </footer>
                </div>
              } />
            </Routes>
          </Router>
        </ReviewProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
