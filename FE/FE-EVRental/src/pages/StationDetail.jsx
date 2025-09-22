import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import stations from '../data/stations';
import { useAuth } from '../contexts/AuthContext';
import '../styles/StationDetail.css';

export default function StationDetail() {
  const { id } = useParams();
  const station = stations.find((s) => s.id === id);
  const { user, verificationStatus } = useAuth();
  const navigate = useNavigate();
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    additionalServices: []
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [activeImage, setActiveImage] = useState('exterior');

  if (!station) {
    return (
      <div className="page-container">
        <div className="not-found-container">
          <h2>Station Not Found</h2>
          <p>Sorry, the station you're looking for doesn't exist.</p>
          <Link to="/stations" className="btn primary">View All Stations</Link>
        </div>
      </div>
    );
  }
  
  function handleVehicleSelect(vehicle) {
    setSelectedVehicle(vehicle);
    setShowBookingForm(true);
    // Scroll to booking form
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  
  function handleInputChange(e) {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  function handleCheckboxChange(e) {
    const { name, checked } = e.target;
    setBookingData(prev => {
      if (checked) {
        return {
          ...prev,
          additionalServices: [...prev.additionalServices, name]
        };
      } else {
        return {
          ...prev,
          additionalServices: prev.additionalServices.filter(service => service !== name)
        };
      }
    });
  }
  
  function handleBookingSubmit(e) {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check verification status
    if (verificationStatus && !verificationStatus.documentsVerified) {
      navigate('/verification-pending');
      return;
    }
    
    // In a real app, this would call an API to create the booking
    setBookingConfirmed(true);
    
    // Scroll to confirmation message
    setTimeout(() => {
      document.getElementById('booking-confirmation')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  
  // Generate a booking ID (in a real app, this would come from the backend)
  const bookingId = 'BK' + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="page-container">
      <div className="station-detail-container">
        {/* Station Header */}
        <div className="station-header">
          <div className="breadcrumbs">
            <Link to="/stations">Stations</Link> / {station.name}
          </div>
          
          <h1>{station.name}</h1>
          <p className="station-address">{station.address}</p>
          
          <div className="station-quick-info">
            <div className="info-item">
              <span className="label">Available Vehicles:</span>
              <span className="value">{station.availableVehicles}</span>
            </div>
            <div className="info-item">
              <span className="label">Charging Stations:</span>
              <span className="value">{station.chargingStations}</span>
            </div>
            <div className="info-item">
              <span className="label">Opening Hours:</span>
              <span className="value">{station.openingHours}</span>
            </div>
          </div>
        </div>
        
        {/* Station Gallery */}
        {station.images && (
          <div className="station-gallery">
            <div className="main-image">
              {activeImage === 'exterior' && station.images.exterior && (
                <img src={station.images.exterior} alt={`${station.name} exterior`} />
              )}
              {activeImage === 'chargers' && station.images.chargers && (
                <img src={station.images.chargers} alt={`${station.name} charging stations`} />
              )}
              {activeImage === 'thumbnail' && station.images.thumbnail && (
                <img src={station.images.thumbnail} alt={`${station.name} overview`} />
              )}
            </div>
            
            <div className="gallery-thumbnails">
              {station.images.exterior && (
                <div 
                  className={`thumbnail ${activeImage === 'exterior' ? 'active' : ''}`}
                  onClick={() => setActiveImage('exterior')}
                >
                  <img src={station.images.exterior} alt="Exterior view" />
                </div>
              )}
              
              {station.images.chargers && (
                <div 
                  className={`thumbnail ${activeImage === 'chargers' ? 'active' : ''}`}
                  onClick={() => setActiveImage('chargers')}
                >
                  <img src={station.images.chargers} alt="Charging stations" />
                </div>
              )}
              
              {station.images.thumbnail && (
                <div 
                  className={`thumbnail ${activeImage === 'thumbnail' ? 'active' : ''}`}
                  onClick={() => setActiveImage('thumbnail')}
                >
                  <img src={station.images.thumbnail} alt="Overview" />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Station Description */}
        <div className="station-description">
          <h2>About This Location</h2>
          <p>{station.description}</p>
          
          <div className="amenities">
            <h3>Amenities</h3>
            <div className="amenities-list">
              {station.amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  <div className="amenity-icon">✓</div>
                  <div className="amenity-name">{amenity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Available Vehicles */}
        <div className="available-vehicles">
          <h2>Available Vehicles</h2>
          
          <div className="vehicles-list">
            {station.vehicles
              .filter(vehicle => vehicle.available)
              .map(vehicle => (
                <div 
                  key={vehicle.id} 
                  className={`vehicle-card ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="vehicle-image">
                    {vehicle.image ? (
                      <img src={vehicle.image} alt={vehicle.name} />
                    ) : (
                      <div className="image-placeholder">
                        <span>{vehicle.name.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="vehicle-details">
                    <h3 className="vehicle-name">{vehicle.name}</h3>
                    <div className="vehicle-meta">
                      <span className="vehicle-type">{vehicle.type}</span>
                      <span className="vehicle-price">${vehicle.price}/day</span>
                    </div>
                    
                    <div className="vehicle-specs">
                      <div className="spec">
                        <span className="spec-label">Battery:</span>
                        <span className="spec-value">{vehicle.batteryCapacity}</span>
                      </div>
                      <div className="spec">
                        <span className="spec-label">Range:</span>
                        <span className="spec-value">{vehicle.range}</span>
                      </div>
                    </div>
                    
                    <button className="btn primary btn-select">
                      {selectedVehicle?.id === vehicle.id ? 'Selected' : 'Select Vehicle'}
                    </button>
                  </div>
                </div>
              ))}
              
            {station.vehicles.filter(vehicle => vehicle.available).length === 0 && (
              <div className="no-vehicles">
                <p>No vehicles currently available at this station.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Booking Form */}
        {showBookingForm && selectedVehicle && !bookingConfirmed && (
          <div id="booking-form" className="booking-form-container">
            <h2>Book {selectedVehicle.name}</h2>
            
            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-section">
                <h3>Rental Period</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pickupDate">Pickup Date</label>
                    <input 
                      type="date" 
                      id="pickupDate"
                      name="pickupDate"
                      value={bookingData.pickupDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="pickupTime">Pickup Time</label>
                    <input 
                      type="time" 
                      id="pickupTime"
                      name="pickupTime"
                      value={bookingData.pickupTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="returnDate">Return Date</label>
                    <input 
                      type="date" 
                      id="returnDate"
                      name="returnDate"
                      value={bookingData.returnDate}
                      onChange={handleInputChange}
                      min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="returnTime">Return Time</label>
                    <input 
                      type="time" 
                      id="returnTime"
                      name="returnTime"
                      value={bookingData.returnTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Additional Services</h3>
                
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      name="insurance"
                      checked={bookingData.additionalServices.includes('insurance')}
                      onChange={handleCheckboxChange}
                    />
                    Insurance Coverage (+$15/day)
                  </label>
                  
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      name="charger"
                      checked={bookingData.additionalServices.includes('charger')}
                      onChange={handleCheckboxChange}
                    />
                    Portable Charger (+$10/day)
                  </label>
                  
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      name="gps"
                      checked={bookingData.additionalServices.includes('gps')}
                      onChange={handleCheckboxChange}
                    />
                    GPS Navigation System (+$5/day)
                  </label>
                </div>
              </div>
              
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                
                <div className="summary-item">
                  <span>Vehicle Rental:</span>
                  <span>${selectedVehicle.price}/day</span>
                </div>
                
                {bookingData.additionalServices.includes('insurance') && (
                  <div className="summary-item">
                    <span>Insurance:</span>
                    <span>$15/day</span>
                  </div>
                )}
                
                {bookingData.additionalServices.includes('charger') && (
                  <div className="summary-item">
                    <span>Portable Charger:</span>
                    <span>$10/day</span>
                  </div>
                )}
                
                {bookingData.additionalServices.includes('gps') && (
                  <div className="summary-item">
                    <span>GPS Navigation:</span>
                    <span>$5/day</span>
                  </div>
                )}
                
                <div className="summary-total">
                  <span>Estimated Total:</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              <div className="booking-actions">
                <button type="button" className="btn secondary" onClick={() => setShowBookingForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Booking Confirmation */}
        {bookingConfirmed && (
          <div id="booking-confirmation" className="booking-confirmation">
            <div className="confirmation-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            
            <div className="confirmation-details">
              <p>Your booking has been confirmed. Please see the details below:</p>
              
              <div className="confirmation-data">
                <div className="confirmation-item">
                  <span className="label">Booking ID:</span>
                  <span className="value">{bookingId}</span>
                </div>
                
                <div className="confirmation-item">
                  <span className="label">Vehicle:</span>
                  <span className="value">{selectedVehicle.name}</span>
                </div>
                
                <div className="confirmation-item">
                  <span className="label">Pickup:</span>
                  <span className="value">
                    {new Date(bookingData.pickupDate).toLocaleDateString()} at {bookingData.pickupTime}
                  </span>
                </div>
                
                <div className="confirmation-item">
                  <span className="label">Return:</span>
                  <span className="value">
                    {new Date(bookingData.returnDate).toLocaleDateString()} at {bookingData.returnTime}
                  </span>
                </div>
                
                <div className="confirmation-item">
                  <span className="label">Location:</span>
                  <span className="value">{station.name}</span>
                </div>
              </div>
              
              <div className="next-steps">
                <h3>Next Steps</h3>
                <ol>
                  <li>Arrive at the station at your scheduled pickup time</li>
                  <li>Present your ID and driver's license at the counter</li>
                  <li>Complete the check-in process with our staff</li>
                  <li>Inspect the vehicle with staff and document its condition</li>
                  <li>Sign the digital rental agreement</li>
                  <li>Begin your EV adventure!</li>
                </ol>
              </div>
            </div>
            
            <div className="confirmation-actions">
              <Link to="/stations" className="btn secondary">
                Browse More Stations
              </Link>
              <Link to="/" className="btn primary">
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
