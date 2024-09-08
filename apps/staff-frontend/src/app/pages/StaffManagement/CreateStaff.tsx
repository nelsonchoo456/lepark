import React from 'react';
import { Form, Input, Button, Select, Descriptions, Switch, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark } from '@lepark/common-ui';
import { registerStaff, RegisterStaffData, StaffType } from '@lepark/data-access';

const { Option } = Select;

const CreateStaff: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const onFinish = async (values: any) => {
    try {
      const newStaffDetails: RegisterStaffData = {
        firstName: values.firstNameInput,
        lastName: values.lastNameInput,
        contactNumber: values.contactNumberInput,
        email: values.emailInput,
        password: values.passwordInput,
        role: values.roleSelect,
      };
      const response = await registerStaff(newStaffDetails);
      console.log('Success:', response.data);
      message.success('Staff added successfully!');
      // Navigate to another page or show success message
      navigate('/staff-management');
    } catch (error) {
      console.error(error);
      message.error('Failed to add staff.');
      // Handle error, show error message to user
    }
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <ContentWrapperDark>
      <PageHeader>Add a new Staff</PageHeader>
      <Form
        {...layout}
        form={form}
        name="create_staff"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        // style={{ maxWidth: 50 }}
        className="max-w-[600px] mx-auto"
        autoComplete="off"
      >
        <Form.Item name="firstNameInput" label="First Name" rules={[{ required: true, message: 'Please enter a first name.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="lastNameInput" label="Last Name" rules={[{ required: true, message: 'Please enter a last name.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="roleSelect" label="Role" rules={[{ required: true, message: 'Please select a role.' }]}>
          <Select placeholder="Select a Role" allowClear>
            {Object.values(StaffType).map((role) => (
              <Select.Option key={role} value={role}>
                {role}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="emailInput" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter an email.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="passwordInput" label="Password" rules={[{ required: true, message: 'Please enter a password.' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="contactNumberInput"
          label="Contact Number"
          rules={[{ required: true, message: 'Please enter a contact number.' }]}
        >
          <Input />
        </Form.Item>
        {/* <Form.Item label="Active Status" name="activeStatus" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item> */}
        <Form.Item {...tailLayout}>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </ContentWrapperDark>
  );
};

export default CreateStaff;
