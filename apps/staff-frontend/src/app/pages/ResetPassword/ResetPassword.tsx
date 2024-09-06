import { LoginLayout, LoginPanel, Logo, LogoText } from '@lepark/common-ui';
import { Button, Divider, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import LoginAnnouncements from '../Login/components/LoginAnnouncements';

const ResetPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (values: any) => {
    const { email, password } = values;
    navigate('/');
  };
  
  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <LoginLayout>
      <LoginPanel>
        <div className="flex items-center flex-col w-full max-w-screen-sm p-2 md:p-16">
          <div className="flex items-center gap-4">
            <Logo size={2.5} />
            <LogoText className="text-3xl">Leparks</LogoText>
          </div>
          <div className="w-full">
            <Divider>Forgot Password</Divider>
            <Form
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="password"
                label="New Password"
                rules={[{ required: true, message: 'Please enter a new Password' }]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                rules={[{ required: true, message: 'Please re-enter the new Password' }]}
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
              Reset Password
            </Button>
          </div>
        </div>
      </LoginPanel>
      <LoginAnnouncements />
    </LoginLayout>
    
  );
};

export default ResetPassword;
