import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { Card, Tabs, Row, Col, Statistic, Tag, Typography, Spin, Empty, Progress, Space, List, Tooltip, Button, Select } from 'antd';
import { FiThermometer, FiDroplet, FiSun, FiWind, FiExternalLink } from 'react-icons/fi';
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
  SensorReadingResponse,
  getSensorReadingsByDateRange,
  getHourlyAverageSensorReadingsByDateRange,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, ChartTooltip, Legend);

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
      if (value.includes('-')) return <ArrowDownOutlined style={{ color: 'red' }} />;
      if (value.includes('+')) return <ArrowUpOutlined style={{ color: 'green' }} />;
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

const SensorDetails: React.FC<{ sensor: SensorResponse }> = ({ sensor }) => {
  const [latestReading, setLatestReading] = useState<SensorReadingResponse | null>(null);
  const [readings, setReadings] = useState<SensorReadingResponse[]>([]);
  const [hourlyAverages, setHourlyAverages] = useState<{ date: Date; average: number }[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'days'),
    dayjs(),
  ]);
  const [displayMode, setDisplayMode] = useState<'individual' | 'hourly'>('individual');

  useEffect(() => {
    const fetchLatestReading = async () => {
      try {
        const response = await getLatestSensorReadingBySensorId(sensor.id);
        setLatestReading(response.data || null);
      } catch (error) {
        console.error('Error fetching latest sensor reading:', error);
      }
    };

    const fetchReadings = async () => {
      try {
        const response = await getSensorReadingsByDateRange(
          sensor.id,
          dateRange[0].toDate(),
          dateRange[1].toDate()
        );
        setReadings(response.data);
      } catch (error) {
        console.error('Error fetching sensor readings:', error);
      }
    };

    const fetchHourlyAverages = async () => {
      try {
        const response = await getHourlyAverageSensorReadingsByDateRange(
          sensor.id,
          dateRange[0].toDate(),
          dateRange[1].toDate()
        );
        setHourlyAverages(response.data);
      } catch (error) {
        console.error('Error fetching hourly average sensor readings:', error);
      }
    };

    fetchLatestReading();
    fetchReadings();
    fetchHourlyAverages();
  }, [sensor.id, dateRange]);

  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates) {
      setDateRange([dates[0] as dayjs.Dayjs, dates[1] as dayjs.Dayjs]);
    }
  };

  const handleDisplayModeChange = (value: 'individual' | 'hourly') => {
    setDisplayMode(value);
  };

  const sortedReadings = [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedHourlyAverages = [...hourlyAverages].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = {
    labels: displayMode === 'individual'
      ? sortedReadings.map(reading => dayjs(reading.date).format('YYYY-MM-DD HH:mm'))
      : sortedHourlyAverages.map(reading => dayjs(reading.date).format('YYYY-MM-DD HH:mm')),
    datasets: [
      {
        label: formatEnumLabelToRemoveUnderscores(sensor.sensorType),
        data: displayMode === 'individual'
          ? sortedReadings.map(reading => reading.value)
          : sortedHourlyAverages.map(reading => reading.average),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${formatEnumLabelToRemoveUnderscores(sensor.sensorType)} Readings`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += displayMode === 'individual'
                ? context.parsed.y.toFixed(2)
                : context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: getSensorUnit(sensor.sensorType),
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
    },
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Space>
          <Tag color={getStatusColor(sensor.sensorStatus)}>{formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}</Tag>
          <Text strong>{formatEnumLabelToRemoveUnderscores(sensor.sensorType)}</Text>
        </Space>
      </Col>
      <Col span={24}>
        <Space direction="vertical">
          <Statistic
            title={`Last reported: ${latestReading?.date ? dayjs(latestReading.date).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}`}
            value={latestReading !== null ? latestReading.value.toFixed(2) : 'N/A'}
            suffix={getSensorUnit(sensor.sensorType)}
          />
        </Space>
      </Col>
      <Col span={24}>
        <Row justify="end" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
              />
              <Select defaultValue="individual" style={{ width: 160 }} onChange={handleDisplayModeChange}>
                <Option value="individual">Individual</Option>
                <Option value="hourly">Hourly Average</Option>
              </Select>
            </Space>
          </Col>
        </Row>
        <Line height={120} data={chartData} options={chartOptions} />
      </Col>
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