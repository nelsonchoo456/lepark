import React from 'react';
import { Form, Input, Button, Select, Switch } from 'antd';

const { Option } = Select;

interface EditStaffProps {
  staff: {
    key: string;
    name: string;
    role: string;
    email: string;
    contactNumber: string;
    status: boolean;
  };
}

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

const EditStaffDetailsModal: React.FC<EditStaffProps> = ({ staff }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Success:', values);
    // logic for update staff is here
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={staff}
      onFinish={onFinish}
    >
      <Form.Item name="name" label="Name">
        <Input />
      </Form.Item>
      <Form.Item name="role" label="Role">
        <Select>
          {roles.map((role) => (
            <Option key={role} value={role}>
              {role}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="email" label="Email">
        <Input />
      </Form.Item>
      <Form.Item name="contactNumber" label="Contact Number">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditStaffDetailsModal;
