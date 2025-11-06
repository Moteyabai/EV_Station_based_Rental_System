import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('orderCode') || 'N/A';
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const callSuccessAPI = async () => {
      if (orderCode && orderCode !== "N/A") {
        try {
          const token = localStorage.getItem('token');
          
          // Get booking info from localStorage
          const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
          const booking = allBookings.find(b => 
            b.id?.includes(orderCode) || 
            b.orderCode == orderCode ||
            b.paymentStatus === 'pending'
          );
          
          console.log('📦 Found booking:', booking);
          
          // Call payment success API
          const response = await fetch(
            `http://localhost:5168/api/Payment/success?orderID=${orderCode}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            console.log('✅ Payment success recorded');
            
            // Update booking status in localStorage
            if (booking) {
              booking.paymentStatus = 'completed';
            }
            
            // Fetch Payment details to get RentalID
            try {
              const paymentResponse = await fetch(
                `http://localhost:5168/api/Payment/GetPaymentById/${orderCode}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              
              if (paymentResponse.ok) {
                const paymentData = await paymentResponse.json();
                console.log('💳 Payment data:', paymentData);
                
                // Get Rental details with real license plate
                if (paymentData.rentalID || paymentData.RentalID) {
                  const rentalID = paymentData.rentalID || paymentData.RentalID;
                  const rentalResponse = await fetch(
                    `http://localhost:5168/api/Rental/GetRentalById/${rentalID}`,
                    {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    }
                  );
                  
                  if (rentalResponse.ok) {
                    const rentalData = await rentalResponse.json();
                    console.log('🏍️ Rental data:', rentalData);
                    
                    // Update booking with real license plate from database
                    if (booking && rentalData.licensePlate) {
                      booking.licensePlate = rentalData.licensePlate || rentalData.LicensePlate;
                      console.log('✅ Updated license plate:', booking.licensePlate);
                    }
                  } else {
                    console.warn('⚠️ Could not fetch rental details');
                  }
                }
              } else {
                console.warn('⚠️ Could not fetch payment details');
              }
            } catch (fetchError) {
              console.error('⚠️ Error fetching rental details:', fetchError);
            }
            
            // Update localStorage and state
            if (booking) {
              localStorage.setItem('bookings', JSON.stringify(allBookings));
              setBookingInfo(booking);
            }
          } else {
            console.error('❌ Failed to record payment success');
            // Still set booking info even if API fails
            if (booking) {
              setBookingInfo(booking);
            }
          }
        } catch (error) {
          console.error('💥 Error:', error);
          // Still set booking info even if error occurs
          const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
          const booking = allBookings.find(b => 
            b.id?.includes(orderCode) || 
            b.orderCode == orderCode ||
            b.paymentStatus === 'pending'
          );
          if (booking) {
            setBookingInfo(booking);
          }
        } finally {
          setLoading(false);
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
      padding: '2rem 1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        animation: 'slideUp 0.6s ease-out',
        borderTop: '6px solid #10b981',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Success Icon */}
        <div
          style={{
            width: "100px",
            height: "100px",
            margin: "0 auto 2rem",
            borderRadius: "50%",
            background: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid #10b981",
          }}
        >
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <path
              d="M10 25L20 35L40 15"
              stroke="#10b981"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "#10b981",
            marginBottom: "1rem",
          }}
        >
          Thanh toán thành công! 🎉
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            color: "#6b7280",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          Cảm ơn bạn đã hoàn tất thanh toán. Đơn hàng của bạn đã được xác nhận.
        </p>

        {loading ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-block',
              width: '50px',
              height: '50px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}></div>
            <p style={{
              marginTop: '1rem',
              color: '#6b7280',
            }}>
              Đang tải thông tin đặt xe...
            </p>
          </div>
        ) : (
          <>
            {/* Order Info */}
            <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            📋 Thông tin đặt xe
          </h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.75rem 0',
            borderBottom: '1px solid #e5e7eb',
          }}>
            <span style={{ fontWeight: '600', color: '#4b5563' }}>Mã đơn hàng:</span>
            <span style={{ fontWeight: '700', color: '#10b981' }}>{orderCode}</span>
          </div>

          {bookingInfo && (
            <>
              {/* Vehicle Info */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem 0',
                borderBottom: '1px solid #e5e7eb',
                alignItems: 'center',
              }}>
                {bookingInfo.vehicleImage && (
                  <img 
                    src={bookingInfo.vehicleImage} 
                    alt={bookingInfo.vehicleName}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '1.1rem' }}>
                    🏍️ {bookingInfo.vehicleName}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Biển số: <span style={{ fontWeight: '600', color: '#10b981' }}>{bookingInfo.licensePlate}</span>
                  </div>
                </div>
              </div>

              {/* Rental Period */}
              <div style={{
                padding: '1rem 0',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ fontWeight: '600', color: '#4b5563' }}>📅 Ngày thuê:</span>
                  <span style={{ color: '#1f2937' }}>{bookingInfo.pickupDate}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ fontWeight: '600', color: '#4b5563' }}>📅 Ngày trả:</span>
                  <span style={{ color: '#1f2937' }}>{bookingInfo.returnDate}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontWeight: '600', color: '#4b5563' }}>⏱️ Thời gian thuê:</span>
                  <span style={{ 
                    color: 'white', 
                    background: '#10b981',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}>
                    {bookingInfo.days} ngày
                  </span>
                </div>
              </div>

              {/* Pickup/Return Time */}
              <div style={{
                padding: '1rem 0',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ fontWeight: '600', color: '#4b5563' }}>🕒 Giờ nhận xe:</span>
                  <span style={{ color: '#1f2937' }}>{bookingInfo.pickupTime}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontWeight: '600', color: '#4b5563' }}>🕒 Giờ trả xe:</span>
                  <span style={{ color: '#1f2937' }}>{bookingInfo.returnTime}</span>
                </div>
              </div>

              {/* Station Info */}
              <div style={{
                padding: '1rem 0',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: '600', color: '#4b5563', marginBottom: '0.25rem' }}>
                    📍 Điểm nhận xe:
                  </div>
                  <div style={{ color: '#1f2937', paddingLeft: '1.5rem' }}>
                    <div style={{ fontWeight: '600' }}>{bookingInfo.pickupStation}</div>
                    {bookingInfo.pickupStationAddress && (
                      <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        {bookingInfo.pickupStationAddress}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#4b5563', marginBottom: '0.25rem' }}>
                    🚩 Điểm trả xe:
                  </div>
                  <div style={{ color: '#1f2937', paddingLeft: '1.5rem' }}>
                    <div style={{ fontWeight: '600' }}>{bookingInfo.returnStation}</div>
                    {bookingInfo.returnStationAddress && (
                      <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        {bookingInfo.returnStationAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{
                padding: '1rem 0',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ fontWeight: '600', color: '#4b5563' }}>👤 Người thuê:</span>
                  <span style={{ color: '#1f2937' }}>{bookingInfo.userName}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{ fontWeight: '600', color: '#4b5563' }}>📧 Email:</span>
                  <span style={{ color: '#1f2937', fontSize: '0.9rem' }}>{bookingInfo.userEmail}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontWeight: '600', color: '#4b5563' }}>📞 Số điện thoại:</span>
                  <span style={{ color: '#1f2937' }}>{bookingInfo.userPhone}</span>
                </div>
              </div>

              {/* Total Price */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem 0',
                fontSize: '1.2rem',
              }}>
                <span style={{ fontWeight: '700', color: '#1f2937' }}>💰 Tổng tiền:</span>
                <span style={{ fontWeight: '700', color: '#10b981' }}>
                  {bookingInfo.totalPrice?.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </>
          )}
        </div>

        {/* Important Notes */}
        <div style={{
          background: '#fef3c7',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: '#92400e',
            marginBottom: '0.75rem',
          }}>
            ⚠️ Lưu ý quan trọng:
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            color: '#92400e',
            fontSize: '0.9rem',
            lineHeight: '1.8',
          }}>
            <li>Vui lòng mang theo CMND/CCCD và bằng lái xe khi nhận xe</li>
            <li>Đến đúng giờ đã đặt để nhận xe ({bookingInfo?.pickupTime})</li>
            <li>Kiểm tra xe kỹ trước khi sử dụng</li>
            <li>Trả xe đúng hạn để tránh phí phạt</li>
            <li>Liên hệ hotline 1900-EV-RENTAL nếu cần hỗ trợ</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <button
            onClick={() => navigate("/history")}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
            }}
          >
            <i className="fas fa-history"></i> Xem lịch sử đặt xe
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "600",
              border: "2px solid #d1d5db",
              cursor: "pointer",
              background: "transparent",
              color: "#6b7280",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#f9fafb";
              e.target.style.borderColor = "#9ca3af";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
              e.target.style.borderColor = "#d1d5db";
            }}
          >
            <i className="fas fa-home"></i> Về trang chủ
          </button>
        </div>
        </>
        )}

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
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          /* Custom scrollbar */
          div::-webkit-scrollbar {
            width: 8px;
          }
          
          div::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          
          div::-webkit-scrollbar-thumb {
            background: #10b981;
            border-radius: 10px;
          }
          
          div::-webkit-scrollbar-thumb:hover {
            background: #059669;
          }
          
          @media (max-width: 768px) {
            div[style*="maxWidth: 700px"] {
              padding: 2rem 1.5rem;
              max-height: 95vh;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentSuccess;
