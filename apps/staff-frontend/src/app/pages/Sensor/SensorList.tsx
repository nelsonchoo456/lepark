import React, { useRef, useState, useMemo } from 'react';
import { Button, Input, Space, Table, Layout, Row, Col, Dropdown, Modal, Flex, Tag, notification, message, Tooltip, Card } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { deleteSensor, SensorResponse, StaffResponse, StaffType } from '@lepark/data-access';
import PageHeader from '../../components/main/PageHeader';
import { SCREEN_LG } from '../../config/breakpoints';
import { FiEye, FiSearch } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import { ColumnsType } from 'antd/es/table';
import { SensorTypeEnum, SensorStatusEnum } from '@prisma/client';
import { useFetchSensors } from '../../hooks/Sensors/useFetchSensors';

const formatEnumLabel = (enumValue: string): string => {
  return enumValue.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const SensorManagementPage: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { sensors, loading, fetchSensors, triggerFetch } = useFetchSensors();

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: 'Confirm Deletion?',
          content: 'Deleting a Sensor cannot be undone. Are you sure you want to proceed?',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
          okText: "Confirm Delete",
          okButtonProps: { danger: true }
        });
      });

      if (!confirmed) return;

      await deleteSensor(id);
      message.success('Sensor deleted successfully');
      triggerFetch(); // Refresh the sensor list
    } catch (error) {
      console.error('Error deleting sensor:', error);
      message.error('Failed to delete sensor. Please try again.');
    }
  };

  const filteredSensors = useMemo(() => {
    return sensors.filter((sensor) => {
      return Object.values(sensor).some((value) =>
        value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [sensors, searchQuery]);

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const columns: ColumnsType<SensorResponse> = [
    {
      title: 'Name',
      dataIndex: 'sensorName',
      key: 'sensorName',
      sorter: (a, b) => a.sensorName.localeCompare(b.sensorName),
      width: '20%',
    },
    {
      title: 'Type',
      dataIndex: 'sensorType',
      key: 'sensorType',
      filters: Object.values(SensorTypeEnum).map((type) => ({ text: formatEnumLabel(type), value: type })),
      onFilter: (value, record) => record.sensorType === value,
      render: (type: string) => formatEnumLabel(type),
      width: '15%',

    },
    {
      title: 'Status',
      dataIndex: 'sensorStatus',
      key: 'sensorStatus',
      filters: Object.values(SensorStatusEnum).map((status) => ({ text: formatEnumLabel(status), value: status })),
      onFilter: (value, record) => record.sensorStatus === value,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : status === 'INACTIVE' ? 'orange' : 'red'} bordered={false}>
          {formatEnumLabel(status)}
        </Tag>
      ),
      width: '15%',
    },
    {
      title: 'Last Calibrated',
      dataIndex: 'lastCalibratedDate',
      key: 'lastCalibratedDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
      sorter: (a, b) => new Date(a.lastCalibratedDate || '').getTime() - new Date(b.lastCalibratedDate || '').getTime(),
      width: '15%',
    },
    {
      title: 'Next Maintenance',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
      sorter: (a, b) => new Date(a.nextMaintenanceDate || '').getTime() - new Date(b.nextMaintenanceDate || '').getTime(),
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
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`edit/${record.id}`)} />
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
     <ContentWrapperDark>
      <PageHeader>Sensor Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Sensors..."
          onChange={handleSearchBar}
          className="mb-4 bg-white"
          variant="filled"
        />
        {user && (user.role === StaffType.MANAGER || user.role === StaffType.SUPERADMIN) && (
          <Button type="primary" onClick={() => navigate('create')}>
            Create Sensor
          </Button>
        )}
      </Flex>
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSensors}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: SCREEN_LG }}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default SensorManagementPage;
