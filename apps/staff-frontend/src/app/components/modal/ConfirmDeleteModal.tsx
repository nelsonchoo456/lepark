import { Modal } from 'antd';
import { useState } from 'react';

interface ConfirmDeleteModalProps {
  open: boolean;
  confirmLoading?: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal = ({ open, confirmLoading, title, description, onConfirm, onCancel }: ConfirmDeleteModalProps) => {

  return (
    <Modal
      title={title ? title : 'Confirm Deletion?'}
      open={open}
      onOk={onConfirm}
      okText="Confirm Delete"
      okButtonProps={{ danger: true }}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
    >
      <p>{description}</p>
    </Modal>
  );
};

export default ConfirmDeleteModal;
