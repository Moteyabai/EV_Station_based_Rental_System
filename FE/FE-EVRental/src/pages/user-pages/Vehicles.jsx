import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAvailableBikes } from "../../api/bikes";
import "../../styles/Vehicles.css";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import BookingForm from "../../components/BookingForm";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [sortOption, setSortOption] = useState("price-asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Check role access - Block Staff and Admin
  useEffect(() => {
    if (user) {
      const userRoleId = user?.roleID || user?.RoleID;
      if (userRoleId === 2 || userRoleId === 3) {
        console.log("Vehicles: Access denied for Staff/Admin, redirecting...");
        if (userRoleId === 2) {
          navigate("/staff");
        } else {
          navigate("/admin");
        }
      }
    }
  }, [user, navigate]);

  // Load vehicles from API
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;
    
    async function loadVehicles() {
      try {
        if (!isMounted || abortController.signal.aborted) return;
        
        setLoading(true);
        setError(null); // Reset error state
        
        const token = localStorage.getItem('ev_token');
        console.log('🚀 Calling getAvailableBikes API... (Reload safe)');
        const bikesData = await getAvailableBikes(token);
        
        // Check if component is still mounted and request wasn't aborted
        if (!isMounted || abortController.signal.aborted) {
          console.log('⚠️ Component unmounted or request aborted');
          return;
        }
        
        console.log('🚲 Raw bikes data from API:', bikesData);
        console.log('🔍 First bike sample:', bikesData[0]);
        
        // Map backend data to frontend format
        const mappedVehicles = bikesData.map((bike) => {
          console.log('🔧 Mapping bike:', bike.bikeID, bike);
          const quantity = bike.quantity || 0;
          const isAvailable = quantity > 0;
          
          return {
            id: bike.bikeID || bike.BikeID,
            name: bike.bikeName || bike.model || bike.Model || 'Xe điện',
            brand: bike.brandName || 'Unknown',
            image: bike.thumbnailImageUrl || bike.ThumbnailImageUrl || bike.frontImg || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60',
            price: bike.pricePerDay || bike.PricePerDay || 0,
            priceUnit: '/ngày',
            category: 'scooter',
            short: `${bike.brandName || bike.BrandName || 'Xe điện'} - Số lượng: ${quantity||'0'}`,
            description: bike.description || bike.Description || '',
            quantity: quantity,
            specs: {
              range: `${bike.maxDistance || 'N/A'} km`,
              maxSpeed: `${bike.maxSpeed || 'N/A'} km/h`,
              batteryCapacity: `${bike.batteryCapacity || bike.BatteryCapacity || 'N/A'} kWh`,
            },
            status: isAvailable ? 'available' : 'out-of-stock',
            statusText: isAvailable ? 'Có sẵn' : 'Hết xe',
            statusColor: isAvailable ? 'green' : 'red'
          };
        });
        
        console.log('✅ Mapped vehicles:', mappedVehicles);
        console.log('📊 Total vehicles:', mappedVehicles.length);
        
        setVehicles(mappedVehicles);
        setError(null);
      } catch (err) {
        console.error('❌ Error loading vehicles:', err);
        if (isMounted) {
          setError('Không thể tải danh sách xe. Vui lòng thử lại sau.');
          setVehicles([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('✅ Vehicles page loaded successfully');
        }
      }
    }
    
    // Always call loadVehicles on mount/reload
    loadVehicles();
    
    // Cleanup function to abort request if component unmounts
    return () => { 
      console.log('🧹 Cleanup: Aborting API request');
      isMounted = false;
      abortController.abort();
    };
  }, []); // Empty dependency array - only run once on mount

  // Get unique brands
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(vehicles.map((vehicle) => vehicle.brand))];
    return ["all", ...uniqueBrands];
  }, [vehicles]);

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
  }, [filterType, sortOption, searchTerm, brandFilter, vehicles]);

  // Loading state
  if (loading) {
    return (
      <div className="vehicles-page">
        <div className="vehicles-hero">
          <div className="vehicles-hero-content">
            <h1>Xe máy điện có sẵn</h1>
            <p>Đang tải danh sách xe...</p>
          </div>
        </div>
        <div className="vehicles-container">
          <div className="loading-message">
            <p>🔄 Đang tải danh sách xe điện...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="vehicles-page">
        <div className="vehicles-hero">
          <div className="vehicles-hero-content">
            <h1>Xe máy điện có sẵn</h1>
            <p>{error}</p>
          </div>
        </div>
        <div className="vehicles-container">
          <div className="error-message">
            <h3>❌ Có lỗi xảy ra</h3>
            <p>{error}</p>
            <button
              className="btn primary"
              onClick={() => window.location.reload()}
            >
              🔄 Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                      <span 
                        className={`vehicle-status ${vehicle.status}`}
                        style={{ 
                          color: vehicle.statusColor,
                          fontWeight: 'bold'
                        }}
                      >
                        {vehicle.statusText}
                      </span>
                    </div>
                    <div className="vehicle-price">
                      {vehicle.price.toLocaleString("vi-VN")}
                      <span className="price-unit">{vehicle.priceUnit}</span>
                    </div>
                    <div className="vehicle-specs">
                      <div className="spec">
                        <span className="spec-icon">🏁</span>
                        <span className="spec-value">
                          {vehicle.specs.range}
                        </span>
                      </div>
                      <div className="spec">
                        <span className="spec-icon">⚡</span>
                        <span className="spec-value">
                          {vehicle.specs.maxSpeed}
                        </span>
                      </div>
                      <div className="spec">
                        <span className="spec-icon">🔋</span>
                        <span className="spec-value">
                          {vehicle.specs.batteryCapacity}
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
                          if (vehicle.status === 'available') {
                            if (!user) {
                              navigate('/login');
                              return;
                            }
                            setSelectedVehicle(vehicle);
                            setShowBookingForm(true);
                          }
                        }}
                        className={`btn rent-now ${vehicle.status === 'out-of-stock' ? 'disabled' : ''}`}
                        disabled={vehicle.status === 'out-of-stock'}
                        style={{
                          opacity: vehicle.status === 'out-of-stock' ? 0.5 : 1,
                          cursor: vehicle.status === 'out-of-stock' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {vehicle.status === 'available' ? 'Thuê ngay' : 'Hết xe'}
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
