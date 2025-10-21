import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component phân quyền dựa trên role
 * @param {Array|Number} allowedRoles - Mảng các roleID được phép hoặc một roleID
 * @param {Array|Number} blockedRoles - Mảng các roleID bị chặn hoặc một roleID
 * @param {String} redirectTo - Đường dẫn redirect khi không có quyền
 * @param {ReactNode} children - Component con
 */
export default function RoleBasedRoute({ 
  allowedRoles, 
  blockedRoles, 
  redirectTo,
  children 
}) {
  const { user } = useAuth();
  
  // Nếu chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRoleId = user?.roleID || user?.RoleID;

  // Kiểm tra blocked roles trước
  if (blockedRoles) {
    const blocked = Array.isArray(blockedRoles) ? blockedRoles : [blockedRoles];
    if (blocked.includes(userRoleId)) {
      // Redirect dựa vào role của user
      if (userRoleId === 2) {
        return <Navigate to="/staff" replace />;
      } else if (userRoleId === 3) {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  // Kiểm tra allowed roles
  if (allowedRoles) {
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!allowed.includes(userRoleId)) {
      // Redirect về trang phù hợp với role
      if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
      }
      
      if (userRoleId === 2) {
        return <Navigate to="/staff" replace />;
      } else if (userRoleId === 3) {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
}
