import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('orderCode') || 'N/A';

  useEffect(() => {
    const callSuccessAPI = async () => {
      if (orderCode && orderCode !== 'N/A') {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(
            `http://localhost:5168/api/Payment/success?orderID=${orderCode}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            console.log('Payment success recorded successfully');
          } else {
            console.error('Failed to record payment success');
          }
        } catch (error) {
          console.error('Error calling payment success API:', error);
        }
      }
    };

    callSuccessAPI();
  }, [orderCode]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#4db6ac',
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
        borderTop: '6px solid #10b981',
      }}>
        {/* Success Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 2rem',
          borderRadius: '50%',
          background: '#f0fdf4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px solid #10b981',
        }}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <path d="M10 25L20 35L40 15" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#10b981',
          marginBottom: '1rem',
        }}>
          Thanh toán thành công! 🎉
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6',
        }}>
          Cảm ơn bạn đã hoàn tất thanh toán. Đơn hàng của bạn đã được xác nhận.
        </p>

        {/* Order Info */}
        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.75rem 0',
          }}>
            <span style={{ fontWeight: '600', color: '#4b5563' }}>Mã đơn hàng:</span>
            <span style={{ fontWeight: '500', color: '#1f2937' }}>{orderCode}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            <i className="fas fa-history"></i> Xem lịch sử đặt xe
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

export default PaymentSuccess;
