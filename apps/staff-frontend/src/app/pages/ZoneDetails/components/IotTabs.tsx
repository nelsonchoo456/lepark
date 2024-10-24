import {
  HubResponse,
  SensorResponse,
  SensorStatusEnum,
  SensorTypeEnum,
} from '@lepark/data-access';
import { Button, Flex, Input, message, Tag, Tooltip, Table, Card, Divider, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { ColumnsType } from 'antd/es/table';
import { FiEye, FiSearch } from 'react-icons/fi';
import { SCREEN_LG } from '../../../config/breakpoints';

interface IotTabsProps {
  hubs: (HubResponse & { sensors?: SensorResponse[] })[];
}
interface SensorsTabProps {
  hub: (HubResponse & { sensors?: SensorResponse[] });
}

const IotTabs = ({ hubs }: IotTabsProps) => {
  return (
    <Tabs
      defaultActiveKey="0"
      type="card"
    >
      {hubs.map((hub, index) => (
        <Tabs.TabPane tab={hub.name} key={index.toString()}>
          <SensorsTab hub={hub} />
        </Tabs.TabPane>
      ))}
    </Tabs>
  );
};

const SensorsTab = ({ hub }: SensorsTabProps) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  const filteredSensors = useMemo(() => {
    return hub.sensors?.filter((sensor) => {
      return Object.values(sensor).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [hub.sensors, searchQuery]);

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const sensorColumns: ColumnsType<SensorResponse> = [
    {
      title: 'Identifier Number',
      dataIndex: 'identifierNumber',
      key: 'identifierNumber',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
      width: '20%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '20%',
    },
    {
      title: 'Sensor Type',
      dataIndex: 'sensorType',
      key: 'sensorType',
      filters: Object.values(SensorTypeEnum).map((type) => ({ text: formatEnumLabelToRemoveUnderscores(type), value: type })),
      onFilter: (value, record) => record.sensorType === value,
      render: (type: string) => formatEnumLabelToRemoveUnderscores(type),
      width: '15%',
    },
    {
      title: 'Sensor Status',
      dataIndex: 'sensorStatus',
      key: 'sensorStatus',
      filters: Object.values(SensorStatusEnum).map((status) => ({ text: formatEnumLabelToRemoveUnderscores(status), value: status })),
      onFilter: (value, record) => record.sensorStatus === value,
      render: (status: string) => {
        switch (status) {
          case SensorStatusEnum.ACTIVE:
            return (
              <Tag color="green" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
          case SensorStatusEnum.INACTIVE:
            return (
              <Tag color="blue" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
          case SensorStatusEnum.UNDER_MAINTENANCE:
            return (
              <Tag color="yellow" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
          case SensorStatusEnum.DECOMMISSIONED:
            return (
              <Tag color="red" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
          default:
            return (
              <Tag color="default" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(status)}
              </Tag>
            );
        }
      },
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: SensorResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`${record.id}`)} />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  return (
    <>
      {contextHolder}
      
      <Divider orientation='left'>Hub</Divider>
      <Card styles={{ body: { padding: "1rem" }}} className='mb-4'>
        <div className='flex'>
          <div className='flex-[1]'>
            <span className='text-secondary'>Hub: </span><strong>{hub.name}</strong><br/>
            <span className='text-secondary'>Indentifier No: </span><strong>{hub.identifierNumber}</strong>
          </div>
          <div className='flex items-center'>
            <Tooltip title="View Hub Details">
              <Button type="link" icon={<FiEye />} onClick={() => navigate(`/hubs/${hub.id}`)} />
            </Tooltip>
          </div>
        </div>
      </Card>

      <Divider orientation='left'>Sensors</Divider>
      <Input suffix={<FiSearch />} placeholder="Search in Sensors..." onChange={handleSearchBar} className="mb-4" variant="filled" />
      <Table
        columns={sensorColumns}
        dataSource={filteredSensors}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        scroll={{ x: SCREEN_LG }}
      />
    </>
  );
};

export default IotTabs;
