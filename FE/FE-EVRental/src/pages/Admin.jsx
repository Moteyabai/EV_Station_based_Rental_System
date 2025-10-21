import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '',
    address: '',
    totalVehicles: 0,
    chargingStations: 0
  });

  // Check role access for Admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const userRoleId = user?.roleID || user?.RoleID;
    console.log('Admin page: User:', user, 'RoleID:', userRoleId);
    
    // Chỉ cho phép Admin (roleID = 3)
    if (userRoleId !== 3) {
      console.log('Admin page: Access denied, redirecting...');
      if (userRoleId === 2) {
        navigate('/staff');
      } else {
        navigate('/');
      }
      return;
    }

    // Thay thế history state để ngăn back về trang trước
    window.history.replaceState(null, '', '/admin');
  }, [user, navigate]);

  // Xử lý nút back của trình duyệt
  useEffect(() => {
    const handlePopState = (event) => {
      const userRoleId = user?.roleID || user?.RoleID;
      
      // Nếu là Admin, ngăn không cho back về trang user/staff
      if (userRoleId === 3) {
        console.log('Admin trying to go back - preventing navigation');
        event.preventDefault();
        
        // Giữ lại ở trang admin
        window.history.pushState(null, '', '/admin');
        
        // Hiển thị cảnh báo (tùy chọn)
        alert('⚠️ Bạn không thể quay lại trang trước. Vui lòng sử dụng menu điều hướng hoặc đăng xuất.');
      }
    };

    // Thêm state ban đầu để có thể catch popstate
    window.history.pushState(null, '', window.location.pathname);
    
    // Lắng nghe sự kiện popstate (nút back/forward)
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user]);
  
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

  const [stations, setStations] = useState([
    { 
      id: 's1', 
      name: 'Trạm EV Công Viên Tao Đàn', 
      address: '123 Trương Định, Phường Bến Thành, Quận 1, TP.HCM',
      availableVehicles: 15,
      totalVehicles: 20,
      chargingStations: 8,
      status: 'active'
    },
    { 
      id: 's2', 
      name: 'Trạm EV Bờ Sông Sài Gòn', 
      address: '456 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP.HCM',
      availableVehicles: 8,
      totalVehicles: 12,
      chargingStations: 4,
      status: 'active'
    },
    { 
      id: 's3', 
      name: 'Trạm EV Trung Tâm Quận 1', 
      address: '789 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
      availableVehicles: 12,
      totalVehicles: 15,
      chargingStations: 6,
      status: 'active'
    },
    { 
      id: 's4', 
      name: 'Trạm EV Khu Công Nghệ Cao', 
      address: '101 Đường D1, Khu Công Nghệ Cao, Quận 9, TP.HCM',
      availableVehicles: 10,
      totalVehicles: 12,
      chargingStations: 8,
      status: 'active'
    },
    { 
      id: 's5', 
      name: 'Trạm EV Sân Bay Tân Sơn Nhất', 
      address: '200 Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM',
      availableVehicles: 18,
      totalVehicles: 25,
      chargingStations: 10,
      status: 'maintenance'
    },
  ]);

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Logout function
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch customers from API
  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    }
  }, [activeTab]);

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    setCustomersError(null);
    
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại');
      }

      const response = await fetch('http://localhost:5168/api/Account/AccountList', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Lọc chỉ lấy accounts có roleID = 1 (khách hàng)
      const customerAccounts = data.filter(account => account.roleID === 1);
      
      console.log('✅ Loaded customers:', customerAccounts);
      setCustomers(customerAccounts);
      
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      setCustomersError(error.message);
      
      if (error.message.includes('đăng nhập')) {
        alert(error.message);
        handleLogout();
      }
    } finally {
      setCustomersLoading(false);
    }
  };

  // Get status badge and text
  const getStatusInfo = (status) => {
    switch(status) {
      case 0:
        return { text: 'Pending', class: 'status-pending', icon: '⏳' };
      case 1:
        return { text: 'Active', class: 'status-active', icon: '✅' };
      case 2:
        return { text: 'Suspended', class: 'status-suspended', icon: '🚫' };
      default:
        return { text: 'Unknown', class: 'status-unknown', icon: '❓' };
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    // Filter by search term
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      customer.fullName?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchTerm) ||
      customer.accountId?.toString().includes(searchTerm);
    
    // Filter by status
    const matchesStatus = 
      statusFilter === 'all' || 
      customer.status === parseInt(statusFilter);
    
    return matchesSearch && matchesStatus;
  });

  // Station management functions
  const handleAddStation = () => {
    if (!newStation.name || !newStation.address) {
      alert('Vui lòng điền đầy đủ thông tin trạm');
      return;
    }

    const station = {
      id: `s${stations.length + 1}`,
      name: newStation.name,
      address: newStation.address,
      availableVehicles: 0,
      totalVehicles: parseInt(newStation.totalVehicles) || 0,
      chargingStations: parseInt(newStation.chargingStations) || 0,
      status: 'active'
    };

    setStations([...stations, station]);
    setShowAddStationModal(false);
    setNewStation({ name: '', address: '', totalVehicles: 0, chargingStations: 0 });
    alert('✅ Đã thêm trạm mới thành công!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStation(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
        <h2>Quản lý trạm thuê xe</h2>
        <button className="btn-primary" onClick={() => setShowAddStationModal(true)}>
          + Thêm trạm mới
        </button>
      </div>

      <div className="filters">
        <select className="filter-select">
          <option>Tất cả trạng thái</option>
          <option>Hoạt động</option>
          <option>Không hoạt động</option>
        </select>
        <input type="text" className="search-input" placeholder="Tìm kiếm trạm..." />
      </div>

      {/* Stations Table */}
      <div className="stations-table-container">
        <table className="stations-table">
          <thead>
            <tr>
              <th>Trạm</th>
              <th>Địa chỉ</th>
              <th>Số lượng xe</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => {
              const usageRate = ((station.totalVehicles - station.availableVehicles) / station.totalVehicles * 100);
              return (
                <tr key={station.id}>
                  <td>
                    <div className="station-name-cell">
                      <div className="station-icon">�</div>
                      <span>{station.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="address-cell">
                      📍 {station.address}
                    </div>
                  </td>
                  <td>
                    <div className="vehicle-count-cell">
                      <span className="count-value">
                        {station.availableVehicles}/{station.totalVehicles}
                      </span>
                      <div className="mini-progress-bar">
                        <div 
                          className="mini-progress-fill"
                          style={{ 
                            width: `${usageRate}%`,
                            backgroundColor: station.availableVehicles < 5 ? '#f44336' : 
                                           station.availableVehicles < 10 ? '#ff9800' : '#4caf50'
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${station.status}`}>
                      {station.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-table-action btn-view" title="Chi tiết">📊</button>
                      <button className="btn-table-action btn-edit" title="Sửa">✏️</button>
                      <button className="btn-table-action btn-manage" title="Quản lý xe">🏍️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Station Modal */}
      {showAddStationModal && (
        <div className="modal-overlay" onClick={() => setShowAddStationModal(false)}>
          <div className="modal-content add-station-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Thêm trạm thuê xe mới</h2>
              <button className="btn-close" onClick={() => setShowAddStationModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tên trạm <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={newStation.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Trạm EV Quận 1"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ <span className="required">*</span></label>
                <textarea
                  name="address"
                  value={newStation.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ đầy đủ của trạm"
                  className="form-textarea"
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số lượng xe</label>
                  <input
                    type="number"
                    name="totalVehicles"
                    value={newStation.totalVehicles}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="form-input"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Số trạm sạc</label>
                  <input
                    type="number"
                    name="chargingStations"
                    value={newStation.chargingStations}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="form-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="info-note">
                <span className="note-icon">💡</span>
                <p>Thông tin về số lượng xe và trạm sạc có thể cập nhật sau khi tạo trạm.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddStationModal(false)}>
                Hủy
              </button>
              <button className="btn-confirm" onClick={handleAddStation}>
                Thêm trạm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCustomerManagement = () => (
    <div className="management-content">
      <div className="section-header">
        <h2>👥 Quản lý khách hàng</h2>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchCustomers} disabled={customersLoading}>
            {customersLoading ? '🔄 Đang tải...' : '🔄 Làm mới'}
          </button>
          <button className="btn-primary">📊 Xuất báo cáo</button>
        </div>
      </div>

      <div className="filters">
        <select 
          className="filter-select" 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="0">⏳ Pending</option>
          <option value="1">✅ Active</option>
          <option value="2">🚫 Suspended</option>
        </select>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Tìm kiếm theo tên, email, SĐT..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {customersError && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{customersError}</span>
          <button onClick={fetchCustomers}>Thử lại</button>
        </div>
      )}

      {customersLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách khách hàng...</p>
        </div>
      ) : (
        <>
          <div className="stats-summary">
            <div className="summary-item">
              <span className="summary-label">Tổng khách hàng:</span>
              <span className="summary-value">{customers.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">⏳ Pending:</span>
              <span className="summary-value pending">{customers.filter(c => c.status === 0).length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">✅ Active:</span>
              <span className="summary-value active">{customers.filter(c => c.status === 1).length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">🚫 Suspended:</span>
              <span className="summary-value suspended">{customers.filter(c => c.status === 2).length}</span>
            </div>
          </div>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Avatar</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Ngày tạo</th>
                  <th>Cập nhật lần cuối</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-state">
                      {searchTerm || statusFilter !== 'all' 
                        ? '🔍 Không tìm thấy khách hàng phù hợp' 
                        : '📭 Chưa có khách hàng nào'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const statusInfo = getStatusInfo(customer.status);
                    return (
                      <tr key={customer.accountId}>
                        <td>#{customer.accountId}</td>
                        <td>
                          <div className="avatar-cell">
                            {customer.avatar ? (
                              <img 
                                src={customer.avatar} 
                                alt={customer.fullName} 
                                className="customer-avatar"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/40?text=N/A';
                                }}
                              />
                            ) : (
                              <div className="avatar-placeholder">
                                {customer.fullName?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="customer-name">
                          <div className="name-cell">
                            <span className="name">{customer.fullName || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="customer-email">{customer.email}</td>
                        <td>{customer.phone || 'N/A'}</td>
                        <td className="date-cell">
                          {customer.createdAt 
                            ? new Date(customer.createdAt).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </td>
                        <td className="date-cell">
                          {customer.updatedAt 
                            ? new Date(customer.updatedAt).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </td>
                        <td>
                          <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.icon} {statusInfo.text}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-action btn-view" title="Xem chi tiết">
                              👁️
                            </button>
                            {customer.status === 1 && (
                              <button className="btn-action btn-suspend" title="Khóa tài khoản">
                                🚫
                              </button>
                            )}
                            {customer.status === 2 && (
                              <button className="btn-action btn-activate" title="Kích hoạt">
                                ✅
                              </button>
                            )}
                            {customer.status === 0 && (
                              <button className="btn-action btn-approve" title="Phê duyệt">
                                ✔️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
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
            Bảng phân tích
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            <span className="nav-icon">🏍️</span>
            Các trạm thuê xe
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
          <button className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <h1>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'vehicles' && 'Quản lý Trạm Thuê Xe'}
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
