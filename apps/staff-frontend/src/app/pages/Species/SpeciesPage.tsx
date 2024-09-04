// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState, useMemo } from 'react';
import MainLayout from '../../components/main/MainLayout';
import "leaflet/dist/leaflet.css";
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { SIDEBAR_WIDTH, CustButton, PageWrapper } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
//species view
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { DescriptionsProps } from 'antd';
import {speciesExamples} from '@lepark/data-utility'
import { Descriptions, Card, Row, Col, Input, Tag } from 'antd';

const SpeciesPage = () => {
  const [webMode, setWebMode] = useState<boolean>(
    window.innerWidth >= SCREEN_LG
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
    return speciesExamples.filter(species =>
      Object.values(species).some(value =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };


  return webMode ? (
        <div className={`h-screen w-[calc(100vw-var(--sidebar-width))] overflow-auto z-[1] p-10`} >
      <h1 className="header-1 mb-4">Species</h1>

      <CustButton type="primary" className={`m-5`} onClick={()=>navigate('/species/create')}>
        Create Species
      </CustButton>  {/*TODO: fix aesthetics*/}

    <Search placeholder="Search species" allowClear enterButton="Search" size="large" onSearch={handleSearch} style={{ marginBottom: 20 }} />

      {filteredSpecies.map((species) => (
        <Card key={species.id} title={species.commonName} style={{ marginBottom: 20 }}>
          <Row gutter={[16, 16]}>
            {Object.entries(species).map(([key, value]) => (
              <Col span={6} key={key}>
                <div style={{
                  border: '1px solid #e8e8e8',
                  padding: '8px',
                  background: '#f5f5f5', // Light grey background
                  height: '100%', // Ensure all boxes have the same height
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div>
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      ))}

    </div>
  ) : (
    <div
      className="h-[calc(100vh-2rem)] w-screen p-4" // page wrapper - padding
    >
       <h1 className="header-1 mb-4">Species Mobile Mode</h1>
       {/* Add your mobile content here */}
    </div>
  );
};

export default SpeciesPage;
