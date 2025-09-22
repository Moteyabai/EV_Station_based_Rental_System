import React, { useState, useEffect } from 'react';
import '../styles/StationMap.css';

export default function StationMap({ stations, onStationSelect, selectedStation }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 10.762622, lng: 106.660172 }); // TP.HCM center
  const [loading, setLoading] = useState(false);

  // Simulated map component since we don't have real map integration
  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setMapCenter(userPos);
          setLoading(false);
        },
        (error) => {
          console.log('Không thể lấy vị trí hiện tại:', error);
          setLoading(false);
        }
      );
    }
  }, []);

  // Calculate distance between two points (simplified)
  const calculateDistance = (pos1, pos2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Sort stations by distance from user
  const sortedStations = userLocation 
    ? [...stations].sort((a, b) => {
        const distA = calculateDistance(userLocation, a.location);
        const distB = calculateDistance(userLocation, b.location);
        return distA - distB;
      })
    : stations;

  return (
    <div className="station-map-container">
      <div className="map-header">
        <h3>🗺️ Bản đồ điểm thuê xe điện</h3>
        {loading && <p>Đang xác định vị trí của bạn...</p>}
        {userLocation && (
          <p className="location-info">
            📍 Vị trí hiện tại: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        )}
      </div>
      
      {/* Simulated Map Display */}
      <div className="map-display">
        <div className="map-placeholder">
          <div className="map-legend">
            <div className="legend-item">
              <span className="marker user-marker">📍</span>
              <span>Vị trí của bạn</span>
            </div>
            <div className="legend-item">
              <span className="marker station-marker">🏢</span>
              <span>Điểm thuê xe</span>
            </div>
          </div>
          
          {/* User location marker */}
          {userLocation && (
            <div 
              className="user-marker-on-map"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              📍 Bạn ở đây
            </div>
          )}
          
          {/* Station markers */}
          {sortedStations.slice(0, 5).map((station, index) => (
            <div
              key={station.id}
              className={`station-marker-on-map ${selectedStation?.id === station.id ? 'selected' : ''}`}
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + Math.sin(index) * 20}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => onStationSelect(station)}
            >
              <div className="marker-content">
                <span className="marker-icon">🏢</span>
                <div className="marker-popup">
                  <strong>{station.name}</strong>
                  <p>{station.availableVehicles} xe có sẵn</p>
                  {userLocation && (
                    <p className="distance">
                      📏 {calculateDistance(userLocation, station.location).toFixed(1)} km
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Station List */}
      <div className="station-list-sidebar">
        <h4>Danh sách điểm thuê gần bạn</h4>
        <div className="stations-list">
          {sortedStations.map((station) => (
            <div
              key={station.id}
              className={`station-item ${selectedStation?.id === station.id ? 'selected' : ''}`}
              onClick={() => onStationSelect(station)}
            >
              <div className="station-info">
                <h5>{station.name}</h5>
                <p className="station-address">{station.address}</p>
                <div className="station-stats">
                  <span className="available-count">
                    🚗 {station.availableVehicles} xe có sẵn
                  </span>
                  {userLocation && (
                    <span className="distance-info">
                      📏 {calculateDistance(userLocation, station.location).toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>
              <div className="station-action">
                <button className="btn-select">Chọn điểm này</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}