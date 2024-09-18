import { Button, Divider, Form, Input, Row, Col, Select } from 'antd';
import { useNavigate } from 'react-router-dom';

interface LoginStepProps {
  handleReturnToMain: () => void;
}

const LoginStep = ({ handleReturnToMain }: LoginStepProps) => {
  const navigate = useNavigate();

  const handleSubmit = (values: any) => {
    const { firstName, lastName, email, password } = values;
    navigate('/');
  };


  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Validators
  // confirmPasswordValidator - checks confirmPassword matches password
  const confirmPasswordValidator = ({ getFieldValue }: any) => ({
    validator(_: any, value: any) {
      // console.log(value)
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('The two passwords do not match!'));
    },
  });

  return (
    <div className="w-full">
      <Divider>Staff</Divider>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              validateTrigger="onSubmit"
              rules={[
                { required: true, message: 'Please enter your First Name' },
              ]}
            >
              <Input placeholder="First Name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              validateTrigger="onSubmit"
              rules={[
                { required: true, message: 'Please enter your Last Name' },
              ]}
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="role"
          label="Role"
          validateTrigger="onSubmit"
          rules={[{ required: true, message: 'Please select a Role' }]}
        >
          <Select
            showSearch
            placeholder="Select a Role"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              { value: 'MANAGE', label: 'Manager' },
              { value: 'BOTANIST', label: 'Botanist' },
              { value: 'ARBORIST', label: 'Arborist' },
              { value: 'GARDENER', label: 'Gardener' },
              { value: 'MAINTENANCE_WORKER', label: 'Maintenance Worker' },
              { value: 'LANDSCAPE_ARTIST', label: 'Landscape Artist' },
              { value: 'PARK_RANGER', label: 'Park Ranger' },
            ]}
          />
        </Form.Item>

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
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your Password'}]}
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
      </Form>
      <Divider>
        <span className="text-secondary">or</span>
      </Divider>
      <Button
        type="link"
        className="w-full justify-center"
        onClick={handleGoToLogin}
      >
        Return to Login
      </Button>
    </div>
  );
};

export default LoginStep;
