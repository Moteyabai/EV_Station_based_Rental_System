import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as adminService from '../services/adminService';
import '../styles/Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [showEditStationModal, setShowEditStationModal] = useState(false);
  const [showStationDetailModal, setShowStationDetailModal] = useState(false);
  const [showStationVehiclesModal, setShowStationVehiclesModal] = useState(false);
  const [showStationStaffModal, setShowStationStaffModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  
  // Vehicle management modals
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Search and filter states for stations
  const [stationSearchTerm, setStationSearchTerm] = useState('');
  const [stationStatusFilter, setStationStatusFilter] = useState('all');
  
  // Search and filter states for staff
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [staffStationFilter, setStaffStationFilter] = useState('all');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');
  
  const [newStation, setNewStation] = useState({
    name: '',
    address: '',
    totalVehicles: 0,
    chargingStations: 0
  });

  const [newVehicle, setNewVehicle] = useState({
    name: '',
    brandId: '',
    modelYear: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    batteryCapacity: 0,
    maxSpeed: 0,
    stationId: '',
    status: 'available'
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
  
  // Loading and error states
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState(null);
  
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
    { id: 1, name: 'Phạm Văn D', stationId: 's1', station: 'Trạm EV Công Viên Tao Đàn', role: 'Nhân viên giao xe', performance: 95, totalDeliveries: 156 },
    { id: 2, name: 'Hoàng Thị E', stationId: 's1', station: 'Trạm EV Công Viên Tao Đàn', role: 'Nhân viên kỹ thuật', performance: 88, totalDeliveries: 98 },
    { id: 3, name: 'Võ Văn F', stationId: 's2', station: 'Trạm EV Bờ Sông Sài Gòn', role: 'Quản lý điểm', performance: 92, totalDeliveries: 142 },
    { id: 4, name: 'Trần Văn G', stationId: 's3', station: 'Trạm EV Trung Tâm Quận 1', role: 'Nhân viên giao xe', performance: 87, totalDeliveries: 120 },
    { id: 5, name: 'Nguyễn Thị H', stationId: 's4', station: 'Trạm EV Khu Công Nghệ Cao', role: 'Nhân viên kỹ thuật', performance: 91, totalDeliveries: 134 },
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

  // Fetch stations from API
  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setStationsLoading(true);
    setStationsError(null);
    
    try {
      const data = await adminService.getAllStations();
      console.log('Stations loaded from API:', data);
      
      // Transform API data to match component structure
      const transformedStations = data.map(station => ({
        id: station.stationID,
        name: station.name,
        address: station.address,
        availableVehicles: station.bikeCapacity || 0, // This should come from bike count API
        totalVehicles: station.bikeCapacity || 0,
        chargingStations: 0, // Not in API, keep as 0 or add to API
        status: station.isActive ? 'active' : 'maintenance'
      }));
      
      setStations(transformedStations);
    } catch (error) {
      console.error('Error loading stations:', error);
      setStationsError('Không thể tải danh sách trạm. Vui lòng thử lại.');
    } finally {
      setStationsLoading(false);
    }
  };

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

  const handleViewStationDetail = (station) => {
    console.log('View station detail:', station);
    setSelectedStation(station);
    setShowStationDetailModal(true);
  };

  const handleEditStation = (station) => {
    console.log('Edit station:', station);
    setSelectedStation(station);
    setNewStation({
      name: station.name,
      address: station.address,
      totalVehicles: station.totalVehicles,
      chargingStations: station.chargingStations
    });
    setShowEditStationModal(true);
  };

  const handleUpdateStation = () => {
    if (!newStation.name || !newStation.address) {
      alert('Vui lòng điền đầy đủ thông tin trạm');
      return;
    }

    setStations(stations.map(s => 
      s.id === selectedStation.id 
        ? { 
            ...s, 
            name: newStation.name,
            address: newStation.address,
            totalVehicles: parseInt(newStation.totalVehicles),
            chargingStations: parseInt(newStation.chargingStations)
          }
        : s
    ));
    
    setShowEditStationModal(false);
    setSelectedStation(null);
    setNewStation({ name: '', address: '', totalVehicles: 0, chargingStations: 0 });
    alert('✅ Đã cập nhật thông tin trạm!');
  };

  const handleManageStationVehicles = (station) => {
    console.log('Manage station vehicles:', station);
    setSelectedStation(station);
    setShowStationVehiclesModal(true);
  };

  const handleManageStationStaff = (station) => {
    console.log('Manage station staff:', station);
    setSelectedStation(station);
    setShowStationStaffModal(true);
  };

  const handleDeleteStation = (stationId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa trạm này?')) {
      setStations(stations.filter(s => s.id !== stationId));
      alert('✅ Đã xóa trạm!');
    }
  };

  // Vehicle handlers
  const handleAddVehicle = () => {
    setNewVehicle({
      name: '',
      brandId: '',
      modelYear: new Date().getFullYear(),
      color: '',
      licensePlate: '',
      batteryCapacity: 0,
      maxSpeed: 0,
      stationId: '',
      status: 'available'
    });
    setShowAddVehicleModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setNewVehicle(vehicle);
    setShowEditVehicleModal(true);
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      alert('✅ Đã xóa xe!');
    }
  };

  const handleSaveVehicle = () => {
    if (!newVehicle.name || !newVehicle.licensePlate || !newVehicle.stationId) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (selectedVehicle) {
      // Update existing vehicle
      setVehicles(vehicles.map(v => 
        v.id === selectedVehicle.id ? { ...newVehicle, id: v.id } : v
      ));
      alert('✅ Đã cập nhật xe!');
      setShowEditVehicleModal(false);
    } else {
      // Add new vehicle
      const newId = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
      setVehicles([...vehicles, { ...newVehicle, id: newId }]);
      alert('✅ Đã thêm xe mới!');
      setShowAddVehicleModal(false);
    }
    
    setSelectedVehicle(null);
  };

  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({
      ...prev,
      [name]: value
    }));
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
            <h3>Doanh thu tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</h3>
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

  const renderVehicleManagement = () => {
    // Filter stations based on search and status
    const filteredStations = stations.filter((station) => {
      if (stationStatusFilter !== 'all' && station.status !== stationStatusFilter) {
        return false;
      }
      if (stationSearchTerm) {
        const searchLower = stationSearchTerm.toLowerCase();
        const matchesSearch = (
          station.name.toLowerCase().includes(searchLower) ||
          station.address.toLowerCase().includes(searchLower)
        );
        console.log('Search:', searchLower, 'Station:', station.name, 'Matches:', matchesSearch);
        return matchesSearch;
      }
      return true;
    });

    console.log('Filter - Search term:', stationSearchTerm, 'Status:', stationStatusFilter);
    console.log('Total stations:', stations.length, 'Filtered:', filteredStations.length);

    return (
    <div className="management-content">
      <div className="section-header">
        <h2>Quản lý trạm thuê xe <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 'normal' }}>({filteredStations.length} trạm)</span></h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-primary" 
            onClick={() => {
              console.log('TEST: Opening detail modal for first station');
              if (stations.length > 0) {
                handleViewStationDetail(stations[0]);
              }
            }}
            style={{ background: '#10b981' }}
          >
            🧪 Test Chi tiết
          </button>
          <button className="btn-primary" onClick={() => setShowAddStationModal(true)}>
            + Thêm trạm mới
          </button>
        </div>
      </div>

      <div className="filters">
        <select 
          className="filter-select"
          value={stationStatusFilter}
          onChange={(e) => {
            console.log('Status filter changed to:', e.target.value);
            setStationStatusFilter(e.target.value);
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="maintenance">Bảo trì</option>
        </select>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Tìm kiếm trạm..." 
          value={stationSearchTerm}
          onChange={(e) => {
            console.log('Search term changed to:', e.target.value);
            setStationSearchTerm(e.target.value);
          }}
        />
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
            {filteredStations.map((station) => {
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
                      <button 
                        className="btn-table-action btn-view" 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Chi tiết button clicked for station:', station);
                          handleViewStationDetail(station);
                        }}
                        title="Chi tiết"
                      >
                        📊
                      </button>
                      <button 
                        className="btn-table-action btn-edit" 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Sửa button clicked for station:', station);
                          handleEditStation(station);
                        }}
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-table-action btn-manage" 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Quản lý nhân viên button clicked for station:', station);
                          handleManageStationStaff(station);
                        }}
                        title="Quản lý nhân viên"
                      >
                        👥
                      </button>
                      <button 
                        className="btn-table-action btn-manage" 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Quản lý xe button clicked for station:', station);
                          handleViewStationVehicles(station);
                        }}
                        title="Quản lý xe"
                      >
                        🚗
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredStations.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                    Không tìm thấy trạm nào
                  </div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </div>
                </td>
              </tr>
            )}
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

      {/* Edit Station Modal */}
      {showEditStationModal && (
        <div className="modal-overlay" onClick={() => setShowEditStationModal(false)}>
          <div className="modal-content add-station-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Sửa thông tin trạm</h2>
              <button className="btn-close" onClick={() => setShowEditStationModal(false)}>✕</button>
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
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditStationModal(false)}>
                Hủy
              </button>
              <button className="btn-confirm" onClick={handleUpdateStation}>
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Station Detail Modal */}
      {console.log('showStationDetailModal:', showStationDetailModal, 'selectedStation:', selectedStation)}
      {showStationDetailModal && selectedStation && (
        <div className="modal-overlay" onClick={() => setShowStationDetailModal(false)}>
          <div className="modal-content station-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Chi tiết trạm</h2>
              <button className="btn-close" onClick={() => setShowStationDetailModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="station-detail-info">
                <h3>⚡ {selectedStation.name}</h3>
                <div className="detail-row">
                  <span className="detail-label">📍 Địa chỉ:</span>
                  <span className="detail-value">{selectedStation.address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🏍️ Tổng số xe:</span>
                  <span className="detail-value">{selectedStation.totalVehicles} xe</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">✅ Xe khả dụng:</span>
                  <span className="detail-value">{selectedStation.availableVehicles} xe</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🚴 Xe đang cho thuê:</span>
                  <span className="detail-value">{selectedStation.totalVehicles - selectedStation.availableVehicles} xe</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🔌 Trạm sạc:</span>
                  <span className="detail-value">{selectedStation.chargingStations} trạm</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📊 Trạng thái:</span>
                  <span className={`status-badge ${selectedStation.status}`}>
                    {selectedStation.status === 'active' ? '✅ Hoạt động' : '🚫 Không hoạt động'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📈 Tỷ lệ sử dụng:</span>
                  <span className="detail-value">
                    {((selectedStation.totalVehicles - selectedStation.availableVehicles) / selectedStation.totalVehicles * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowStationDetailModal(false)}>
                Đóng
              </button>
              <button className="btn-primary" onClick={() => {
                setShowStationDetailModal(false);
                handleEditStation(selectedStation);
              }}>
                ✏️ Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Station Vehicles Management Modal */}
      {showStationVehiclesModal && selectedStation && (
        <div className="modal-overlay" onClick={() => setShowStationVehiclesModal(false)}>
          <div className="modal-content station-vehicles-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
            <div className="modal-header">
              <h2>🏍️ Quản lý xe tại {selectedStation.name}</h2>
              <button className="btn-close" onClick={() => setShowStationVehiclesModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="vehicles-info">
                <div className="info-summary">
                  <div className="summary-item">
                    <span className="summary-icon">🏍️</span>
                    <div>
                      <p className="summary-label">Tổng số xe</p>
                      <p className="summary-number">{vehicles.filter(v => v.stationId === selectedStation.id).length}</p>
                    </div>
                  </div>
                  <div className="summary-item">
                    <span className="summary-icon">✅</span>
                    <div>
                      <p className="summary-label">Khả dụng</p>
                      <p className="summary-number">{vehicles.filter(v => v.stationId === selectedStation.id && v.status === 'available').length}</p>
                    </div>
                  </div>
                  <div className="summary-item">
                    <span className="summary-icon">🚴</span>
                    <div>
                      <p className="summary-label">Đang thuê</p>
                      <p className="summary-number">{vehicles.filter(v => v.stationId === selectedStation.id && v.status === 'rented').length}</p>
                    </div>
                  </div>
                </div>

                <div className="vehicles-actions" style={{ marginTop: '1.5rem' }}>
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      setNewVehicle({
                        name: '',
                        brandId: '',
                        modelYear: new Date().getFullYear(),
                        color: '',
                        licensePlate: '',
                        batteryCapacity: 0,
                        maxSpeed: 0,
                        stationId: selectedStation.id,
                        status: 'available'
                      });
                      setShowAddVehicleModal(true);
                    }}
                  >
                    ➕ Thêm xe mới
                  </button>
                </div>

                {/* Vehicles Table */}
                <div className="data-table" style={{ marginTop: '1.5rem', maxHeight: '400px', overflow: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Tên xe</th>
                        <th>Biển số</th>
                        <th>Màu sắc</th>
                        <th>Pin (Ah)</th>
                        <th>Tốc độ (km/h)</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.filter(v => v.stationId === selectedStation.id).map(vehicle => (
                        <tr key={vehicle.id}>
                          <td>{vehicle.name}</td>
                          <td><strong>{vehicle.licensePlate}</strong></td>
                          <td>{vehicle.color}</td>
                          <td>{vehicle.batteryCapacity} Ah</td>
                          <td>{vehicle.maxSpeed} km/h</td>
                          <td>
                            <span className={`status-badge ${vehicle.status}`}>
                              {vehicle.status === 'available' ? '✅ Khả dụng' : 
                               vehicle.status === 'rented' ? '🚴 Đang thuê' : 
                               vehicle.status === 'maintenance' ? '🔧 Bảo trì' : '❌ Hỏng'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button 
                                className="btn-table-action btn-edit" 
                                onClick={() => handleEditVehicle(vehicle)}
                                title="Sửa"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-table-action btn-delete" 
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                title="Xóa"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {vehicles.filter(v => v.stationId === selectedStation.id).length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            <div style={{ fontSize: '2rem' }}>🏍️</div>
                            <p>Chưa có xe nào tại trạm này</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Nhấn "Thêm xe mới" để bắt đầu</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowStationVehiclesModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Station Staff Management Modal */}
      {showStationStaffModal && selectedStation && (
        <div className="modal-overlay" onClick={() => setShowStationStaffModal(false)}>
          <div className="modal-content station-staff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👥 Quản lý nhân viên tại {selectedStation.name}</h2>
              <button className="btn-close" onClick={() => setShowStationStaffModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="staff-info">
                {(() => {
                  const stationStaff = staff.filter(s => s.stationId === selectedStation.id);
                  const avgPerformance = stationStaff.length > 0 
                    ? (stationStaff.reduce((sum, s) => sum + s.performance, 0) / stationStaff.length).toFixed(0)
                    : 0;
                  
                  return (
                    <>
                      <div className="info-summary">
                        <div className="summary-item">
                          <span className="summary-icon">👥</span>
                          <div>
                            <p className="summary-label">Tổng nhân viên</p>
                            <p className="summary-number">{stationStaff.length}</p>
                          </div>
                        </div>
                        <div className="summary-item">
                          <span className="summary-icon">📊</span>
                          <div>
                            <p className="summary-label">Hiệu suất TB</p>
                            <p className="summary-number">{avgPerformance}%</p>
                          </div>
                        </div>
                        <div className="summary-item">
                          <span className="summary-icon">🚚</span>
                          <div>
                            <p className="summary-label">Tổng giao/nhận</p>
                            <p className="summary-number">{stationStaff.reduce((sum, s) => sum + s.totalDeliveries, 0)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="staff-list-section">
                        <h3>Danh sách nhân viên</h3>
                        {stationStaff.length === 0 ? (
                          <div className="empty-state">
                            <p>⚠️ Chưa có nhân viên nào tại trạm này</p>
                          </div>
                        ) : (
                          <div className="staff-table-wrapper">
                            <table className="staff-table">
                              <thead>
                                <tr>
                                  <th>Họ tên</th>
                                  <th>Vai trò</th>
                                  <th>Hiệu suất</th>
                                  <th>Số lượt</th>
                                  <th>Thao tác</th>
                                </tr>
                              </thead>
                              <tbody>
                                {stationStaff.map((member) => (
                                  <tr key={member.id}>
                                    <td className="staff-name">{member.name}</td>
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
                                      <div className="table-actions">
                                        <button className="btn-action btn-detail" title="Chi tiết">👁️</button>
                                        <button className="btn-action btn-edit" title="Chỉnh sửa">✏️</button>
                                        <button 
                                          className="btn-action btn-delete" 
                                          title="Xóa"
                                          onClick={() => {
                                            if (window.confirm(`Bạn có chắc muốn xóa nhân viên ${member.name}?`)) {
                                              setStaff(staff.filter(s => s.id !== member.id));
                                              alert('✅ Đã xóa nhân viên!');
                                            }
                                          }}
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="staff-actions">
                        <button 
                          className="btn-primary btn-full-width" 
                          onClick={() => {
                            setShowStationStaffModal(false);
                            setActiveTab('staff');
                          }}
                        >
                          👥 Đi đến Quản lý toàn bộ nhân viên
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowStationStaffModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="modal-overlay" onClick={() => setShowAddVehicleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Thêm xe mới</h2>
              <button className="btn-close" onClick={() => setShowAddVehicleModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Tên xe *</label>
                <input
                  type="text"
                  name="name"
                  value={newVehicle.name}
                  onChange={handleVehicleInputChange}
                  placeholder="VD: Honda Vision 2024"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hãng xe *</label>
                  <select
                    name="brandId"
                    value={newVehicle.brandId}
                    onChange={handleVehicleInputChange}
                    required
                  >
                    <option value="">-- Chọn hãng --</option>
                    <option value="1">Honda</option>
                    <option value="2">Yamaha</option>
                    <option value="3">Vinfast</option>
                    <option value="4">Pega</option>
                    <option value="5">Yadea</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Năm sản xuất</label>
                  <input
                    type="number"
                    name="modelYear"
                    value={newVehicle.modelYear}
                    onChange={handleVehicleInputChange}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Màu sắc</label>
                  <input
                    type="text"
                    name="color"
                    value={newVehicle.color}
                    onChange={handleVehicleInputChange}
                    placeholder="VD: Đỏ, Xanh, Trắng"
                  />
                </div>

                <div className="form-group">
                  <label>Biển số xe *</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={newVehicle.licensePlate}
                    onChange={handleVehicleInputChange}
                    placeholder="VD: 29A-12345"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dung lượng pin (Ah)</label>
                  <input
                    type="number"
                    name="batteryCapacity"
                    value={newVehicle.batteryCapacity}
                    onChange={handleVehicleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="VD: 12.5"
                  />
                </div>

                <div className="form-group">
                  <label>Tốc độ tối đa (km/h)</label>
                  <input
                    type="number"
                    name="maxSpeed"
                    value={newVehicle.maxSpeed}
                    onChange={handleVehicleInputChange}
                    min="0"
                    placeholder="VD: 45"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Trạm *</label>
                  <select
                    name="stationId"
                    value={newVehicle.stationId}
                    onChange={handleVehicleInputChange}
                    required
                  >
                    <option value="">-- Chọn trạm --</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.name} - {station.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    name="status"
                    value={newVehicle.status}
                    onChange={handleVehicleInputChange}
                  >
                    <option value="available">✅ Khả dụng</option>
                    <option value="rented">🚴 Đang thuê</option>
                    <option value="maintenance">🔧 Bảo trì</option>
                    <option value="broken">❌ Hỏng</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddVehicleModal(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSaveVehicle}>
                ➕ Thêm xe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditVehicleModal && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowEditVehicleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Chỉnh sửa thông tin xe</h2>
              <button className="btn-close" onClick={() => setShowEditVehicleModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Tên xe *</label>
                <input
                  type="text"
                  name="name"
                  value={newVehicle.name}
                  onChange={handleVehicleInputChange}
                  placeholder="VD: Honda Vision 2024"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hãng xe *</label>
                  <select
                    name="brandId"
                    value={newVehicle.brandId}
                    onChange={handleVehicleInputChange}
                    required
                  >
                    <option value="">-- Chọn hãng --</option>
                    <option value="1">Honda</option>
                    <option value="2">Yamaha</option>
                    <option value="3">Vinfast</option>
                    <option value="4">Pega</option>
                    <option value="5">Yadea</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Năm sản xuất</label>
                  <input
                    type="number"
                    name="modelYear"
                    value={newVehicle.modelYear}
                    onChange={handleVehicleInputChange}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Màu sắc</label>
                  <input
                    type="text"
                    name="color"
                    value={newVehicle.color}
                    onChange={handleVehicleInputChange}
                    placeholder="VD: Đỏ, Xanh, Trắng"
                  />
                </div>

                <div className="form-group">
                  <label>Biển số xe *</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={newVehicle.licensePlate}
                    onChange={handleVehicleInputChange}
                    placeholder="VD: 29A-12345"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dung lượng pin (Ah)</label>
                  <input
                    type="number"
                    name="batteryCapacity"
                    value={newVehicle.batteryCapacity}
                    onChange={handleVehicleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="VD: 12.5"
                  />
                </div>

                <div className="form-group">
                  <label>Tốc độ tối đa (km/h)</label>
                  <input
                    type="number"
                    name="maxSpeed"
                    value={newVehicle.maxSpeed}
                    onChange={handleVehicleInputChange}
                    min="0"
                    placeholder="VD: 45"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Trạm *</label>
                  <select
                    name="stationId"
                    value={newVehicle.stationId}
                    onChange={handleVehicleInputChange}
                    required
                  >
                    <option value="">-- Chọn trạm --</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.name} - {station.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    name="status"
                    value={newVehicle.status}
                    onChange={handleVehicleInputChange}
                  >
                    <option value="available">✅ Khả dụng</option>
                    <option value="rented">🚴 Đang thuê</option>
                    <option value="maintenance">🔧 Bảo trì</option>
                    <option value="broken">❌ Hỏng</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditVehicleModal(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSaveVehicle}>
                💾 Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  };

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
                  <th>Lịch sử thuê</th>
                  <th>Mức độ rủi ro</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty-state">
                      {searchTerm || statusFilter !== 'all' 
                        ? '🔍 Không tìm thấy khách hàng phù hợp' 
                        : '📭 Chưa có khách hàng nào'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const statusInfo = getStatusInfo(customer.status);
                    // Calculate rental history and risk level (mock data for now)
                    const rentalCount = Math.floor(Math.random() * 20);
                    const violationCount = Math.floor(Math.random() * 5);
                    const damageCount = Math.floor(Math.random() * 3);
                    const riskLevel = violationCount + damageCount > 3 ? 'high' : 
                                     violationCount + damageCount > 1 ? 'medium' : 'low';
                    const riskInfo = {
                      high: { label: 'Cao', icon: '🔴', color: '#ef4444' },
                      medium: { label: 'Trung bình', icon: '🟡', color: '#f59e0b' },
                      low: { label: 'Thấp', icon: '🟢', color: '#10b981' }
                    };
                    
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
                        <td>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                              {rentalCount}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {violationCount > 0 && `⚠️ ${violationCount} vi phạm`}
                              {damageCount > 0 && ` 🔧 ${damageCount} hư hỏng`}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="risk-badge"
                            style={{ 
                              background: riskInfo[riskLevel].color + '20',
                              color: riskInfo[riskLevel].color,
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            {riskInfo[riskLevel].icon} {riskInfo[riskLevel].label}
                          </span>
                        </td>
                        <td className="date-cell">
                          {customer.createdAt 
                            ? new Date(customer.createdAt).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </td>
                        <td>
                          <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.icon} {statusInfo.text}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-action btn-view" title="Xem lịch sử thuê">
                              📋
                            </button>
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

  const renderStaffManagement = () => {
    // Filter staff based on search and filters
    const filteredStaff = staff.filter((member) => {
      // Filter by station
      if (staffStationFilter !== 'all' && member.stationId !== staffStationFilter) {
        return false;
      }
      
      // Filter by role
      if (staffRoleFilter !== 'all' && member.role !== staffRoleFilter) {
        return false;
      }
      
      // Filter by search term
      if (staffSearchTerm) {
        const searchLower = staffSearchTerm.toLowerCase();
        return (
          member.name.toLowerCase().includes(searchLower) ||
          member.station.toLowerCase().includes(searchLower) ||
          member.role.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Get unique stations and roles for dropdowns
    const uniqueStations = [...new Set(staff.map(s => ({ id: s.stationId, name: s.station })))];
    const uniqueRoles = [...new Set(staff.map(s => s.role))];

    return (
    <div className="management-content">
      <div className="section-header">
        <h2>Quản lý nhân viên <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 'normal' }}>({filteredStaff.length} nhân viên)</span></h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-primary" 
            onClick={() => {
              console.log('Test - Current filters:', { staffSearchTerm, staffStationFilter, staffRoleFilter });
              alert('Search: ' + staffSearchTerm);
            }}
            style={{ background: '#10b981' }}
          >
            🧪 Test Filters
          </button>
          <button className="btn-primary">+ Thêm nhân viên</button>
        </div>
      </div>

      <div className="filters">
        <select 
          className="filter-select"
          value={staffStationFilter}
          onChange={(e) => {
            console.log('Staff station filter changed to:', e.target.value);
            setStaffStationFilter(e.target.value);
          }}
        >
          <option value="all">Tất cả điểm</option>
          {stations.map((station) => (
            <option key={station.id} value={station.id}>{station.name}</option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={staffRoleFilter}
          onChange={(e) => {
            console.log('Staff role filter changed to:', e.target.value);
            setStaffRoleFilter(e.target.value);
          }}
        >
          <option value="all">Tất cả vai trò</option>
          {uniqueRoles.map((role, index) => (
            <option key={index} value={role}>{role}</option>
          ))}
        </select>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Tìm kiếm nhân viên..." 
          value={staffSearchTerm}
          onChange={(e) => {
            console.log('Staff search term changed to:', e.target.value);
            setStaffSearchTerm(e.target.value);
          }}
        />
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
            {filteredStaff.map((member) => (
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
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                    Không tìm thấy nhân viên nào
                  </div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    );
  };

  const renderDeliveryHistory = () => {
    // Mock delivery history data
    const deliveryHistory = [
      { id: 1, type: 'pickup', customer: 'Nguyễn Văn A', bike: 'VinFast Klara S', station: 'Trạm EV Công Viên Tao Đàn', staff: 'Phạm Văn D', time: '2025-10-28 08:30', status: 'completed' },
      { id: 2, type: 'return', customer: 'Trần Thị B', bike: 'DatBike Weaver 200', station: 'Trạm EV Bờ Sông Sài Gòn', staff: 'Hoàng Thị E', time: '2025-10-28 09:15', status: 'completed' },
      { id: 3, type: 'pickup', customer: 'Lê Văn C', bike: 'VinFast Feliz S', station: 'Trạm EV Trung Tâm Quận 1', staff: 'Võ Văn F', time: '2025-10-28 10:00', status: 'in_progress' },
      { id: 4, type: 'return', customer: 'Phạm Thị D', bike: 'VinFast Klara S', station: 'Trạm EV Khu Công Nghệ Cao', staff: 'Trần Văn G', time: '2025-10-28 10:30', status: 'pending' },
      { id: 5, type: 'pickup', customer: 'Hoàng Văn E', bike: 'DatBike Weaver 200', station: 'Trạm EV Sân Bay Tân Sơn Nhất', staff: 'Nguyễn Thị H', time: '2025-10-28 11:00', status: 'completed' },
    ];

    const typeInfo = {
      pickup: { label: 'Giao xe', icon: '🚀', color: '#3b82f6' },
      return: { label: 'Nhận xe', icon: '🏁', color: '#10b981' }
    };

    const statusInfo = {
      completed: { label: 'Hoàn thành', icon: '✅', color: '#10b981' },
      in_progress: { label: 'Đang thực hiện', icon: '⏳', color: '#f59e0b' },
      pending: { label: 'Chờ xử lý', icon: '📋', color: '#6b7280' }
    };

    return (
      <div className="management-content">
        <div className="section-header">
          <h2>🚚 Lịch sử giao/nhận xe</h2>
          <div className="header-actions">
            <button className="btn-primary">📊 Xuất báo cáo</button>
          </div>
        </div>

        <div className="filters">
          <select className="filter-select">
            <option value="all">Tất cả loại</option>
            <option value="pickup">Giao xe</option>
            <option value="return">Nhận xe</option>
          </select>
          <select className="filter-select">
            <option value="all">Tất cả trạm</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>{station.name}</option>
            ))}
          </select>
          <select className="filter-select">
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Hoàn thành</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="pending">Chờ xử lý</option>
          </select>
          <input 
            type="date" 
            className="filter-select" 
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="stats-summary">
          <div className="summary-item">
            <span className="summary-label">Tổng giao dịch hôm nay:</span>
            <span className="summary-value">{deliveryHistory.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🚀 Giao xe:</span>
            <span className="summary-value" style={{ color: '#3b82f6' }}>
              {deliveryHistory.filter(d => d.type === 'pickup').length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🏁 Nhận xe:</span>
            <span className="summary-value" style={{ color: '#10b981' }}>
              {deliveryHistory.filter(d => d.type === 'return').length}
            </span>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Loại</th>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Trạm</th>
                <th>Nhân viên</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {deliveryHistory.map((record) => (
                <tr key={record.id}>
                  <td>#{record.id}</td>
                  <td>
                    <span 
                      style={{ 
                        background: typeInfo[record.type].color + '20',
                        color: typeInfo[record.type].color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {typeInfo[record.type].icon} {typeInfo[record.type].label}
                    </span>
                  </td>
                  <td>{record.customer}</td>
                  <td>{record.bike}</td>
                  <td>{record.station}</td>
                  <td>{record.staff}</td>
                  <td>{record.time}</td>
                  <td>
                    <span 
                      style={{ 
                        background: statusInfo[record.status].color + '20',
                        color: statusInfo[record.status].color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {statusInfo[record.status].icon} {statusInfo[record.status].label}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-view" title="Xem chi tiết">
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
            className={`nav-item ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            <span className="nav-icon">🚚</span>
            Lịch sử giao/nhận
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
            {activeTab === 'delivery' && 'Lịch sử Giao/Nhận Xe'}
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
          {activeTab === 'delivery' && renderDeliveryHistory()}
          {activeTab === 'customers' && renderCustomerManagement()}
          {activeTab === 'staff' && renderStaffManagement()}
          {activeTab === 'reports' && renderReports()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
