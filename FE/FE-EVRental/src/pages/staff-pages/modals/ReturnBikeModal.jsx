import React, { useState } from 'react';
import { getToken } from '../../../utils/auth';

export default function ReturnBikeModal({ vehicle, onClose, onComplete }) {
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [hasAdditionalFee, setHasAdditionalFee] = useState(false);
  const [additionalFee, setAdditionalFee] = useState(0);
  const [feeReason, setFeeReason] = useState('');
  const [bikeCondition, setBikeCondition] = useState('good'); // good, damaged, broken
  const [finalBattery, setFinalBattery] = useState(100); // Battery percentage when returned

  const handleReturnBike = async () => {
    if (!vehicle?.rentalID) {
      alert('❌ Không tìm thấy thông tin Rental ID!');
      return;
    }

    // Validate additional fee if selected
    if (hasAdditionalFee) {
      if (additionalFee <= 0) {
        alert('⚠️ Vui lòng nhập số tiền phát sinh!');
        return;
      }
      if (!feeReason.trim()) {
        alert('⚠️ Vui lòng nhập lý do phát sinh phí!');
        return;
      }
    }

    const confirmMessage = hasAdditionalFee
      ? `Xác nhận thu hồi xe từ khách hàng ${vehicle.customerName}?\n\n💰 Phí phát sinh: ${formatCurrency(additionalFee)}\n📝 Lý do: ${feeReason}`
      : `Xác nhận thu hồi xe từ khách hàng ${vehicle.customerName}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      
      if (!token) {
        alert('❌ Không tìm thấy token xác thực!');
        return;
      }

      console.log(`🔄 [RETURN BIKE] Calling API for rental ID: ${vehicle.rentalID}`);
      console.log(`💰 Additional fee: ${hasAdditionalFee ? additionalFee : 0}`);
      console.log(`📝 Fee reason: ${hasAdditionalFee ? feeReason : 'N/A'}`);
      console.log(`🔧 Bike condition: ${bikeCondition}`);
      console.log(`🔋 Final battery: ${finalBattery}%`);

      const returnDate = new Date().toISOString();
      const requestBody = {
        rentalID: vehicle.rentalID,
        finalBattery: finalBattery,
        finalBikeCondition: bikeCondition,
        note: notes || null,
        returnDate: returnDate,
        fee: hasAdditionalFee ? additionalFee : 0
      };

      console.log('📤 [RETURN BIKE] Request body:', requestBody);

      const response = await fetch(
        `http://localhost:5168/api/Rental/ReturnBike`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [RETURN BIKE] API Error:', response.status, errorText);
        alert(`❌ Lỗi thu hồi xe: ${response.status} - ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log('✅ [RETURN BIKE] Bike returned successfully:', result);
      
      const successMessage = hasAdditionalFee
        ? `✅ Thu hồi xe thành công!\n💰 Phí phát sinh: ${formatCurrency(additionalFee)}`
        : '✅ Thu hồi xe thành công!';
      
      alert(successMessage);
      
      if (onComplete) {
        onComplete(vehicle);
      }
      
      onClose();
    } catch (error) {
      console.error('❌ [RETURN BIKE] Error:', error);
      alert(`❌ Có lỗi xảy ra: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>🔄 Thu Hồi Xe</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="rental-info-section" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
              📋 Thông tin đơn thuê
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', fontWeight: '600', color: '#666', width: '40%' }}>🆔 Rental ID:</td>
                  <td style={{ padding: '10px 0' }}>#{vehicle?.rentalID}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', fontWeight: '600', color: '#666' }}>👤 Khách hàng:</td>
                  <td style={{ padding: '10px 0' }}>{vehicle?.customerName}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', fontWeight: '600', color: '#666' }}>📞 Số điện thoại:</td>
                  <td style={{ padding: '10px 0' }}>{vehicle?.userPhone}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', fontWeight: '600', color: '#666' }}>🏍️ Xe:</td>
                  <td style={{ padding: '10px 0' }}>{vehicle?.vehicleName} - {vehicle?.licensePlate}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', fontWeight: '600', color: '#666' }}>📅 Ngày thuê:</td>
                  <td style={{ padding: '10px 0' }}>{formatDate(vehicle?.startDate)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', fontWeight: '600', color: '#666' }}>📅 Ngày trả dự kiến:</td>
                  <td style={{ padding: '10px 0' }}>{formatDate(vehicle?.endDate)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', fontWeight: '600', color: '#666' }}>💰 Tổng tiền:</td>
                  <td style={{ padding: '10px 0', color: '#2196F3', fontWeight: '600' }}>
                    {formatCurrency(vehicle?.totalCost)}
                  </td>
                </tr>
              </tbody>
            </table>

            {vehicle?.isOverdue && (
              <div style={{ 
                marginTop: '15px',
                padding: '12px', 
                background: '#fff3cd', 
                borderRadius: '6px',
                border: '1px solid #ffc107',
                textAlign: 'center'
              }}>
                <span style={{ color: '#856404', fontWeight: '600' }}>
                  ⚠️ Xe quá hạn {vehicle.overdueHours} giờ
                </span>
              </div>
            )}
          </div>

          <div className="additional-fee-section" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
              💵 Phí phát sinh
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="additionalFee"
                  checked={!hasAdditionalFee}
                  onChange={() => {
                    setHasAdditionalFee(false);
                    setAdditionalFee(0);
                    setFeeReason('');
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '15px' }}>✅ Không có phí phát sinh</span>
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="additionalFee"
                  checked={hasAdditionalFee}
                  onChange={() => setHasAdditionalFee(true)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '15px' }}>💰 Có phí phát sinh</span>
              </label>
            </div>

            {hasAdditionalFee && (
              <div style={{ 
                padding: '15px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
                    💵 Số tiền phát sinh: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={additionalFee}
                    onChange={(e) => setAdditionalFee(Number(e.target.value))}
                    placeholder="Nhập số tiền (VND)"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '15px'
                    }}
                  />
                  {additionalFee > 0 && (
                    <div style={{ marginTop: '8px', color: '#2196F3', fontWeight: '600' }}>
                      = {formatCurrency(additionalFee)}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
                    📝 Lý do phát sinh phí: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <textarea
                    value={feeReason}
                    onChange={(e) => setFeeReason(e.target.value)}
                    placeholder="Nhập lý do (ví dụ: Xe bị trầy xước, thiếu phụ kiện...)"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="battery-section" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
              🔋 Mức pin khi trả xe <span style={{ color: 'red' }}>*</span>
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={finalBattery}
                onChange={(e) => setFinalBattery(Number(e.target.value))}
                style={{
                  flex: 1,
                  height: '8px',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                minWidth: '80px',
                padding: '10px 20px',
                background: finalBattery >= 80 ? '#4CAF50' : finalBattery >= 40 ? '#FF9800' : '#f44336',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '18px',
                textAlign: 'center'
              }}>
                {finalBattery}%
              </div>
            </div>
            
            <div style={{ 
              marginTop: '10px', 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666'
            }}>
              <span>0%</span>
              <span style={{ color: finalBattery >= 80 ? '#4CAF50' : finalBattery >= 40 ? '#FF9800' : '#f44336', fontWeight: '600' }}>
                {finalBattery >= 80 ? '✅ Tốt' : finalBattery >= 40 ? '⚠️ Trung bình' : '❌ Thấp'}
              </span>
              <span>100%</span>
            </div>
          </div>

          <div className="bike-condition-section" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
              🔧 Tình trạng xe <span style={{ color: 'red' }}>*</span>
            </h3>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <label style={{ 
                flex: '1', 
                minWidth: '150px',
                padding: '12px', 
                border: bikeCondition === 'good' ? '2px solid #4CAF50' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                background: bikeCondition === 'good' ? '#f1f8f4' : 'white',
                transition: 'all 0.3s'
              }}>
                <input
                  type="radio"
                  name="bikeCondition"
                  value="good"
                  checked={bikeCondition === 'good'}
                  onChange={(e) => setBikeCondition(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: '600', color: bikeCondition === 'good' ? '#4CAF50' : '#666' }}>
                  ✅ Tốt
                </span>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '24px' }}>
                  Không có vấn đề
                </div>
              </label>

              <label style={{ 
                flex: '1', 
                minWidth: '150px',
                padding: '12px', 
                border: bikeCondition === 'damaged' ? '2px solid #FF9800' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                background: bikeCondition === 'damaged' ? '#fff8f0' : 'white',
                transition: 'all 0.3s'
              }}>
                <input
                  type="radio"
                  name="bikeCondition"
                  value="damaged"
                  checked={bikeCondition === 'damaged'}
                  onChange={(e) => setBikeCondition(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: '600', color: bikeCondition === 'damaged' ? '#FF9800' : '#666' }}>
                  ⚠️ Hư hỏng nhẹ
                </span>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '24px' }}>
                  Trầy xước, móp méo
                </div>
              </label>

              <label style={{ 
                flex: '1', 
                minWidth: '150px',
                padding: '12px', 
                border: bikeCondition === 'broken' ? '2px solid #f44336' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                background: bikeCondition === 'broken' ? '#ffebee' : 'white',
                transition: 'all 0.3s'
              }}>
                <input
                  type="radio"
                  name="bikeCondition"
                  value="broken"
                  checked={bikeCondition === 'broken'}
                  onChange={(e) => setBikeCondition(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: '600', color: bikeCondition === 'broken' ? '#f44336' : '#666' }}>
                  ❌ Hư hỏng nặng
                </span>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '24px' }}>
                  Cần sửa chữa
                </div>
              </label>
            </div>
          </div>

          <div className="notes-section">
            <h3 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
              📝 Ghi chú
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú về tình trạng xe khi thu hồi (tùy chọn)..."
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </button>
          <button 
            className="btn-primary" 
            onClick={handleReturnBike}
            disabled={submitting}
            style={{
              background: submitting ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? '⏳ Đang xử lý...' : hasAdditionalFee ? `✅ Thu hồi (+ ${formatCurrency(additionalFee)})` : '✅ Xác nhận thu hồi'}
          </button>
        </div>
      </div>
    </div>
  );
}
