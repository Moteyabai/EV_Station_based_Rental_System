import React, { useState } from 'react';
import './StationFinderPage.css';

// Dữ liệu mẫu cho các điểm thuê xe
const dummyStations = [
  {
    id: 1,
    name: 'Điểm thuê Quận 1',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    distance: 1.2,
    availableBikes: 8,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1599593752325-ffa41031056e?auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 2,
    name: 'Điểm thuê Quận 3',
    address: '45 Võ Văn Tần, Quận 3, TP.HCM',
    distance: 2.5,
    availableBikes: 5,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 3,
    name: 'Điểm thuê Quận 7',
    address: '1234 Nguyễn Văn Linh, Quận 7, TP.HCM',
    distance: 5.8,
    availableBikes: 12,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1574270981993-3b647123e3d1?auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 4,
    name: 'Điểm thuê Bình Thạnh',
    address: '101 Điện Biên Phủ, Bình Thạnh, TP.HCM',
    distance: 3.1,
    availableBikes: 3,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1635519183739-68adb5fb8673?auto=format&fit=crop&w=500&q=60'
  }
];

function StationFinderPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stations, setStations] = useState(dummyStations);
  const [selectedStation, setSelectedStation] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const handleSearch = (e) => {
    e.preventDefault();
    // Simulated search
    if (searchTerm.trim() === '') {
      setStations(dummyStations);
    } else {
      const filtered = dummyStations.filter(station => 
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setStations(filtered);
    }
  };

  const handleSelectStation = (station) => {
    setSelectedStation(station);
  };

  return (
    <div className="station-finder-page">
      <div className="station-finder-header">
        <h1>Tìm điểm thuê xe</h1>
        <p>Tìm và đặt xe tại các điểm thuê gần bạn nhất</p>
        
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Tìm kiếm</button>
        </form>
        
        <div className="view-toggle">
          <button 
            className={viewMode === 'list' ? 'active' : ''} 
            onClick={() => setViewMode('list')}
          >
            Danh sách
          </button>
          <button 
            className={viewMode === 'map' ? 'active' : ''} 
            onClick={() => setViewMode('map')}
          >
            Bản đồ
          </button>
        </div>
      </div>

      <div className="station-finder-content">
        {viewMode === 'list' ? (
          <div className="stations-list">
            {stations.length > 0 ? (
              stations.map(station => (
                <div
                  key={station.id}
                  className={`station-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
                  onClick={() => handleSelectStation(station)}
                >
                  <div className="station-image" style={{ backgroundImage: `url(${station.image})` }}>
                    <div className="available-badge">
                      {station.availableBikes} xe có sẵn
                    </div>
                  </div>
                  <div className="station-info">
                    <h3>{station.name}</h3>
                    <p className="station-address">{station.address}</p>
                    <div className="station-meta">
                      <span className="distance">{station.distance} km</span>
                      <span className="rating">
                        <span className="star">★</span> {station.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>Không tìm thấy điểm thuê nào phù hợp với tìm kiếm của bạn.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="map-view">
            <div className="map-placeholder">
              <p>Bản đồ sẽ được hiển thị ở đây.</p>
              <p>Các điểm thuê: {stations.map(s => s.name).join(', ')}</p>
            </div>
          </div>
        )}

        {selectedStation && (
          <div className="selected-station-details">
            <h2>{selectedStation.name}</h2>
            <p className="address">{selectedStation.address}</p>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Khoảng cách</span>
                <span className="detail-value">{selectedStation.distance} km</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Xe có sẵn</span>
                <span className="detail-value">{selectedStation.availableBikes} xe</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Đánh giá</span>
                <span className="detail-value">
                  <span className="star">★</span> {selectedStation.rating}
                </span>
              </div>
            </div>
            <div className="action-buttons">
              <button className="btn-primary">Đặt xe tại đây</button>
              <button className="btn-secondary">Xem chi tiết</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StationFinderPage;