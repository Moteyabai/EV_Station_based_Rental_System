import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/UserHistory.css';

// Mock booking history data
const mockRentalHistory = [
  {
    id: 'BK100001',
    vehicleName: 'Tesla Model 3',
    vehicleType: 'Sedan',
    stationName: 'Central Park EV Station',
    pickupDate: '2025-08-15',
    pickupTime: '10:00',
    returnDate: '2025-08-17',
    returnTime: '18:00',
    status: 'completed',
    totalAmount: 225,
    distanceTraveled: 320,
    avgBatteryUsage: 28
  },
  {
    id: 'BK100002',
    vehicleName: 'Nissan Leaf',
    vehicleType: 'Hatchback',
    stationName: 'Downtown EV Center',
    pickupDate: '2025-09-05',
    pickupTime: '09:30',
    returnDate: '2025-09-06',
    returnTime: '17:00',
    status: 'completed',
    totalAmount: 125,
    distanceTraveled: 180,
    avgBatteryUsage: 32
  },
  {
    id: 'BK100003',
    vehicleName: 'Chevrolet Bolt',
    vehicleType: 'Hatchback',
    stationName: 'Riverside EV Hub',
    pickupDate: '2025-09-22',
    pickupTime: '14:00',
    returnDate: '2025-09-24',
    returnTime: '12:00',
    status: 'active',
    totalAmount: 150,
    distanceTraveled: null,
    avgBatteryUsage: null
  }
];

