import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface DataType {
  key: string;
  name: string;
  role: string;
  email: string;
  contactNumber: string;
  status: boolean;
}

interface EditStaffActiveStatusModalProps {
  visible: boolean;
  onOk: (updatedStaff: DataType[]) => void;
  onCancel: () => void;
  record: DataType | null;
  staff: DataType[];
}

const EditStaffActiveStatusModal: React.FC<EditStaffActiveStatusModalProps> = ({
  visible,
  onOk,
  onCancel,
  record,
  staff,
}) => {
  const handleOk = () => {
    if (record) {
      const updatedStaff = staff.map((staffMember) =>
        staffMember.key === record.key
          ? { ...staffMember, status: !staffMember.status }
          : staffMember,
      );
      onOk(updatedStaff);
    }
  };

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined
            style={{ color: 'orange', marginRight: '10px' }}
          />
          Change Active Status
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="confirm" type="primary" onClick={handleOk}>
          Confirm
        </Button>,
      ]}
    >
      {record && (
        <div>
          Are you sure you want to change the active status of {record.name}{' '}
          from {record.status ? 'Active' : 'Inactive'} to{' '}
          <strong>{!record.status ? 'Active' : 'Inactive'}</strong>?
        </div>
      )}
    </Modal>
  );
};

export default EditStaffActiveStatusModal;
