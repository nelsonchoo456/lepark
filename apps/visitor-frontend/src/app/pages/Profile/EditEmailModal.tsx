import React, { FC, useState } from 'react';
import { Modal, Form, Input, Button, notification } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

interface EditEmailModalProps {
  open: boolean;
  onClose: () => void;
}

const EditEmailModal: FC<EditEmailModalProps> = ({ open, onClose }) => {
  const [step, setStep] = useState<number>(1); // 1: Enter new email, 2: Enter OTP
  const [form] = Form.useForm();
  const [email, setEmail] = useState<string>('');

  const handleNextStep = () => {
    form.validateFields().then(values => {
      if (step === 1) {
        // Simulate sending OTP
        console.log('New Email:', values.newEmail);
        setEmail(values.newEmail);
        notification.success({
          message: 'OTP Sent',
          description: 'An OTP has been sent to your new email address.',
        });
        setStep(2);
      } else if (step === 2) {
        // Validate OTP here
        console.log('Entered OTP:', values.otp);
        notification.success({
          message: 'Email Changed',
          description: 'Your email address has been successfully changed.',
        });
        handleReset(); 
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleReset = () => {
    form.resetFields();
    setStep(1);
    onClose();
  };

  return (
    <Modal
      title={step === 1 ? "Change Email" : "Verify OTP"}
      open={open}
      centered 
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleNextStep}
        >
          {step === 1 ? 'Next' : 'Verify'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="change_email"
        initialValues={{ newEmail: '', otp: '' }}
      >
        {step === 1 ? (
          <>
            <Form.Item
              name="newEmail"
              label="New Email"
              rules={[{ required: true, message: 'Please input your new email address!' }, { type: 'email', message: 'Please enter a valid email address!' }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="New Email"
              />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              name="otp"
              label="Enter OTP"
              rules={[{ required: true, message: 'Please input the OTP sent to your email!' }]}
            >
              <Input
                prefix={<LockOutlined />}
                placeholder="Enter OTP"
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default EditEmailModal;