export default function UserHistory() {
  const { user } = useAuth();
  const [rentalHistory, setRentalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date-desc');
  
  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalRentals: 0,
    totalSpent: 0,
    totalDistance: 0,
    avgBatteryUsage: 0,
    favoriteVehicle: '',
    favoriteStation: ''
  });
  
  useEffect(() => {
    // In a real app, fetch user rental history from API
    setTimeout(() => {
      setRentalHistory(mockRentalHistory);
      
      // Calculate analytics
      const completed = mockRentalHistory.filter(rental => rental.status === 'completed');
      
      if (completed.length > 0) {
        const totalDistance = completed.reduce((sum, rental) => sum + rental.distanceTraveled, 0);
        const totalSpent = completed.reduce((sum, rental) => sum + rental.totalAmount, 0);
        const avgBatteryUsage = completed.reduce((sum, rental) => sum + rental.avgBatteryUsage, 0) / completed.length;
        
        // Find favorite vehicle and station
        const vehicleCounts = {};
        const stationCounts = {};
        
        completed.forEach(rental => {
          vehicleCounts[rental.vehicleName] = (vehicleCounts[rental.vehicleName] || 0) + 1;
          stationCounts[rental.stationName] = (stationCounts[rental.stationName] || 0) + 1;
        });
        
        const favoriteVehicle = Object.keys(vehicleCounts).reduce((a, b) => 
          vehicleCounts[a] > vehicleCounts[b] ? a : b, Object.keys(vehicleCounts)[0]);
          
        const favoriteStation = Object.keys(stationCounts).reduce((a, b) => 
          stationCounts[a] > stationCounts[b] ? a : b, Object.keys(stationCounts)[0]);
        
        setAnalytics({
          totalRentals: completed.length,
          totalSpent: totalSpent,
          totalDistance: totalDistance,
          avgBatteryUsage: avgBatteryUsage,
          favoriteVehicle: favoriteVehicle,
          favoriteStation: favoriteStation
        });
      }
      
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter rentals based on selected filter
  const filteredRentals = rentalHistory.filter(rental => {
    if (filter === 'all') return true;
    return rental.status === filter;
  });
  
  // Sort rentals based on selected sort
  const sortedRentals = [...filteredRentals].sort((a, b) => {
    if (sort === 'date-desc') {
      return new Date(b.pickupDate) - new Date(a.pickupDate);
    } else if (sort === 'date-asc') {
      return new Date(a.pickupDate) - new Date(b.pickupDate);
    } else if (sort === 'price-desc') {
      return b.totalAmount - a.totalAmount;
    } else if (sort === 'price-asc') {
      return a.totalAmount - b.totalAmount;
    }
    return 0;
  });
  
  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-container">
          Loading rental history...
        </div>
      </div>
    );
  }
  
  return (
    <div className="history-container">
      <h1>My Rental History</h1>
      
      {/* Analytics Dashboard */}
      <div className="analytics-dashboard">
        <h2>Your Rental Analytics</h2>
        
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-icon">🚗</div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.totalRentals}</div>
              <div className="analytics-label">Total Rentals</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">💰</div>
            <div className="analytics-content">
              <div className="analytics-value">${analytics.totalSpent}</div>
              <div className="analytics-label">Total Spent</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">🛣️</div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.totalDistance} km</div>
              <div className="analytics-label">Total Distance</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">🔋</div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.avgBatteryUsage.toFixed(1)}%</div>
              <div className="analytics-label">Avg. Battery Usage</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">❤️</div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.favoriteVehicle || 'N/A'}</div>
              <div className="analytics-label">Favorite Vehicle</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">📍</div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.favoriteStation || 'N/A'}</div>
              <div className="analytics-label">Favorite Station</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Sorting */}
      <div className="history-controls">
        <div className="filter-group">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Rentals</option>
            <option value="active">Active Rentals</option>
            <option value="completed">Completed Rentals</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Sort By:</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="price-desc">Price (Highest First)</option>
            <option value="price-asc">Price (Lowest First)</option>
          </select>
        </div>
      </div>
      
      {/* Rental History List */}
      <div className="rental-history-list">
        {sortedRentals.length === 0 ? (
          <div className="empty-history">
            <p>No rental history found with the selected filter.</p>
          </div>
        ) : (
          sortedRentals.map(rental => (
            <div key={rental.id} className={`rental-card ${rental.status}`}>
              <div className="rental-header">
                <div className="rental-id">Booking #{rental.id}</div>
                <div className={`rental-status ${rental.status}`}>
                  {rental.status === 'completed' ? 'Completed' : 'Active'}
                </div>
              </div>
              
              <div className="rental-body">
                <div className="rental-details">
                  <div className="rental-vehicle">
                    <h3>{rental.vehicleName}</h3>
                    <div className="vehicle-type">{rental.vehicleType}</div>
                  </div>
                  
                  <div className="rental-dates">
                    <div className="date-group">
                      <div className="date-label">Pickup</div>
                      <div className="date-value">
                        {new Date(rental.pickupDate).toLocaleDateString()} at {rental.pickupTime}
                      </div>
                    </div>
                    
                    <div className="date-connector"></div>
                    
                    <div className="date-group">
                      <div className="date-label">Return</div>
                      <div className="date-value">
                        {new Date(rental.returnDate).toLocaleDateString()} at {rental.returnTime}
                      </div>
                    </div>
                  </div>
                  
                  <div className="rental-station">
                    <div className="station-label">Location</div>
                    <div className="station-value">{rental.stationName}</div>
                  </div>
                </div>
                
                <div className="rental-metrics">
                  <div className="metric">
                    <div className="metric-label">Total</div>
                    <div className="metric-value">${rental.totalAmount}</div>
                  </div>
                  
                  {rental.status === 'completed' && (
                    <>
                      <div className="metric">
                        <div className="metric-label">Distance</div>
                        <div className="metric-value">{rental.distanceTraveled} km</div>
                      </div>
                      
                      <div className="metric">
                        <div className="metric-label">Battery Used</div>
                        <div className="metric-value">{rental.avgBatteryUsage}%</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="rental-actions">
                {rental.status === 'active' ? (
                  <>
                    <Link to={`/bookings/${rental.id}`} className="btn btn-secondary">View Details</Link>
                    <Link to={`/return/${rental.id}`} className="btn btn-primary">Return Vehicle</Link>
                  </>
                ) : (
                  <>
                    <Link to={`/bookings/${rental.id}`} className="btn btn-secondary">View Receipt</Link>
                    <Link to={`/book/${rental.vehicleType}`} className="btn btn-primary">Book Similar</Link>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Booking History Pagination */}
      <div className="pagination">
        <button className="pagination-button" disabled>{/* < */}Prev</button>
        <div className="pagination-info">Page 1 of 1</div>
        <button className="pagination-button" disabled>Next{/* > */}</button>
      </div>
      
      {/* Additional Action */}
      <div className="history-actions">
        <Link to="/book" className="btn btn-primary">Book New Rental</Link>
      </div>
    </div>
  );
}