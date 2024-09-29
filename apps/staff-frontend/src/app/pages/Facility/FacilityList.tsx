import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { FacilityResponse, StaffResponse, StaffType, deleteFacility } from '@lepark/data-access';
import { Button, Card, Flex, Input, Table, TableProps, Tag, Tooltip, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { FiEye, FiSearch } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { SCREEN_LG } from '../../config/breakpoints';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import moment from 'moment';

const FacilityList: React.FC = () => {
  const { facilities, loading, triggerFetch } = useFetchFacilities();
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [facilityToBeDeleted, setFacilityToBeDeleted] = useState<FacilityResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { parks } = useFetchParks();

  const filteredFacilities = useMemo(() => {
    let filtered = facilities;

    return filtered.filter((facility) => {
      const park = parks.find((p) => p.id === facility.parkId);
      return (
        facility.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.facilityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        park?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.facilityStatus.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, facilities, parks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (facilityId: string) => {
    navigate(`/facilities/${facilityId}`);
  };

  const facilityTypes = [
    { text: 'Toilet', value: 'TOILET' },
    { text: 'Playground', value: 'PLAYGROUND' },
    { text: 'Information', value: 'INFORMATION' },
    { text: 'Carpark', value: 'CARPARK' },
    { text: 'Accessibility', value: 'ACCESSIBILITY' },
    { text: 'Stage', value: 'STAGE' },
    { text: 'Water Fountain', value: 'WATER_FOUNTAIN' },
    { text: 'Picnic Area', value: 'PICNIC_AREA' },
    { text: 'BBQ Pit', value: 'BBQ_PIT' },
    { text: 'Camping Area', value: 'CAMPING_AREA' },
    { text: 'AED', value: 'AED' },
    { text: 'First Aid', value: 'FIRST_AID' },
    { text: 'Amphitheater', value: 'AMPHITHEATER' },
    { text: 'Gazebo', value: 'GAZEBO' },
    { text: 'Storeroom', value: 'STOREROOM' },
    { text: 'Others', value: 'OTHERS' },
  ];

  const columns: TableProps<FacilityResponse>['columns'] = [
    {
      title: 'Facility Name',
      dataIndex: 'facilityName',
      key: 'facilityName',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.facilityName.localeCompare(b.facilityName),
      width: '20%',
    },
    {
      title: 'Facility Type',
      dataIndex: 'facilityType',
      key: 'facilityType',
      render: (text) => <div>{text}</div>,
      filters: facilityTypes,
      onFilter: (value, record) => record.facilityType === value,
      width: '15%',
    },
    {
      title: 'Facility Status',
      dataIndex: 'facilityStatus',
      key: 'facilityStatus',
      render: (text) => {
        switch (text) {
          case 'OPEN':
            return <Tag color="green">OPEN</Tag>;
          case 'CLOSED':
            return <Tag color="red">CLOSED</Tag>;
          case 'MAINTENANCE':
            return <Tag color="yellow">MAINTENANCE</Tag>;
          default:
            return <Tag>{text}</Tag>;
        }
      },
      filters: [
        { text: 'Open', value: 'OPEN' },
        { text: 'Closed', value: 'CLOSED' },
        { text: 'Maintenance', value: 'MAINTENANCE' },
      ],
      onFilter: (value, record) => record.facilityStatus === value,
      width: '15%',
    },
    {
      title: 'Last Maintenance Date',
      dataIndex: 'lastMaintenanceDate',
      key: 'lastMaintenanceDate',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.lastMaintenanceDate).unix() - moment(b.lastMaintenanceDate).unix(),
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          {user?.role !== StaffType.ARBORIST && user?.role !== StaffType.BOTANIST && (
            <>
              <Tooltip title="Edit">
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/facilities/${record.id}/edit`)} />
              </Tooltip>
            </>
          )}
          {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.LANDSCAPE_ARCHITECT) && (
            <>
              <Tooltip title="Delete">
                <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => showDeleteModal(record)} />
              </Tooltip>
            </>
          )}
        </Flex>
      ),
      width: '15%',
    },
  ];

  if (user?.role === StaffType.SUPERADMIN) {
    columns.splice(2, 0, {
      title: 'Park',
      dataIndex: 'parkId',
      key: 'parkId',
      render: (parkId) => {
        const park = parks.find((p) => p.id === parkId);
        return <div>{park ? park.name : parkId}</div>;
      },
      filters:
        user?.role === StaffType.SUPERADMIN
          ? useMemo(() => {
              const uniqueParkIds = [...new Set(facilities.map((a) => a.parkId))];
              return uniqueParkIds.map((parkId) => {
                const park = parks.find((p) => p.id === parkId);
                return { text: park ? park.name : `Park ${parkId}`, value: parkId };
              });
            }, [facilities, parks])
          : undefined,
      onFilter: user?.role === StaffType.SUPERADMIN ? (value, record) => record.parkId === value : undefined,
      // width: '25%',
    });
  }

  const showDeleteModal = (facility: FacilityResponse) => {
    setDeleteModalOpen(true);
    setFacilityToBeDeleted(facility);
  };

  const cancelDelete = () => {
    setFacilityToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  const deleteFacilityToBeDeleted = async () => {
    try {
      if (facilityToBeDeleted) {
        await deleteFacility(facilityToBeDeleted.id);
        messageApi.success('Facility deleted successfully');
        setFacilityToBeDeleted(null);
        triggerFetch();
        cancelDelete();
      }
    } catch (error) {
      messageApi.error('Failed to delete facility');
    }
  };

  const breadcrumbItems = [
    {
      title: 'Facility Management',
      pathKey: '/facilities',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <ConfirmDeleteModal
        onCancel={cancelDelete}
        onConfirm={deleteFacilityToBeDeleted}
        description={`Are you sure you want to delete the facility "${facilityToBeDeleted?.facilityName}"?`}
        open={deleteModalOpen}
      />
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Facilities..."
          className="mb-4 bg-white"
          variant="filled"
          onChange={handleSearch}
        />
        {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.LANDSCAPE_ARCHITECT) && (
          <Button type="primary" onClick={() => navigate('/facilities/create')}>
            Create Facility
          </Button>
        )}
      </Flex>
      <Card>
        <Table dataSource={filteredFacilities} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }} />
      </Card>
    </ContentWrapperDark>
  );
};

export default FacilityList;
