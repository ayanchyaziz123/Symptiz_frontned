import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/index';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[]; // ['patient'] or ['doctor']
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, userType } = useAppSelector((state) => state.auth);

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated) {
    const loginPath = allowedRoles.includes('patient')
      ? '/patient/login'
      : '/doctor/login';
    return <Navigate to={loginPath} replace />;
  }

  // Authenticated but wrong role - redirect to their home
  if (userType && !allowedRoles.includes(userType)) {
    const homePath = userType === 'patient'
      ? '/patient/dashboard'
      : '/doctor/home';
    return <Navigate to={homePath} replace />;
  }

  // Correct role - render the protected content
  return <>{children}</>;
};

export default RoleProtectedRoute;
