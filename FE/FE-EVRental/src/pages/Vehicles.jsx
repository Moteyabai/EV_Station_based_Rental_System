import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import vehicles from "../data/vehicles";
import "../styles/Vehicles.css";
import { useCart } from "../contexts/CartContext";
import BookingForm from "../components/BookingForm";

export default function Vehicles() {
  const [filterType, setFilterType] = useState("all");
  const [sortOption, setSortOption] = useState("price-asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Get unique brands
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(vehicles.map((vehicle) => vehicle.brand))];
    return ["all", ...uniqueBrands];
  }, []);

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = [...vehicles];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(term) ||
          vehicle.description.toLowerCase().includes(term) ||
          vehicle.short.toLowerCase().includes(term)
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.category === filterType);
    }

    // Apply brand filter
    if (brandFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.brand === brandFilter);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      if (sortOption === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [filterType, sortOption, searchTerm, brandFilter]);

  return (
    <div className="vehicles-page">
      <div className="vehicles-hero">
        <div className="vehicles-hero-content">
          <h1>Xe máy điện có sẵn</h1>
          <p>Lựa chọn xe máy điện phù hợp với nhu cầu của bạn</p>
        </div>
      </div>

      <div className="vehicles-container">
        <div className="vehicles-sidebar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm xe máy điện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <h3>Bộ lọc</h3>

            <div className="filter-group">
              <label htmlFor="brand">Thương hiệu</label>
              <select
                id="brand"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand === "all" ? "Tất cả thương hiệu" : brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="category">Loại phương tiện</label>
              <select
                id="category"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="scooter">Xe máy điện</option>
                <option value="motorcycle">Xe máy</option>
                <option value="bicycle">Xe đạp điện</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sortOption">Sắp xếp theo</label>
              <select
                id="sortOption"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="name">Tên xe</option>
              </select>
            </div>
          </div>
        </div>

        <div className="vehicles-main">
          {filteredVehicles.length === 0 ? (
            <div className="no-results">
              <p>
                Không tìm thấy xe máy điện phù hợp với bộ lọc đã chọn. Vui lòng
                thử lại với bộ lọc khác.
              </p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicle-card">
                  <div className="vehicle-image-container">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="vehicle-image"
                      onError={(e) => {
                        console.log(
                          `Failed to load image for vehicle: ${vehicle.name}`
                        );
                        e.target.src =
                          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60";
                      }}
                    />
                    <div className="vehicle-badge">{vehicle.brand}</div>
                  </div>
                  <div className="vehicle-info">
                    <h3>{vehicle.name}</h3>
                    <p className="vehicle-short">{vehicle.short}</p>
                    <div className="vehicle-meta">
                      <span className="vehicle-brand">{vehicle.brand}</span>
                      <span className="vehicle-category">
                        {vehicle.category === "scooter"
                          ? "Xe máy điện"
                          : vehicle.category}
                      </span>
                    </div>
                    <div className="vehicle-price">
                      {vehicle.price.toLocaleString("vi-VN")}
                      <span className="price-unit">{vehicle.priceUnit}</span>
                    </div>
                    <div className="vehicle-specs">
                      <div className="spec">
                        <span className="spec-icon">⚡</span>
                        <span className="spec-value">
                          {vehicle.specs.range}
                        </span>
                      </div>
                      <div className="spec">
                        <span className="spec-icon">🏁</span>
                        <span className="spec-value">
                          {vehicle.specs.maxSpeed}
                        </span>
                      </div>
                    </div>
                    <div className="vehicle-actions">
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="btn view-details"
                      >
                        Chi tiết
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setShowBookingForm(true);
                        }}
                        className="btn rent-now"
                      >
                        Thuê ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedVehicle && (
        <BookingForm
          vehicle={selectedVehicle}
          onSubmit={async (formData, rentalDetails) => {
            setShowBookingForm(false);
            navigate("/cart");
          }}
          onCancel={() => {
            setShowBookingForm(false);
            setSelectedVehicle(null);
          }}
        />
      )}
    </div>
  );
}
