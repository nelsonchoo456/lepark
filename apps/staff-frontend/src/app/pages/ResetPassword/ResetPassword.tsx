import { LoginLayout, LoginPanel, Logo, LogoText } from '@lepark/common-ui';
import { Button, Divider, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import LoginAnnouncements from '../Login/components/LoginAnnouncements';
import { resetStaffPassword } from '@lepark/data-access';

const ResetPassword = () => {
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token');

  const handleSubmit = async (values: any) => {
    const { password, confirmPassword } = values;

    if (password !== confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    if (token) {
      try {
        const response = await resetStaffPassword({ token, newPassword: password });

        if (response.status === 200) {
          message.success('Password reset successful');

          setTimeout(() => {
            navigate('/login');
          }, 1000);
        }
      } catch (error) {       
        message.error(String(error));
      }
    }
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
            <Divider>Reset Password</Divider>
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="password" label="New Password" rules={[
          { required: true, message: 'Please enter a new Password.' },
          { pattern: /^.{8,}$/, message: 'Password must be at least 8 characters long.' }
        ]}>
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
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </LoginPanel>
      <LoginAnnouncements />
    </LoginLayout>
  );
};

export default ResetPassword;
