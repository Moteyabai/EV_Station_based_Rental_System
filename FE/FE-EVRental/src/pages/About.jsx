import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        {/* Hero Section */}
        <section className="about-hero">
          <h1>Giới thiệu Trung Tâm Cho Thuê Xe Điện EV Rental</h1>
          <p className="hero-description">
            EV Rental tự hào là đơn vị hàng đầu trong lĩnh vực cho thuê xe điện, 
            mang đến cho khách hàng giải pháp di chuyển xanh – an toàn – tiết kiệm. 
            Với mục tiêu thúc đẩy lối sống thân thiện với môi trường, chúng tôi cung cấp 
            đa dạng các dòng xe điện chất lượng cao, phù hợp cho mọi nhu cầu từ cá nhân 
            đến doanh nghiệp.
          </p>
        </section>

        {/* Mission Section */}
        <section className="about-section mission-section">
          <h2>Sứ mệnh và giá trị</h2>
          <p className="section-intro">
            EV Rental không chỉ là dịch vụ cho thuê xe, mà còn là một phần trong hành trình 
            hướng tới giao thông bền vững. Chúng tôi cam kết:
          </p>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>Bảo vệ môi trường</h3>
              <p>Giảm thiểu khí thải, bảo vệ môi trường sống.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🛡️</div>
              <h3>An toàn hàng đầu</h3>
              <p>Mang lại trải nghiệm lái êm ái, an toàn cho mọi khách hàng.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💚</div>
              <h3>Dịch vụ tận tâm</h3>
              <p>Dịch vụ chăm sóc tận tâm, hỗ trợ nhanh chóng 24/7.</p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="about-section services-section">
          <h2>Dịch vụ của chúng tôi</h2>
          <div className="services-list">
            <div className="service-item">
              <div className="service-icon">🛵</div>
              <div className="service-content">
                <h3>Cho thuê xe điện cá nhân</h3>
                <p>Xe gọn nhẹ, dễ di chuyển, phù hợp đi lại hằng ngày hoặc du lịch ngắn hạn.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-icon">🏢</div>
              <div className="service-content">
                <h3>Cho thuê xe điện doanh nghiệp</h3>
                <p>Giải pháp vận chuyển cho công ty, sự kiện, hội chợ, giảm chi phí nhiên liệu.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-icon">⏰</div>
              <div className="service-content">
                <h3>Cho thuê theo giờ, ngày hoặc tháng</h3>
                <p>Linh hoạt về thời gian và giá cả để đáp ứng mọi nhu cầu.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-icon">🚚</div>
              <div className="service-content">
                <h3>Giao và nhận xe tận nơi</h3>
                <p>Tiện lợi ngay tại địa điểm khách hàng mong muốn.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team & Equipment Section */}
        <section className="about-section team-section">
          <h2>Đội ngũ và thiết bị</h2>
          <p>
            EV Rental sở hữu đội ngũ kỹ thuật viên lành nghề, luôn bảo dưỡng xe định kỳ 
            để đảm bảo vận hành tối ưu. Tất cả xe điện đều được trang bị pin dung lượng cao, 
            hệ thống phanh an toàn, và thiết kế hiện đại, mang lại trải nghiệm lái dễ dàng 
            và thú vị.
          </p>
        </section>

        {/* Commitment Section */}
        <section className="about-section commitment-section">
          <h2>Cam kết với khách hàng</h2>
          <p className="section-intro">Khi đến với EV Rental, bạn sẽ nhận được:</p>
          <div className="commitment-grid">
            <div className="commitment-item">
              <span className="commitment-check">✓</span>
              <p>Xe sạch sẽ, pin đầy sẵn sàng cho hành trình.</p>
            </div>
            <div className="commitment-item">
              <span className="commitment-check">✓</span>
              <p>Hợp đồng rõ ràng, minh bạch chi phí.</p>
            </div>
            <div className="commitment-item">
              <span className="commitment-check">✓</span>
              <p>Hỗ trợ kỹ thuật và cứu hộ miễn phí khi cần.</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="about-section contact-section">
          <h2>Liên hệ</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <h3>Địa chỉ</h3>
              <p>123 Đường Xanh, Quận 1, TP. Hồ Chí Minh</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <h3>Hotline</h3>
              <p>0909 123 456</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <h3>Email</h3>
              <p>contact@evrental.vn</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">🌐</div>
              <h3>Website</h3>
              <p>www.evrental.vn</p>
            </div>
          </div>
        </section>

        {/* Footer Slogan */}
        <section className="about-footer">
          <h3>EV Rental – Di chuyển xanh, sống bền vững.</h3>
        </section>
      </div>
    </div>
  );
};

export default About;
