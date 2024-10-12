import React, { useState, useMemo, useEffect } from 'react';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { Card, Input, Row, Col, Statistic, Tag, Button, Flex, Tooltip, Typography, Progress, Space } from 'antd';
import { FiSearch, FiEye } from 'react-icons/fi';
import { StaffResponse, ZoneResponse, HubResponse, SensorResponse, SensorStatusEnum } from '@lepark/data-access';
import { useNavigate } from 'react-router-dom';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import PageHeader2 from '../../components/main/PageHeader2';
import { SCREEN_LG } from '../../config/breakpoints';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { getSensorReadingsAverageForPastFourHours } from '@lepark/data-access';

const { Text } = Typography;

const ZoneIoTDashboard: React.FC = () => {
  const { zones, loading } = useFetchZones();
  const { user } = useAuth<StaffResponse>();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [zoneMetrics, setZoneMetrics] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    const fetchZoneMetrics = async () => {
      const metrics: { [key: number]: any } = {};
      for (const zone of zones) {
        const hub = zone.hub;
        const sensors = zone.sensors || [];
        const totalDevices = (hub ? 1 : 0) + sensors.length;
        const activeDevices = (hub?.hubStatus === 'ACTIVE' ? 1 : 0) + 
          sensors.filter(s => s.sensorStatus === SensorStatusEnum.ACTIVE).length;

        const sensorMetrics = await Promise.all(sensors.map(async (sensor) => {
          try {
            const response = await getSensorReadingsAverageForPastFourHours(sensor.id);
            console.log(response.data);
            return { type: sensor.sensorType, value: response.data[0]?.value || 0 };
          } catch (error) {
            console.error(`Error fetching data for sensor ${sensor.id}:`, error);
            return { type: sensor.sensorType, value: 0 };
          }
        }));

        const avgTemperature = sensorMetrics.filter(m => m.type === 'TEMPERATURE').reduce((sum, m) => sum + m.value, 0) / 
          (sensorMetrics.filter(m => m.type === 'TEMPERATURE').length || 1);
        const avgMoisture = sensorMetrics.filter(m => m.type === 'SOIL_MOISTURE').reduce((sum, m) => sum + m.value, 0) / 
          (sensorMetrics.filter(m => m.type === 'SOIL_MOISTURE').length || 1);
        const avgLight = sensorMetrics.filter(m => m.type === 'LIGHT').reduce((sum, m) => sum + m.value, 0) / 
          (sensorMetrics.filter(m => m.type === 'LIGHT').length || 1);
        const avgHumidity = sensorMetrics.filter(m => m.type === 'HUMIDITY').reduce((sum, m) => sum + m.value, 0) / 
          (sensorMetrics.filter(m => m.type === 'HUMIDITY').length || 1);

        metrics[zone.id] = { totalDevices, activeDevices, avgTemperature, avgMoisture, avgLight, avgHumidity };
      }
      setZoneMetrics(metrics);
    };

    fetchZoneMetrics();
  }, [zones]);

  const filteredZones = useMemo(() => {
    return zones.filter((zone) =>
      Object.values(zone).some((value) => 
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, zones]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToZoneDetails = (zoneId: number) => {
    navigate(`/zone/${zoneId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'green';
      case 'UNDER_CONSTRUCTION': return 'orange';
      case 'LIMITED_ACCESS': return 'yellow';
      case 'CLOSED': return 'red';
      default: return 'default';
    }
  };

  const breadcrumbItems = [
    {
      title: 'IoT Dashboard',
      pathKey: '/zone-iot-dashboard',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Flex justify="end" className="mb-4">
        <Input 
          suffix={<FiSearch />} 
          placeholder="Search zones..." 
          className="bg-white" 
          style={{ width: 250 }}
          onChange={handleSearch}
        />
      </Flex>

      <Row gutter={[16, 16]}>
        {filteredZones.map((zone) => {
          const metrics = zoneMetrics[zone.id] || {};
          const { totalDevices, activeDevices, avgTemperature, avgMoisture, avgLight, avgHumidity } = metrics;
          return (
            <Col xs={24} sm={12} lg={8} key={zone.id}>
              <Card
                title={
                  <Flex justify="space-between" align="center">
                    <Typography.Text strong>{zone.name}</Typography.Text>
                    <Tag color={getStatusColor(zone.zoneStatus)}>{formatEnumLabelToRemoveUnderscores(zone.zoneStatus)}</Tag>
                  </Flex>
                }
                extra={
                  <Tooltip title="View Zone Details">
                    <Button type="link" icon={<FiEye />} onClick={() => navigateToZoneDetails(zone.id)} />
                  </Tooltip>
                }
              >
                <Flex vertical gap="small">
                  <Statistic title="IoT Devices" value={totalDevices} />
                  <Statistic title="Active Devices" value={activeDevices} suffix={`/ ${totalDevices}`} />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="Avg. Soil Moisture" value={avgMoisture?.toFixed(2) || 0} suffix="%" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Avg. Light" value={avgLight?.toFixed(2) || 0} suffix="Lux" />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="Avg. Temperature" value={avgTemperature?.toFixed(2) || 0} suffix="°C" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Avg. Humidity" value={avgHumidity?.toFixed(2) || 0} suffix="%" />
                    </Col>
                  </Row>
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>
    </ContentWrapperDark>
  );
};

export default ZoneIoTDashboard;
