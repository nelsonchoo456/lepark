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
import PageHeader from '../../components/main/PageHeader';

import { FiEdit2, FiEye, FiSearch, FiTrash2 } from 'react-icons/fi';

const SpeciesPage = () => {
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const [fetchedSpecies, setFetchedSpecies] = useState<SpeciesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, updateUser } = useAuth<StaffResponse>();


  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchSpecies = async () => {
      setLoading(true);
      try {
        const species = await getAllSpecies();
        setFetchedSpecies(species.data);
        console.log('fetched species', species.data);
      } catch (error) {
        console.error('Error fetching species:', error);
        message.error('Failed to fetch species');
      } finally {
        setLoading(false);
      }
    };
    fetchSpecies();
  }, []);

  const filteredSpecies = useMemo(() => {
    if (loading) return [];
    return fetchedSpecies.filter((species) =>
      Object.values(species).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [searchQuery, fetchedSpecies, loading]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await new Promise((resolve) => {
        Modal.confirm({
          title: 'Are you sure you want to delete this species?',
          content: 'This action cannot be undone.',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
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
      render: (text) => text,
    },
    {
      title: 'Scientific Name',
      dataIndex: 'speciesName',
      key: 'speciesName',
      render: (text) => <i>{text}</i>,
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      render: (text) => text,
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      render: (text) => text,
    },
    {
      title: 'Family',
      dataIndex: 'family',
      key: 'family',
      render: (text) => text,
    },
    {
      title: 'Genus',
      dataIndex: 'genus',
      key: 'genus',
      render: (text) => text,
    },
    {
      title: 'Conservation Status',
      dataIndex: 'conservationStatus',
      key: 'conservationStatus',
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
            color = 'white';
            style = { color: 'rgba(0, 0, 0, 0.85)', border: '1px solid #d9d9d9' };
            break;
          default:
            color = 'default';
        }
        return (
          <Tag color={color} style={style}>
            {status.replace(/_/g, ' ')}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/species/${record.id}`)} />
          </Tooltip>
          {user && !['LANDSCAPE_ARCHITECT', 'PARK_RANGER', 'VENDOR_MANAGER'].includes(user.role) && (
            <>
              <Tooltip title="Edit Species">
                <Button type="link" icon={<FiEdit2 />} onClick={() => navigate('/species/edit', { state: { speciesId: record.id } })} />
              </Tooltip>
              <Tooltip title="Delete Species">
                <Button type="link" icon={<FiTrash2 />} onClick={() => handleDelete(record.id)} />
              </Tooltip>
            </>
          )}
        </Flex>
      ),
      width: '1%',
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader>Species Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search species..."
          onChange={(e) => handleSearch(e.target.value)}
          className="mb-4 bg-white"
          variant="filled"
        />
        <Button type="primary" onClick={() => navigate('/species/create')}>
          Create Species
        </Button>
      </Flex>

      <Card>
        <Table dataSource={filteredSpecies} columns={columns} rowKey="id" loading={loading} />
      </Card>
    </ContentWrapperDark>
  );
};

export default SpeciesPage;
