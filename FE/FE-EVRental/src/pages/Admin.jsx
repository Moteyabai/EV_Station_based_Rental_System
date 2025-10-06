import React, { useState, useEffect } from 'react';
import '../styles/Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalVehicles: 125,
    activeRentals: 48,
    totalCustomers: 356,
    totalStaff: 24,
    revenue: 45680000,
    vehiclesInUse: 48,
    availableVehicles: 77
  });

  // Mock data - thay thế bằng API calls thực tế
  const [vehicles, setVehicles] = useState([
    { id: 1, name: 'VinFast Klara S', station: 'Quận 1', status: 'available', battery: 95, lastMaintenance: '2025-10-01' },
    { id: 2, name: 'DatBike Weaver 200', station: 'Quận 3', status: 'rented', battery: 78, lastMaintenance: '2025-09-28' },
    { id: 3, name: 'VinFast Feliz S', station: 'Quận 7', status: 'maintenance', battery: 45, lastMaintenance: '2025-10-05' },
  ]);

  const [customers, setCustomers] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', totalRentals: 12, riskLevel: 'low', status: 'active' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0907654321', totalRentals: 5, riskLevel: 'medium', status: 'active' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', phone: '0909876543', totalRentals: 18, riskLevel: 'high', status: 'warning' },
  ]);

  const [staff, setStaff] = useState([
    { id: 1, name: 'Phạm Văn D', station: 'Quận 1', role: 'Nhân viên giao xe', performance: 95, totalDeliveries: 156 },
    { id: 2, name: 'Hoàng Thị E', station: 'Quận 3', role: 'Nhân viên kỹ thuật', performance: 88, totalDeliveries: 98 },
    { id: 3, name: 'Võ Văn F', station: 'Quận 7', role: 'Quản lý điểm', performance: 92, totalDeliveries: 142 },
  ]);

  const [reports, setReports] = useState({
    revenueByStation: [
      { station: 'Quận 1', revenue: 18500000, rentals: 45 },
      { station: 'Quận 3', revenue: 15200000, rentals: 38 },
      { station: 'Quận 7', revenue: 11980000, rentals: 29 },
    ],
    peakHours: [
      { hour: '7-9h', usage: 85 },
      { hour: '12-14h', usage: 72 },
      { hour: '17-19h', usage: 93 },
    ]
  });

  const renderDashboard = () => (
    <div className="dashboard-content">
      <h2>Tổng quan hệ thống</h2>
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🏍️</div>
          <div className="stat-info">
            <h3>Tổng số xe</h3>
            <p className="stat-number">{stats.totalVehicles}</p>
            <span className="stat-detail">{stats.availableVehicles} xe khả dụng</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Đang cho thuê</h3>
            <p className="stat-number">{stats.activeRentals}</p>
            <span className="stat-detail">Hôm nay</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Khách hàng</h3>
            <p className="stat-number">{stats.totalCustomers}</p>
            <span className="stat-detail">Tổng số</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Doanh thu tháng</h3>
            <p className="stat-number">{(stats.revenue / 1000000).toFixed(1)}M</p>
            <span className="stat-detail">VNĐ</span>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Doanh thu theo điểm</h3>
          <div className="bar-chart">
            {reports.revenueByStation.map((item, index) => (
              <div key={index} className="bar-item">
                <div className="bar-label">{item.station}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(item.revenue / 20000000) * 100}%` }}
                  ></div>
                </div>
                <div className="bar-value">{(item.revenue / 1000000).toFixed(1)}M</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Giờ cao điểm</h3>
          <div className="peak-hours">
            {reports.peakHours.map((item, index) => (
              <div key={index} className="peak-item">
                <div className="peak-label">{item.hour}</div>
                <div className="peak-bar">
                  <div 
                    className="peak-fill" 
                    style={{ width: `${item.usage}%` }}
                  >
                    {item.usage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVehicleManagement = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>Quản lý đội xe & điểm thuê</h2>
        <button className="btn-primary">+ Thêm xe mới</button>
      </div>

      <div className="filters">
        <select className="filter-select">
          <option>Tất cả điểm</option>
          <option>Quận 1</option>
          <option>Quận 3</option>
          <option>Quận 7</option>
        </select>
        <select className="filter-select">
          <option>Tất cả trạng thái</option>
          <option>Khả dụng</option>
          <option>Đang cho thuê</option>
          <option>Bảo trì</option>
        </select>
        <input type="text" className="search-input" placeholder="Tìm kiếm xe..." />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên xe</th>
              <th>Điểm thuê</th>
              <th>Trạng thái</th>
              <th>Pin</th>
              <th>Bảo trì gần nhất</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>#{vehicle.id}</td>
                <td className="vehicle-name">{vehicle.name}</td>
                <td>{vehicle.station}</td>
                <td>
                  <span className={`status-badge ${vehicle.status}`}>
                    {vehicle.status === 'available' ? 'Khả dụng' : 
                     vehicle.status === 'rented' ? 'Đang thuê' : 'Bảo trì'}
                  </span>
                </td>
                <td>
                  <div className="battery-indicator">
                    <div 
                      className="battery-fill" 
                      style={{ 
                        width: `${vehicle.battery}%`,
                        backgroundColor: vehicle.battery > 60 ? '#4caf50' : 
                                       vehicle.battery > 30 ? '#ff9800' : '#f44336'
                      }}
                    ></div>
                    <span>{vehicle.battery}%</span>
                  </div>
                </td>
                <td>{vehicle.lastMaintenance}</td>
                <td>
                  <button className="btn-action">Chi tiết</button>
                  <button className="btn-action">Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomerManagement = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>Quản lý khách hàng</h2>
        <button className="btn-primary">Xuất báo cáo</button>
      </div>

      <div className="filters">
        <select className="filter-select">
          <option>Tất cả mức độ rủi ro</option>
          <option>Thấp</option>
          <option>Trung bình</option>
          <option>Cao</option>
        </select>
        <select className="filter-select">
          <option>Tất cả trạng thái</option>
          <option>Hoạt động</option>
          <option>Cảnh báo</option>
          <option>Khóa</option>
        </select>
        <input type="text" className="search-input" placeholder="Tìm kiếm khách hàng..." />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Số lần thuê</th>
              <th>Mức độ rủi ro</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>#{customer.id}</td>
                <td className="customer-name">{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.totalRentals}</td>
                <td>
                  <span className={`risk-badge ${customer.riskLevel}`}>
                    {customer.riskLevel === 'low' ? 'Thấp' : 
                     customer.riskLevel === 'medium' ? 'TB' : 'Cao'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${customer.status}`}>
                    {customer.status === 'active' ? 'Hoạt động' : 'Cảnh báo'}
                  </span>
                </td>
                <td>
                  <button className="btn-action">Xem</button>
                  <button className="btn-action">Lịch sử</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStaffManagement = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>Quản lý nhân viên</h2>
        <button className="btn-primary">+ Thêm nhân viên</button>
      </div>

      <div className="filters">
        <select className="filter-select">
          <option>Tất cả điểm</option>
          <option>Quận 1</option>
          <option>Quận 3</option>
          <option>Quận 7</option>
        </select>
        <select className="filter-select">
          <option>Tất cả vai trò</option>
          <option>Nhân viên giao xe</option>
          <option>Kỹ thuật viên</option>
          <option>Quản lý điểm</option>
        </select>
        <input type="text" className="search-input" placeholder="Tìm kiếm nhân viên..." />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Điểm làm việc</th>
              <th>Vai trò</th>
              <th>Hiệu suất</th>
              <th>Số lượt giao/nhận</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td>#{member.id}</td>
                <td className="staff-name">{member.name}</td>
                <td>{member.station}</td>
                <td>{member.role}</td>
                <td>
                  <div className="performance-bar">
                    <div 
                      className="performance-fill" 
                      style={{ 
                        width: `${member.performance}%`,
                        backgroundColor: member.performance > 90 ? '#4caf50' : 
                                       member.performance > 70 ? '#ff9800' : '#f44336'
                      }}
                    >
                      {member.performance}%
                    </div>
                  </div>
                </td>
                <td>{member.totalDeliveries}</td>
                <td>
                  <button className="btn-action">Chi tiết</button>
                  <button className="btn-action">Đánh giá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>Báo cáo & Phân tích</h2>
        <div className="report-actions">
          <select className="filter-select">
            <option>Tháng này</option>
            <option>Tháng trước</option>
            <option>Quý này</option>
            <option>Năm nay</option>
          </select>
          <button className="btn-primary">Xuất PDF</button>
        </div>
      </div>

      <div className="report-grid">
        <div className="report-card">
          <h3>Doanh thu theo điểm thuê</h3>
          <div className="report-content">
            {reports.revenueByStation.map((item, index) => (
              <div key={index} className="revenue-item">
                <div className="revenue-header">
                  <span className="revenue-station">{item.station}</span>
                  <span className="revenue-amount">{(item.revenue / 1000000).toFixed(1)}M VNĐ</span>
                </div>
                <div className="revenue-details">
                  <span>Số lượt thuê: {item.rentals}</span>
                  <span>Trung bình: {(item.revenue / item.rentals / 1000).toFixed(0)}K/lượt</span>
                </div>
                <div className="revenue-progress">
                  <div 
                    className="revenue-bar" 
                    style={{ width: `${(item.revenue / 20000000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <h3>Tỷ lệ sử dụng xe</h3>
          <div className="usage-stats">
            <div className="usage-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="10" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#4caf50" 
                  strokeWidth="10"
                  strokeDasharray={`${(stats.vehiclesInUse / stats.totalVehicles) * 283} 283`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="usage-text">
                <span className="usage-percent">
                  {((stats.vehiclesInUse / stats.totalVehicles) * 100).toFixed(0)}%
                </span>
                <span className="usage-label">Đang sử dụng</span>
              </div>
            </div>
            <div className="usage-details">
              <p>Xe đang cho thuê: <strong>{stats.vehiclesInUse}</strong></p>
              <p>Xe khả dụng: <strong>{stats.availableVehicles}</strong></p>
              <p>Tổng số xe: <strong>{stats.totalVehicles}</strong></p>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>Giờ cao điểm</h3>
          <div className="peak-analysis">
            {reports.peakHours.map((item, index) => (
              <div key={index} className="peak-detail">
                <div className="peak-time">{item.hour}</div>
                <div className="peak-meter">
                  <div 
                    className="peak-meter-fill" 
                    style={{ width: `${item.usage}%` }}
                  >
                    {item.usage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="peak-summary">
            <p>📊 Giờ cao điểm nhất: <strong>17-19h (93%)</strong></p>
            <p>📈 Khuyến nghị: Tăng cường xe tại các điểm chính vào khung giờ này</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>⚡ EV Rental Admin</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            <span className="nav-icon">🏍️</span>
            Quản lý xe
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <span className="nav-icon">👥</span>
            Khách hàng
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <span className="nav-icon">👔</span>
            Nhân viên
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span className="nav-icon">📈</span>
            Báo cáo
          </button>
        </nav>

        <div className="admin-footer">
          <button className="nav-item logout">
            <span className="nav-icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <h1>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'vehicles' && 'Quản lý Xe'}
            {activeTab === 'customers' && 'Quản lý Khách hàng'}
            {activeTab === 'staff' && 'Quản lý Nhân viên'}
            {activeTab === 'reports' && 'Báo cáo & Phân tích'}
          </h1>
          <div className="admin-user">
            <span>Admin User</span>
            <div className="avatar">A</div>
          </div>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'vehicles' && renderVehicleManagement()}
          {activeTab === 'customers' && renderCustomerManagement()}
          {activeTab === 'staff' && renderStaffManagement()}
          {activeTab === 'reports' && renderReports()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
