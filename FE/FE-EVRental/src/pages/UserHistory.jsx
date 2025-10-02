import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/UserHistory.css';

// Mock dữ liệu lịch sử thuê xe
const mockRentalHistory = [
  {
    id: 'BK100001',
    vehicleName: 'Tesla Model 3',
    vehicleType: 'Sedan',
    stationName: 'Trạm EV Công viên Trung tâm',
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
    stationName: 'Trung tâm EV Thành phố',
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
    stationName: 'Trung tâm EV Riverside',
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
    // Trong ứng dụng thực, lấy lịch sử thuê xe từ API
    setTimeout(() => {
      setRentalHistory(mockRentalHistory);
      
      // Tính toán phân tích
      const completed = mockRentalHistory.filter(rental => rental.status === 'completed');
      
      if (completed.length > 0) {
        const totalDistance = completed.reduce((sum, rental) => sum + rental.distanceTraveled, 0);
        const totalSpent = completed.reduce((sum, rental) => sum + rental.totalAmount, 0);
        const avgBatteryUsage = completed.reduce((sum, rental) => sum + rental.avgBatteryUsage, 0) / completed.length;
        
        // Tìm xe và trạm yêu thích
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
  
  // Lọc lịch sử thuê theo bộ lọc đã chọn
  const filteredRentals = rentalHistory.filter(rental => {
    if (filter === 'all') return true;
    return rental.status === filter;
  });
  
  // Sắp xếp lịch sử thuê theo tiêu chí đã chọn
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
          Đang tải lịch sử thuê xe...
        </div>
      </div>
    );
  }
  
  return (
    <div className="history-container">
      <h1>Lịch sử thuê xe của tôi</h1>
      
      {/* Bảng điều khiển phân tích */}
      <div className="analytics-dashboard">
        <h2>Phân tích thuê xe của bạn</h2>
        
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-icon">🏍️</div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.totalRentals}</div>
              <div className="analytics-label">Tổng lần thuê</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">💰</div>
            <div className="analytics-content">
              <div className="analytics-value">${analytics.totalSpent}</div>
              <div className="analytics-label">Tổng chi tiêu</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">🛣️</div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.totalDistance} km</div>
              <div className="analytics-label">Tổng quãng đường</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">🔋</div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.avgBatteryUsage.toFixed(1)}%</div>
              <div className="analytics-label">TB. sử dụng pin</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">❤️</div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.favoriteVehicle || 'Chưa có'}</div>
              <div className="analytics-label">Xe yêu thích</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">📍</div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.favoriteStation || 'Chưa có'}</div>
              <div className="analytics-label">Trạm yêu thích</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bộ lọc và Sắp xếp */}
      <div className="history-controls">
        <div className="filter-group">
          <label>Lọc:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tất cả lịch thuê</option>
            <option value="active">Đang thuê</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Sắp xếp theo:</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date-desc">Ngày (Mới nhất trước)</option>
            <option value="date-asc">Ngày (Cũ nhất trước)</option>
            <option value="price-desc">Giá (Cao nhất trước)</option>
            <option value="price-asc">Giá (Thấp nhất trước)</option>
          </select>
        </div>
      </div>
      
      {/* Danh sách lịch sử thuê */}
      <div className="rental-history-list">
        {sortedRentals.length === 0 ? (
          <div className="empty-history">
            <p>Không tìm thấy lịch sử thuê nào với bộ lọc đã chọn.</p>
          </div>
        ) : (
          sortedRentals.map(rental => (
            <div key={rental.id} className={`rental-card ${rental.status}`}>
              <div className="rental-header">
                <div className="rental-id">Đặt xe #{rental.id}</div>
                <div className={`rental-status ${rental.status}`}>
                  {rental.status === 'completed' ? 'Hoàn thành' : 'Đang thuê'}
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
                      <div className="date-label">Nhận xe</div>
                      <div className="date-value">
                        {new Date(rental.pickupDate).toLocaleDateString('vi-VN')} lúc {rental.pickupTime}
                      </div>
                    </div>
                    
                    <div className="date-connector"></div>
                    
                    <div className="date-group">
                      <div className="date-label">Trả xe</div>
                      <div className="date-value">
                        {new Date(rental.returnDate).toLocaleDateString('vi-VN')} lúc {rental.returnTime}
                      </div>
                    </div>
                  </div>
                  
                  <div className="rental-station">
                    <div className="station-label">Địa điểm</div>
                    <div className="station-value">{rental.stationName}</div>
                  </div>
                </div>
                
                <div className="rental-metrics">
                  <div className="metric">
                    <div className="metric-label">Tổng tiền</div>
                    <div className="metric-value">${rental.totalAmount}</div>
                  </div>
                  
                  {rental.status === 'completed' && (
                    <>
                      <div className="metric">
                        <div className="metric-label">Quãng đường</div>
                        <div className="metric-value">{rental.distanceTraveled} km</div>
                      </div>
                      
                      <div className="metric">
                        <div className="metric-label">Pin đã dùng</div>
                        <div className="metric-value">{rental.avgBatteryUsage}%</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="rental-actions">
                {rental.status === 'active' ? (
                  <>
                    <Link to={`/bookings/${rental.id}`} className="btn btn-secondary">Xem chi tiết</Link>
                    <Link to={`/return/${rental.id}`} className="btn btn-primary">Trả xe</Link>
                  </>
                ) : (
                  <>
                    <Link to={`/bookings/${rental.id}`} className="btn btn-secondary">Xem hóa đơn</Link>
                    <Link to={`/book/${rental.vehicleType}`} className="btn btn-primary">Thuê tương tự</Link>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Phân trang lịch sử đặt xe */}
      <div className="pagination">
        <button className="pagination-button" disabled>{/* < */}Trước</button>
        <div className="pagination-info">Trang 1 / 1</div>
        <button className="pagination-button" disabled>Sau{/* > */}</button>
      </div>
      
      {/* Hành động bổ sung */}
      <div className="history-actions">
        <Link to="/vehicles" className="btn btn-primary">Thuê xe mới</Link>
      </div>
    </div>
  );
}