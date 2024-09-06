import React, { useState } from 'react';
import { Modal, Button, Input } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface DeleteAccountModalProps {
  visible: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ visible, onConfirm, onCancel }) => {
  const [password, setPassword] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirm = () => {
    onConfirm(password);
  };

  return (
    <Modal
    centered
      title={
        <span>
          <ExclamationCircleOutlined style={{ color: 'red', marginRight: '10px' }} />
          Delete Account
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="confirm" type="primary" danger onClick={handleConfirm}>
          Confirm
        </Button>,
      ]}
    >
      <div>
        Are you sure you want to delete your account? This action cannot be undone.
      </div>
      <Input.Password
        placeholder="Enter your password"
        value={password}
        onChange={handlePasswordChange}
        style={{ marginTop: '10px' }}
      />
    </Modal>
  );
};

export default DeleteAccountModal;