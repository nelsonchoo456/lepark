import { Flex, Modal } from 'antd';
import { useState } from 'react';
import { PiWarningCircleFill } from 'react-icons/pi';

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
      title={title ? title : <Flex gap={8}><PiWarningCircleFill className='text-mustard-400 text-2xl'/>Confirm Deletion?</Flex>}
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
