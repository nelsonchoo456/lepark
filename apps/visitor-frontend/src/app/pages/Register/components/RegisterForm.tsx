import { registerVisitor, RegisterVisitorData } from '@lepark/data-access';
import { Button, Divider, Form, Input, Row, Col, message } from 'antd';
import { useState } from 'react';
import { AiOutlineMail } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

interface LoginStepProps {
  handleReturnToMain: () => void;
}

const LoginStep = ({ handleReturnToMain }: LoginStepProps) => {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);

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
        setIsRegistered(true);

        // setTimeout(() => {
        //   navigate('/login');
        // }, 1000);
      }
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
      {isRegistered ? (
        <div className="flex flex-col items-center justify-center p-4 mt-5 text-center">
          <AiOutlineMail size={48} className="text-green-400" />
          <h1 className="text-2xl text-bold">Email Verification Sent</h1>
          <p className="mt-2">A verification link has been sent to your email address. Please check your inbox and click on the link to verify your account.</p>
        </div>
      ) : (
      <><Form layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  validateTrigger="onSubmit"
                  rules={[{ required: true, message: 'Please enter your First Name' }]}
                >
                  <Input placeholder="First Name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  validateTrigger="onSubmit"
                  rules={[{ required: true, message: 'Please enter your Last Name' }]}
                >
                  <Input placeholder="Last Name" />
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
              <Input placeholder="Email" />
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
              <Input placeholder="Contact Number"/>
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password.' },
                { pattern: /^.{8,}$/, message: 'Password must be at least 8 characters long.' },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              validateTrigger="onSubmit"
              rules={[{ required: true, message: 'Please re-enter your Password' }, confirmPasswordValidator]}
            >
              <Input.Password placeholder="Confirm Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                Register
              </Button>
            </Form.Item>
          </Form><Divider>
              <span className="text-secondary">or</span>
            </Divider><Button type="link" className="w-full justify-center" onClick={handleGoToLogin}>
              Return to Login
            </Button></>
      )}
    </div>
  );
};

export default LoginStep;
