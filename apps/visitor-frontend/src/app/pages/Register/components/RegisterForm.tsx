import { registerVisitor, RegisterVisitorData } from '@lepark/data-access';
import { Button, Divider, Form, Input, Row, Col, message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface LoginStepProps {
  handleReturnToMain: () => void;
}

const LoginStep = ({ handleReturnToMain }: LoginStepProps) => {
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    const { password, confirmPassword } = values;

    if (password !== confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    const newVisitorDetails: RegisterVisitorData = {
      firstName: values.firstName,
      lastName: values.lastName,
      contactNumber: values.contactNumber,
      email: values.email,
      password: values.password,
      isVerified: false,
    };

    try {
      const response = await registerVisitor(newVisitorDetails);

      if (response.status === 200) {
        message.success('Account created successfully!');

        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    } catch (error) {
      console.log(error);
      message.error(String(error));
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Validators
  // confirmPasswordValidator - checks confirmPassword matches password
  const confirmPasswordValidator = ({ getFieldValue }: any) => ({
    validator(_: any, value: any) {
      // console.log(value);
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('The two passwords do not match!'));
    },
  });

  return (
    <div className="w-full">
      <Divider></Divider>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              validateTrigger="onSubmit"
              rules={[{ required: true, message: 'Please enter your First Name' }]}
            >
              <Input placeholder="First Name" variant="filled" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              validateTrigger="onSubmit"
              rules={[{ required: true, message: 'Please enter your Last Name' }]}
            >
              <Input placeholder="Last Name" variant="filled" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="email"
          label="Email"
          validateTrigger="onSubmit"
          rules={[
            { required: true, message: 'Please enter your Email' },
            { type: 'email', message: 'Please enter a valid Email' },
          ]}
        >
          <Input placeholder="Email" variant="filled" />
        </Form.Item>

        <Form.Item
          name="contactNumber"
          label="Contact Number"
          rules={[
            { required: true, message: 'Please enter a contact number.' },
            {
              pattern: /^[689]\d{7}$/,
              message: 'Contact number must consist of exactly 8 digits and be a valid Singapore contact number',
            },
          ]}
        >
          <Input placeholder="Contact Number" variant="filled" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter your password.' },
            { pattern: /^.{8,}$/, message: 'Password must be at least 8 characters long.' },
          ]}
        >
          <Input.Password placeholder="Password" variant="filled" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          validateTrigger="onSubmit"
          rules={[{ required: true, message: 'Please re-enter your Password' }, confirmPasswordValidator]}
        >
          <Input.Password placeholder="Confirm Password" variant="filled" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Register
          </Button>
        </Form.Item>
      </Form>
      <Divider>
        <span className="text-secondary">or</span>
      </Divider>
      <Button type="link" className="w-full justify-center" onClick={handleGoToLogin}>
        Return to Login
      </Button>
    </div>
  );
};

export default LoginStep;
