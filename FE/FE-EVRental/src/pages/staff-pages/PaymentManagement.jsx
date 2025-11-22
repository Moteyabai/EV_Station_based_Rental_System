import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getToken } from '../../utils/auth';
import Pagination from './components/Pagination';

export default function PaymentManagement() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRentalInfoModal, setShowRentalInfoModal] = useState(false);
  const [rentalInfo, setRentalInfo] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingPayment, setCancellingPayment] = useState(null);
  const [paymentType, setPaymentType] = useState("cash");
  const [paymentFilter, setPaymentFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRental, setLoadingRental] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    console.log("🔄 [PAYMENTS] Loading payments for type:", paymentType, "filter:", paymentFilter);
    loadPayments();

    // Auto-refresh every 5 seconds
    const intervalId = setInterval(() => {
      console.log("🔄 [PAYMENTS] Auto-refreshing payments...");
      loadPayments();
    }, 5000);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [paymentType, paymentFilter]);

  useEffect(() => {
    if (paymentType === "online" && paymentFilter === "pending") {
      console.log("🔄 [PAYMENTS] Switching to 'verified' filter for online payments");
      setPaymentFilter("verified");
    }
  }, [paymentType, paymentFilter]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [paymentType, paymentFilter, searchQuery]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        console.warn("⚠️ [PAYMENTS] No token found");
        setPayments([]);
        return [];
      }

      const staffAccountID = user?.accountID || user?.AccountID;
      
      if (!staffAccountID) {
        console.error("❌ [PAYMENTS] Staff accountID not found!");
        setPayments([]);
        return [];
      }
      
      if (paymentType === "cash") {
        console.log(`📋 [PAYMENTS] Fetching CASH payments at station for staff accountID: ${staffAccountID}`);
        
        const response = await fetch(`http://localhost:5168/api/Payment/GetCashPaymentsAtStation/${staffAccountID}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          console.log(`✅ [PAYMENTS] Loaded ${data.length} cash payments at station`);
          setPayments(data);
          return data;
        } else {
          setPayments([]);
          return [];
        }
      }
      
      if (paymentType === "online") {
        console.log(`📋 [PAYMENTS] Fetching PayOS payments at station for staff accountID: ${staffAccountID}`);
        
        const response = await fetch(`http://localhost:5168/api/Payment/GetPayOSPaymentsAtStation/${staffAccountID}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          console.log(`✅ [PAYMENTS] Loaded ${data.length} PayOS payments at station`);
          setPayments(data);
          return data;
        } else {
          setPayments([]);
          return [];
        }
      }
    } catch (err) {
      console.error("❌ [PAYMENTS] Error:", err);
      setError(err.message || "Không thể tải dữ liệu thanh toán");
      setPayments([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (payment) => {
    if (!window.confirm(`Xác nhận thanh toán #${payment.paymentID}?`)) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5168/api/Payment/success?orderID=${payment.paymentID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      alert("✅ Đã xác nhận thanh toán thành công!");
      loadPayments();
    } catch (err) {
      console.error("❌ [CONFIRM] Error:", err);
      alert(`❌ Có lỗi xảy ra khi xác nhận: ${err.message}`);
    }
  };

  const handleOpenCancelModal = (payment) => {
    setCancellingPayment(payment);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelPayment = async () => {
    if (!cancelReason.trim()) {
      alert("⚠️ Vui lòng nhập lý do hủy đơn!");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5168/api/Payment/failed?orderID=${cancellingPayment.paymentID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      alert("✅ Đã hủy đơn thanh toán thành công!");
      setShowCancelModal(false);
      setCancelReason("");
      setCancellingPayment(null);
      loadPayments();
    } catch (err) {
      console.error("❌ [CANCEL] Error:", err);
      alert(`❌ Có lỗi xảy ra khi hủy đơn: ${err.message}`);
    }
  };

  const filteredPayments = payments.filter((p) => {
    let statusMatch = true;
    if (paymentFilter === "pending") {
      statusMatch = p.status === 0;
    } else if (paymentFilter === "verified") {
      statusMatch = p.status === 1;
    } else if (paymentFilter === "cancelled") {
      statusMatch = p.status === -1;
    }

    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const paymentIdStr = p.paymentID?.toString().toLowerCase() || "";
      searchMatch = paymentIdStr.includes(query);
    }

    return statusMatch && searchMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const getStatusBadge = (payment) => {
    const status = payment.status;
    const method = (payment.paymentMethod || '').toString().toLowerCase();
    
    if (status === 0 && method.includes('cash')) {
      return <span className="status-badge status-cash-unpaid">💵 Chưa thanh toán (Cash)</span>;
    }
    
    if (status === 2 && method.includes('payos')) {
      return <span className="status-badge status-payos-paid">✅ Đã thanh toán (PayOS)</span>;
    }
    
    switch (status) {
      case 0:
        return <span className="status-badge status-pending">⏳ Chưa thanh toán</span>;
      case 1:
        return <span className="status-badge status-verified">✅ Đã xác nhận</span>;
      case 2:
        return <span className="status-badge status-payos-paid">✅ Đã thanh toán</span>;
      case -1:
        return <span className="status-badge status-cancelled">❌ Đã hủy</span>;
      default:
        return <span className="status-badge">❓ Không xác định</span>;
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>💰 Quản Lý Thanh Toán</h2>
      </div>

      <div className="payment-type-tabs" style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '10px'
      }}>
        <button
          className={`payment-type-tab ${paymentType === "cash" ? "active" : ""}`}
          onClick={() => setPaymentType("cash")}
          style={{
            flex: 1,
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            background: paymentType === "cash" ? '    background: linear-gradient(135deg, #66c9adff 0%, #079724ff 100%)' : '#27c253ff',
            color: paymentType === "cash" ? 'white' : '#666',
            transition: 'all 0.3s ease',
          }}
        >
          💵 Thanh toán trực tiếp ({payments.filter((p) => p.paymentMethod === 2).length})
        </button>
        <button
          className={`payment-type-tab ${paymentType === "online" ? "active" : ""}`}
          onClick={() => setPaymentType("online")}
          style={{
            flex: 1,
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            background: paymentType === "online" ? '    background: linear-gradient(135deg, #66c9a9 0%, #56ab91 100%)' : '#3acfe0ff',
            color: paymentType === "online" ? 'white' : '#666',
            transition: 'all 0.3s ease',
          }}
        >
          💳 Thanh toán online ({payments.filter((p) => p.paymentMethod === 1).length})
        </button>
      </div>

      <div className="filter-tabs">
        {paymentType === "cash" && (
          <button
            className={`filter-tab ${paymentFilter === "pending" ? "active" : ""}`}
            onClick={() => setPaymentFilter("pending")}
          >
            ⏳ Chưa xác nhận ({payments.filter((p) => p.status === 0 || p.status === 2).length})
          </button>
        )}
        <button
          className={`filter-tab ${paymentFilter === "verified" ? "active" : ""}`}
          onClick={() => setPaymentFilter("verified")}
        >
          ✅ Đã xác nhận ({payments.filter((p) => p.status === 1).length})
        </button>
        <button
          className={`filter-tab ${paymentFilter === "cancelled" ? "active" : ""}`}
          onClick={() => setPaymentFilter("cancelled")}
        >
          ❌ Đã hủy ({payments.filter((p) => p.status === -1).length})
        </button>
      </div>

      <div className="search-bar" style={{
        margin: '20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '15px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '10px',
      }}>
        <span style={{ fontSize: '20px' }}>🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã Payment ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '15px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            outline: 'none',
            background: 'white'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{
              padding: '8px 16px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ✕ Xóa
          </button>
        )}
      </div>
      
      <div className="payment-list">
        {paginatedPayments.length === 0 && (
          <div className="empty-state">
            {searchQuery ? (
              <p>🔍 Không tìm thấy payment với ID: "{searchQuery}"</p>
            ) : (
              <>
                {paymentFilter === "pending" && <p>📭 Chưa có thanh toán nào cần xác nhận</p>}
                {paymentFilter === "verified" && <p>📭 Chưa có thanh toán nào đã xác nhận</p>}
                {paymentFilter === "cancelled" && <p>📭 Chưa có thanh toán nào bị hủy</p>}
              </>
            )}
          </div>
        )}

        {paginatedPayments.map((payment) => (
          <div key={payment.paymentID} className="payment-card">
            <div className="payment-header">
              <div className="payment-info">
                <h3>🆔 Payment #{payment.paymentID}</h3>
                <span className="payment-date">
                  🕐 Ngày tạo đơn: {formatDate(payment.createdAt)}
                </span>
              </div>
              <div className="payment-badges">
                {getStatusBadge(payment)}
              </div>
            </div>

            <div className="payment-details">
              <div className="payment-amount">
                <span className="amount-label">💰 Số tiền:</span>
                <span className="amount-value">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <div className="payment-method">
                <span className="method-label">💳 Phương thức:</span>
                <span className="method-value">
                  {payment.paymentMethod === 2 ? "💵 Tiền mặt" : 
                   payment.paymentMethod === 1 ? "💳 PayOS" : "N/A"}
                </span>
              </div>
            </div>

            <div className="payment-actions">
              <button 
                className="btn-action btn-view"
                onClick={() => {
                  setSelectedPayment(payment);
                  setShowPaymentModal(true);
                }}
              >
                👁️ Xem thông tin
              </button>
              
              {(payment.status === 0 || payment.status === 2) && (
                <>
                  <button
                    className="btn-action btn-confirm"
                    onClick={() => handleConfirmPayment(payment)}
                    style={{
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      color: 'white'
                    }}
                  >
                    ✅ Xác nhận
                  </button>
                  <button
                    className="btn-action btn-cancel"
                    onClick={() => handleOpenCancelModal(payment)}
                    style={{
                      background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                      color: 'white'
                    }}
                  >
                    ❌ Hủy đơn
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPayments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredPayments.length}
        />
      )}

      {/* Payment Detail Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>💰 Chi Tiết Thanh Toán</h2>
              <button className="btn-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ padding: '2rem' }}>
              {/* Payment Info */}
              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '0.8rem' }}>
                  💳 Thông tin thanh toán
                </h3>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '150px' }}>🆔 Payment ID:</span>
                    <span style={{ fontWeight: '700', color: '#2c3e50', fontSize: '1.1rem', fontFamily: 'monospace', background: '#e3f2fd', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>
                      #{selectedPayment.paymentID}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '150px' }}>💰 Số tiền:</span>
                    <span style={{ fontWeight: '700', color: '#4CAF50', fontSize: '1.3rem' }}>
                      {formatCurrency(selectedPayment.amount)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '150px' }}>💳 Phương thức:</span>
                    <span style={{ fontWeight: '700', color: '#2c3e50' }}>
                      {selectedPayment.paymentMethod === 2 ? "💵 Tiền mặt" : 
                       selectedPayment.paymentMethod === 1 ? "💳 PayOS" : "N/A"}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '150px' }}>📊 Trạng thái:</span>
                    <span>{getStatusBadge(selectedPayment)}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '150px' }}>🕐 Ngày tạo:</span>
                    <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                      {formatDate(selectedPayment.createdAt)}
                    </span>
                  </div>
                  
                  {selectedPayment.updatedAt && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '150px' }}>🔄 Cập nhật:</span>
                      <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                        {formatDate(selectedPayment.updatedAt)}
                      </span>
                    </div>
                  )}
                  
                  {selectedPayment.rentalID && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '150px' }}>🏍️ Rental ID:</span>
                      <span style={{ fontWeight: '700', color: '#2c3e50', fontFamily: 'monospace' }}>
                        #{selectedPayment.rentalID}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info for Cash Payment */}
              {selectedPayment.paymentMethod === 2 && (
                <div style={{ padding: '1.5rem', background: '#fff3e0', borderRadius: '12px', border: '2px solid #ff9800', marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#e65100', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    💵 Thanh toán trực tiếp tại điểm
                  </h3>
                  <p style={{ color: '#bf360c', lineHeight: '1.6', margin: 0 }}>
                    ⚠️ <strong>Lưu ý:</strong> Khách hàng sẽ thanh toán bằng tiền mặt khi nhận xe tại trạm.
                    Vui lòng kiểm tra kỹ số tiền và xác nhận thanh toán sau khi nhận tiền.
                  </p>
                </div>
              )}

              {/* Additional Info for PayOS */}
              {selectedPayment.paymentMethod === 1 && (
                <div style={{ padding: '1.5rem', background: '#e3f2fd', borderRadius: '12px', border: '2px solid #2196F3', marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#1565c0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    💳 Thanh toán online PayOS
                  </h3>
                  <p style={{ color: '#0d47a1', lineHeight: '1.6', margin: 0 }}>
                    ✅ Khách hàng đã thanh toán online qua cổng PayOS.
                    Vui lòng xác nhận để hoàn tất giao dịch.
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div style={{ padding: '1.5rem', background: '#f1f8e9', borderRadius: '12px', border: '1px solid #aed581' }}>
                <h3 style={{ marginBottom: '1rem', color: '#558b2f' }}>📝 Hướng dẫn xử lý</h3>
                <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#33691e', lineHeight: '1.8' }}>
                  <li>Kiểm tra kỹ thông tin thanh toán và số tiền</li>
                  <li>
                    {selectedPayment.paymentMethod === 2 
                      ? "Thu tiền mặt từ khách hàng và đếm kỹ" 
                      : "Xác nhận giao dịch PayOS đã hoàn tất"}
                  </li>
                  <li>Click nút "✅ Xác nhận" để hoàn tất thanh toán</li>
                  <li>Nếu có vấn đề, click "❌ Hủy đơn" và ghi rõ lý do</li>
                </ol>
              </div>
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', padding: '1.5rem', borderTop: '2px solid #e9ecef' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowPaymentModal(false)}
                style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
              >
                ❌ Đóng
              </button>
              
              {(selectedPayment.status === 0 || selectedPayment.status === 2) && (
                <>
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      setShowPaymentModal(false);
                      handleConfirmPayment(selectedPayment);
                    }}
                    style={{ 
                      padding: '0.8rem 2rem', 
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                    }}
                  >
                    ✅ Xác nhận thanh toán
                  </button>
                  
                  <button 
                    className="btn btn-danger" 
                    onClick={() => {
                      setShowPaymentModal(false);
                      handleOpenCancelModal(selectedPayment);
                    }}
                    style={{ 
                      padding: '0.8rem 2rem', 
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)'
                    }}
                  >
                    ❌ Hủy đơn
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Payment Modal */}
      {showCancelModal && cancellingPayment && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>❌ Hủy Đơn Thanh Toán</h2>
              <button className="btn-close" onClick={() => setShowCancelModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Payment ID:</strong> #{cancellingPayment.paymentID}</p>
                <p><strong>Số tiền:</strong> {formatCurrency(cancellingPayment.amount)}</p>
              </div>
              
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  📝 Lý do hủy đơn: <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy đơn (bắt buộc)..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
              >
                Đóng
              </button>
              <button
                className="btn-primary"
                onClick={handleCancelPayment}
                disabled={!cancelReason.trim()}
                style={{
                  background: !cancelReason.trim() ? '#ccc' : 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                  cursor: !cancelReason.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                ❌ Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
