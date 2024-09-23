import React from 'react';
import { Tag } from 'antd';
import { AttractionStatusEnum } from '@lepark/data-access';

const statusConfig: Record<AttractionStatusEnum, { color: string; label: string }> = {

  OPEN: { color: 'success', label: 'Open' },
  CLOSED: { color: 'error', label: 'Closed' },
  UNDER_MAINTENANCE: { color: 'warning', label: 'Under Maintenance' },
};

interface AttractionStatusTagProps {
  status?: AttractionStatusEnum;
}

const AttractionStatusTag: React.FC<AttractionStatusTagProps> = ({ status }) => {
  if (!status) {
    return null;
  }

  const { color, label } = statusConfig[status] || { color: 'default', label: status };
  return <Tag color={color}>{label}</Tag>;
};

export default AttractionStatusTag;