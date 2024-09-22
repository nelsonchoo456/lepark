import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyVisitor, VisitorResponse } from '@lepark/data-access';
import VerificationSuccess from './components/VerificationSuccess';
import VerificationError from './components/VerificationError';
import { LoginLayout, LoginPanel, Logo, LogoText, useAuth } from '@lepark/common-ui';

const VerifyUser: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired' | 'verified'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const { logout } = useAuth<VisitorResponse>();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyVisitor({ token })
        .then((response) => {
          if (response.status === 200) {
            setStatus('success');
            logout();
          } 
        })
        .catch((error: any) => {
          console.error(error);
          const errorMessage = error.message || error.toString();
          console.log('Error message:', errorMessage);
          if (errorMessage.includes('TokenExpiredError') || errorMessage.includes('expired')) {
            setStatus('expired');
            setErrorMessage('Verification link has expired. Please request a new one.');
          } else if (errorMessage.includes('Invalid token')) {
            setStatus('error');
            setErrorMessage('Invalid verification token. Please try again or request a new one.');
          } else if (errorMessage.includes('Visitor already verified')) {
            setStatus('verified');
            setErrorMessage('Your account has already been verified.');
          } else {
            setStatus('error');
            setErrorMessage('Verification failed. Please try again.');
          }
          console.log('New status:', status);
        });
    } else {
      setStatus('error');
      setErrorMessage('Invalid verification link.');
    }
  }, [searchParams]);

  useEffect(() => {
    console.log('Current status:', status);
  }, [status]);

  if (status === 'verifying') {
    return (
      <LoginLayout>
        <LoginPanel>
          <div className="flex items-center flex-col w-full max-w-screen-sm p-2 md:p-16">
            <div className="flex items-center gap-4">
              <Logo size={2.5} />
              <LogoText className="text-3xl">Lepark</LogoText>
            </div>
            <p>Verifying email...</p>
          </div>
        </LoginPanel>
      </LoginLayout>
    );
  } else if (status === 'success' || status === 'verified') {
    return (
      <LoginLayout>
        <LoginPanel>
          <div className="flex items-center flex-col w-full max-w-screen-sm p-2 md:p-16">
            <div className="flex items-center gap-4">
              <Logo size={2.5} />
              <LogoText className="text-3xl">Lepark</LogoText>
            </div>
            <VerificationSuccess message={errorMessage} />
          </div>
        </LoginPanel>
      </LoginLayout>
    );
  } else {
    return (
      <LoginLayout>
        <LoginPanel>
          <div className="flex items-center flex-col w-full max-w-screen-sm p-2 md:p-16">
            <div className="flex items-center gap-4">
              <Logo size={2.5} />
              <LogoText className="text-3xl">Lepark</LogoText>
            </div>
            <VerificationError message={errorMessage} />
          </div>
        </LoginPanel>
      </LoginLayout>
    );
  }
};

export default VerifyUser;
