import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import stationsData from '../data/stations_new';
import '../styles/StationFinder.css';

export default function StationFinder() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapObject, setMapObject] = useState(null);
  const [markers, setMarkers] = useState([]);
  
  // Initialize map when component mounts
  useEffect(() => {
    setStations(stationsData);
    setLoading(false);
    
    // In a real application, you would load a map library like Google Maps or Leaflet
    // For this demo, we'll simulate a map with a placeholder
    setTimeout(() => {
      initializeMap();
    }, 500);
  }, []);
  
  // Update map markers when stations change
  useEffect(() => {
    if (mapObject && stations.length > 0) {
      addMarkersToMap();
    }
  }, [mapObject, stations]);
  
  // Initialize map (simulation)
  const initializeMap = () => {
    // This would be replaced with actual map initialization code
    const mockMapObject = {
      setCenter: (lat, lng) => console.log(`Map centered at ${lat}, ${lng}`),
      setZoom: (zoom) => console.log(`Map zoom set to ${zoom}`),
    };
    
    setMapObject(mockMapObject);
    setMapInitialized(true);
  };
  
  // Add markers to map (simulation)
  const addMarkersToMap = () => {
    // Clear existing markers
    markers.forEach(marker => {
      // In a real app: marker.setMap(null);
    });
    
    // Create new markers
    const newMarkers = stations.map(station => {
      // In a real app: create actual map markers
      return {
        id: station.id,
        position: { lat: station.location.lat, lng: station.location.lng },
        onClick: () => handleStationSelect(station)
      };
    });
    
    setMarkers(newMarkers);
  };
  
  // Handle station selection
  const handleStationSelect = (station) => {
    setSelectedStation(station);
    
    // In a real app: center the map on the selected station
    if (mapObject) {
      // mapObject.setCenter(station.location.lat, station.location.lng);
      // mapObject.setZoom(15);
    }
  };
  
  // Filter stations based on search query
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="station-finder-container">
      <h2 className="section-title">Find Rental Stations</h2>
      
      <div className="station-search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by station name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="station-search-input"
          />
        </div>
      </div>
      
      <div className="station-finder-content">
        <div className="station-list">
          <h3>Available Stations ({filteredStations.length})</h3>
          
          {loading ? (
            <div className="loading-indicator">Loading stations...</div>
          ) : (
            <div className="station-items">
              {filteredStations.map(station => (
                <div 
                  key={station.id} 
                  className={`station-item ${selectedStation?.id === station.id ? 'selected' : ''}`}
                  onClick={() => handleStationSelect(station)}
                >
                  <div className="station-name">{station.name}</div>
                  <div className="station-address">{station.address}</div>
                  <div className="station-details">
                    <div className="station-availability">
                      <span className="label">Available EVs:</span> 
                      <span className="value">{station.availableVehicles}</span>
                    </div>
                    <div className="station-charging">
                      <span className="label">Charging Spots:</span> 
                      <span className="value">{station.chargingStations}</span>
                    </div>
                  </div>
                  <Link to={`/stations/${station.id}`} className="btn primary btn-sm">View Details</Link>
                </div>
              ))}
              
              {filteredStations.length === 0 && (
                <div className="no-stations">
                  No stations match your search criteria.
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="map-container">
          {!mapInitialized ? (
            <div className="map-loading">Loading map...</div>
          ) : (
            <div className="map-placeholder">
              <div className="map-overlay">
                <div className="map-message">
                  <p>Interactive Map</p>
                  <p className="map-note">(This is a placeholder for the actual map implementation)</p>
                </div>
                
                {/* Show selected station info if any */}
                {selectedStation && (
                  <div className="selected-station-info">
                    <h4>{selectedStation.name}</h4>
                    <p>{selectedStation.address}</p>
                    <Link to={`/stations/${selectedStation.id}`} className="btn primary">
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}