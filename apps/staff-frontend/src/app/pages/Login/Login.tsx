import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { Divider, LoginLayout, LoginPanel, Logo, LogoText } from '@lepark/common-ui';
import LoginAnnouncements from './components/LoginAnnouncements';
import LoginStep from './components/LoginStep';
import ForgotPassword from './components/ForgotPassword';
import { useNavigate } from 'react-router-dom';
import { fetchStaff } from '@lepark/data-access';

const Login = () => {
  const [inloginStep, setInLoginStep] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleGoToForgotPassword = () => {
    setInLoginStep(false);
  };

  const handleGoToLogin = () => {
    setInLoginStep(true);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetchStaff();

        if (response.status === 200) {
          // If the response is OK, it means we have a valid JWT token
          navigate('/');
        }
      } catch (error) {}
    };

    checkAuthStatus();
  }, [navigate]);

  return (
    <LoginLayout>
      <LoginPanel>
        <div className="flex items-center flex-col w-full max-w-screen-sm p-2 md:p-16">
          <div className="flex items-center gap-4">
            <Logo size={2.5} />
            <LogoText className="text-3xl">Lepark Staff</LogoText>
          </div>
          {inloginStep ? <LoginStep goToForgotPassword={handleGoToForgotPassword} /> : <ForgotPassword goToLogin={handleGoToLogin} />}
        </div>
      </LoginPanel>
      <LoginAnnouncements />
    </LoginLayout>
  );
};

export default Login;
