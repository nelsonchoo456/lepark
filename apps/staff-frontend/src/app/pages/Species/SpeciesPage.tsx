// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState, useMemo } from 'react';
import MainLayout from '../../components/main/MainLayout';
import 'leaflet/dist/leaflet.css';
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  SIDEBAR_WIDTH,
  CustButton,
  ContentWrapperDark,
} from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
//species view
import { useNavigate } from 'react-router-dom';
import type { DescriptionsProps } from 'antd';
import { speciesExamples } from '@lepark/data-utility';
import {
  Descriptions,
  Card,
  Row,
  Col,
  Input,
  Tag,
  Flex,
  Button,
  Table,
  Modal,
  message,
  Tooltip,
  TableProps
} from 'antd';
import PageHeader from '../../components/main/PageHeader';
import { PlusOutlined } from '@ant-design/icons';
import { getAllSpecies, deleteSpecies, SpeciesResponse } from '@lepark/data-access';

import { FiSearch, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

const SpeciesPage = () => {
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const [fetchedSpecies, setFetchedSpecies] = useState<SpeciesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
      Object.values(species).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
      ),
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
      setFetchedSpecies(prevSpecies => prevSpecies.filter(species => species.id !== id));
      message.success('Species deleted successfully');
    } catch (error) {
      console.error('Error deleting species:', error);
      message.error('Failed to delete species. Please try again.');
    }
  };

  const renderBooleanTag = (value: boolean | undefined) => {
    if (value === undefined) return <Tag>Unknown</Tag>;
    return value ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>;
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
      title: 'Family',
      dataIndex: 'family',
      key: 'family',
      render: (text) => text,
    },
    {
      title: 'Conservation Status',
      dataIndex: 'conservationStatus',
      key: 'conservationStatus',
      render: (status) => {
        let color = 'green';
        switch (status) {
          case 'VULNERABLE':
            color = 'orange';
            break;
          case 'ENDANGERED':
          case 'CRITICALLY_ENDANGERED':
            color = 'red';
            break;
          default:
            color = 'green';
        }
        return <Tag color={color}>{status.replace('_', ' ')}</Tag>;
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
          <Tooltip title="Edit Species">
            <Button type="link" icon={<FiEdit2 />} onClick={() => navigate('/species/edit', { state: { speciesId: record.id } })} />
          </Tooltip>
          <Tooltip title="Delete Species">
            <Button type="link" icon={<FiTrash2 />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Flex>
      ),
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
          style={{ width: 200 }}
        />
        <Button
          type="primary"
          onClick={() => navigate('/species/create')}
        >
          Create Species
        </Button>
      </Flex>

      <Card>
        <Table
          dataSource={filteredSpecies}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default SpeciesPage;
