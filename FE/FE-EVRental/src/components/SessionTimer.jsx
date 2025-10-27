import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/SessionTimer.css';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 giờ
const WARNING_TIME = 5 * 60 * 1000; // Cảnh báo trước 5 phút

export default function SessionTimer() {
  const { user, logout } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!user) {
      setTimeRemaining(null);
      setShowWarning(false);
      return;
    }

    const updateTimer = () => {
      const loginTime = localStorage.getItem('ev_login_time');
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        const remaining = SESSION_TIMEOUT - elapsed;

        if (remaining > 0) {
          setTimeRemaining(remaining);
          setShowWarning(remaining <= WARNING_TIME);
        } else {
          setTimeRemaining(0);
        }
      }
    };

    // Cập nhật ngay lập tức
    updateTimer();

    // Cập nhật mỗi giây
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleExtendSession = () => {
    // Gia hạn session (reload lại thời gian)
    const newLoginTime = Date.now();
    localStorage.setItem('ev_login_time', newLoginTime.toString());
    setShowWarning(false);
    setTimeRemaining(SESSION_TIMEOUT);
    console.log('🔄 Session extended for 1 more hour');
  };

  if (!user || timeRemaining === null) {
    return null;
  }

  // Chỉ hiển thị khi còn dưới 5 phút
  if (!showWarning) {
    return null;
  }

  return (
    <div className="session-timer-warning">
      <div className="session-timer-content">
        <div className="timer-icon">⏰</div>
        <div className="timer-message">
          <h4>Phiên đăng nhập sắp hết hạn!</h4>
          <p>
            Phiên của bạn sẽ hết hạn sau{' '}
            <strong>{formatTime(timeRemaining)}</strong>
          </p>
        </div>
        <div className="timer-actions">
          <button 
            className="btn-extend" 
            onClick={handleExtendSession}
          >
            Gia hạn thêm 1 giờ
          </button>
          <button 
            className="btn-logout" 
            onClick={logout}
          >
            Đăng xuất ngay
          </button>
        </div>
      </div>
    </div>
  );
}
