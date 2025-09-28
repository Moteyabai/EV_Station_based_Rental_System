import React, { useState } from "react";
import ProductCard from "./ProductCard";
import "../styles/ProductList.css";

export default function ProductList({ products }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicle(vehicleId);
  };

  return (
    <div className="available-vehicles-section">
      <div className="section-header">
        <h2>Xe máy điện hiện có</h2>
      </div>

      <div className="product-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            isSelected={selectedVehicle === p.id}
            onSelect={handleVehicleSelect}
          />
        ))}
      </div>
    </div>
  );
}
