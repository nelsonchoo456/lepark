import { forgotVisitorPassword } from '@lepark/data-access';
import { Button, Divider, Form, Input, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ForgotPasswordProps {
  goToLogin: () => void;
}
const ForgotPassword = ({ goToLogin }: ForgotPasswordProps) => {
  const navigate = useNavigate();
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      await forgotVisitorPassword(values);
      setIsEmailSent(true);
    } catch (error) {
      message.error('Email does not exist.');
    }
  };

  const handleReturnToLogin = () => {
    goToLogin();
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="w-full">
      <Divider>Reset Password</Divider>
      {isEmailSent ? (
        <div className="text-secondary">An email has been sent to your address. Please check your inbox to reset your password.</div>
      ) : (
        <Form layout="vertical" onFinish={handleSubmit}>
          <div className="text-secondary">Please enter your email address. A link to reset your password will be sent to you.</div>
          <br />
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}>
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Continue
            </Button>
          </Form.Item>
        </Form>
      )}
      <Divider>
        <span className="text-secondary">or</span>
      </Divider>
      <div className="flex flex-col items-center">
        <Button type="link" onClick={handleReturnToLogin}>
          Return to Log In
        </Button>
        <Button type="link" onClick={handleGoToRegister}>
          <div className="text-black opacity-50">Don't have an account with us?</div>
          Sign up
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
