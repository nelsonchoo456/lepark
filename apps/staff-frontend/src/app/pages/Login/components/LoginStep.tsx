import { Button, Divider, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@lepark/common-ui';

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
    } catch (error) {
      message.error(String(error));
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
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your Email' }]}>
          <Input placeholder="Email" />
        </Form.Item>

        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter your Password' }]}>
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
      <Button type="link" className="w-full justify-center" onClick={handleGoToForgotPassword}>
        Forgot Password?
      </Button>
      {/* <Button type="link" className="w-full justify-center" onClick={handleGoToRegister}>
        Register
      </Button> */}
    </div>
  );
};

export default LoginStep;
