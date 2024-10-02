import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { notification } from 'antd';
import { StaffResponse, StaffType } from '@lepark/data-access';
import { useAuth } from './AuthContext';

export interface RoleProtectedRouteProps {
  allowedRoles: StaffType[];
  redirectTo: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles, redirectTo }) => {
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  const mapRoleToStaffType = (role: string): StaffType | null => {
    switch (role) {
      case 'MANAGER':
        return StaffType.MANAGER;
      case 'BOTANIST':
        return StaffType.BOTANIST;
      case 'ARBORIST':
        return StaffType.ARBORIST;
      case 'LANDSCAPE_ARCHITECT':
        return StaffType.LANDSCAPE_ARCHITECT;
      case 'PARK_RANGER':
        return StaffType.PARK_RANGER;
      case 'VENDOR_MANAGER':
        return StaffType.VENDOR_MAANGER;
      case 'SUPERADMIN':
        return StaffType.SUPERADMIN;
      default:
        return null;
    }
  };

  useEffect(() => {
    const userRole = user ? mapRoleToStaffType(user.role) : null;
    if (user && userRole && !allowedRoles.includes(userRole) && !notificationShown.current) {
      notification.error({
        message: 'Access Denied',
        description: 'You are not allowed to access this page!',
      });
      notificationShown.current = true;
    }
  }, [user, allowedRoles]);

  const userRole = user ? mapRoleToStaffType(user.role) : null;
  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
