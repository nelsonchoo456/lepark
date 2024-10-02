import { Tag } from 'antd';

interface ZoneStatusTagProps {
  children?: string;
}

const ZoneStatusTag = ({ children }: ZoneStatusTagProps) => {
  return (
    <Tag
      color={children === 'Open' ? 'green' : children === 'Under Construction' ? 'orange' : children === 'Limited Access' ? 'yellow' : 'red'}
      className="w-min"
      bordered={false}
    >
      {children}
    </Tag>
  );
};

export default ZoneStatusTag;
