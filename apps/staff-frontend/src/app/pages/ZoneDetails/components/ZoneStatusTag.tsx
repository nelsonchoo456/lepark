import { Tag } from "antd";

interface ZoneStatusTagProps {
  children?: string;
}

const ZoneStatusTag = ({ children }: ZoneStatusTagProps) => {
  return <Tag color={children === 'OPEN' ? 'green' : children === 'UNDER_CONSTRUCTION' ? 'orange' : 'red'} className='w-min' bordered={false}>{ children }</Tag>
}

export default ZoneStatusTag;