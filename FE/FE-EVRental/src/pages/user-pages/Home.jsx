import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import "../../styles/media.css";
import { fetchActiveStations } from "../../api/stations";
import { getAvailableBikes } from "../../api/bikes";
import { useAuth } from "../../contexts/AuthContext";

// Default placeholder images
const defaultBikeImg =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60";
const stationImg =
  "https://images.unsplash.com/photo-1599593752325-ffa41031056e?auto=format&fit=crop&w=1200&q=80";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);
  const [currentStationIndex, setCurrentStationIndex] = React.useState(0);
  const [stations, setStations] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [loadingStations, setLoadingStations] = React.useState(true);
  const [loadingVehicles, setLoadingVehicles] = React.useState(true);
  const [vehiclesError, setVehiclesError] = React.useState(null);

  // Check if user is Staff or Admin
  const userRoleId = user?.roleID || user?.RoleID;
  const isStaffOrAdmin = userRoleId === 2 || userRoleId === 3;

  // Auto-redirect Staff/Admin to their management pages
  React.useEffect(() => {
    if (user && isStaffOrAdmin) {
      console.log("Home: Staff/Admin detected, auto-redirecting to management page...");
      if (userRoleId === 2) {
        navigate("/staff", { replace: true });
      } else if (userRoleId === 3) {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, isStaffOrAdmin, userRoleId, navigate]);

  // Background images array with cache busting
  // Background images (keep static paths so browser can cache them)
  const backgroundImages = [
    `/images/background/background-1.jpg`,
    `/images/background/background-2.jpg`,
    `/images/background/background-3.jpg`,
  ];

  // Load both stations and vehicles from API in a single effect to prevent race conditions
  React.useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    
    async function loadData() {
      try {
        if (!isMounted) return;
        
        // Load stations and vehicles in parallel but update state carefully
        console.log("🚀 [HOME] Loading stations and vehicles...");
        
        // Start both API calls in parallel
        const [stationsPromise, vehiclesPromise] = [
          fetchActiveStations().catch(err => {
            console.error("❌ [HOME] Error loading stations:", err);
            return [];
          }),
          (async () => {
            try {
              const token = localStorage.getItem("ev_token");
              return await getAvailableBikes(token);
            } catch (err) {
              console.error("❌ [HOME] Error loading vehicles:", err);
              throw err;
            }
          })()
        ];
        
        // Wait for stations first
        const apiStations = await stationsPromise;
        
        // Check if component is still mounted before updating state
        if (!isMounted || abortController.signal.aborted) {
          console.log("⚠️ [HOME] Data loading aborted");
          return;
        }
        
        console.log("✅ [HOME] Stations data received:", apiStations);
        
        // Debug: Log first station to check image field names
        if (apiStations && apiStations.length > 0) {
          console.log("🔍 [DEBUG] First station raw data:", apiStations[0]);
          console.log("🔍 [DEBUG] First station image fields:", {
            imageUrl: apiStations[0].imageUrl,
            ImageUrl: apiStations[0].ImageUrl,
            ThumbnailImageUrl: apiStations[0].ThumbnailImageUrl,
            ExteriorImageUrl: apiStations[0].ExteriorImageUrl,
          });
        }
        
        const mappedStations = apiStations.map((s) => {
          // Backend trả imageUrl (có thể là local path hoặc URL)
          let imageUrl = s.imageUrl || s.ImageUrl || s.ThumbnailImageUrl || s.ExteriorImageUrl;
          
          // Check nếu là local path (C:\, D:\, /uploads/, etc.) → dùng placeholder
          if (imageUrl && (
            imageUrl.includes(':\\') ||           // Windows path: C:\
            imageUrl.startsWith('/uploads/') ||   // Linux path: /uploads/
            imageUrl.startsWith('uploads/')       // Relative path: uploads/
          )) {
            console.warn(`⚠️ [HOME] Station "${s.name}" có local path, dùng placeholder:`, imageUrl);
            imageUrl = null; // Set null để dùng stationImg placeholder
          }
          
          return {
            id: s.stationID || s.StationID || s.id,
            name: s.name || s.Name,
            address: s.address || s.Address,
            description: s.description || s.Description,
            image: imageUrl || stationImg,
            availableVehicles: s.bikeCapacity || s.Quantity || 0,
          };
        });
        
        // Debug: Log mapped stations with images
        console.log("🔍 [DEBUG] Mapped stations with images:", mappedStations.map(m => ({ 
          id: m.id, 
          name: m.name, 
          image: m.image 
        })));
        
        // Update stations state
        setStations(mappedStations);
        setLoadingStations(false);
        console.log("✅ [HOME] Stations loaded successfully");
        
        // Now wait for vehicles
        try {
          const bikesData = await vehiclesPromise;
          
          // Check again if component is still mounted
          if (!isMounted || abortController.signal.aborted) {
            console.log("⚠️ [HOME] Vehicles loading aborted");
            return;
          }
          
          console.log("✅ [HOME] Bikes data received:", bikesData);

          const mappedVehicles = bikesData.map((bike) => {
            const quantity = bike.quantity || bike.Quantity || 0;
            return {
              id: bike.bikeID || bike.BikeID,
              name: bike.bikeName || bike.model || bike.Model || "Xe điện",
              brand: bike.brandName || bike.BrandName || "Unknown",
              image:
                bike.thumbnailImageUrl ||
                bike.ThumbnailImageUrl ||
                bike.frontImg ||
                defaultBikeImg,
              price: bike.pricePerDay || bike.PricePerDay || 0,
              priceUnit: "/ngày",
              short: `${
                bike.brandName || bike.BrandName || "Xe điện"
              } - ${quantity} xe có sẵn`,
              quantity: quantity,
            };
          });
          
          setVehicles(mappedVehicles);
          setVehiclesError(null);
          console.log("✅ [HOME] Vehicles loaded successfully");
        } catch (vehicleError) {
          if (!abortController.signal.aborted) {
            console.error("❌ [HOME] Error loading vehicles:", vehicleError);
            setVehicles([]);
            setVehiclesError(vehicleError.message || "Không thể tải danh sách xe");
          }
        } finally {
          if (isMounted && !abortController.signal.aborted) {
            setLoadingVehicles(false);
          }
        }
        
      } catch (error) {
        if (abortController.signal.aborted) {
          console.log("⚠️ [HOME] Data loading cancelled");
          return;
        }
        console.error("❌ [HOME] Critical error loading data:", error);
        if (isMounted) {
          setStations([]);
          setVehicles([]);
          setLoadingStations(false);
          setLoadingVehicles(false);
        }
      }
    }
    
    loadData();
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  // Background slideshow effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Chuyển ảnh mỗi 5 giây

    return () => clearInterval(interval);
  }, []);

  // Station carousel controls
  const stationsPerView = 3; // Số station hiển thị cùng lúc
  const maxIndex = Math.max(0, stations.length - stationsPerView);

  const handlePrevStation = () => {
    setCurrentStationIndex((prev) => {
      if (prev === 0) {
        return maxIndex; // Quay về cuối khi ở đầu
      }
      return prev - 1;
    });
  };

  const handleNextStation = () => {
    setCurrentStationIndex((prev) => {
      if (prev >= maxIndex) {
        return 0; // Quay về đầu khi ở cuối
      }
      return prev + 1;
    });
  };

  // Add scroll reveal effect
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe scroll reveal elements
    document
      .querySelectorAll(".scroll-reveal, .feature, .plan")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Featured stations (just the first 3)
  const featuredStations = stations.slice(0, 3);

  // Featured vehicles (first 3)
  const featuredVehicles = vehicles.slice(0, 3);

  // Debug logs
  console.log("🔍 [HOME RENDER] stations:", stations.length, stations);
  console.log("🔍 [HOME RENDER] vehicles:", vehicles.length, vehicles);
  console.log(
    "🔍 [HOME RENDER] featuredVehicles:",
    featuredVehicles.length,
    featuredVehicles
  );
  console.log("🔍 [HOME RENDER] loadingVehicles:", loadingVehicles);
  console.log("🔍 [HOME RENDER] loadingStations:", loadingStations);

  return (
    <div className="template-root">
      <section className="template-hero">
        {/* Background slideshow */}
        <div className="hero-background-slideshow">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`hero-background-image ${
                index === currentBgIndex ? "active" : ""
              }`}
              style={{
                backgroundImage: `url(${image})`,
              }}
            />
          ))}
        </div>

        {/* Overlay */}
        <div className="hero-overlay"></div>

        <div className="hero-inner ev-container">
          <div className="hero-text">
            <h1>Thuê xe máy điện - Khám phá thành phố</h1>
            <p className="lead">
              Nhanh chóng tìm điểm thuê gần bạn, đặt xe và di chuyển — thân
              thiện với môi trường, giá cả phải chăng và thuận tiện.
            </p>
            {!isStaffOrAdmin && (
              <div className="hero-ctas">
                <Link className="btn primary" to="/stations">
                  Tìm điểm thuê
                </Link>
                <Link className="btn secondary" to="/vehicles">
                  Xem xe máy điện
                </Link>
              </div>
            )}
            {isStaffOrAdmin && (
              <div className="hero-ctas">
                <Link 
                  className="btn primary" 
                  to={userRoleId === 2 ? "/staff" : "/admin"}
                >
                  Đi đến trang quản lý
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="vehicles-showcase" className="template-section">
        <div className="ev-container">
          <h2 className="section-title scroll-reveal fade-up">
            Xe máy điện cao cấp
          </h2>
          <p className="section-sub scroll-reveal fade-up">
            Trải nghiệm tương lai của giao thông đô thị.
          </p>

          {loadingVehicles ? (
            <div className="loading-message">
              <p>🔄 Đang tải xe máy điện...</p>
            </div>
          ) : vehiclesError ? (
            <div className="no-vehicles-message" style={{ 
              background: '#fff3cd', 
              border: '2px solid #ffc107',
              padding: '2rem',
              borderRadius: '12px'
            }}>
              <p style={{ color: '#856404', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                ⚠️ Không thể tải danh sách xe
              </p>
              <p style={{ color: '#856404', fontSize: '0.95rem' }}>
                {vehiclesError}
              </p>
              <p style={{ color: '#856404', fontSize: '0.9rem', marginTop: '1rem' }}>
                💡 <strong>Hướng dẫn khắc phục:</strong>
              </p>
              <ul style={{ 
                textAlign: 'left', 
                color: '#856404', 
                fontSize: '0.9rem',
                maxWidth: '600px',
                margin: '0.5rem auto',
                paddingLeft: '1.5rem'
              }}>
                <li>Kiểm tra Backend đang chạy tại <code>http://localhost:5168</code></li>
                <li>Kiểm tra API <code>/api/EVBike/AvailableBikes</code> không bị lỗi 500</li>
                <li>Xem Console F12 để biết chi tiết lỗi</li>
                <li>Thử refresh lại trang (Ctrl+R)</li>
              </ul>
            </div>
          ) : featuredVehicles.length === 0 ? (
            <div className="no-vehicles-message">
              <p>Hiện chưa có xe máy điện nào.</p>
            </div>
          ) : (
            <div className="image-gallery">
              {featuredVehicles.map((vehicle, index) => (
                isStaffOrAdmin ? (
                  <div
                    key={vehicle.id}
                    className="gallery-item"
                    style={{ cursor: "not-allowed", opacity: 0.7 }}
                  >
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      loading="lazy"
                      onError={(e) => {
                        console.log("❌ Image failed to load:", vehicle.image);
                        e.target.src =
                          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60";
                      }}
                    />
                    <div className="gradient-overlay"></div>
                    <div className="gallery-content">
                      <h3>{vehicle.name}</h3>
                      <p>{vehicle.short}</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    key={vehicle.id}
                    className="gallery-item"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      loading="lazy"
                      onError={(e) => {
                        console.log("❌ Image failed to load:", vehicle.image);
                        e.target.src =
                          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60";
                      }}
                    />
                    <div className="gradient-overlay"></div>
                    <div className="gallery-content">
                      <h3>{vehicle.name}</h3>
                      <p>{vehicle.short}</p>
                    </div>
                  </Link>
                )
              ))}
            </div>
          )}

          {!isStaffOrAdmin && (
            <div className="text-center mt-4">
              <Link to="/vehicles" className="btn primary">
                Xem tất cả xe máy điện
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="features" className="template-section">
        <div className="ev-container">
          <h2 className="section-title scroll-reveal fade-up">
            Tại sao chọn EV Rental?
          </h2>
          <div className="features-grid">
            <div className="feature scroll-reveal fade-up">
              <div className="feature-icon">🔋</div>
              <h3>Năng lượng xanh</h3>
              <p>
                Xe điện không phát thải, góp phần bảo vệ môi trường và giảm ô
                nhiễm không khí.
              </p>
            </div>
            <div className="feature scroll-reveal fade-up">
              <div className="feature-icon">💰</div>
              <h3>Tiết kiệm chi phí</h3>
              <p>
                Chi phí thuê hợp lý với nhiều gói dịch vụ linh hoạt phù hợp với
                nhu cầu của bạn.
              </p>
            </div>
            <div className="feature scroll-reveal fade-up">
              <div className="feature-icon">📍</div>
              <h3>Nhiều điểm thuê</h3>
              <p>
                Mạng lưới điểm thuê rộng khắp, dễ dàng tìm và trả xe tại các vị
                trí thuận tiện.
              </p>
            </div>
            <div className="feature scroll-reveal fade-up">
              <div className="feature-icon">🔒</div>
              <h3>An toàn & Bảo mật</h3>
              <p>
                Hệ thống bảo mật cao cấp, bảo vệ thông tin cá nhân và giao dịch
                của bạn.
              </p>
            </div>
            <div className="feature scroll-reveal fade-up">
              <div className="feature-icon">⚡</div>
              <h3>Sạc nhanh</h3>
              <p>
                Các trạm sạc nhanh tại mỗi điểm thuê giúp xe luôn sẵn sàng phục
                vụ bạn.
              </p>
            </div>
            <div className="feature scroll-reveal fade-up">
              <div className="feature-icon">📱</div>
              <h3>Đặt xe dễ dàng</h3>
              <p>
                Đặt xe nhanh chóng thông qua website, không cần tải ứng dụng
                phức tạp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="stations" className="template-section">
        <div className="ev-container">
          <h2 className="section-title scroll-reveal fade-up">
            Điểm thuê gần bạn
          </h2>
          <p className="section-sub scroll-reveal fade-up">
            Tìm điểm thuê xe máy điện phù hợp với lịch trình của bạn.
          </p>

          {loadingStations ? (
            <div className="loading-message">
              <p>🔄 Đang tải điểm thuê...</p>
            </div>
          ) : stations.length === 0 ? (
            <div className="no-stations-message">
              <p>Hiện chưa có điểm thuê nào.</p>
            </div>
          ) : (
            <div className="stations-carousel-wrapper">
              {/* Previous Button */}
              <button
                className="carousel-btn carousel-btn-prev"
                onClick={handlePrevStation}
                aria-label="Trạm trước"
              >
                <span>&#8249;</span>
              </button>

              {/* Stations Carousel */}
              <div className="stations-carousel">
                <div
                  className="stations-carousel-track"
                  style={{
                    transform: `translateX(-${
                      currentStationIndex * (100 / stationsPerView)
                    }%)`,
                  }}
                >
                  {stations.map((station) => (
                    <div key={station.id} className="station-card">
                      <img
                        src={station.image}
                        alt={station.name}
                        className="station-img"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1599593752325-ffa41031056e?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />
                      <div className="station-content">
                        <h3>{station.name}</h3>
                        <p className="station-address">{station.address}</p>
                        <div className="station-meta">
                          <span className="station-hours">
                            7:00-21:00
                          </span>
                          <span className="station-available">
                            {station.availableVehicles} xe có sẵn
                          </span>
                        </div>
                        {!isStaffOrAdmin ? (
                          <Link
                            to={`/stations/${station.id}`}
                            className="btn primary sm"
                          >
                            Xem chi tiết
                          </Link>
                        ) : (
                          <button
                            className="btn primary sm"
                            disabled
                            style={{ opacity: 0.5, cursor: "not-allowed" }}
                          >
                            Chỉ dành cho khách hàng
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                className="carousel-btn carousel-btn-next"
                onClick={handleNextStation}
                aria-label="Trạm tiếp theo"
              >
                <span>&#8250;</span>
              </button>
            </div>
          )}

          {/* Carousel Indicators */}
          {!loadingStations && maxIndex > 0 && (
            <div className="carousel-indicators">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${
                    index === currentStationIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentStationIndex(index)}
                  aria-label={`Đi tới trang ${index + 1}`}
                />
              ))}
            </div>
          )}

          {!isStaffOrAdmin && (
            <div className="text-center mt-4">
              <Link to="/stations" className="btn primary">
                Xem tất cả điểm thuê
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="template-section bg-light">
        <div className="ev-container">
          <h2 className="section-title scroll-reveal fade-up">Cách thuê xe</h2>
          <div className="steps-container">
            <div className="step scroll-reveal fade-up">
              <div className="step-number">1</div>
              <h3>Tìm điểm thuê</h3>
              <p>
                Tìm điểm thuê gần bạn thông qua bản đồ hoặc danh sách có sẵn.
              </p>
            </div>
            <div className="step scroll-reveal fade-up">
              <div className="step-number">2</div>
              <h3>Chọn xe</h3>
              <p>
                Lựa chọn xe máy điện phù hợp với nhu cầu và thời gian của bạn.
              </p>
            </div>
            <div className="step scroll-reveal fade-up">
              <div className="step-number">3</div>
              <h3>Đặt xe</h3>
              <p>Đăng nhập và xác nhận đặt xe, bạn sẽ nhận được mã QR.</p>
            </div>
            <div className="step scroll-reveal fade-up">
              <div className="step-number">4</div>
              <h3>Nhận xe</h3>
              <p>Đến điểm thuê, quét mã QR và nhận xe để bắt đầu hành trình.</p>
            </div>
          </div>
        </div>
      </section>

      {!isStaffOrAdmin && (
        <section id="cta" className="template-section cta-section">
          <div className="ev-container">
            <div className="cta-container scroll-reveal fade-up">
              <h2>Sẵn sàng cho hành trình xanh?</h2>
              <p>
                Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt dành cho thành viên
                mới.
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="btn primary large">
                  Đăng ký ngay
                </Link>
                <Link to="/stations" className="btn outline large">
                  Tìm điểm thuê
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
