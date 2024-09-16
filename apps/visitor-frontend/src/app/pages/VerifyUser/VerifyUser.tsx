import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyVisitor, VisitorResponse } from '@lepark/data-access';
import VerificationSuccess from './components/VerificationSuccess';
import VerificationError from './components/VerificationError';
import { LoginLayout, LoginPanel, Logo, LogoText, useAuth } from '@lepark/common-ui';

const VerifyUser: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
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
          } else {
            setStatus('error');
            setErrorMessage('Verification failed. Please try again.');
          }
        })
        .catch((error) => {
          setStatus('error');
          setErrorMessage('Verification failed. Please try again.');
        });
    } else {
      setStatus('error');
      setErrorMessage('Invalid verification link.');
    }
  }, [searchParams]);

  if (status === 'verifying') {
    return (
      <LoginLayout>
        <LoginPanel>
          <div className="flex items-center flex-col w-full max-w-screen-sm p-2 md:p-16">
            <div className="flex items-center gap-4">
              <Logo size={2.5} />
              <LogoText className="text-3xl">Leparks</LogoText>
            </div>
            <p>Verifying email...</p>
          </div>
        </LoginPanel>
      </LoginLayout>
    );
  } else if (status === 'success') {
    return (
      <LoginLayout>
        <LoginPanel>
          <div className="flex items-center flex-col w-full max-w-screen-sm p-2 md:p-16">
            <div className="flex items-center gap-4">
              <Logo size={2.5} />
              <LogoText className="text-3xl">Leparks</LogoText>
            </div>
            <VerificationSuccess />
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
              <LogoText className="text-3xl">Leparks</LogoText>
            </div>
            <VerificationError message={errorMessage} />
          </div>
        </LoginPanel>
      </LoginLayout>
    );
  }
};

export default VerifyUser;
