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
      const response = await fetch(`http://localhost:5168/api/Payment/success?paymentID=${payment.paymentID}`, {
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
      const response = await fetch(`http://localhost:5168/api/Payment/failed?paymentID=${cancellingPayment.paymentID}&reason=${encodeURIComponent(cancelReason)}`, {
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
            background: paymentType === "cash" ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
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
            background: paymentType === "online" ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
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
              <button className="btn-action btn-view">
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
