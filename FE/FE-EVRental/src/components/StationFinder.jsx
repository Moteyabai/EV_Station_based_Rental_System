import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import stationsData from '../data/stations_new';
import '../styles/StationFinder.css';

export default function StationFinder() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  
  // Load stations data
  useEffect(() => {
    try {
      setLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        if (stationsData && Array.isArray(stationsData)) {
          setStations(stationsData);
          setError(null);
        } else {
          setError('Dữ liệu trạm không hợp lệ');
        }
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Không thể tải dữ liệu trạm: ' + err.message);
      setLoading(false);
    }
  }, []);
  
  // Handle station selection
  const handleStationSelect = (station) => {
    setSelectedStation(station);
  };
  
  // Filter stations based on search query
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="station-finder-container">
        <div className="loading-message">
          <p>🔄 Đang tải danh sách trạm thuê xe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="station-finder-container">
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
    );
  }

  return (
    <div className="station-finder-container">
      <div className="station-finder-header">
        <h2>🚗 Tìm Điểm Thuê Xe</h2>
        <p>Khám phá {stations.length} điểm thuê xe điện gần bạn</p>
      </div>
      
      <div className="search-form">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên trạm hoặc địa chỉ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="station-finder-content">
        <div className="stations-list">
          <h3>📍 Danh sách trạm ({filteredStations.length})</h3>
          
          {filteredStations.length === 0 ? (
            <div className="no-results">
              <p>😔 Không tìm thấy trạm nào phù hợp với từ khóa "{searchQuery}"</p>
            </div>
          ) : (
            <div className="station-cards">
              {filteredStations.map((station) => (
                <div 
                  key={station.id} 
                  className={`station-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
                  onClick={() => handleStationSelect(station)}
                >
                  <div className="station-image">
                    <img src={station.image} alt={station.name} />
                    <div className="available-badge">
                      {station.availableVehicles} xe có sẵn
                    </div>
                  </div>
                  
                  <div className="station-info">
                    <h4>{station.name}</h4>
                    <p className="address">📍 {station.address}</p>
                    <p className="hours">🕒 {station.openingHours}</p>
                    <p className="contact">📞 {station.contactNumber}</p>
                    
                    <div className="station-rating">
                      ⭐ {station.rating} ({station.reviews} đánh giá)
                    </div>
                    
                    <div className="amenities">
                      {station.amenities.map((amenity, index) => (
                        <span key={index} className="amenity-tag">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    
                    <div className="station-actions">
                      <Link 
                        to={`/stations/${station.id}`} 
                        className="btn primary"
                      >
                        Xem chi tiết
                      </Link>
                      <button className="btn secondary">
                        Đặt xe ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Map placeholder */}
        <div className="map-container">
          <div className="map-placeholder">
            <div className="map-message">
              <h4>🗺️ Bản đồ tương tác</h4>
              <p>Hiển thị vị trí các trạm thuê xe</p>
              <small>(Tính năng sẽ được cập nhật trong phiên bản tiếp theo)</small>
            </div>
            
            {selectedStation && (
              <div className="selected-station-overlay">
                <div className="selected-info">
                  <h4>📍 {selectedStation.name}</h4>
                  <p>{selectedStation.address}</p>
                  <p>🚗 {selectedStation.availableVehicles} xe có sẵn</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}