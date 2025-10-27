import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { markPaymentSuccess, markPaymentFailed } from '../api/payment';
import { useAuth } from '../contexts/AuthContext';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Lấy parameters từ URL (theo format BE: code, id, cancel, status, orderCode)
        const code = searchParams.get('code'); // 00 = success
        const id = searchParams.get('id'); // transaction ID
        const cancel = searchParams.get('cancel'); // true/false
        const status = searchParams.get('status'); // PAID, CANCELLED, etc.
        const orderCode = searchParams.get('orderCode'); // 432043 = PaymentID
        
        console.log('💳 PayOS Callback received:', { code, id, cancel, status, orderCode });

        if (!orderCode) {
          console.error('❌ No orderCode found in URL');
          navigate('/payment-failure?reason=no_order_code');
          return;
        }

        // Check authentication
        if (!user) {
          console.log('⚠️ User not logged in');
          navigate('/login', {
            state: {
              from: `/payment-callback?orderCode=${orderCode}`,
              message: 'Vui lòng đăng nhập để xem kết quả thanh toán'
            }
          });
          return;
        }

        const token = localStorage.getItem('ev_token');
        
        // Xác định payment success hay failed
        // Success: code=00 AND status=PAID AND cancel!=true
        // Failed: code!=00 OR status=CANCELLED OR cancel=true
        const isSuccess = code === '00' && 
                         status === 'PAID' && 
                         cancel !== 'true';

        if (isSuccess) {
          // Gọi BE API success
          console.log('✅ Processing payment success...');
          const result = await markPaymentSuccess(parseInt(orderCode), token);
          
          console.log('✅ BE Success Response:', result);
          
          // Redirect đến success page
          navigate(`/payment-success?orderCode=${orderCode}&transactionId=${id || ''}`);
        } else {
          // Gọi BE API failed
          console.log('❌ Processing payment failure...');
          const result = await markPaymentFailed(parseInt(orderCode), token);
          
          console.log('❌ BE Failed Response:', result);
          
          // Redirect đến failure page với lý do
          const reason = cancel === 'true' ? 'cancelled' : (status || 'unknown');
          navigate(`/payment-failure?orderCode=${orderCode}&reason=${reason}`);
        }
      } catch (error) {
        console.error('❌ Error processing payment callback:', error);
        const orderCode = searchParams.get('orderCode');
        navigate(`/payment-failure?orderCode=${orderCode || 'unknown'}&reason=error`);
      }
    };

    handlePaymentCallback();
  }, [searchParams, navigate, user]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e5e7eb',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          margin: '0 auto 1.5rem',
          animation: 'spin 1s linear infinite',
        }} />
        <h2 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
          Đang xử lý thanh toán...
        </h2>
        <p style={{ color: '#6b7280' }}>
          Vui lòng đợi trong giây lát
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentCallback;
