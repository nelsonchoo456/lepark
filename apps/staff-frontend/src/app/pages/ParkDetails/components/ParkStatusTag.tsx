import { Tag } from 'antd';

interface ParkStatusTagProps {
  children?: string;
}

const ParkStatusTag = ({ children }: ParkStatusTagProps) => {
  return (
    <Tag color={children === 'Open' ? 'green' : children === 'Under Construction' ? 'orange' : children === 'Limited Access' ? 'yellow' : 'red'} className="w-min" bordered={false}>
      {children}
    </Tag>
  );
};

export default ParkStatusTag;