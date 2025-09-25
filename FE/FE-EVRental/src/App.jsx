import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Components
import NavBar from "./components/NavBar";

// Pages
import Home from "./pages/Home";
import Vehicles from "./pages/Vehicles";
import Stations from "./pages/Stations";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import StationDetail from "./pages/StationDetail";
import UserHistory from "./pages/UserHistory";
import VehiclePickup from "./pages/VehiclePickup";
import VehicleReturn from "./pages/VehicleReturn";
import PickupSuccess from "./pages/PickupSuccess";
import ReturnSuccess from "./pages/ReturnSuccess";

// Styles
import "./App.css";
import "./styles/scrollbar.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <NavBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/:id" element={<ProductDetail />} />
              <Route path="/stations" element={<Stations />} />
              <Route path="/stations/:id" element={<StationDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/history" element={<UserHistory />} />
              <Route path="/pickup/:vehicleId/:stationId" element={<VehiclePickup />} />
              <Route path="/return/:vehicleId/:stationId" element={<VehicleReturn />} />
              <Route path="/pickup-success" element={<PickupSuccess />} />
              <Route path="/return-success" element={<ReturnSuccess />} />
            </Routes>
          </main>
          <footer className="app-footer">
            <div className="footer-content">
              <p>&copy; 2025 EV Rental System. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
