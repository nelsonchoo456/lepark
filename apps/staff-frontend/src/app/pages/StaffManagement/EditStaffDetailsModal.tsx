import React, { useEffect } from 'react';
import { Form, Input, Button, Select, Switch, message } from 'antd';
import { viewStaffDetails, updateStaffDetails, updateStaffRole, StaffResponse, StaffUpdateData, StaffType } from '@lepark/data-access';

const { Option } = Select;

interface EditStaffProps {
  staff: StaffResponse;
  onStaffUpdated: () => void;
}

const EditStaffDetailsModal: React.FC<EditStaffProps> = ({ staff, onStaffUpdated }) => {
  const [form] = Form.useForm();

  // Populate initial form values
  useEffect(() => {
    if (staff) {
      form.setFieldsValue({
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        email: staff.email,
        contactNumber: staff.contactNumber,
      });
    }
  }, [staff, form]);

  const onFinish = async (values: any) => {
    try {
      const updatedStaffDetails: StaffUpdateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        contactNumber: values.contactNumber,
      };
      // rmb to change requesterId to actual requesterId
      const responseStaffRole = await updateStaffRole(staff.id, values.role, '9ffdeeac-ecdb-4882-99a2-cf8094b92c92'); // requesterId to be passed in the request body; hardcoded for now
      console.log('Staff role updated successfully:', responseStaffRole.data);

      const responseStaffDetails = await updateStaffDetails(staff.id, updatedStaffDetails);
      console.log('Staff details updated successfully:', responseStaffDetails.data);

      message.success('Staff details updated successfully!');
      onStaffUpdated();
    } catch (error: any) {
      console.error(error);
      // TODO: filter out specific error messages from the response
      message.error('Failed to update staff details.');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter a first name.'}]}>
        <Input />
      </Form.Item>

      <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter a last name.'}]}>
        <Input />
      </Form.Item>

      <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role.'}]}>
        <Select>
          {Object.values(StaffType).map((role) => (
            <Option key={role} value={role}>
              {role}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="email" label="Email">
        <Input disabled />
      </Form.Item>
      <Form.Item name="contactNumber" label="Contact Number" rules={[{ required: true, message: 'Please enter a contact number.'}]}>
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
