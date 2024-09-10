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
import React from 'react';
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
  message
} from 'antd';
import PageHeader from '../../components/main/PageHeader';
import { FiSearch } from 'react-icons/fi';
import { PlusOutlined } from '@ant-design/icons';
import { getAllSpecies, deleteSpecies, SpeciesResponse } from '@lepark/data-access';

const SpeciesPage = () => {
  const [webMode, setWebMode] = useState<boolean>(
    window.innerWidth >= SCREEN_LG,
  );
  const [fetchedSpecies, setFetchedSpecies] = useState<SpeciesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const {Search} = Input;
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
      // Show a confirmation dialog
      const confirmed = await new Promise((resolve) => {
        Modal.confirm({
          title: 'Are you sure you want to delete this species?',
          content: 'This action cannot be undone.',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      if (!confirmed) return;

      // Call the delete API
      await deleteSpecies(id);

      // If successful, update the local state
      setFetchedSpecies(prevSpecies => prevSpecies.filter(species => species.id !== id));

      // Show success message
      message.success('Species deleted successfully');
    } catch (error) {
      console.error('Error deleting species:', error);
      message.error('Failed to delete species. Please try again.');
    }
  };

  const handleEdit = (id: string) => {
    navigate('/species/edit', { state: { speciesId: id } });
  };

  const columns = [
    {
      key: 'commonName',
      title: 'Common Name',
      dataIndex: 'commonName',
      render: (text: string) => text,
    },
    {
      key: 'class',
      title: 'Class',
      dataIndex: 'class',
      render: (text: string) => text,
    },
    {
      key: 'family',
      title: 'Family',
      dataIndex: 'family',
      render: (text: string) => text,
    },
    {
      key: 'genus',
      title: 'Genus',
      dataIndex: 'genus',
      render: (text: string) => text,
    },
    {
      key: 'conservationStatus',
      title: 'Conservation Status',
      dataIndex: 'conservationStatus',
      render: (text: string) => (
        <Tag
          bordered={false}
          color={text === 'LEAST_CONCERN' ? 'green' : 'red'}
        >
          {text}
        </Tag>
      ),
    },
  ];
  // const columns = Object.keys(filteredSpecies[1]).map((label) => ({ key: label, dataIndex: label, label, render: (text: string)=> text}))
  //console.log('filteredSpecies', filteredSpecies);

  return webMode ? (
    // <div className={`h-screen w-[calc(100vw-var(--sidebar-width))] overflow-auto z-[1] p-10`} >
    <ContentWrapperDark>
      <PageHeader>Species Management</PageHeader>
      {/* <CustButton
        type="primary"
        className={`m-5`}
        onClick={() => navigate('/species/create')}
      >
        Create Species
      </CustButton>{' '} */}
      {/*TODO: fix aesthetics*/}
      {/* <Search
        placeholder="Search species"
        allowClear
        enterButton="Search"
        size="large"
        onSearch={handleSearch}
        style={{ marginBottom: 20 }}
      /> */}

      <Flex justify="end" gap={10}>
        <Search
          placeholder="Search species"
          allowClear
          enterButton="Search"
          onSearch={handleSearch}
          style={{ marginBottom: 20 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/species/create')}
        >
          Create Species
        </Button>
      </Flex>
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredSpecies.map((species: any) => ({
            key: species.id,
            ...species,
          }))}
          expandable={{
            expandedRowRender: (species) => {
              const descriptionsItems = Object.entries(species).map(([key, val]) => ({ key, label: key.charAt(0).toUpperCase() + key.slice(1), children: <p>{"" + val}</p>}))
              return (
              <div>
              <Descriptions items={descriptionsItems} column={2} size="small"/>
              <Button className='m-1' type="primary" onClick={() => handleEdit(species.id)}>Edit</Button>
              <Button className='m-1' type="primary" danger onClick={() => handleDelete(species.id)}>Delete</Button>
              </div>)
            },
          }}
        />
      </Card>
      {/* filteredSpecies.map((species: any) => (
        <Card
          key={species.id}
          title={species.commonName}
          style={{ marginBottom: 20 }}
        >
          <Row gutter={[16, 16]}>
            {Object.entries(species).map(([key, value]) => (
              <Col span={6} key={key}>
                <div
                  style={{
                    border: '1px solid #e8e8e8',
                    padding: '8px',
                    background: '#f5f5f5', // Light grey background
                    height: '100%', // Ensure all boxes have the same height
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div>
                    {typeof value === 'boolean'
                      ? value
                        ? 'Yes'
                        : 'No'
                      : value?.toString()}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )) */}
    </ContentWrapperDark>
  ) : (
    // </div>
    <div
      className="h-[calc(100vh-2rem)] w-screen p-4" // page wrapper - padding
    >
      {/* <h1 className="header-1 mb-4">Species Mobile Mode</h1> */}
      <PageHeader>Species Management (Mobile)</PageHeader>
      {/* Add your mobile content here */}
    </div>
  );
};

export default SpeciesPage;
