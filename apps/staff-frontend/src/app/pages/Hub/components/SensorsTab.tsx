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
import { MdDeleteOutline } from 'react-icons/md';
import { useAuth } from '@lepark/common-ui';
import { Button, Flex, Input, message, Modal, Tag, Tooltip, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { ColumnsType } from 'antd/es/table';
import { FiEye, FiSearch } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { SCREEN_LG } from '../../../config/breakpoints';

interface SensorsTabProps {
  hub: HubResponse;
  zone: ZoneResponse;
  sensors?: SensorResponse[];
}

const SensorsTab = ({ hub, zone, sensors }: SensorsTabProps) => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [showSensors, setShowSensors] = useState(false);

  const notificationShown = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: 'Confirm Deletion?',
          content: 'Deleting a Sensor cannot be undone. Are you sure you want to proceed?',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
          okText: 'Confirm Delete',
          okButtonProps: { danger: true },
        });
      });

      if (!confirmed) return;

      await deleteSensor(id);
      message.success('Sensor deleted successfully');
    } catch (error) {
      console.error('Error deleting sensor:', error);
      message.error('Failed to delete sensor. Please try again.');
    }
  };

  const filteredSensors = useMemo(() => {
    return sensors?.filter((sensor) => {
      return Object.values(sensor).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [sensors, searchQuery]);

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const columns: ColumnsType<SensorResponse> = [
    {
      title: 'Identifier Number',
      dataIndex: 'identifierNumber',
      key: 'identifierNumber',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.identifierNumber.localeCompare(b.identifierNumber),
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
      title: 'Facility',
      render: (text, record) => (
        <Flex justify="space-between" align="center">
          {record.facility?.name}
        </Flex>
      ),
      sorter: (a, b) => {
        if (a.park?.name && b.park?.name) {
          return a.park.name.localeCompare(b.park.name);
        }
        if (a.name && b.name) {
          return a.name.localeCompare(b.name);
        }
        return (a.facilityId ?? '').localeCompare(b.facilityId ?? '');
      },

      width: '15%',
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
          <>
            <Tooltip title="Edit Sensor">
              <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`${record.id}/edit`)} />
            </Tooltip>
            <Tooltip title="Delete Sensor">
              <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => handleDelete(record.id)} />
            </Tooltip>
          </>
        </Flex>
      ),
      width: '20%',
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
      title: 'Park, Facility',
      render: (_, record) => (
        <div>
          <p className="font-semibold">{record.park?.name}</p>
          <div className="flex">
            <p className="opacity-50 mr-2">Facility:</p>
            {record.facility?.name}
          </div>
        </div>
      ),
      sorter: (a, b) => {
        if (a.park?.name && b.park?.name) {
          return a.park.name.localeCompare(b.park.name);
        }
        if (a.name && b.name) {
          return a.name.localeCompare(b.name);
        }
        return (a.facilityId ?? '').localeCompare(b.facilityId ?? '');
      },

      width: '15%',
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
          {user && (user.role === StaffType.MANAGER || user.role === StaffType.SUPERADMIN) && (
            <>
              <Tooltip title="Edit Sensor">
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`${record.id}/edit`)} />
              </Tooltip>
              <Tooltip title="Delete Sensor">
                <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => handleDelete(record.id)} />
              </Tooltip>
            </>
          )}
        </Flex>
      ),
      width: '20%',
    },
  ];

  return (
    <>
      <Input suffix={<FiSearch />} placeholder="Search in Sensors..." onChange={handleSearchBar} className="mb-4" variant="filled" />
      <Table
        columns={user?.role === StaffType.SUPERADMIN ? superAdminColumns : columns}
        dataSource={filteredSensors}
        rowKey="id"
        // loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: SCREEN_LG }}
      />
    </>
  );
};

export default SensorsTab;
