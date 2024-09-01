import { Button, Divider, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (values: any) => {
    const { email, password } = values;
    navigate('/');
  };
  
  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="w-full">
      <Divider>Reset Password</Divider>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Please enter your Email' }]}
        >
          <Input placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your Password' }]}
        >
          <Input.Password placeholder="Password" />
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
    </div>
  );
};

export default ForgotPassword;
