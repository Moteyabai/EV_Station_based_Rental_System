// Placeholder - sẽ được implement đầy đủ sau
import React from 'react';

export default function UpdateVehicleModal({ vehicle, onClose, onUpdate }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔄 Cập nhật Trạng thái Xe</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>Modal content sẽ được implement sau</p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
