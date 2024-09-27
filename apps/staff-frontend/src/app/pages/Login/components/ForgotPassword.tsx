import { Button, Divider, Form, Input, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotStaffPassword } from '@lepark/data-access';

interface ForgotPasswordProps {
  goToLogin: () => void;
}
const ForgotPassword = ({ goToLogin }: ForgotPasswordProps) => {
  const navigate = useNavigate();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (values: any) => {
    setEmail(values.email);
    try {
      await forgotStaffPassword(values);
      setIsEmailSent(true);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('Invalid email address')) {
        message.error('Invalid email format.');
      } else {
        // message.error('If the email exists, a reset link has been sent.');
        setIsEmailSent(true);
      }
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
        <><div className="text-secondary text-center">An email has been sent to <b>{email}</b>. If an account is registered with this email address, you will receive a password reset link. </div>
        <br/>
        <div className="text-secondary text-center"> Please check your inbox to reset your password.</div></> 
      ) : (
        <Form layout="vertical" onFinish={handleSubmit}>
          <div className="text-secondary">Please enter your email address. A link to reset your password will be sent to you.</div>
          <br />
          <Form.Item name="email" label="Email" rules={[
            { required: true, message: 'Please input an email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}>
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
      <div className="flex justify-center">
        <Button type="link" onClick={handleReturnToLogin}>
          Return to Log In
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
