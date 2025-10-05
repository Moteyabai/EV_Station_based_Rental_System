import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Staff.css';

export default function Staff() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('handover');

  useEffect(() => {
    // Kiểm tra quyền truy cập
    const userRoleId = user?.roleID || user?.RoleID;
    console.log('Staff page: User:', user, 'RoleID:', userRoleId);
    
    if (!user || userRoleId !== 2) {
      console.log('Staff page: Access denied, redirecting to home');
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="staff-page">
      {/* Header */}
      <header className="staff-header">
        <div className="staff-header-content">
          <div className="staff-brand">
            <h1>🏍️ Nhân Viên Điểm Thuê</h1>
            <p>Quản lý giao nhận xe và khách hàng</p>
          </div>
          <div className="staff-user-info">
            <div className="user-details">
              <span className="user-name">{user.fullName}</span>
              <span className="user-role">👤 {user.roleName}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="staff-nav">
        <button 
          className={`nav-tab ${activeTab === 'handover' ? 'active' : ''}`}
          onClick={() => setActiveTab('handover')}
        >
          � Giao nhận xe
        </button>
        <button 
          className={`nav-tab ${activeTab === 'verification' ? 'active' : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          🔐 Xác thực KH
        </button>
        <button 
          className={`nav-tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          � Thanh toán
        </button>
        <button 
          className={`nav-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
          onClick={() => setActiveTab('vehicles')}
        >
          🏍️ Quản lý xe
        </button>
      </nav>

      {/* Main Content */}
      <main className="staff-content">
        <div className="content-container">
          {activeTab === 'handover' && <VehicleHandover />}
          {activeTab === 'verification' && <CustomerVerification />}
          {activeTab === 'payment' && <PaymentManagement />}
          {activeTab === 'vehicles' && <VehicleManagement />}
        </div>
      </main>
    </div>
  );
}

// Component Quản lý Giao - Nhận xe
function VehicleHandover() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      vehicleName: 'VinFast Klara S',
      licensePlate: '59A-12345',
      customerName: 'Nguyễn Văn A',
      bookingId: 'BK001',
      status: 'booked',
      pickupDate: '2025-10-05 14:00',
      returnDate: '2025-10-07 14:00',
      battery: '95%',
      lastCheck: '2025-10-05 08:00'
    },
    {
      id: 2,
      vehicleName: 'DatBike Weaver 200',
      licensePlate: '59B-67890',
      customerName: 'Trần Thị B',
      bookingId: 'BK002',
      status: 'renting',
      pickupDate: '2025-10-03 10:00',
      returnDate: '2025-10-06 10:00',
      battery: '60%',
      lastCheck: '2025-10-03 10:00'
    },
    {
      id: 3,
      vehicleName: 'VinFast Feliz S',
      licensePlate: '59C-11111',
      customerName: null,
      bookingId: null,
      status: 'available',
      pickupDate: null,
      returnDate: null,
      battery: '100%',
      lastCheck: '2025-10-05 07:00'
    }
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);

  const filteredVehicles = vehicles.filter(v => {
    if (selectedFilter === 'all') return true;
    return v.status === selectedFilter;
  });

  const getStatusBadge = (status) => {
    const config = {
      available: { text: 'Sẵn sàng', class: 'status-available', icon: '✅' },
      booked: { text: 'Đã đặt trước', class: 'status-booked', icon: '📅' },
      renting: { text: 'Đang cho thuê', class: 'status-renting', icon: '🚗' }
    };
    const c = config[status] || config.available;
    return <span className={`status-badge ${c.class}`}>{c.icon} {c.text}</span>;
  };

  const handlePickup = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowHandoverModal(true);
  };

  const handleReturn = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowHandoverModal(true);
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>🔄 Quản lý Giao - Nhận Xe</h2>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            Tất cả ({vehicles.length})
          </button>
          <button 
            className={`filter-btn ${selectedFilter === 'available' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('available')}
          >
            Sẵn sàng ({vehicles.filter(v => v.status === 'available').length})
          </button>
          <button 
            className={`filter-btn ${selectedFilter === 'booked' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('booked')}
          >
            Đã đặt ({vehicles.filter(v => v.status === 'booked').length})
          </button>
          <button 
            className={`filter-btn ${selectedFilter === 'renting' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('renting')}
          >
            Đang thuê ({vehicles.filter(v => v.status === 'renting').length})
          </button>
        </div>
      </div>

      <div className="vehicles-list">
        {filteredVehicles.map(vehicle => (
          <div key={vehicle.id} className="handover-vehicle-card">
            <div className="vehicle-header">
              <div className="vehicle-title">
                <h3>{vehicle.vehicleName}</h3>
                <span className="license-plate">🏍️ {vehicle.licensePlate}</span>
              </div>
              {getStatusBadge(vehicle.status)}
            </div>

            <div className="vehicle-details">
              <div className="detail-row">
                <span className="label">🔋 Pin:</span>
                <span className="value">
                  <div className="battery-indicator">
                    <div 
                      className="battery-fill" 
                      style={{ width: vehicle.battery }}
                    />
                  </div>
                  {vehicle.battery}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">🕐 Kiểm tra cuối:</span>
                <span className="value">{vehicle.lastCheck}</span>
              </div>
              
              {vehicle.customerName && (
                <>
                  <div className="detail-row">
                    <span className="label">👤 Khách hàng:</span>
                    <span className="value">{vehicle.customerName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📋 Mã booking:</span>
                    <span className="value">{vehicle.bookingId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📅 Nhận xe:</span>
                    <span className="value">{vehicle.pickupDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📅 Trả xe:</span>
                    <span className="value">{vehicle.returnDate}</span>
                  </div>
                </>
              )}
            </div>

            <div className="vehicle-actions">
              {vehicle.status === 'booked' && (
                <button 
                  className="btn-action btn-pickup"
                  onClick={() => handlePickup(vehicle)}
                >
                  ✅ Bàn giao xe
                </button>
              )}
              {vehicle.status === 'renting' && (
                <button 
                  className="btn-action btn-return"
                  onClick={() => handleReturn(vehicle)}
                >
                  🔄 Thu hồi xe
                </button>
              )}
              <button className="btn-action btn-view">
                👁️ Chi tiết
              </button>
              <button className="btn-action btn-photo">
                📸 Chụp ảnh
              </button>
            </div>
          </div>
        ))}
      </div>

      {showHandoverModal && selectedVehicle && (
        <HandoverModal 
          vehicle={selectedVehicle}
          onClose={() => {
            setShowHandoverModal(false);
            setSelectedVehicle(null);
          }}
        />
      )}
    </div>
  );
}

// Modal bàn giao xe
function HandoverModal({ vehicle, onClose }) {
  const [checklist, setChecklist] = useState({
    bodyCondition: false,
    tireCondition: false,
    lightsWorking: false,
    brakeWorking: false,
    batteryCharged: false,
    documentsChecked: false
  });
  const [signature, setSignature] = useState('');
  const [photos, setPhotos] = useState([]);

  const handleChecklistChange = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(v => v);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Thủ tục Bàn giao Xe</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="vehicle-info-box">
            <h3>{vehicle.vehicleName} - {vehicle.licensePlate}</h3>
            <p>Khách hàng: <strong>{vehicle.customerName}</strong></p>
            <p>Mã booking: <strong>{vehicle.bookingId}</strong></p>
          </div>

          <div className="checklist-section">
            <h3>✅ Checklist kiểm tra xe</h3>
            <div className="checklist-items">
              <label className="checklist-item">
                <input 
                  type="checkbox"
                  checked={checklist.bodyCondition}
                  onChange={() => handleChecklistChange('bodyCondition')}
                />
                <span>Thân xe không trầy xước, móp méo</span>
              </label>
              <label className="checklist-item">
                <input 
                  type="checkbox"
                  checked={checklist.tireCondition}
                  onChange={() => handleChecklistChange('tireCondition')}
                />
                <span>Lốp xe trong tình trạng tốt</span>
              </label>
              <label className="checklist-item">
                <input 
                  type="checkbox"
                  checked={checklist.lightsWorking}
                  onChange={() => handleChecklistChange('lightsWorking')}
                />
                <span>Đèn chiếu sáng hoạt động bình thường</span>
              </label>
              <label className="checklist-item">
                <input 
                  type="checkbox"
                  checked={checklist.brakeWorking}
                  onChange={() => handleChecklistChange('brakeWorking')}
                />
                <span>Phanh hoạt động tốt</span>
              </label>
              <label className="checklist-item">
                <input 
                  type="checkbox"
                  checked={checklist.batteryCharged}
                  onChange={() => handleChecklistChange('batteryCharged')}
                />
                <span>Pin đầy, sạc tốt ({vehicle.battery})</span>
              </label>
              <label className="checklist-item">
                <input 
                  type="checkbox"
                  checked={checklist.documentsChecked}
                  onChange={() => handleChecklistChange('documentsChecked')}
                />
                <span>Giấy tờ xe đầy đủ</span>
              </label>
            </div>
          </div>

          <div className="photo-section">
            <h3>📸 Chụp ảnh xe (Trước/Sau/Trái/Phải)</h3>
            <div className="photo-upload">
              <button className="btn-upload">📷 Chụp ảnh</button>
              <span className="photo-count">{photos.length}/4 ảnh</span>
            </div>
          </div>

          <div className="signature-section">
            <h3>✍️ Ký xác nhận điện tử</h3>
            <div className="signature-box">
              <input 
                type="text"
                placeholder="Nhập tên để ký xác nhận..."
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="signature-input"
              />
            </div>
            <p className="signature-note">
              Tôi xác nhận đã kiểm tra xe và đồng ý với tình trạng trên
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button 
            className="btn-confirm" 
            disabled={!allChecked || !signature}
          >
            ✅ Hoàn tất bàn giao
          </button>
        </div>
      </div>
    </div>
  );
}

// Component Xác thực khách hàng
function CustomerVerification() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([
    {
      id: 1,
      fullName: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      idCard: '001234567890',
      driverLicense: 'B1-123456789',
      licenseExpiry: '2028-12-31',
      verified: true,
      bookingId: 'BK001'
    },
    {
      id: 2,
      fullName: 'Trần Thị B',
      phone: '0912345678',
      email: 'tranthib@email.com',
      idCard: '001234567891',
      driverLicense: 'B1-987654321',
      licenseExpiry: '2027-06-30',
      verified: false,
      bookingId: 'BK002'
    }
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerify = (customer) => {
    setSelectedCustomer(customer);
    setShowVerifyModal(true);
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>🔐 Xác thực Khách hàng</h2>
        <div className="search-box">
          <input 
            type="text"
            placeholder="🔍 Tìm theo tên, SĐT, mã booking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="customer-list">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="customer-card">
            <div className="customer-header">
              <div className="customer-info">
                <h3>{customer.fullName}</h3>
                <span className="booking-badge">📋 {customer.bookingId}</span>
              </div>
              <span className={`verify-badge ${customer.verified ? 'verified' : 'pending'}`}>
                {customer.verified ? '✅ Đã xác thực' : '⏳ Chưa xác thực'}
              </span>
            </div>

            <div className="customer-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">📱 Số điện thoại:</span>
                  <span className="value">{customer.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📧 Email:</span>
                  <span className="value">{customer.email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">🆔 CMND/CCCD:</span>
                  <span className="value">{customer.idCard}</span>
                </div>
                <div className="detail-item">
                  <span className="label">🪪 GPLX:</span>
                  <span className="value">{customer.driverLicense}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📅 Hạn GPLX:</span>
                  <span className="value">{customer.licenseExpiry}</span>
                </div>
              </div>
            </div>

            <div className="customer-actions">
              {!customer.verified && (
                <button 
                  className="btn-action btn-verify"
                  onClick={() => handleVerify(customer)}
                >
                  ✅ Xác thực
                </button>
              )}
              <button className="btn-action btn-view">
                👁️ Xem hồ sơ
              </button>
              <button className="btn-action btn-photo">
                📸 Chụp giấy tờ
              </button>
            </div>
          </div>
        ))}
      </div>

      {showVerifyModal && selectedCustomer && (
        <VerificationModal 
          customer={selectedCustomer}
          onClose={() => {
            setShowVerifyModal(false);
            setSelectedCustomer(null);
          }}
          onVerify={() => {
            setCustomers(customers.map(c => 
              c.id === selectedCustomer.id ? { ...c, verified: true } : c
            ));
            setShowVerifyModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

// Modal xác thực khách hàng
function VerificationModal({ customer, onClose, onVerify }) {
  const [verification, setVerification] = useState({
    idCardPhoto: false,
    licensePhoto: false,
    facePhoto: false,
    idCardMatch: false,
    licenseValid: false
  });

  const allVerified = Object.values(verification).every(v => v);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔐 Xác thực khách hàng</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="customer-info-box">
            <h3>{customer.fullName}</h3>
            <p>Mã booking: <strong>{customer.bookingId}</strong></p>
            <p>Số điện thoại: <strong>{customer.phone}</strong></p>
          </div>

          <div className="verification-section">
            <h3>📋 Checklist xác thực</h3>
            <div className="verification-items">
              <label className="verification-item">
                <input 
                  type="checkbox"
                  checked={verification.idCardPhoto}
                  onChange={() => setVerification(prev => ({ ...prev, idCardPhoto: !prev.idCardPhoto }))}
                />
                <span>📸 Đã chụp ảnh CMND/CCCD</span>
              </label>
              <label className="verification-item">
                <input 
                  type="checkbox"
                  checked={verification.licensePhoto}
                  onChange={() => setVerification(prev => ({ ...prev, licensePhoto: !prev.licensePhoto }))}
                />
                <span>📸 Đã chụp ảnh GPLX</span>
              </label>
              <label className="verification-item">
                <input 
                  type="checkbox"
                  checked={verification.facePhoto}
                  onChange={() => setVerification(prev => ({ ...prev, facePhoto: !prev.facePhoto }))}
                />
                <span>📸 Đã chụp ảnh khuôn mặt</span>
              </label>
              <label className="verification-item">
                <input 
                  type="checkbox"
                  checked={verification.idCardMatch}
                  onChange={() => setVerification(prev => ({ ...prev, idCardMatch: !prev.idCardMatch }))}
                />
                <span>✅ Thông tin CMND khớp với hồ sơ</span>
              </label>
              <label className="verification-item">
                <input 
                  type="checkbox"
                  checked={verification.licenseValid}
                  onChange={() => setVerification(prev => ({ ...prev, licenseValid: !prev.licenseValid }))}
                />
                <span>✅ GPLX còn hạn và hợp lệ</span>
              </label>
            </div>
          </div>

          <div className="document-info">
            <h3>📄 Thông tin giấy tờ</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>CMND/CCCD:</label>
                <span>{customer.idCard}</span>
              </div>
              <div className="info-item">
                <label>Giấy phép lái xe:</label>
                <span>{customer.driverLicense}</span>
              </div>
              <div className="info-item">
                <label>Ngày hết hạn GPLX:</label>
                <span>{customer.licenseExpiry}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button 
            className="btn-confirm" 
            disabled={!allVerified}
            onClick={onVerify}
          >
            ✅ Xác thực
          </button>
        </div>
      </div>
    </div>
  );
}

// Component Quản lý thanh toán
function PaymentManagement() {
  const [payments, setPayments] = useState([
    {
      id: 1,
      bookingId: 'BK001',
      customerName: 'Nguyễn Văn A',
      type: 'rental',
      amount: 240000,
      status: 'pending',
      method: 'cash',
      date: '2025-10-05 14:00'
    },
    {
      id: 2,
      bookingId: 'BK002',
      customerName: 'Trần Thị B',
      type: 'deposit',
      amount: 500000,
      status: 'completed',
      method: 'transfer',
      date: '2025-10-03 10:00'
    },
    {
      id: 3,
      bookingId: 'BK002',
      customerName: 'Trần Thị B',
      type: 'refund',
      amount: 500000,
      status: 'pending',
      method: 'transfer',
      date: '2025-10-06 10:00'
    }
  ]);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getTypeBadge = (type) => {
    const config = {
      rental: { text: 'Phí thuê', class: 'type-rental', icon: '💰' },
      deposit: { text: 'Đặt cọc', class: 'type-deposit', icon: '🏦' },
      refund: { text: 'Hoàn cọc', class: 'type-refund', icon: '💵' }
    };
    const c = config[type] || config.rental;
    return <span className={`type-badge ${c.class}`}>{c.icon} {c.text}</span>;
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { text: 'Chờ thanh toán', class: 'status-pending', icon: '⏳' },
      completed: { text: 'Đã thanh toán', class: 'status-completed', icon: '✅' },
      cancelled: { text: 'Đã hủy', class: 'status-cancelled', icon: '❌' }
    };
    const c = config[status] || config.pending;
    return <span className={`status-badge ${c.class}`}>{c.icon} {c.text}</span>;
  };

  const handleProcessPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCompleted = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>� Quản lý Thanh toán</h2>
        <div className="section-stats">
          <div className="stat-card">
            <span className="stat-number">{totalPending.toLocaleString()} đ</span>
            <span className="stat-label">Chờ thanh toán</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{totalCompleted.toLocaleString()} đ</span>
            <span className="stat-label">Đã thanh toán</span>
          </div>
        </div>
      </div>

      <div className="payment-list">
        {payments.map(payment => (
          <div key={payment.id} className="payment-card">
            <div className="payment-header">
              <div className="payment-info">
                <h3>#{payment.bookingId} - {payment.customerName}</h3>
                <span className="payment-date">� {payment.date}</span>
              </div>
              <div className="payment-badges">
                {getTypeBadge(payment.type)}
                {getStatusBadge(payment.status)}
              </div>
            </div>

            <div className="payment-details">
              <div className="payment-amount">
                <span className="amount-label">Số tiền:</span>
                <span className="amount-value">{payment.amount.toLocaleString()} VNĐ</span>
              </div>
              <div className="payment-method">
                <span className="method-label">Phương thức:</span>
                <span className="method-value">
                  {payment.method === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                </span>
              </div>
            </div>

            <div className="payment-actions">
              {payment.status === 'pending' && (
                <button 
                  className="btn-action btn-pay"
                  onClick={() => handleProcessPayment(payment)}
                >
                  ✅ Xác nhận thanh toán
                </button>
              )}
              <button className="btn-action btn-view">
                👁️ Chi tiết
              </button>
              <button className="btn-action btn-print">
                🖨️ In biên lai
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPaymentModal && selectedPayment && (
        <PaymentModal 
          payment={selectedPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
          onConfirm={() => {
            setPayments(payments.map(p => 
              p.id === selectedPayment.id ? { ...p, status: 'completed' } : p
            ));
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
}

// Modal xác nhận thanh toán
function PaymentModal({ payment, onClose, onConfirm }) {
  const [notes, setNotes] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 Xác nhận Thanh toán</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="payment-info-box">
            <h3>Thông tin thanh toán</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã booking:</label>
                <span>{payment.bookingId}</span>
              </div>
              <div className="info-item">
                <label>Khách hàng:</label>
                <span>{payment.customerName}</span>
              </div>
              <div className="info-item">
                <label>Loại:</label>
                <span>
                  {payment.type === 'rental' && '💰 Phí thuê xe'}
                  {payment.type === 'deposit' && '🏦 Đặt cọc'}
                  {payment.type === 'refund' && '💵 Hoàn cọc'}
                </span>
              </div>
              <div className="info-item">
                <label>Số tiền:</label>
                <span className="amount-highlight">{payment.amount.toLocaleString()} VNĐ</span>
              </div>
              <div className="info-item">
                <label>Phương thức:</label>
                <span>{payment.method === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}</span>
              </div>
            </div>
          </div>

          {payment.method === 'transfer' && (
            <div className="photo-section">
              <label className="photo-item">
                <input 
                  type="checkbox"
                  checked={receiptPhoto}
                  onChange={() => setReceiptPhoto(!receiptPhoto)}
                />
                <span>📸 Đã chụp ảnh biên lai chuyển khoản</span>
              </label>
            </div>
          )}

          <div className="notes-section">
            <label>Ghi chú:</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú nếu có..."
              rows="3"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button 
            className="btn-confirm" 
            onClick={onConfirm}
            disabled={payment.method === 'transfer' && !receiptPhoto}
          >
            ✅ Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}

// Component Quản lý xe tại điểm
function VehicleManagement() {
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      name: 'VinFast Klara S',
      licensePlate: '59A-12345',
      battery: 95,
      technicalStatus: 'good',
      lastMaintenance: '2025-09-15',
      mileage: 1250,
      status: 'available',
      issues: []
    },
    {
      id: 2,
      name: 'DatBike Weaver 200',
      licensePlate: '59B-67890',
      battery: 60,
      technicalStatus: 'good',
      lastMaintenance: '2025-09-20',
      mileage: 980,
      status: 'renting',
      issues: []
    },
    {
      id: 3,
      name: 'VinFast Feliz S',
      licensePlate: '59C-11111',
      battery: 20,
      technicalStatus: 'issue',
      lastMaintenance: '2025-08-10',
      mileage: 2100,
      status: 'maintenance',
      issues: ['Phanh trước yếu', 'Đèn pha phải không sáng']
    }
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const getTechnicalBadge = (status) => {
    const config = {
      good: { text: 'Tốt', class: 'tech-good', icon: '✅' },
      issue: { text: 'Có vấn đề', class: 'tech-issue', icon: '⚠️' },
      broken: { text: 'Hỏng hóc', class: 'tech-broken', icon: '❌' }
    };
    const c = config[status] || config.good;
    return <span className={`tech-badge ${c.class}`}>{c.icon} {c.text}</span>;
  };

  const getStatusBadge = (status) => {
    const config = {
      available: { text: 'Sẵn sàng', class: 'status-available', icon: '✅' },
      renting: { text: 'Đang cho thuê', class: 'status-renting', icon: '🚗' },
      maintenance: { text: 'Bảo trì', class: 'status-maintenance', icon: '�' }
    };
    const c = config[status] || config.available;
    return <span className={`status-badge ${c.class}`}>{c.icon} {c.text}</span>;
  };

  const getBatteryClass = (battery) => {
    if (battery >= 80) return 'battery-high';
    if (battery >= 40) return 'battery-medium';
    return 'battery-low';
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>🏍️ Quản lý Xe tại Điểm</h2>
        <div className="header-stats">
          <div className="stat-mini">
            <span className="stat-icon">✅</span>
            <span className="stat-text">{vehicles.filter(v => v.status === 'available').length} xe sẵn sàng</span>
          </div>
          <div className="stat-mini">
            <span className="stat-icon">�</span>
            <span className="stat-text">{vehicles.filter(v => v.status === 'renting').length} đang cho thuê</span>
          </div>
          <div className="stat-mini">
            <span className="stat-icon">🔧</span>
            <span className="stat-text">{vehicles.filter(v => v.status === 'maintenance').length} bảo trì</span>
          </div>
        </div>
      </div>

      <div className="vehicles-grid-manage">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="vehicle-manage-card">
            <div className="vehicle-card-header">
              <div className="vehicle-title">
                <h3>{vehicle.name}</h3>
                <span className="license-plate">🏍️ {vehicle.licensePlate}</span>
              </div>
              <div className="vehicle-badges">
                {getStatusBadge(vehicle.status)}
                {getTechnicalBadge(vehicle.technicalStatus)}
              </div>
            </div>

            <div className="vehicle-stats">
              <div className="stat-row">
                <span className="label">🔋 Mức pin:</span>
                <div className="battery-container">
                  <div className="battery-bar">
                    <div 
                      className={`battery-fill ${getBatteryClass(vehicle.battery)}`}
                      style={{ width: `${vehicle.battery}%` }}
                    />
                  </div>
                  <span className="battery-value">{vehicle.battery}%</span>
                </div>
              </div>
              <div className="stat-row">
                <span className="label">📏 Km đã đi:</span>
                <span className="value">{vehicle.mileage} km</span>
              </div>
              <div className="stat-row">
                <span className="label">🔧 Bảo trì cuối:</span>
                <span className="value">{vehicle.lastMaintenance}</span>
              </div>
            </div>

            {vehicle.issues.length > 0 && (
              <div className="issues-box">
                <h4>⚠️ Vấn đề kỹ thuật:</h4>
                <ul>
                  {vehicle.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="vehicle-actions">
              <button 
                className="btn-action btn-update"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setShowUpdateModal(true);
                }}
              >
                🔄 Cập nhật
              </button>
              <button 
                className="btn-action btn-report"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setShowReportModal(true);
                }}
              >
                📝 Báo cáo sự cố
              </button>
              <button className="btn-action btn-view">
                👁️ Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {showUpdateModal && selectedVehicle && (
        <UpdateVehicleModal 
          vehicle={selectedVehicle}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedVehicle(null);
          }}
          onUpdate={(updatedData) => {
            setVehicles(vehicles.map(v => 
              v.id === selectedVehicle.id ? { ...v, ...updatedData } : v
            ));
            setShowUpdateModal(false);
            setSelectedVehicle(null);
          }}
        />
      )}

      {showReportModal && selectedVehicle && (
        <ReportIssueModal 
          vehicle={selectedVehicle}
          onClose={() => {
            setShowReportModal(false);
            setSelectedVehicle(null);
          }}
          onReport={(issue) => {
            setVehicles(vehicles.map(v => 
              v.id === selectedVehicle.id 
                ? { ...v, issues: [...v.issues, issue], technicalStatus: 'issue' }
                : v
            ));
            setShowReportModal(false);
            setSelectedVehicle(null);
          }}
        />
      )}
    </div>
  );
}

// Modal cập nhật trạng thái xe
function UpdateVehicleModal({ vehicle, onClose, onUpdate }) {
  const [battery, setBattery] = useState(vehicle.battery);
  const [technicalStatus, setTechnicalStatus] = useState(vehicle.technicalStatus);
  const [mileage, setMileage] = useState(vehicle.mileage);
  const [notes, setNotes] = useState('');

  const handleUpdate = () => {
    onUpdate({
      battery: parseInt(battery),
      technicalStatus,
      mileage: parseInt(mileage)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔄 Cập nhật Trạng thái Xe</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="vehicle-info-box">
            <h3>{vehicle.name} - {vehicle.licensePlate}</h3>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>🔋 Mức pin (%):</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={battery}
                onChange={(e) => setBattery(e.target.value)}
                className="battery-slider"
              />
              <span className="battery-display">{battery}%</span>
            </div>

            <div className="form-group">
              <label>🔧 Tình trạng kỹ thuật:</label>
              <select 
                value={technicalStatus}
                onChange={(e) => setTechnicalStatus(e.target.value)}
                className="status-select"
              >
                <option value="good">✅ Tốt</option>
                <option value="issue">⚠️ Có vấn đề</option>
                <option value="broken">❌ Hỏng hóc</option>
              </select>
            </div>

            <div className="form-group">
              <label>📏 Số km đã đi:</label>
              <input 
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="mileage-input"
              />
            </div>

            <div className="form-group">
              <label>📝 Ghi chú:</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú về tình trạng xe..."
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={handleUpdate}>
            ✅ Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal báo cáo sự cố
function ReportIssueModal({ vehicle, onClose, onReport }) {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [photos, setPhotos] = useState([]);

  const handleReport = () => {
    if (issueType && description) {
      onReport(description);
      alert('Đã gửi báo cáo sự cố lên Admin!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Báo cáo Sự cố / Hỏng hóc</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="vehicle-info-box">
            <h3>{vehicle.name} - {vehicle.licensePlate}</h3>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>🔧 Loại sự cố:</label>
              <select 
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="issue-select"
              >
                <option value="">-- Chọn loại sự cố --</option>
                <option value="battery">🔋 Pin / Sạc điện</option>
                <option value="brake">🛑 Phanh</option>
                <option value="light">� Đèn chiếu sáng</option>
                <option value="tire">🛞 Lốp xe</option>
                <option value="body">🏍️ Thân xe / Ngoại thất</option>
                <option value="other">❓ Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label>⚠️ Mức độ nghiêm trọng:</label>
              <select 
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="severity-select"
              >
                <option value="low">🟢 Nhẹ - Có thể tiếp tục sử dụng</option>
                <option value="medium">🟡 Trung bình - Cần sửa chữa sớm</option>
                <option value="high">🔴 Nghiêm trọng - Dừng sử dụng ngay</option>
              </select>
            </div>

            <div className="form-group">
              <label>📝 Mô tả chi tiết:</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về sự cố, hỏng hóc..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>📸 Chụp ảnh sự cố:</label>
              <button className="btn-upload">📷 Chụp / Tải ảnh</button>
              <span className="photo-count">{photos.length} ảnh</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button 
            className="btn-confirm btn-danger" 
            onClick={handleReport}
            disabled={!issueType || !description}
          >
            🚨 Gửi báo cáo lên Admin
          </button>
        </div>
      </div>
    </div>
  );
}
