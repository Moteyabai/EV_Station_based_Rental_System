import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/auth';
import Pagination from './components/Pagination';
import VerificationModal from './modals/VerificationModal';
import ProfileViewModal from './modals/ProfileViewModal';

export default function CustomerVerification() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPendingIDDocuments();
    const interval = setInterval(loadPendingIDDocuments, 30000);
    return () => clearInterval(interval);
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadPendingIDDocuments = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn("No token found, skipping API call");
        return;
      }

      const response = await fetch(
        "http://localhost:5168/api/IDDocument/IDDocumentPendingList",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch pending ID documents:", response.status);
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const mappedCustomers = data.map((item, idx) => ({
          id: item.documentID ?? idx,
          fullName: item.fullName ?? "N/A",
          userName: item.userName ?? "N/A",
          phone: item.phone ?? item.phoneNumber ?? "N/A",
          email: item.email ?? "N/A",
          dateOfBirth: item.dateOfBirth ?? "N/A",
          idCard: item.idNumber ?? item.idCard ?? "N/A",
          driverLicense: item.licenseNumber ?? item.driverLicense ?? "N/A",
          licenseExpiry: item.licenseExpiry ?? item.licenseExpiryDate ?? "N/A",
          status: item.status,
          idCardFrontImage: item.idCardFront ?? null,
          idCardBackImage: item.idCardBack ?? null,
          licenseFrontImage: item.licenseCardFront ?? null,
          licenseBackImage: item.licenseCardBack ?? null,
          bookingId: `BK-${item.documentID || idx}`,
        }));

        setCustomers(mappedCustomers);
        console.log("Loaded pending ID documents:", mappedCustomers.length);
      }
    } catch (error) {
      console.error("Error fetching pending ID documents:", error);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleVerify = (customer) => {
    setSelectedCustomer(customer);
    setShowVerifyModal(true);
  };

  const handleViewProfile = (customer) => {
    setSelectedCustomer(customer);
    setShowProfileModal(true);
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
        {paginatedCustomers.length === 0 && (
          <div className="empty-state">
            <p>📭 {searchTerm ? `Không tìm thấy khách hàng với từ khóa: "${searchTerm}"` : 'Không có khách hàng nào cần xác thực'}</p>
          </div>
        )}

        {paginatedCustomers.map((customer) => (
          <div key={customer.id} className="customer-card">
            <div className="customer-header">
              <div className="customer-info">
                <h3>{customer.userName}</h3>
                <span className="booking-badge">📋 {customer.bookingId}</span>
              </div>
              <span
                className={`verify-badge ${
                  customer.status == 1 ? "verified" : "pending"
                }`}
              >
                {customer.status == 1 ? "✅ Đã xác thực" : "⏳ Chưa xác thực"}
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
              </div>
            </div>

            <div className="customer-actions">
              <button
                className="btn-action btn-verify"
                onClick={() => handleVerify(customer)}
              >
                {customer.verified ? "✅ Xem hồ sơ" : "✅ Xác nhận hồ sơ"}
              </button>
              <button className="btn-action btn-photo">📸 Chụp giấy tờ</button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredCustomers.length}
        />
      )}

      {showVerifyModal && selectedCustomer && (
        <VerificationModal
          customer={selectedCustomer}
          onClose={() => {
            setShowVerifyModal(false);
            setSelectedCustomer(null);
          }}
          onVerify={() => {
            console.log("✅ [VERIFICATION] Customer verified, reloading list...");
            loadPendingIDDocuments();
            setShowVerifyModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {showProfileModal && selectedCustomer && (
        <ProfileViewModal
          customer={selectedCustomer}
          onClose={(updatedData) => {
            if (updatedData) {
              setCustomers(
                customers.map((c) =>
                  c.id === selectedCustomer.id ? { ...c, ...updatedData } : c
                )
              );
            }
            setShowProfileModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}
