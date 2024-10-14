import { Flex, Modal } from 'antd';
import { useState } from 'react';
import { PiWarningCircleFill } from 'react-icons/pi';

interface ConfirmDeleteModalProps {
  open: boolean;
  confirmLoading?: boolean;
  okText?: string;
  title?: string;
  description?: string | JSX.Element;
  onConfirm: () => void;
  onCancel: () => void;
  children?: string | JSX.Element;

  [key: string]: any;
}

const ConfirmDeleteModal = ({
  open,
  confirmLoading,
  title,
  description,
  onConfirm,
  onCancel,
  okText,
  children,
  ...otherFields
}: ConfirmDeleteModalProps) => {
  return (
    <Modal
      title={
        title ? (
          title
        ) : (
          <Flex gap={8}>
            <PiWarningCircleFill className="text-mustard-400 text-2xl" />
            Confirm Deletion?
          </Flex>
        )
      }
      open={open}
      onOk={onConfirm}
      okText={okText ? okText : 'Confirm Delete'}
      okButtonProps={{ danger: true }}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      {...otherFields}
    >
      <div>{description}</div>
      {children}
    </Modal>
  );
};

export default ConfirmDeleteModal;
