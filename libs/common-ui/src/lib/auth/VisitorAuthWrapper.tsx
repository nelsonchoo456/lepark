import React, { ReactNode } from 'react';
import { AuthWrapper } from './AuthContext';
import { loginVisitor, logoutVisitor, fetchVisitor } from '@lepark/data-access';

interface VisitorAuthWrapperProps {
  children: ReactNode;
}

export const VisitorAuthWrapper: React.FC<VisitorAuthWrapperProps> = ({ children }) => (
  <AuthWrapper loginApi={loginVisitor} logoutApi={logoutVisitor} fetchUserApi={fetchVisitor}>
    {children}
  </AuthWrapper>
);
