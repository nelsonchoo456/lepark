import React, { useState, useMemo, useEffect } from 'react';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { Card, Input, Row, Col, Statistic, Tag, Button, Flex, Tooltip, Typography, Progress, Space } from 'antd';
import { FiSearch, FiEye } from 'react-icons/fi';
import {
  StaffResponse,
  ZoneResponse,
  HubResponse,
  SensorResponse,
  SensorStatusEnum,
  SensorTypeEnum,
  getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo,
  getZoneTrendForSensorType,
  getActiveZonePlantSensorCount,
  getAverageDifferenceBetweenPeriodsBySensorType,
  getPlantSensorsByZoneId,
} from '@lepark/data-access';
import { useNavigate } from 'react-router-dom';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import PageHeader2 from '../../components/main/PageHeader2';
import { SCREEN_LG } from '../../config/breakpoints';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ZoneIoTDashboard: React.FC = () => {
  const { zonesWithIoT, loading } = useFetchZones();
  const { user } = useAuth<StaffResponse>();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [zoneMetrics, setZoneMetrics] = useState<{ [key: number]: any }>({});
  const [zoneDifferences, setZoneDifferences] = useState<{ [key: number]: any }>({});
  const [activeSensorCounts, setActiveSensorCounts] = useState<{ [key: number]: number }>({});
  const [zoneTotalSensors, setZoneTotalSensors] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const fetchZoneMetrics = async () => {
      const metrics: { [key: number]: any } = {};
      const differences: { [key: number]: any } = {};
      const activeCounts: { [key: number]: number } = {};
      const totalSensors: { [key: number]: number } = {};
      for (const zone of zonesWithIoT) {
        try {
          const averageReadings = await getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo(zone.id, 4);
          metrics[zone.id] = averageReadings.data;

          const avgDifferences = await getAverageDifferenceBetweenPeriodsBySensorType(zone.id, 4);
          differences[zone.id] = avgDifferences.data;

          const activeCount = await getActiveZonePlantSensorCount(zone.id);
          activeCounts[zone.id] = activeCount.data.count;

          const totalSensorsCount = await getPlantSensorsByZoneId(zone.id);
          totalSensors[zone.id] = totalSensorsCount.data.length;
        } catch (error) {
          console.error(`Error fetching data for zone ${zone.id}:`, error);
          metrics[zone.id] = {};
          differences[zone.id] = {};
          activeCounts[zone.id] = 0;
        }
      }
      setZoneMetrics(metrics);
      setZoneDifferences(differences);
      setActiveSensorCounts(activeCounts);
      setZoneTotalSensors(totalSensors);
    };

    fetchZoneMetrics();
  }, [zonesWithIoT]);

  const filteredZones = useMemo(() => {
    return zonesWithIoT.filter((zone) => Object.values(zone).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, zonesWithIoT]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToZoneDetails = (zoneId: number) => {
    navigate(`/iot/zones/${zoneId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'green';
      case 'UNDER_CONSTRUCTION':
        return 'orange';
      case 'LIMITED_ACCESS':
        return 'yellow';
      case 'CLOSED':
        return 'red';
      default:
        return 'default';
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

  const filteredSensorTypes = [SensorTypeEnum.SOIL_MOISTURE, SensorTypeEnum.TEMPERATURE, SensorTypeEnum.LIGHT, SensorTypeEnum.HUMIDITY];

  const renderDifference = (sensorType: SensorTypeEnum, zoneId: number) => {
    const difference = zoneDifferences[zoneId]?.[sensorType]?.difference;
    if (difference === undefined) return null;

    const icon = difference >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
    return (
      <Tooltip title="Change from previous 4-hour period">
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {icon} {Math.abs(difference).toFixed(2)}
        </Text>
      </Tooltip>
    );
  };

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Flex justify="end" className="mb-4">
        <Input suffix={<FiSearch />} placeholder="Search zones..." className="bg-white" style={{ width: 250 }} onChange={handleSearch} />
      </Flex>

      <Row gutter={[16, 16]}>
        {filteredZones.map((zone) => {
          const metrics = zoneMetrics[zone.id] || {};
          const activeSensorCount = activeSensorCounts[zone.id] || 0;
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
                <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Avg. Temperature"
                        value={metrics[SensorTypeEnum.TEMPERATURE]?.toFixed(2) || 0}
                        suffix={
                          <>
                            °C
                            {renderDifference(SensorTypeEnum.TEMPERATURE, zone.id)}
                          </>
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Avg. Humidity"
                        value={metrics[SensorTypeEnum.HUMIDITY]?.toFixed(2) || 0}
                        suffix={<>%{renderDifference(SensorTypeEnum.HUMIDITY, zone.id)}</>}
                      />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Avg. Soil Moisture"
                        value={metrics[SensorTypeEnum.SOIL_MOISTURE]?.toFixed(2) || 0}
                        suffix={<>%{renderDifference(SensorTypeEnum.SOIL_MOISTURE, zone.id)}</>}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Avg. Light"
                        value={metrics[SensorTypeEnum.LIGHT]?.toFixed(2) || 0}
                        suffix={
                          <>
                            Lux
                            {renderDifference(SensorTypeEnum.LIGHT, zone.id)}
                          </>
                        }
                      />
                    </Col>
                  </Row>
                  <Statistic
                    title={
                      <Tooltip title="Active sensors are those that have sent data within the past hour">
                        <span>Active Sensors</span>
                      </Tooltip>
                    }
                    value={activeSensorCount}
                    suffix={`/ ${zoneTotalSensors[zone.id]} sensors`}
                  />
                  <Typography.Text type="secondary">Average readings for the past 4 hours</Typography.Text>
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
