import React, { useState } from 'react';
import StationFinder from '../components/StationFinder';
import StationMap from '../components/StationMap';
import stationsData from '../data/stations_new';
import '../styles/Pages.css';

export default function Stations() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  const handleStationSelect = (station) => {
    setSelectedStation(station);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🚗 Điểm Thuê Xe Điện</h1>
        <p>Tìm điểm thuê gần nhất để bắt đầu hành trình xanh của bạn</p>
        
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            🗺️ Xem bản đồ
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 Xem danh sách
          </button>
        </div>
      </div>
      
      {viewMode === 'map' ? (
        <StationMap 
          stations={stationsData}
          onStationSelect={handleStationSelect}
          selectedStation={selectedStation}
        />
      ) : (
        <StationFinder />
      )}

      {selectedStation && (
        <div className="selected-station-info">
          <h3>📍 Điểm thuê đã chọn: {selectedStation.name}</h3>
          <p>{selectedStation.address}</p>
          <div className="station-actions">
            <button 
              className="btn primary"
              onClick={() => window.location.href = `/stations/${selectedStation.id}`}
            >
              Xem chi tiết & đặt xe
            </button>
            <button 
              className="btn secondary"
              onClick={() => setSelectedStation(null)}
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}