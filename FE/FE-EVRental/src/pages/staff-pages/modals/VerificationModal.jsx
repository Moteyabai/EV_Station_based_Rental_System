import React, { useState } from 'react';
import { getToken } from '../../../utils/auth';
import { useAuth } from '../../../contexts/AuthContext';

export default function VerificationModal({ customer, onClose, onVerify }) {
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [selectedImages, setSelectedImages] = useState({
    idFront: customer.idCardFrontImage,
    idBack: customer.idCardBackImage,
    licenseFront: customer.licenseFrontImage,
    licenseBack: customer.licenseBackImage
  });
  const [verificationNote, setVerificationNote] = useState('');
  const [isApproved, setIsApproved] = useState(null); // true = approve, false = reject

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const handleVerifyDocument = async (approved) => {
    setIsApproved(approved);
    
    if (!approved && !verificationNote.trim()) {
      alert('⚠️ Vui lòng nhập lý do từ chối!');
      return;
    }

    const confirmMessage = approved
      ? `✅ Xác nhận phê duyệt hồ sơ của khách hàng ${customer.fullName}?`
      : `❌ Xác nhận từ chối hồ sơ của khách hàng ${customer.fullName}?\n\nLý do: ${verificationNote}`;

    if (!window.confirm(confirmMessage)) {
      setIsApproved(null);
      return;
    }

    try {
      setVerifying(true);
      const token = getToken();
      
      if (!token) {
        alert('❌ Không tìm thấy token xác thực!');
        return;
      }

      const staffAccountID = user?.accountID || user?.AccountID;
      if (!staffAccountID) {
        alert('❌ Không tìm thấy thông tin nhân viên!');
        return;
      }

      console.log(`🔄 [VERIFY] Calling API for document ID: ${customer.id}`);
      console.log(`📝 Status: ${approved ? 'Approved (1)' : 'Rejected (2)'}`);
      console.log(`💬 Note: ${verificationNote || 'N/A'}`);
      console.log(`👤 Staff Account ID: ${staffAccountID}`);

      const requestBody = {
        documentID: customer.id,
        status: approved ? 1 : 2, // 1 = Approved, 2 = Rejected
        note: verificationNote || null,
        verifiedByStaffID: staffAccountID,
        dateOfBirth: customer.dateOfBirth && customer.dateOfBirth !== 'N/A' ? customer.dateOfBirth : null,
        name: customer.fullName || customer.userName || null,
        licenseNumber: customer.driverLicense || null,
        idNumber: customer.idCard || null
      };

      console.log('📤 [VERIFY] Request body:', requestBody);

      const response = await fetch(
        `http://localhost:5168/api/IDDocument/VerifyDocument`,
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
        console.error('❌ [VERIFY] API Error:', response.status, errorText);
        alert(`❌ Lỗi xác thực: ${response.status} - ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log('✅ [VERIFY] Document verified successfully:', result);
      
      alert(approved 
        ? '✅ Hồ sơ đã được phê duyệt thành công!' 
        : '❌ Hồ sơ đã bị từ chối!');
      
      if (onVerify) {
        onVerify(customer);
      }
      
      onClose();
    } catch (error) {
      console.error('❌ [VERIFY] Error:', error);
      alert(`❌ Có lỗi xảy ra: ${error.message}`);
    } finally {
      setVerifying(false);
      setIsApproved(null);
    }
  };

  const openImageInNewTab = (imageUrl) => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content verification-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h2>🔐 Xác thực hồ sơ khách hàng</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body" style={{ padding: '2rem' }}>
          {/* Customer Info Section */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '0.8rem' }}>
              👤 Thông tin khách hàng
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '0.8rem', background: 'white', borderRadius: '8px' }}>
                <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '120px' }}>👤 Họ tên:</span>
                <span style={{ fontWeight: '700', color: '#2c3e50' }}>{customer.userName}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '0.8rem', background: 'white', borderRadius: '8px' }}>
                <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '120px' }}>📱 Điện thoại:</span>
                <span style={{ fontWeight: '700', color: '#2c3e50' }}>{customer.phone}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '0.8rem', background: 'white', borderRadius: '8px' }}>
                <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '120px' }}>📧 Email:</span>
                <span style={{ fontWeight: '600', color: '#2c3e50', fontSize: '0.9rem' }}>{customer.email}</span>
              </div>
              
            </div>
          </div>

          {/* ID Card Section */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '0.8rem' }}>
              🆔 CMND/CCCD
            </h3>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'white', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '120px' }}>Số CMND/CCCD:</span>
                <span style={{ fontWeight: '700', color: '#2c3e50', fontSize: '1.1rem', fontFamily: 'monospace', background: '#e3f2fd', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>
                  {customer.idCard}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h4 style={{ marginBottom: '0.8rem', color: '#495057', fontSize: '0.95rem' }}>📄 Mặt trước</h4>
                {selectedImages.idFront ? (
                  <div style={{ position: 'relative', border: '2px solid #dee2e6', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => openImageInNewTab(selectedImages.idFront)}>
                    <img src={selectedImages.idFront} alt="ID Front" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                      🔍 Click để phóng to
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '200px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    ❌ Chưa có ảnh
                  </div>
                )}
              </div>
              
              <div>
                <h4 style={{ marginBottom: '0.8rem', color: '#495057', fontSize: '0.95rem' }}>📄 Mặt sau</h4>
                {selectedImages.idBack ? (
                  <div style={{ position: 'relative', border: '2px solid #dee2e6', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => openImageInNewTab(selectedImages.idBack)}>
                    <img src={selectedImages.idBack} alt="ID Back" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                      🔍 Click để phóng to
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '200px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    ❌ Chưa có ảnh
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Driver License Section */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '0.8rem' }}>
              🪪 Giấy phép lái xe
            </h3>
            
            <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '100px' }}>Số GPLX:</span>
                  <span style={{ fontWeight: '700', color: '#2c3e50', fontSize: '1.1rem', fontFamily: 'monospace', background: '#fff3e0', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>
                    {customer.driverLicense}
                  </span>
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#6c757d', minWidth: '100px' }}>Ngày hết hạn:</span>
                  <span style={{ fontWeight: '700', color: '#2c3e50' }}>{formatDate(customer.licenseExpiry)}</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h4 style={{ marginBottom: '0.8rem', color: '#495057', fontSize: '0.95rem' }}>📄 Mặt trước</h4>
                {selectedImages.licenseFront ? (
                  <div style={{ position: 'relative', border: '2px solid #dee2e6', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => openImageInNewTab(selectedImages.licenseFront)}>
                    <img src={selectedImages.licenseFront} alt="License Front" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                      🔍 Click để phóng to
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '200px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    ❌ Chưa có ảnh
                  </div>
                )}
              </div>
              
              <div>
                <h4 style={{ marginBottom: '0.8rem', color: '#495057', fontSize: '0.95rem' }}>📄 Mặt sau</h4>
                {selectedImages.licenseBack ? (
                  <div style={{ position: 'relative', border: '2px solid #dee2e6', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => openImageInNewTab(selectedImages.licenseBack)}>
                    <img src={selectedImages.licenseBack} alt="License Back" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                      🔍 Click để phóng to
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '200px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    ❌ Chưa có ảnh
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Note */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <h3 style={{ marginBottom: '1rem', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '0.8rem' }}>
              📝 Ghi chú xác thực
            </h3>
            <textarea
              value={verificationNote}
              onChange={(e) => setVerificationNote(e.target.value)}
              placeholder="Nhập ghi chú (bắt buộc nếu từ chối)..."
              rows="4"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #dee2e6',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
        
        <div className="modal-footer" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', padding: '1.5rem', borderTop: '2px solid #e9ecef' }}>
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={verifying}
            style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
          >
            ❌ Đóng
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => handleVerifyDocument(false)}
            disabled={verifying}
            style={{ 
              padding: '0.8rem 2rem', 
              fontSize: '1rem',
              background: verifying && isApproved === false ? '#ccc' : 'linear-gradient(135deg, #e74c3c, #c0392b)',
              cursor: verifying ? 'not-allowed' : 'pointer'
            }}
          >
            {verifying && isApproved === false ? '⏳ Đang xử lý...' : '❌ Từ chối'}
          </button>
          <button 
            className="btn-primary" 
            onClick={() => handleVerifyDocument(true)}
            disabled={verifying}
            style={{ 
              padding: '0.8rem 2rem', 
              fontSize: '1rem',
              background: verifying && isApproved === true ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
              cursor: verifying ? 'not-allowed' : 'pointer'
            }}
          >
            {verifying && isApproved === true ? '⏳ Đang xử lý...' : '✅ Phê duyệt'}
          </button>
        </div>
      </div>
    </div>
  );
}
