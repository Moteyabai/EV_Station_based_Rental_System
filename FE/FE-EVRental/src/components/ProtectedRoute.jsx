import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute - Component bảo vệ route dựa trên role
 * @param {React.Component} children - Component cần bảo vệ
 * @param {number|array} allowedRoles - Role ID được phép truy cập (1-Customer, 2-Staff, 3-Admin)
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // Kiểm tra user đã đăng nhập chưa
  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role có được phép không
  const userRoleId = user.roleID || user.RoleID;
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  console.log('ProtectedRoute: User roleID:', userRoleId, 'Allowed roles:', rolesArray);
  
  if (!rolesArray.includes(userRoleId)) {
    // Nếu không có quyền, chuyển về trang chủ
    console.log('ProtectedRoute: Access denied, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute: Access granted');
  // Nếu có quyền, hiển thị component
  return children;
}
