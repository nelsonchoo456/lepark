import {
  HubResponse,
  ZoneResponse,
  StaffResponse,
  StaffType,
  SensorResponse,
  deleteSensor,
  SensorStatusEnum,
  SensorTypeEnum,
} from '@lepark/data-access';
import { Button, Flex, Input, message, Modal, Tag, Tooltip, Table, Result, Card, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { ColumnsType } from 'antd/es/table';
import { FiEye, FiSearch } from 'react-icons/fi';
import { SCREEN_LG } from '../../../config/breakpoints';

interface SensorsTabProps {
  hub: HubResponse;
  zone: ZoneResponse;
  sensors?: SensorResponse[];
  fetchSensors: () => void; // callback function
}

const SensorsTab = ({ hub, zone, sensors, fetchSensors }: SensorsTabProps) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  // const [sensorToBeDeactivated, setSensorToBeDeactivated] = useState<SensorResponse | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  // const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  // const [updatedData, setUpdatedData] = useState<SensorResponse>();

  // const canActivateEdit = user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER

  // // Deactivate utility
  // const cancelDeactivate = () => {
  //   setSensorToBeDeactivated(null);
  //   setDeactivateModalOpen(false);
  // };

  // const showDeactivateModal = (sensor: SensorResponse) => {
  //   setSensorToBeDeactivated(sensor);
  //   setDeactivateModalOpen(true);
  // };

  // const handleDeactivateSensor = async () => {
  //   try {
  //     if (!sensorToBeDeactivated) {
  //       throw new Error('Unable to deactivate Sensor a this time.');
  //     }
  //     const sensorRes = await removeSensorFromHub(sensorToBeDeactivated.id);
  //     if (sensorRes.status === 200) {
  //       setUpdatedData(sensorRes.data);
        
  //       setTimeout(() => {
  //         setDeactivateModalOpen(false);
  //         // triggerFetch();
  //         fetchSensors();
  //       }, 2000);
  //     }
      
  //   } catch (error) {
  //     console.log(error);
  //     if (
  //       error === 'Sensor is not assigned to any hub' ||
  //       error === 'Sensor must be active to be removed from a hub' ||
  //       error === 'Sensor not found'
  //     ) {
  //       messageApi.open({
  //         type: 'error',
  //         content: error,
  //       });
  //       setDeactivateModalOpen(false);
  //     } else {
  //       messageApi.open({
  //         type: 'error',
  //         content: `Unable to deactivate Sensor at this time. Please try again later.`,
  //       });
  //       setDeactivateModalOpen(false);
  //     }
      
  //   }
  // };

  const filteredSensors = useMemo(() => {
    return sensors?.filter((sensor) => {
      return Object.values(sensor).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [sensors, searchQuery]);

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
      {/* <ConfirmDeleteModal
        title="Delinking Sensor"
        okText="Confirm Delinking of Sensor"
        onConfirm={handleDeactivateSensor}
        open={deactivateModalOpen}
        onCancel={cancelDeactivate}

        // For Success
        description={updatedData ? undefined : "Delinking a Sensor will disconnect it from its assigned Hub and remove it from the Zone."}
        footer={updatedData && null}
        closable={!updatedData}
      >
        {updatedData && <Result
          status="success"
          title={updatedData ? `Delinked ${updatedData.name}` : 'Delinked Sensor'}
          subTitle="Returning to Sensors Tab..."
        />}
      </ConfirmDeleteModal> */}
      
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

export default SensorsTab;
