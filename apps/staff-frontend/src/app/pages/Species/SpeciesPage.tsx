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
} from 'antd';
import PageHeader from '../../components/main/PageHeader';
import { FiSearch } from 'react-icons/fi';
import { PlusOutlined } from '@ant-design/icons';

const SpeciesPage = () => {
  const [webMode, setWebMode] = useState<boolean>(
    window.innerWidth >= SCREEN_LG,
  );

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  //navigation
  const navigate = useNavigate();

  // Species search
  const { Search } = Input;
  const [searchQuery, setSearchQuery] = useState('');
  const filteredSpecies = useMemo(() => {
    return speciesExamples.filter((species) =>
      Object.values(species).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
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
  console.log('filteredSpecies', filteredSpecies);

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
          Add Staff
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
              return <Descriptions items={descriptionsItems} column={2} size="small"/>
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
