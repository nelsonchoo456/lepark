// eslint-disable-next-line @typescript-eslint/no-unused-vars
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
//species view
import { deleteSpecies, getAllSpecies, SpeciesResponse, StaffResponse } from '@lepark/data-access';
import { Button, Card, Flex, Input, message, Modal, Table, TableProps, Tag, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiEye, FiSearch, FiTrash2 } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import PageHeader2 from '../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const SpeciesPage = () => {
  const [fetchedSpecies, setFetchedSpecies] = useState<SpeciesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, updateUser } = useAuth<StaffResponse>();
  const [classFilters, setClassFilters] = useState<{ text: string; value: string }[]>([]);
  const [orderFilters, setOrderFilters] = useState<{ text: string; value: string }[]>([]);
  const [conservationStatusFilters, setConservationStatusFilters] = useState<{ text: string; value: string }[]>([]);

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = async () => {
    setLoading(true);
    try {
      const species = await getAllSpecies();
      setFetchedSpecies(species.data);

      // Extract unique values for the 'class', 'order', and 'conservationStatus' columns
      const uniqueClasses = Array.from(new Set(species.data.map((item) => item.class)));
      const uniqueOrders = Array.from(new Set(species.data.map((item) => item.order)));
      const uniqueConservationStatuses = Array.from(new Set(species.data.map((item) => item.conservationStatus)));

      // Generate filter options based on unique values
      setClassFilters(uniqueClasses.map((cls) => ({ text: cls, value: cls })));
      setOrderFilters(uniqueOrders.map((order) => ({ text: order, value: order })));
      setConservationStatusFilters(uniqueConservationStatuses.map((status) => ({
        text: formatEnumLabelToRemoveUnderscores(status),
        value: status
      })));
    } catch (error) {
      console.error('Error fetching species:', error);
      message.error('Failed to fetch species');
    } finally {
      setLoading(false);
    }
  };

  const filteredSpecies = useMemo(() => {
    return fetchedSpecies.filter((species) =>
      Object.values(species).some((value) => 
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, fetchedSpecies]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await new Promise((resolve) => {
        Modal.confirm({
          title: 'Confirm Deletion?',
          content: 'Deleting a Species will delete its Occurrences. This cannot be undone.',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
          okText: "Confirm Delete",
          okButtonProps: { danger: true }
        });
      });

      if (!confirmed) return;

      await deleteSpecies(id);
      setFetchedSpecies((prevSpecies) => prevSpecies.filter((species) => species.id !== id));
      message.success('Species deleted successfully');
    } catch (error) {
      console.error('Error deleting species:', error);
      message.error('Failed to delete species. Please try again.');
    }
  };

  const columns: TableProps<SpeciesResponse>['columns'] = [
    {
      title: 'Common Name',
      dataIndex: 'commonName',
      key: 'commonName',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.commonName.localeCompare(b.commonName),
      width: '20%',
    },
    {
      title: 'Scientific Name',
      dataIndex: 'speciesName',
      key: 'speciesName',
      render: (text) => <i>{text}</i>,
      sorter: (a, b) => a.speciesName.localeCompare(b.speciesName),
      width: '20%',
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      filters: classFilters,
      onFilter: (value, record) => record.class === value,
      width: '15%',
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      filters: orderFilters,
      onFilter: (value, record) => record.order === value,
      width: '15%',
    },
    {
      title: 'Conservation Status',
      dataIndex: 'conservationStatus',
      key: 'conservationStatus',
      filters: conservationStatusFilters,
      onFilter: (value, record) => record.conservationStatus === value,
      render: (status) => {
        let color: string;
        let style: React.CSSProperties = {};
        switch (status) {
          case 'LEAST_CONCERN':
            color = 'green';
            break;
          case 'NEAR_THREATENED':
            color = 'lime';
            break;
          case 'VULNERABLE':
            color = 'orange';
            break;
          case 'ENDANGERED':
            color = 'volcano';
            break;
          case 'CRITICALLY_ENDANGERED':
            color = 'red';
            break;
          case 'EXTINCT_IN_THE_WILD':
            color = 'purple';
            break;
          case 'EXTINCT':
            color = 'lightgray';
            style = { color: 'rgba(0, 0, 0, 0.85)', border: '1px solid #d9d9d9' };
            break;
          default:
            color = 'default';
        }
        return (
          <Tag color={color} style={style} bordered={false}>
            {formatEnumLabelToRemoveUnderscores(status)}
          </Tag>
        );
      },
      width: '20%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Species">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/species/${record.id}`)} />
          </Tooltip>
          {user && !['LANDSCAPE_ARCHITECT', 'PARK_RANGER', 'VENDOR_MANAGER'].includes(user.role) && (
            <>
              <Tooltip title="Edit Species">
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/species/${record.id}/edit`)} />
              </Tooltip>
              <Tooltip title="Delete Species">
                <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => handleDelete(record.id)} />
              </Tooltip>
            </>
          )}
        </Flex>
      ),
      width: '10%',
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Species Management',
      pathKey: '/species',
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
          placeholder="Search in Species..."
          onChange={handleSearch}
          className="mb-4 bg-white"
          variant="filled"
        />
        {user && ['MANAGER', 'SUPERADMIN', 'BOTANIST', 'ARBORIST'].includes(user.role) && (
          <Button type="primary" onClick={() => navigate('/species/create')}>
            Create Species
          </Button>
        )}
      </Flex>

      <Card>
        <Table dataSource={filteredSpecies} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }}/>
      </Card>
    </ContentWrapperDark>
  );
};

export default SpeciesPage;
