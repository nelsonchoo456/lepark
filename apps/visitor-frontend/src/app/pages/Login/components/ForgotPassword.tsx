import { Button, Divider, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

interface ForgotPasswordProps {
  goToLogin: () => void;
}
const ForgotPassword = ({ goToLogin }: ForgotPasswordProps) => {
  const navigate = useNavigate();

  const handleSubmit = (values: any) => {
    const { email, password } = values;
    navigate('/');
  };
  
  const handleReturnToLogin = () => {
    goToLogin()
  };

  const handleGoToRegister = () => {
    navigate('/register')
  };

  return (
    <div className="w-full">
      <Divider>Reset Password</Divider>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div className='text-secondary'>Please enter your email address. A link to reset your password will be sent to you.</div>
        <br/>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Please enter your Email' }]}
        >
          <Input placeholder="Email" variant="filled" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Continue
          </Button>
        </Form.Item>
      </Form>
      <Divider><span className="text-secondary">or</span></Divider>
      <Button type="link" className="w-full justify-center" onClick={handleReturnToLogin}>
        Return to Log In
      </Button>
      <Button type="link" className="w-full justify-center" onClick={handleGoToRegister}>
        <div className='text-black opacity-50'>Don't have an account with us? </div>Sign up
      </Button>
    </div>
  );
};

export default ForgotPassword;
