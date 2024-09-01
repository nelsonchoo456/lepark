import { useState } from 'react';
import { Button } from 'antd';
import {
  Divider,
  LoginLayout,
  LoginPanel,
  Logo,
  LogoText,
} from '@lepark/common-ui';
import LoginAnnouncements from '../Login/components/LoginAnnouncements';
import LoginStep from './components/RegisterForm';

const Register = () => {
  const [inloginStep, setInLoginStep] = useState<boolean>(false);

  const handleReturnToMain = () => {
    setInLoginStep(false);
  }

  return (
    <LoginLayout>
      <LoginPanel>
        <div className="flex items-center flex-col w-full max-w-screen-sm p-2 md:p-16">
          <div className="flex items-center gap-4 mb-2"><Logo size={2.5}/></div>
          <LogoText className='text-3xl'>Create Account</LogoText>
          <LoginStep handleReturnToMain={handleReturnToMain}/>
        </div>
      </LoginPanel>
      <LoginAnnouncements/>
    </LoginLayout>
  );
};

export default Register;
