import { HubResponse, HubStatusEnum, SensorResponse, SensorStatusEnum, SensorTypeEnum, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Flex, Input, message, Tag, Tooltip, Table, Card, Divider, Tabs, Switch, Radio } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { ColumnsType, TableProps } from 'antd/es/table';
import { FiEye, FiSearch } from 'react-icons/fi';
import { SCREEN_LG } from '../../../config/breakpoints';
import { useAuth } from '@lepark/common-ui';

interface ActiveIotTabProps {
  hubs?: (HubResponse & { sensors?: SensorResponse[] })[];
  sensors?: SensorResponse[];
}
interface IotTabsProps {
  hubs: (HubResponse & { sensors?: SensorResponse[] })[];
}
interface SensorsTabProps {
  hub: HubResponse & { sensors?: SensorResponse[] };
}

const ActiveIotTab = ({ hubs, sensors }: ActiveIotTabProps) => {
  const { user } = useAuth<StaffResponse>();
  const [view, setView] = useState<'table' | 'hubs'>('table');
  const navigate = useNavigate();
  const [sensorSearchQuery, setSensorSearchQuery] = useState('');
  const [hubSearchQuery, setHubSearchQuery] = useState('');

  const filteredSensors = useMemo(() => {
    return sensors?.filter((sensor) => {
      return Object.values(sensor).some((value) => value && value.toString().toLowerCase().includes(sensorSearchQuery.toLowerCase()));
    });
  }, [sensors, sensorSearchQuery]);

  const filteredHubs = useMemo(() => {
    return hubs?.filter((hub) => Object.values(hub).some((value) => value?.toString().toLowerCase().includes(hubSearchQuery.toLowerCase())));
  }, [hubSearchQuery, hubs]);

  const handleSensorSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSensorSearchQuery(e.target.value);
  };

  const handleHubSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHubSearchQuery(e.target.value);
  };

  const hubsColumns: TableProps<HubResponse>['columns'] = [
    {
      title: 'Identifier Number',
      dataIndex: 'identifierNumber',
      key: 'identifierNumber',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.identifierNumber.localeCompare(b.identifierNumber),
      width: '15%',
    },
    {
      title: 'Hub Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '15%',
    },
    {
      title: 'No. of Connected Sensors',
      key: "sensors-count",
      dataIndex: 'sensors',
      render: (item: any[]) => item.length || 0,
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/hubs/${record.id}`)} />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const superAdminColumns: ColumnsType<SensorResponse> = [
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
      title: 'Hub',
      key: 'hub-linked',
      dataIndex: 'hub',
      render: (item: any) => <div className="font-semibold">{item.name}</div>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '20%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: SensorResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/sensor/${record.id}`)} />
          </Tooltip>
        </Flex>
      ),
      width: '20%',
    },
  ];

  return (
    <>
      <Flex justify='flex-end' className='mb-2'><Radio.Group onChange={(e) => setView(e.target.value)} optionType="button" defaultValue="table">
        <Radio value="table">Tables</Radio>
        <Radio value="hubs">By Hubs</Radio>
      </Radio.Group>
      </Flex>
      {view === 'table' ? (
        <Tabs defaultActiveKey="0" type="card">
          <Tabs.TabPane tab={'Sensors'} key={'sensors'}>
            <Input
              suffix={<FiSearch />}
              placeholder="Search in Sensors..."
              onChange={handleSensorSearchBar}
              className="mb-4"
              variant="filled"
            />
            <Table
              columns={superAdminColumns}
              dataSource={filteredSensors}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: SCREEN_LG }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={'Hubs'} key={'hubs'}>
            <Input
              suffix={<FiSearch />}
              placeholder="Search in Hubs..."
              onChange={handleHubSearchBar}
              className="mb-4"
              variant="filled"
            />
            <Table
              columns={hubsColumns}
              dataSource={filteredHubs}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: SCREEN_LG }}
            />
          </Tabs.TabPane>
        </Tabs>
      ) : (
        hubs && <IotTabs hubs={hubs} />
      )}
    </>
  );
};

const IotTabs = ({ hubs }: IotTabsProps) => {
  return (
    <Tabs defaultActiveKey="0" type="card">
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
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/sensors${record.id}`)} />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  return (
    <>
      {contextHolder}

      <Divider orientation="left">Hub</Divider>
      <Card styles={{ body: { padding: '1rem' } }} className="mb-4">
        <div className="flex">
          <div className="flex-[1]">
            <span className="text-secondary">Hub: </span>
            <strong>{hub.name}</strong>
            <br />
            <span className="text-secondary">Indentifier No: </span>
            <strong>{hub.identifierNumber}</strong>
          </div>
          <div className="flex items-center">
            <Tooltip title="View Hub Details">
              <Button type="link" icon={<FiEye />} onClick={() => navigate(`/hubs/${hub.id}`)} />
            </Tooltip>
          </div>
        </div>
      </Card>

      <Divider orientation="left">Sensors</Divider>
      <Input suffix={<FiSearch />} placeholder="Search in Sensors..." onChange={handleSearchBar} className="mb-4" variant="filled" />
      <Table columns={sensorColumns} dataSource={filteredSensors} rowKey="id" pagination={{ pageSize: 6 }} scroll={{ x: SCREEN_LG }} />
    </>
  );
};

export default ActiveIotTab;
