import { Tag } from "antd";

interface ParkStatusTagProps {
  children?: string;
}

const ParkStatusTag = ({ children }: ParkStatusTagProps) => {
  return <Tag color={children === 'OPEN' ? 'green' : children === 'UNDER_MAINTENANCE' ? 'green' : 'red'} className='w-min' bordered={false}>{ children }</Tag>
}

export default ParkStatusTag;