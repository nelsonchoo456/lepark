import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { Card, Tabs, Row, Col, Statistic, Tag, Typography, Spin, Empty, Space, List, Tooltip, Button, Select, Collapse, Badge, Flex } from 'antd';
import { FiThermometer, FiDroplet, FiSun, FiWind, FiExternalLink, FiCamera, FiCloudRain } from 'react-icons/fi';
import { ArrowDownOutlined, ArrowUpOutlined, WarningOutlined, MinusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import {
  StaffResponse,
  ZoneResponse,
  SensorResponse,
  SensorTypeEnum,
  getZoneById,
  getSensorsByZoneId,
  getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo,
  getZoneTrendForSensorType,
  getUnhealthyOccurrences,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip as ChartTooltip, Legend } from 'chart.js';
import SensorDetails from './SensorDetails';
import { useRestrictZone } from '../../hooks/IoT/useRestrictZone';
import { useZoneIoTDetails } from '../../hooks/IoT/useZoneIoTDetails';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, ChartTooltip, Legend);

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
export const getSensorIcon = (sensorType: SensorTypeEnum) => {
  switch (sensorType) {
    case SensorTypeEnum.TEMPERATURE:
      return <FiThermometer />;
    case SensorTypeEnum.HUMIDITY:
      return <FiDroplet />;
    case SensorTypeEnum.LIGHT:
      return <FiSun />;
    case SensorTypeEnum.SOIL_MOISTURE:
      return <FiWind />;
    default:
      return null;
  }
};

