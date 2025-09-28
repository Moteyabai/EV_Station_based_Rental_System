import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import BookingForm from "./BookingForm";
import "../styles/ProductCard.css";

export default function ProductCard({ p, isSelected, onSelect }) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    if (p.priceUnit.includes("VND")) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price * 1000);
    }
    return `$${price}`;
  };

  const handleSelectVehicle = () => {
    if (onSelect) {
      onSelect(p.id);
    }
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (formData, rentalDetails) => {
    setShowBookingForm(false);
    // Navigate to cart or show success message
    alert("✅ Đã thêm xe vào giỏ hàng thành công!");
  };

  return (
    <>
      <article className={`product-card ${isSelected ? "selected" : ""}`}>
        {/* Vehicle Brand/Logo */}
        <div className="vehicle-brand">
          {p.name.includes("VinFast") && (
            <span className="brand-logo vinfast">VinFast</span>
          )}
          {p.name.includes("DatBike") && (
            <span className="brand-logo datbike">DatBike</span>
          )}
        </div>

        <div
          className="product-thumb"
          style={p.image ? { backgroundImage: `url(${p.image})` } : {}}
        />

        <div className="product-body">
          <h3>{p.name}</h3>
          <p className="short">{p.short}</p>

          <div className="vehicle-specs">
            <div className="spec-item">
              <span className="label">Battery:</span>
              <span className="value">{p.specs?.battery || "N/A"}</span>
            </div>
            <div className="spec-item">
              <span className="label">Range:</span>
              <span className="value">{p.specs?.range || "N/A"}</span>
            </div>
          </div>

          <div className="price">
            {formatPrice(p.price)}
            <span className="price-unit">/day</span>
          </div>

          <div className="actions">
            <button className="btn secondary" onClick={() => addToCart(p)}>
              Add to Cart
            </button>
            {isSelected ? (
              <button className="btn primary selected-btn">Selected</button>
            ) : (
              <button
                className="btn primary select-btn"
                onClick={handleSelectVehicle}
              >
                Book Now
              </button>
            )}
          </div>
        </div>
      </article>

      {showBookingForm && (
        <div className="booking-modal">
          <div className="booking-modal-content">
            <BookingForm
              vehicle={p}
              onSubmit={handleBookingSubmit}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
