import React, { FC } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';

// Define the props type for the modal
interface EditPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const EditPasswordModal: FC<EditPasswordModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(values => {
      // Handle form submission
      console.log('Received values:', values);
      onClose(); // Close the modal after submission
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <Modal
      title="Change Password"
      open={open} // Updated prop
      onOk={handleOk}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        name="edit_password"
        initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
      >
        <Form.Item
          name="oldPassword"
          label="Old Password"
          rules={[{ required: true, message: 'Please input your old password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Old Password"
          />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[{ required: true, message: 'Please input your new password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New Password"
          />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm New Password"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPasswordModal;
