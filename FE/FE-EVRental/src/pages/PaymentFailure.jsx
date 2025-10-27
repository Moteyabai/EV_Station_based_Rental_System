import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('orderCode') || 'N/A';
  const reason = searchParams.get('reason') || 'Không xác định';

  const getFailureMessage = () => {
    switch (reason.toLowerCase()) {
      case 'cancelled':
      case 'canceled':
        return 'Bạn đã hủy giao dịch thanh toán';
      case 'timeout':
      case 'expired':
        return 'Phiên thanh toán đã hết thời gian';
      case 'insufficient_funds':
        return 'Tài khoản không đủ số dư';
      case 'error':
        return 'Đã có lỗi xảy ra trong quá trình xử lý';
      default:
        return 'Giao dịch thanh toán thất bại';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        animation: 'slideUp 0.6s ease-out',
        borderTop: '6px solid #ef4444',
      }}>
        {/* Failure Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 2rem',
          borderRadius: '50%',
          background: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px solid #ef4444',
        }}>
          <i className="fas fa-times-circle" style={{
            fontSize: '3.5rem',
            color: '#ef4444',
          }}></i>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#ef4444',
          marginBottom: '1rem',
        }}>
          Thanh toán thất bại
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6',
        }}>
          {getFailureMessage()}
        </p>

        {/* Order Info */}
        <div style={{
          background: '#fef2f2',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #fecaca',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.75rem 0',
            borderBottom: '1px solid #fecaca',
          }}>
            <span style={{ fontWeight: '600', color: '#4b5563' }}>Mã đơn hàng:</span>
            <span style={{ fontWeight: '500', color: '#1f2937' }}>{orderCode}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.75rem 0',
          }}>
            <span style={{ fontWeight: '600', color: '#4b5563' }}>Lý do:</span>
            <span style={{ fontWeight: '600', color: '#ef4444' }}>{reason}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <button 
            onClick={() => navigate('/checkout')}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
            }}
          >
            <i className="fas fa-redo"></i> Thử lại thanh toán
          </button>

          <button 
            onClick={() => navigate('/history')}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            <i className="fas fa-history"></i> Xem lịch sử
          </button>

          <button 
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              border: '2px solid #d1d5db',
              cursor: 'pointer',
              background: 'transparent',
              color: '#6b7280',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            <i className="fas fa-home"></i> Về trang chủ
          </button>
        </div>

        {/* Help Section */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#fef3c7',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '8px',
          textAlign: 'left',
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '1rem',
          }}>
            💡 Bạn cần hỗ trợ?
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            color: '#4b5563',
          }}>
            <li style={{ padding: '0.5rem 0' }}>📞 Hotline: <strong>1900 1234</strong></li>
            <li style={{ padding: '0.5rem 0' }}>📧 Email: <strong>support@evrental.com</strong></li>
          </ul>
        </div>

        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentFailure;
