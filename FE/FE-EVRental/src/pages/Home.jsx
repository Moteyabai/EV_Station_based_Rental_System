import React from 'react';
import './Home.css';
import '../styles/media.css';
import StationList from '../components/StationList';
import VideoBackground from '../components/VideoBackground';
import stationsData from '../data/stations';

// Using placeholder images from a public CDN
const heroFallback = 'https://images.unsplash.com/photo-1622981515183-6f4d9e25e2a3?auto=format&fit=crop&w=1920&q=80';
const bikeImg1 = 'https://images.unsplash.com/photo-1623750318869-4f8ab290c655?auto=format&fit=crop&w=800&q=80';
const bikeImg2 = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80';
const bikeImg3 = 'https://images.unsplash.com/photo-1598214015728-bc76b2e6e9f4?auto=format&fit=crop&w=800&q=80';
const stationImg1 = 'https://images.unsplash.com/photo-1599593752325-ffa41031056e?auto=format&fit=crop&w=1200&q=80';

export default function Home() {
  // Add scroll reveal effect
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    // Observe scroll reveal elements
    document.querySelectorAll('.scroll-reveal, .feature, .plan').forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="template-root">
      <section className="template-hero">
        <VideoBackground fallbackImage={heroFallback} />
        <div className="dark-overlay"></div>
        <div className="bg-pattern"></div>
        <div className="hero-inner ev-container">
          <div className="hero-text scroll-reveal fade-up">
            <h1>Electric bike rental for city explorers</h1>
            <p className="lead">Quickly find a nearby station, reserve a bike and get moving — eco-friendly, affordable, and fun.</p>
            <div className="hero-ctas">
              <a className="btn primary glow" href="#stations">Browse Stations</a>
              <a className="btn float" href="#pricing">Plans & Pricing</a>
            </div>
          </div>
          <div className="hero-visual scroll-reveal fade-left">
            <div className="bike-card floating">
              <div className="bike-top">E-BIKE X1</div>
              <div className="bike-img" style={{backgroundImage: `url(${bikeImg1})`}} />
              <div className="bike-meta">Fast • 60km range • GPS</div>
              <div className="card-shine"></div>
            </div>
            <div className="floating-elements">
              <div className="float-badge top">Premium Quality</div>
              <div className="float-badge bottom">24/7 Support</div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="mouse"></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      <section id="bikes-showcase" className="template-section">
        <div className="ev-container">
          <h2 className="section-title scroll-reveal fade-up">Our Premium E-Bikes</h2>
          <p className="section-sub scroll-reveal fade-up">Experience the future of urban mobility.</p>
          <div className="image-gallery">
            <div className="gallery-item scroll-reveal fade-up">
              <img src={bikeImg1} alt="Premium E-Bike Model X1" loading="lazy" />
              <div className="gradient-overlay"></div>
              <div className="gallery-content">
                <h3>Model X1</h3>
                <p>Premium city cruiser</p>
              </div>
            </div>
            <div className="gallery-item scroll-reveal fade-up">
              <img src={bikeImg2} alt="Sport E-Bike Model S2" loading="lazy" />
              <div className="gradient-overlay"></div>
              <div className="gallery-content">
                <h3>Model S2</h3>
                <p>Sport performance</p>
              </div>
            </div>
            <div className="gallery-item scroll-reveal fade-up">
              <img src={bikeImg3} alt="Comfort E-Bike Model C1" loading="lazy" />
              <div className="gradient-overlay"></div>
              <div className="gallery-content">
                <h3>Model C1</h3>
                <p>Ultimate comfort</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stations" className="template-section ev-container">
        <h2>Nearby Stations</h2>
        <p className="section-sub">Stations near you with real-time availability.</p>
        <StationList stations={stationsData} />
      </section>

      <section id="features" className="template-section features">
        <div className="ev-container">
          <h2 className="section-title scroll-reveal fade-up">Why choose our e-bikes?</h2>
          <div className="features-grid">
            <div className="feature" style={{backgroundImage: `url(${bikeImg1})`}}>
              <div className="gradient-overlay"></div>
              <div className="feature-content">
                <h3>Convenient</h3>
                <p>Pick up and drop off at any station across the city.</p>
              </div>
            </div>
            <div className="feature" style={{backgroundImage: `url(${bikeImg2})`}}>
              <div className="gradient-overlay"></div>
              <div className="feature-content">
                <h3>Affordable</h3>
                <p>Cheap per-minute pricing and monthly passes.</p>
              </div>
            </div>
            <div className="feature" style={{backgroundImage: `url(${bikeImg3})`}}>
              <div className="gradient-overlay"></div>
              <div className="feature-content">
                <h3>Green</h3>
                <p>Zero emissions — a cleaner way to commute.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="template-section pricing ev-container">
        <h2>Plans & Pricing</h2>
        <div className="pricing-grid">
          <div className="card plan">
            <h3>Pay-as-you-go</h3>
            <p className="price">$0.15 / min</p>
            <ul>
              <li>No commitment</li>
              <li>Access to all bikes</li>
            </ul>
            <button className="btn primary">Start renting</button>
          </div>
          <div className="card plan popular">
            <div className="badge">Popular</div>
            <h3>Monthly Pass</h3>
            <p className="price">$29 / month</p>
            <ul>
              <li>Unlimited 30-min rides</li>
              <li>Discounted extra time</li>
            </ul>
            <button className="btn primary">Get pass</button>
          </div>
          <div className="card plan">
            <h3>Student</h3>
            <p className="price">$9 / month</p>
            <ul>
              <li>Verified student discount</li>
            </ul>
            <button className="btn">Apply</button>
          </div>
        </div>
      </section>

      <footer className="site-footer ev-container">
        <div className="footer-grid">
          <div>
            <h4>EV Rental</h4>
            <p>Ride clean. Ride fast. Explore more.</p>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>About</li>
              <li>Careers</li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li>Help Center</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} EV Rental — All rights reserved</div>
      </footer>
    </div>
  )
}
