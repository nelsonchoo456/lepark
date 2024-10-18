import {
  HubResponse,
  ZoneResponse,
  StaffResponse,
  StaffType,
  SensorResponse,
  deleteSensor,
  SensorStatusEnum,
  SensorTypeEnum,
  removeSensorFromHub,
} from '@lepark/data-access';
import { MdDeleteOutline } from 'react-icons/md';
import { useAuth } from '@lepark/common-ui';
import { Button, Flex, Input, message, Modal, Tag, Tooltip, Table, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { ColumnsType } from 'antd/es/table';
import { FiEye, FiSearch } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { SCREEN_LG } from '../../../config/breakpoints';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal';
import { LuUnplug } from "react-icons/lu";

interface SensorsTabProps {
  hub: HubResponse;
  zone: ZoneResponse;
  sensors?: SensorResponse[];
  fetchSensors: () => void; // callback function
}

const SensorsTab = ({ hub, zone, sensors, fetchSensors }: SensorsTabProps) => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [sensorToBeDeactivated, setSensorToBeDeactivated] = useState<SensorResponse | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [updatedData, setUpdatedData] = useState<SensorResponse>();

  const canActivateEdit = user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER

  // Deactivate utility
  const cancelDeactivate = () => {
    setSensorToBeDeactivated(null);
    setDeactivateModalOpen(false);
  };

  const showDeactivateModal = (sensor: SensorResponse) => {
    setSensorToBeDeactivated(sensor);
    setDeactivateModalOpen(true);
  };

  const handleDeactivateSensor = async () => {
    try {
      if (!sensorToBeDeactivated) {
        throw new Error('Unable to deactivate Sensor a this time.');
      }
      const sensorRes = await removeSensorFromHub(sensorToBeDeactivated.id);
      if (sensorRes.status === 200) {
        setUpdatedData(sensorRes.data);
        
        setTimeout(() => {
          setDeactivateModalOpen(false);
          // triggerFetch();
          fetchSensors();
        }, 2000);
      }
      
    } catch (error) {
      console.log(error);
      if (
        error === 'Sensor is not assigned to any hub' ||
        error === 'Sensor must be active to be removed from a hub' ||
        error === 'Sensor not found'
      ) {
        messageApi.open({
          type: 'error',
          content: error,
        });
        setDeactivateModalOpen(false);
      } else {
        messageApi.open({
          type: 'error',
          content: `Unable to deactivate Sensor at this time. Please try again later.`,
        });
        setDeactivateModalOpen(false);
      }
      
    }
  };

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
          {canActivateEdit &&
            <Tooltip title="Delink Sensor">
              <Button danger type="link" icon={<LuUnplug className="text-error" />} onClick={() => showDeactivateModal(record)} />
            </Tooltip>
          }
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
          {canActivateEdit &&
            <Tooltip title="Delink Sensor">
              <Button danger type="link" icon={<LuUnplug className="text-error" />} onClick={() => showDeactivateModal(record)} />
            </Tooltip>
          }
        </Flex>
      ),
      width: '1%',
    },
  ];

  return (
    <>
      <ConfirmDeleteModal
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
        {/* For Success */}
        {updatedData && <Result
          status="success"
          title={updatedData ? `Delinked ${updatedData.name}` : 'Delinked Sensor'}
          subTitle="Returning to Sensors Tab..."
        />}
      </ConfirmDeleteModal>
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
