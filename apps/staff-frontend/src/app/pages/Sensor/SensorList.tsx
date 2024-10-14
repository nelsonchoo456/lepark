import React, { useRef, useState, useMemo } from 'react';
import { Button, Input, Space, Table, Layout, Row, Col, Dropdown, Modal, Flex, Tag, notification, message, Tooltip, Card } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { deleteSensor, SensorResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { SCREEN_LG } from '../../config/breakpoints';
import { FiEye, FiSearch } from 'react-icons/fi';
import { RiEdit2Line, RiExternalLinkLine } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import { ColumnsType } from 'antd/es/table';
import { SensorTypeEnum, SensorStatusEnum } from '@prisma/client';
import { useFetchSensors } from '../../hooks/Sensors/useFetchSensors';
import moment from 'moment';
import PageHeader2 from '../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

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
          okText: 'Confirm Delete',
          okButtonProps: { danger: true },
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
      title: 'Storage Facility',
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
      render: (status: string, record) => {
        switch (status) {
          case SensorStatusEnum.ACTIVE:
            return (
              <>
                <Tag color="green" bordered={false}>
                  {formatEnumLabelToRemoveUnderscores(status)}
                </Tag>
                {record.hub?.name && (
                  <div className="flex">
                    <p className="opacity-50 mr-2">Hub:</p>
                    {record.hub?.name}
                  </div>
                )}
              </>
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
    // {
    //   title: 'Next Maintenance Date',
    //   dataIndex: 'nextMaintenanceDate',
    //   key: 'nextMaintenanceDate',
    //   render: (date: string) => (date ? moment(date).format('D MMM YY') : '-'),
    //   sorter: (a, b) => moment(a.nextMaintenanceDate || '').valueOf() - moment(b.nextMaintenanceDate || '').valueOf(),
    //   width: '15%',
    // },
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
      title: 'Storage Facility',
      render: (_, record) => (
        record.sensorStatus === SensorStatusEnum.ACTIVE ? (
          '-'
        ) : (
          <div>
          <p className="font-semibold">{record.park?.name}</p>
          <div className="flex">
            <p className="opacity-50 mr-2">Facility:</p>
            {record.facility?.name}
          </div>
        </div>
        )
        
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
      render: (status: string, record) => {
        switch (status) {
          case SensorStatusEnum.ACTIVE:
            return (
              <>
                <Tag color="green" bordered={false}>
                  {formatEnumLabelToRemoveUnderscores(status)}
                </Tag>
                {record.hub && (
                  <p>
                    <span className="opacity-50 mr-2">Hub:</span>
                    {record.hub?.name}
                  </p>
                )}
              </>
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
    // {
    //   title: 'Next Maintenance Date',
    //   dataIndex: 'nextMaintenanceDate',
    //   key: 'nextMaintenanceDate',
    //   render: (date: string) => (date ? moment(date).format('D MMM YY') : '-'),
    //   sorter: (a, b) => moment(a.nextMaintenanceDate || '').valueOf() - moment(b.nextMaintenanceDate || '').valueOf(),
    //   width: '15%',
    // },
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

  const breadcrumbItems = [
    {
      title: 'Sensors Management',
      pathKey: '/sensor',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Sensors..."
          onChange={handleSearchBar}
          className="mb-4 bg-white"
          variant="filled"
        />

        <Button type="primary" onClick={() => navigate('create')}>
          Create Sensor
        </Button>
      </Flex>
      <Card>
        <Table
          columns={user?.role === StaffType.SUPERADMIN ? superAdminColumns : columns}
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