const ZoneIoTDetailsPage: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const { zone, loading: zoneLoading } = useRestrictZone(zoneId);
  const {
    sensors,
    averageReadings,
    trends,
    unhealthyOccurrences,
    loading: detailsLoading,
    filteredSensorTypes
  } = useZoneIoTDetails(zoneId || '');

  const loading = zoneLoading || detailsLoading;

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

  const getSensorUnit = (sensorType: SensorTypeEnum) => {
    switch (sensorType) {
      case SensorTypeEnum.TEMPERATURE:
        return '°C';
      case SensorTypeEnum.HUMIDITY:
        return '%';
      case SensorTypeEnum.LIGHT:
        return 'Lux';
      case SensorTypeEnum.SOIL_MOISTURE:
        return '%';
      default:
        return '';
    }
  };


  const breadcrumbItems = [
    {
      title: 'IoT Dashboard',
      pathKey: '/iot/zones',
    },
    {
      title: zone?.name || 'Zone Details',
      pathKey: `/iot/zones/${zoneId}`,
      isMain: true,
      isCurrent: true,
    },
  ];

  const renderTrendAnalysis = (sensorType: string, trend: any) => {
    if (!trend) return 'N/A';

    const getArrow = (value: string) => {
      const numberValue = parseFloat(value);
      if (isNaN(numberValue)) return <MinusOutlined style={{ color: 'gray' }} />;
      if (numberValue < 0) return <ArrowDownOutlined style={{ color: 'red' }} />;
      if (numberValue > 0) return <ArrowUpOutlined style={{ color: 'green' }} />;
      return <MinusOutlined style={{ color: 'gray' }} />;
    };

    return (
      <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
        <Col span={12}>
          <Tooltip title="Direction and magnitude of change">
            <Statistic
              title="Trend"
              value={trend.directionOfChange}
              suffix={trend.magnitudeOfChange}
              valueStyle={{ fontSize: '14px' }}
            />
          </Tooltip>
        </Col>
        <Col span={12}>
          <Tooltip title="Total change over the period">
            <Statistic
              title="Absolute Change"
              value={trend.absoluteChange}
              prefix={getArrow(trend.absoluteChange)}
              valueStyle={{ fontSize: '14px' }}
            />
          </Tooltip>
        </Col>
        <Col span={12}>
          <Tooltip title="Change per hour">
            <Statistic
              title="Rate"
              value={trend.rateOfChange}
              valueStyle={{ fontSize: '14px' }}
            />
          </Tooltip>
        </Col>
        <Col span={12}>
          <Tooltip title="Number of readings analyzed">
            <Statistic
              title="Data Points"
              value={trend.readingsCount}
              valueStyle={{ fontSize: '14px' }}
            />
          </Tooltip>
        </Col>
        <Col span={24}>
          <Text strong>Insight:</Text>
          <Text> {trend.actionableInsight}</Text>
        </Col>
      </Row>
    );
  };

  if (loading) {
    return (
      <ContentWrapperDark>
        <Spin size="large" />
      </ContentWrapperDark>
    );
  }

  if (!zone) {
    return (
      <ContentWrapperDark>
        <Empty description="Zone not found" />
      </ContentWrapperDark>
    );
  }

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <Space align="center" size={16}>
              <Title level={3} style={{ marginBottom: 0 }}>{zone.name}</Title>
              <Tag color={getStatusColor(zone.zoneStatus)} style={{ fontSize: '12px', padding: '2px 8px', marginLeft: '3px' }}>
                {formatEnumLabelToRemoveUnderscores(zone.zoneStatus)}
              </Tag>
                
            </Space>
          </Col>
          <Col xs={24} md={14} style={{ textAlign: 'right' }}>
            <Space>
              <Link to={`/iot/zones/${zoneId}/camera-streams`}>
                <Button type="primary" icon={<FiCamera className='text-xl'/>} >View Camera Streams</Button>
              </Link>
              <Link to={`/iot/zones/${zoneId}/predictive-irrigation`}>
                <Button type="primary" icon={<FiCloudRain className='text-xl'/>} >View Rainfall Forecast</Button>
              </Link>
            </Space>
          </Col>
        </Row>
        <Flex justify='flex-end'>
          <Tooltip title="Data averaged over the last 4 hours">
            <Text type="secondary">
              <ClockCircleOutlined /> 4-Hour Average
            </Text>
          </Tooltip>
        </Flex>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {Object.entries(averageReadings)
            .filter(([sensorType]) => filteredSensorTypes.includes(sensorType as SensorTypeEnum))
            .map(([sensorType, value]) => (
              <Col xs={24} sm={12} md={6} key={sensorType}>
                <Statistic
                  title={`Average ${formatEnumLabelToRemoveUnderscores(sensorType as SensorTypeEnum)}`}
                  value={value.toFixed(2)}
                  prefix={getSensorIcon(sensorType as SensorTypeEnum)}
                  suffix={getSensorUnit(sensorType as SensorTypeEnum)}
                />
                {renderTrendAnalysis(sensorType, trends[sensorType])}
              </Col>
            ))}
        </Row>
      </Card>

      {/* New section for unhealthy occurrences */}
      {unhealthyOccurrences.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space align="center">
              <Title level={4} style={{ margin: 0 }}>
                <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                Potential Issues
              </Title>
              <Badge 
                count={unhealthyOccurrences.length} 
                overflowCount={99} 
                style={{ backgroundColor: '#faad14', marginLeft: 8 }}
              />
            </Space>
            <Text type="secondary" style={{ marginBottom: 16 }}>
              Based on sensor readings from the last hour
            </Text>
          </Space>
          
          <Collapse>
            {unhealthyOccurrences.map((item, index) => (
              <Panel 
                key={index} 
                header={
                  <Space>
                    <Text strong>{item.speciesName}</Text>
                    <Text type="secondary">({item.occurrenceName})</Text>
                    <Badge count={item.issues.length} style={{ backgroundColor: '#ff4d4f' }} />
                  </Space>
                }
                extra={
                  <Tooltip title="View Occurrence Details">
                    <Button
                      type="link"
                      icon={<FiExternalLink />}
                      onClick={(event) => {
                        event.stopPropagation();
                        window.open(`/occurrences/${item.occurrenceId}`, '_blank');
                      }}
                    />
                  </Tooltip>
                }
              >
                <List
                  size="small"
                  dataSource={item.issues}
                  renderItem={(issue: string) => (
                    <List.Item>
                      <Text>{issue}</Text>
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        </Card>
      )}

      <Card style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="0">
          {sensors.map((sensor, index) => (
            <TabPane
              tab={
                <span>
                  {getSensorIcon(sensor.sensorType)}
                  {sensor.name}
                </span>
              }
              key={index.toString()}
            >
              <SensorDetails sensor={sensor} />
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </ContentWrapperDark>
  );
};

export default ZoneIoTDetailsPage;
