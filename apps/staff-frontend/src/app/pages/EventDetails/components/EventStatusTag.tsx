import React from 'react';
import { Tag } from 'antd';
import { EventStatusEnum } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const statusConfig: Record<EventStatusEnum, { color: string; label: string }> = {
  [EventStatusEnum.UPCOMING]: { color: 'processing', label: formatEnumLabelToRemoveUnderscores(EventStatusEnum.UPCOMING) },
  [EventStatusEnum.ONGOING]: { color: 'success', label: formatEnumLabelToRemoveUnderscores(EventStatusEnum.ONGOING) },
  [EventStatusEnum.COMPLETED]: { color: 'gold', label: formatEnumLabelToRemoveUnderscores(EventStatusEnum.COMPLETED) },
  [EventStatusEnum.CANCELLED]: { color: 'default', label: formatEnumLabelToRemoveUnderscores(EventStatusEnum.CANCELLED) },
};

interface EventStatusTagProps {
  status?: EventStatusEnum;
}

const EventStatusTag: React.FC<EventStatusTagProps> = ({ status }) => {
  if (!status) {
    return null;
  }

  const { color, label } = statusConfig[status] || { color: 'default', label: status };
  return <Tag color={color} bordered={false}>{label}</Tag>;
};

export default EventStatusTag;