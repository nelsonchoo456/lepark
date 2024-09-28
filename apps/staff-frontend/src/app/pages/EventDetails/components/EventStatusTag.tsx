import React from 'react';
import { Tag } from 'antd';
import { EventStatusEnum } from '@lepark/data-access';

const statusConfig: Record<EventStatusEnum, { color: string; label: string }> = {
  UPCOMING: { color: 'processing', label: 'Upcoming' },
  ONGOING: { color: 'success', label: 'Ongoing' },
  COMPLETED: { color: 'gold', label: 'Completed' },
  CANCELLED: { color: 'default', label: 'Cancelled' },
};

interface EventStatusTagProps {
  status?: EventStatusEnum;
}

const EventStatusTag: React.FC<EventStatusTagProps> = ({ status }) => {
  if (!status) {
    return null;
  }

  const { color, label } = statusConfig[status] || { color: 'default', label: status };
  return <Tag color={color}>{label}</Tag>;
};

export default EventStatusTag;