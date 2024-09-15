import React, { FC, useState } from 'react';
import { Modal, Form, Input, Button, notification } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { sendVerificationEmailWithEmail, VisitorResponse } from '@lepark/data-access';

interface EditEmailModalProps {
  open: boolean;
  onClose: () => void;
  onResendEmail: () => void;
  onChangeEmail: () => void;
  user: VisitorResponse;
}

const EditEmailModal: FC<EditEmailModalProps> = ({ open, onClose, onResendEmail, onChangeEmail, user }) => {
  const [form] = Form.useForm();
  const [email, setEmail] = useState<string>('');

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          const response = await sendVerificationEmailWithEmail(values.newEmail, user.id);
          console.log('Resend verification email', response);
          onResendEmail(); 
          onChangeEmail();
          onClose();
        } catch (error) {
          console.error('Error resending verification email', error);
        }
       
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleReset = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      centered
      onCancel={onClose}
      title="Change Email"
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="change_email" initialValues={{ newEmail: '', otp: '' }}>
        <Form.Item
          name="newEmail"
          label="New Email"
          rules={[
            { required: true, message: 'Please input your new email address!' },
            { type: 'email', message: 'Please enter a valid email address!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="New Email" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditEmailModal;
