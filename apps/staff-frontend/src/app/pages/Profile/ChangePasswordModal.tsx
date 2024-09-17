import React, { FC, useEffect } from 'react';
import { Modal, Form, Input, Button, notification, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { changeStaffPassword, StaffResponse } from '@lepark/data-access';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: StaffResponse;
}

const ChangePasswordModal: FC<ChangePasswordModalProps> = ({ open, onClose, user }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleOk = () => {
    form.validateFields().then(values => {
      // Handle form submission

      const { currentPassword, newPassword, confirmPassword } = values;
      if (newPassword !== confirmPassword) {
        message.error('Passwords do not match');
        return;
      }

      changeStaffPassword({ newPassword, currentPassword, staffId: user.id })
        .then(() => {
          notification.success({
            message: 'Success',
            description: 'Your password has been changed successfully.',
          });
          onClose();
        })
        .catch(error => {
          console.error('Error changing password:', error);
          message.error(String(error));
        });
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
          name="currentPassword"
          label="Current Password:"
          rules={[{ required: true, message: 'Please input your current password!' },
            { pattern: /^.{8,}$/, message: 'Current password should be at least 8 characters long.' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Current Password"
          />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="New Password:"
          rules={[{ required: true, message: 'Please input your new password!' },
            { pattern: /^.{8,}$/, message: 'Password must be at least 8 characters long.' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New Password"
          />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm New Password:"
          rules={[
            { required: true, message: 'Please confirm your new password!' }]}
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

export default ChangePasswordModal;
