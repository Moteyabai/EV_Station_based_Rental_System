import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import "../styles/media.css";
import stations from "../data/stations";
import vehicles from "../data/vehicles";

// Using placeholder images and direct links to product images
const bikeImg1 = vehicles[0].image; // VinFast Klara S
const bikeImg2 = vehicles[1].image; // DatBike Weaver 200
const bikeImg3 = vehicles[2].image; // VinFast Feliz S
const stationImg =
  "https://images.unsplash.com/photo-1599593752325-ffa41031056e?auto=format&fit=crop&w=1200&q=80";

export default function Home() {
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

  return (
    <div className="template-root">
      <section className="template-hero">
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
          <div className="image-gallery">
            {featuredVehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="gallery-item scroll-reveal fade-up"
              >
                <img src={vehicle.image} alt={vehicle.name} loading="lazy" />
                <div className="gradient-overlay"></div>
                <div className="gallery-content">
                  <h3>{vehicle.name}</h3>
                  <p>{vehicle.short}</p>
                </div>
              </div>
            ))}
          </div>
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

          <div className="stations-grid scroll-reveal fade-up">
            {featuredStations.map((station) => (
              <div key={station.id} className="station-card">
                <img
                  src={station.image}
                  alt={station.name}
                  className="station-img"
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
