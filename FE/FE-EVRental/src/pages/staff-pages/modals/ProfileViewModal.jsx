// Placeholder - sẽ được implement đầy đủ sau
import React from 'react';

export default function ProfileViewModal({ customer, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Giấy tờ khách hàng</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>Modal content sẽ được implement sau</p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
