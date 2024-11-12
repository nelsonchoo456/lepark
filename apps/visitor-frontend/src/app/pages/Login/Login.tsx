import { useState } from 'react';
import { Button, Grid } from 'antd';
import { Divider, LoginLayout, LoginPanel, Logo, LogoText } from '@lepark/common-ui';
import LoginAnnouncements from './components/LoginAnnouncements';
import LoginStep from './components/LoginForm';
import ForgotPassword from './components/ForgotPassword';
import { Link } from 'react-router-dom';

const { useBreakpoint } = Grid;

const Login = () => {
  const [inloginStep, setInLoginStep] = useState<boolean>(true);
  const screens = useBreakpoint();

  const handleGoToForgotPassword = () => {
    setInLoginStep(false);
  };

  const handleGoToLogin = () => {
    setInLoginStep(true);
  };

  return (
    <LoginLayout>
      <LoginPanel>
        <div className="flex items-center flex-col w-full max-w-screen-sm p-2 md:p-16">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo size={2.5} />{' '}
            </Link>
            <Link to="/">
              <LogoText className="text-3xl">Lepark</LogoText>
            </Link>
          </div>
          {inloginStep ? <LoginStep goToForgotPassword={handleGoToForgotPassword} /> : <ForgotPassword goToLogin={handleGoToLogin} />}
        </div>
      </LoginPanel>
      {screens.lg && <LoginAnnouncements />}
    </LoginLayout>
  );
};

export default Login;
