import React from 'react';
import { Form, Input, Select, Typography, Divider } from 'antd';
import { StaffType, ParkResponse, StaffResponse } from '@lepark/data-access';

const { Text } = Typography;
const { Option } = Select;

interface CreateDetailsStepProps {
  form: any;
  parks: ParkResponse[];
  user: StaffResponse | null;
}

const CreateDetailsStep: React.FC<CreateDetailsStepProps> = ({ form, parks, user }) => {
  const getParkName = (parkId?: number) => {
    const park = parks.find((park) => park.id === parkId);
    return parkId && park ? park.name : 'NParks';
  };

  return (
    <Form
      form={form}
      name="create_staff"
      initialValues={{ remember: true }}
      className="max-w-[600px] mx-auto mt-8"
      autoComplete="off"
      labelCol={{ span: 8 }}
    >
      <Divider orientation="left">Staff Details</Divider>
      <Form.Item name="firstNameInput" label="First Name" rules={[{ required: true, message: 'Please enter a first name.' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="lastNameInput" label="Last Name" rules={[{ required: true, message: 'Please enter a last name.' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="roleSelect" label="Role" rules={[{ required: true, message: 'Please select a role.' }]}>
        <Select placeholder="Select a Role" allowClear>
          {Object.values(StaffType)
            .filter((role) => {
              if (user?.role === StaffType.MANAGER) {
                return role !== StaffType.MANAGER && role !== StaffType.SUPERADMIN;
              } else if (user?.role === StaffType.SUPERADMIN) {
                return role !== StaffType.SUPERADMIN;
              }
              return true;
            })
            .map((role) => (
              <Select.Option key={role} value={role}>
                {role.replace(/_/g, ' ')}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="emailInput"
        label="Email"
        rules={[
          { required: true, message: 'Please enter an email.' },
          { type: 'email', message: 'Please enter a valid email.' },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="contactNumberInput"
        label="Contact Number"
        rules={[
          { required: true, message: 'Please enter a contact number.' },
          {
            pattern: /^[689]\d{7}$/,
            message: 'Contact number must consist of exactly 8 digits and be a valid Singapore contact number',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="parkSelect" label="Park" rules={[{ required: true, message: 'Please select a park.' }]}>
        {parks.length === 0 ? (
          <Text type="secondary">There are no parks created yet!</Text>
        ) : user?.role === StaffType.MANAGER ? (
          <Select placeholder={getParkName(user?.parkId)} value={user?.parkId}>
            <Select.Option key={user?.parkId} value={user?.parkId}>
              {getParkName(user?.parkId)}
            </Select.Option>
          </Select>
        ) : (
          <Select placeholder="Select a Park" allowClear>
            {parks.map((park) => (
              <Select.Option key={park.id} value={park.id}>
                {park.name}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;