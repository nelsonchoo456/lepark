import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { Card, Tabs, Row, Col, Statistic, Tag, Typography, Spin, Empty, Space, List, Tooltip, Button, Select } from 'antd';
import { FiThermometer, FiDroplet, FiSun, FiWind, FiExternalLink } from 'react-icons/fi';
import { ArrowDownOutlined, ArrowUpOutlined, WarningOutlined } from '@ant-design/icons';
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, ChartTooltip, Legend);

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const ZoneIoTDetailsPage: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const [zone, setZone] = useState<ZoneResponse | null>(null);
  const [sensors, setSensors] = useState<SensorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageReadings, setAverageReadings] = useState<{ [key: string]: number }>({});
  const [trends, setTrends] = useState<{ [key: string]: any }>({});
  const [unhealthyOccurrences, setUnhealthyOccurrences] = useState<any[]>([]);

  const filteredSensorTypes = [
    SensorTypeEnum.SOIL_MOISTURE,
    SensorTypeEnum.TEMPERATURE,
    SensorTypeEnum.LIGHT,
    SensorTypeEnum.HUMIDITY
  ];

  useEffect(() => {
    const fetchZoneDetails = async () => {
      try {
        setLoading(true);
        const zoneResponse = await getZoneById(Number(zoneId));
        setZone(zoneResponse.data);

        const sensorsResponse = await getSensorsByZoneId(Number(zoneId));
        setSensors(sensorsResponse.data.filter((sensor) => sensor.sensorType !== SensorTypeEnum.CAMERA));

        const avgReadings = await getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo(Number(zoneId), 4);
        setAverageReadings(avgReadings.data);

        const trendPromises = filteredSensorTypes.map(async (sensorType) => {
          const trend = await getZoneTrendForSensorType(Number(zoneId), sensorType, 4);
          return { [sensorType]: trend.data };
        });
        const trendResults = await Promise.all(trendPromises);
        setTrends(Object.assign({}, ...trendResults));

        // Fetch unhealthy occurrences
        const unhealthyResponse = await getUnhealthyOccurrences(Number(zoneId));
        setUnhealthyOccurrences(unhealthyResponse.data);
        console.log('Unhealthy occurrences:', unhealthyResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching zone details:', error);
        setLoading(false);
      }
    };

    fetchZoneDetails();
  }, [zoneId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'red';
      case 'MAINTENANCE':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getSensorIcon = (sensorType: SensorTypeEnum) => {
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
      console.log('numberValue', numberValue);
      if (isNaN(numberValue)) return null;
      if (numberValue < 0) return <ArrowDownOutlined style={{ color: 'red' }} />;
      if (numberValue > 0) return <ArrowUpOutlined style={{ color: 'green' }} />;
      return null;
    };

    return (
      <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
        <li>Trend: {trend.trendDescription}</li>
        <li>
          Direction: {trend.directionOfChange} ({trend.magnitudeOfChange})
        </li>
        <li>
          Absolute change: {getArrow(trend.absoluteChange)} {trend.absoluteChange}
        </li>
        <li>
          Rate of change: {getArrow(trend.rateOfChange)} {trend.rateOfChange}
        </li>
        <li>Readings analyzed: {trend.readingsCount}</li>
        <li>
          <Text strong>Insight:</Text> {trend.actionableInsight}
        </li>
      </ul>
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
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space align="center">
              <Title level={3}>{zone.name}</Title>
              <Tag color={getStatusColor(zone.zoneStatus)}>{formatEnumLabelToRemoveUnderscores(zone.zoneStatus)}</Tag>
              <Tag color="blue">4-Hour Average</Tag>
            </Space>
          </Col>
          {Object.entries(averageReadings)
            .filter(([sensorType]) => filteredSensorTypes.includes(sensorType as SensorTypeEnum))
            .map(([sensorType, value]) => (
              <Col xs={24} sm={12} md={6} key={sensorType}>
                <Statistic
                  title={formatEnumLabelToRemoveUnderscores(sensorType as SensorTypeEnum)}
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
          <Title level={4}>
            <WarningOutlined style={{ color: '#faad14' }} /> Potential Issues
          </Title>
          <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            Showing issues based on sensor readings from the last hour only.
          </Text>
          <List
            dataSource={unhealthyOccurrences}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      {`${item.speciesName} (Occurrence Name: ${item.occurrenceName})`}
                      <Tooltip title="View Occurrence Details">
                        <Button
                          type="link"
                          icon={<FiExternalLink />}
                          onClick={() => window.open(`/occurrences/${item.occurrenceId}`, '_blank')}
                        />
                      </Tooltip>
                    </Space>
                  }
                  description={
                    <ul>
                      {item.issues.map((issue: string, index: number) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  }
                />
              </List.Item>
            )}
          />
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
