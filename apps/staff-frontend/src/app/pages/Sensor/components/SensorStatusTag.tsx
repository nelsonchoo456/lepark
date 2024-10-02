import { Tag } from "antd";
import { SensorStatusEnum } from "@prisma/client";

interface SensorStatusTagProps {
  children?: SensorStatusEnum;
}

const SensorStatusTag = ({ children }: SensorStatusTagProps) => {
  const getColor = (status: SensorStatusEnum | undefined) => {
    switch (status) {
      case SensorStatusEnum.ACTIVE:
        return 'green';
      case SensorStatusEnum.INACTIVE:
        return 'orange';
      case SensorStatusEnum.UNDER_MAINTENANCE:
        return 'blue';
      case SensorStatusEnum.DECOMMISSIONED:
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <Tag color={getColor(children)} className='w-min' bordered={false}>
      {children?.replace('_', ' ')}
    </Tag>
  );
};

export default SensorStatusTag;
