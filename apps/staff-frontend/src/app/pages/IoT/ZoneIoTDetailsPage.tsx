import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { Card, Tabs, Row, Col, Statistic, Tag, Typography, Spin, Empty, Progress, Space, List } from 'antd';
import { FiThermometer, FiDroplet, FiSun, FiWind } from 'react-icons/fi';
import { ArrowDownOutlined, ArrowUpOutlined, WarningOutlined } from '@ant-design/icons';
import {
  StaffResponse,
  ZoneResponse,
  SensorResponse,
  SensorTypeEnum,
  SensorStatusEnum,
  getZoneById,
  getSensorsByZoneId,
  getLatestSensorReadingBySensorId,
  getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo,
  getZoneTrendForSensorType,
  getUnhealthyOccurrences,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const ZoneIoTDetailsPage: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const { user } = useAuth<StaffResponse>();
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
          const trend = await getZoneTrendForSensorType(Number(zoneId), sensorType, 1);
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

    const getArrow = (value: number) => {
      if (value > 0) return <ArrowUpOutlined style={{ color: 'green' }} />;
      if (value < 0) return <ArrowDownOutlined style={{ color: 'red' }} />;
      return null;
    };

    return (
      <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
        <li>Trend: {trend.trendDescription}</li>
        <li>
          Average rate of change: {getArrow(parseFloat(trend.averageRateOfChange))} {trend.averageRateOfChange} {trend.unit}/hour
        </li>
        <li>
          Average % change: {getArrow(parseFloat(trend.averagePercentageChange))} {trend.averagePercentageChange}%
        </li>
        <li>
          Overall change: {getArrow(parseFloat(trend.overallChange))} {trend.overallChange}%
        </li>
        <li>Readings analyzed: {trend.readingsCount}</li>
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
                <Text type="secondary">4h Trend:</Text>
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
          <List
            dataSource={unhealthyOccurrences}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`${item.speciesName} (Occurrence Name: ${item.occurrenceName})`}
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

const SensorDetails: React.FC<{ sensor: SensorResponse }> = ({ sensor }) => {
  const [latestReading, setLatestReading] = useState<number | null>(null);

  useEffect(() => {
    const fetchLatestReading = async () => {
      try {
        const response = await getLatestSensorReadingBySensorId(sensor.id);
        setLatestReading(response.data?.value || null);
      } catch (error) {
        console.error('Error fetching latest sensor reading:', error);
      }
    };

    fetchLatestReading();
  }, [sensor.id]);

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Space>
          <Tag color={getStatusColor(sensor.sensorStatus)}>{formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}</Tag>
          <Text strong>{formatEnumLabelToRemoveUnderscores(sensor.sensorType)}</Text>
        </Space>
      </Col>
      <Col span={24}>
        <Statistic
          title="Last Reported Value"
          value={latestReading !== null ? latestReading.toFixed(2) : 'N/A'}
          suffix={getSensorUnit(sensor.sensorType)}
        />
      </Col>
      {/* <Col span={24}>
        <Text type="secondary">Last Update: {sensor.lastDataUpdateDate ? new Date(sensor.lastDataUpdateDate).toLocaleString() : 'N/A'}</Text>
      </Col> */}
    </Row>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case SensorStatusEnum.ACTIVE:
      return 'green';
    case SensorStatusEnum.INACTIVE:
      return 'red';
    case SensorStatusEnum.UNDER_MAINTENANCE:
      return 'orange';
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

export default ZoneIoTDetailsPage;
