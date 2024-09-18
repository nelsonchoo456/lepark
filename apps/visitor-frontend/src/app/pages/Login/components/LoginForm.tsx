import { useAuth } from '@lepark/common-ui';
import { Button, Divider, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface LoginStepProps {
  goToForgotPassword: () => void;
}

const LoginStep = ({ goToForgotPassword }: LoginStepProps) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values: any) => {
    const { email, password } = values;
    try {
      await login(email, password);
      message.success('Login successful');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('Invalid email address')) {
        message.error('Invalid email format.');
      } else {
        message.error(errorMessage || 'Failed to update staff details.');
      }
    }
  };

  const handleGoToForgotPassword = () => {
    goToForgotPassword();
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  const handleContinueWithoutAcc = () => {
    navigate('/');
  };

  return (
    <div className="w-full">
      <Divider></Divider>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email'}]}>
          <Input placeholder="Email"/>
        </Form.Item>

        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter your password' }]}>
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Log In
          </Button>
        </Form.Item>
      </Form>
      <Divider>
        <span className="text-secondary">or</span>
      </Divider>
      <div className="flex flex-col items-center">
        <Button type="link" onClick={handleGoToForgotPassword}>
          Forgot Password?
        </Button>
        <Button type="link" onClick={handleGoToRegister}>
          Register
        </Button>
      </div>
      {/* <Button type="link" className="w-full justify-center" onClick={handleReturnToPrev}>
        Continue using without Account
      </Button> */}
    </div>
  );
};

export default LoginStep;
