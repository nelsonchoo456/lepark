import { Button, Divider, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

interface LoginStepProps {
  handleReturnToMain: () => void;
}

const LoginStep = ({ handleReturnToMain }: LoginStepProps) => {
  const navigate = useNavigate();

  const handleSubmit = (values: any) => {
    const { email, password } = values;
    navigate('/');
  };

  const handleReturnToPrev = () => {
    handleReturnToMain();
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="w-full">
      <Divider></Divider>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Please enter your Email' }]}
        >
          <Input placeholder="Email" variant="filled"/>
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your Password' }]}
        >
          <Input.Password placeholder="Password" variant="filled"/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Log In
          </Button>
        </Form.Item>
      </Form>
      <Divider><span className="text-secondary">or</span></Divider>
      <Button type="link" className="w-full justify-center" onClick={() => {console.log("keke")}}>
        Forgot Password?
      </Button>
      <Button type="link" className="w-full justify-center" onClick={handleGoToRegister}>
        Register
      </Button>
      {/* <Button type="link" className="w-full justify-center" onClick={handleReturnToPrev}>
        Continue using without Account
      </Button> */}
    </div>
  );
};

export default LoginStep;
