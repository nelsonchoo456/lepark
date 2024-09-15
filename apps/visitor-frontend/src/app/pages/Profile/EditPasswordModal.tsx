import React, { FC } from 'react';
import { Modal, Form, Input, Button, notification } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '@lepark/common-ui';
import { forgotVisitorPassword, VisitorResponse } from '@lepark/data-access';

interface EditPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const EditPasswordModal: FC<EditPasswordModalProps> = ({ open, onClose }) => {
  const { user } = useAuth<VisitorResponse>();
  const handleOk = async () => {
    try {
      const data = {
        email: user?.email || '',
      };

      await forgotVisitorPassword(data);

      notification.success({
        message: 'Success',
        description: 'A reset password link has been sent to your email successfully.',
      });

      onClose();
    } catch (error) {}
  };

  return (
    <Modal
      title="Reset Password"
      open={open} // Updated prop
      onOk={handleOk}
      onCancel={onClose}
      okText="Reset Password"
      cancelText="Cancel"
      centered
    >
      <p className="mt-2">A link will be sent to your email. Please check your inbox and click on the link to reset your password.</p>
    </Modal>
  );
};

export default EditPasswordModal;
