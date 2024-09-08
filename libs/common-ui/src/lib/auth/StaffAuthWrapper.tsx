import React, { ReactNode } from 'react';
import { AuthWrapper } from './AuthContext';
import { loginStaff, fetchStaff, logoutStaff } from '@lepark/data-access';

interface StaffAuthWrapperProps {
  children: ReactNode;
}

export const StaffAuthWrapper: React.FC<StaffAuthWrapperProps> = ({ children }) => (
  <AuthWrapper loginApi={loginStaff} logoutApi={logoutStaff} fetchUserApi={fetchStaff}>
    {children}
  </AuthWrapper>
);
