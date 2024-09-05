import React from 'react';
import { Form, Input, Button, Select, Descriptions, Switch, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark } from '@lepark/common-ui';

const { Option } = Select;

const roles = [
  'Manager',
  'Botanist',
  'Arborist',
  'Landscaper',
  'Maintenance Worker',
  'Cleaner',
  'Landscape Architect',
  'Park Ranger',
];

const CreateStaff: React.FC = () => {
  const [form] = Form.useForm();
  
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const onFinish = (values: any) => {
    console.log('Success:', values);
    // logic for creating new staff
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
        <Form.Item
          name="firstNameInput"
          label="First Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="lastNameInput"
          label="Last Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="roleSelect" label="Role" rules={[{ required: true }]}>
          <Select placeholder="Select a Role" allowClear>
            {roles.map((role) => (
              <Option key={role} value={role}>
                {role}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="emailInput" label="Email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="contactNumberInput"
          label="Contact Number"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Active Status"
          name="activeStatus"
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
        <Form.Item {...tailLayout}>
            <Space>
              <Button type="primary" htmlType="submit" onClick={onFinish}>
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
