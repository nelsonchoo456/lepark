import React from 'react';
import { Tag } from 'antd';
import dayjs from 'dayjs';

interface PromotionValidityTagProps {
  validFrom: string;
  validUntil: string;
}

const PromotionValidityTag: React.FC<PromotionValidityTagProps> = ({ validFrom, validUntil }) => {
  const now = dayjs();
  const startDate = dayjs(validFrom);
  const endDate = dayjs(validUntil);

  let status: React.ReactNode;

  if (now.isBefore(startDate)) {
    status = <Tag color="blue" bordered={false}>Upcoming</Tag>;
  } else if (now.isAfter(startDate) && now.isBefore(endDate)) {
    status = <Tag color="green" bordered={false}>Ongoing</Tag>;
  } else {
    status = <Tag bordered={false}>Done</Tag>;
  }

  return (
    <div>
       {status}<br/>
      {`${startDate.format('DD MMM YY')} - ${endDate.format('DD MMM YY')}`}
    </div>
  );
};

export default PromotionValidityTag;
