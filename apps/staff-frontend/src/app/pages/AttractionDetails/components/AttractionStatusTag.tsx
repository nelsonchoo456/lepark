import React from 'react';
import { Tag } from 'antd';
import { AttractionStatusEnum } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const statusConfig: Record<AttractionStatusEnum, { color: string; label: string }> = {
  [AttractionStatusEnum.OPEN]: { color: 'success', label: formatEnumLabelToRemoveUnderscores(AttractionStatusEnum.OPEN) },
  [AttractionStatusEnum.CLOSED]: { color: 'error', label: formatEnumLabelToRemoveUnderscores(AttractionStatusEnum.CLOSED) },
  [AttractionStatusEnum.UNDER_MAINTENANCE]: { color: 'warning', label: formatEnumLabelToRemoveUnderscores(AttractionStatusEnum.UNDER_MAINTENANCE) },
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