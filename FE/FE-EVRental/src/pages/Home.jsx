import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import "../styles/media.css";
import { fetchActiveStations } from "../api/stations";
import { getAvailableBikes } from "../api/bikes";

// Default placeholder images
const defaultBikeImg = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60";
const stationImg =
  "https://images.unsplash.com/photo-1599593752325-ffa41031056e?auto=format&fit=crop&w=1200&q=80";

export default function Home() {
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);
  const [currentStationIndex, setCurrentStationIndex] = React.useState(0);
  const [stations, setStations] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [loadingStations, setLoadingStations] = React.useState(true);
  const [loadingVehicles, setLoadingVehicles] = React.useState(true);
  
  // Background images array with cache busting
  const backgroundImages = [
    `/images/background/background-1.jpg?v=${Date.now()}`,
    `/images/background/background-2.jpg?v=${Date.now()}`,
    `/images/background/background-3.jpg?v=${Date.now()}`,
  ];

  // Load stations from API
  React.useEffect(() => {
    let isMounted = true;
    async function loadStations() {
      try {
        setLoadingStations(true);
        console.log('🚀 [HOME] Calling fetchActiveStations API... (Reload safe)');
        const apiStations = await fetchActiveStations();
        if (!isMounted) return;
        console.log('✅ [HOME] Stations data received:', apiStations);
        const mapped = apiStations.map((s) => ({
          id: s.stationID || s.StationID || s.id,
          name: s.name || s.Name,
          address: s.address || s.Address,
          description: s.description || s.Description,
          image: s.thumbnailImageUrl || s.ThumbnailImageUrl || stationImg,
          availableVehicles: s.availableBikes || 0,
        }));
        setStations(mapped);
      } catch (error) {
        console.error("❌ [HOME] Error loading stations:", error);
        if (isMounted) setStations([]);
      } finally {
        if (isMounted) {
          setLoadingStations(false);
          console.log('✅ [HOME] Stations loaded successfully');
        }
      }
    }
    // Always call loadStations on mount/reload
    loadStations();
    return () => { isMounted = false; };
  }, []);

  // Load vehicles from API
  React.useEffect(() => {
    let isMounted = true;
    async function loadVehicles() {
      try {
        setLoadingVehicles(true);
        const token = localStorage.getItem('ev_token');
        console.log('🚀 [HOME] Calling getAvailableBikes API... (Reload safe)');
        const bikesData = await getAvailableBikes(token);
        if (!isMounted) return;
        console.log('✅ [HOME] Bikes data received:', bikesData);
        
        const mapped = bikesData.map((bike) => {
          const quantity = bike.quantity || 0;
          return {
            id: bike.bikeID || bike.BikeID,
            name: bike.bikeName || bike.model || bike.Model || 'Xe điện',
            brand: bike.brandName || bike.BrandName || 'Unknown',
            image: bike.thumbnailImageUrl || bike.ThumbnailImageUrl || bike.frontImg || defaultBikeImg,
            price: bike.pricePerDay || bike.PricePerDay || 0,
            priceUnit: '/ngày',
            short: `${bike.brandName || bike.BrandName || 'Xe điện'} - ${quantity} xe có sẵn`,
            quantity: quantity,
          };
        });
        setVehicles(mapped);
      } catch (error) {
        console.error("❌ [HOME] Error loading vehicles:", error);
        if (isMounted) setVehicles([]);
      } finally {
        if (isMounted) {
          setLoadingVehicles(false);
          console.log('✅ [HOME] Vehicles loaded successfully');
        }
      }
    }
    // Always call loadVehicles on mount/reload
    loadVehicles();
    return () => { isMounted = false; };
  }, []);

  // Background slideshow effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
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
  console.log('🔍 [HOME RENDER] stations:', stations.length, stations);
  console.log('🔍 [HOME RENDER] vehicles:', vehicles.length, vehicles);
  console.log('🔍 [HOME RENDER] featuredVehicles:', featuredVehicles.length, featuredVehicles);
  console.log('🔍 [HOME RENDER] loadingVehicles:', loadingVehicles);
  console.log('🔍 [HOME RENDER] loadingStations:', loadingStations);

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
            <div className="hero-ctas">
              <Link className="btn primary" to="/stations">
                Tìm điểm thuê
              </Link>
              <Link className="btn secondary" to="/vehicles">
                Xem xe máy điện
              </Link>
            </div>
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
          ) : featuredVehicles.length === 0 ? (
            <div className="no-vehicles-message">
              <p>Hiện chưa có xe máy điện nào.</p>
            </div>
          ) : (
            <div className="image-gallery">
              {featuredVehicles.map((vehicle, index) => (
                <Link
                  to={`/vehicles/${vehicle.id}`}
                  key={vehicle.id}
                  className="gallery-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name} 
                    loading="lazy"
                    onError={(e) => {
                      console.log('❌ Image failed to load:', vehicle.image);
                      e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60';
                    }}
                  />
                  <div className="gradient-overlay"></div>
                  <div className="gallery-content">
                    <h3>{vehicle.name}</h3>
                    <p>{vehicle.short}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link to="/vehicles" className="btn primary">
              Xem tất cả xe máy điện
            </Link>
          </div>
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
                    transform: `translateX(-${currentStationIndex * (100 / stationsPerView)}%)`,
                  }}
                >
                  {stations.map((station) => (
                    <div key={station.id} className="station-card">
                      <img
                        src={station.image}
                        alt={station.name}
                        className="station-img"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1599593752325-ffa41031056e?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                      <div className="station-content">
                        <h3>{station.name}</h3>
                        <p className="station-address">{station.address}</p>
                        <div className="station-meta">
                          <span className="station-hours">
                            {station.openingHours}
                          </span>
                          <span className="station-available">
                            {station.availableVehicles} xe có sẵn
                          </span>
                        </div>
                        <Link
                          to={`/stations/${station.id}`}
                          className="btn primary sm"
                        >
                          Xem chi tiết
                        </Link>
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
                  className={`indicator ${index === currentStationIndex ? "active" : ""}`}
                  onClick={() => setCurrentStationIndex(index)}
                  aria-label={`Đi tới trang ${index + 1}`}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-4">
            <Link to="/stations" className="btn primary">
              Xem tất cả điểm thuê
            </Link>
          </div>
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
    </div>
  );
}
