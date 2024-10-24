import { SensorResponse, SensorReadingResponse, getLatestSensorReadingBySensorId, getSensorReadingsByDateRange, getHourlyAverageSensorReadingsByDateRange } from "@lepark/data-access";
import { formatEnumLabelToRemoveUnderscores } from "@lepark/data-utility";
import { SensorStatusEnum, SensorTypeEnum } from "@prisma/client";
import { Row, Col, Space, Tag, Statistic, Alert, Select, DatePicker, Typography, Card, Divider } from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { InfoCircleOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;

interface SensorDetailsProps {
  sensor: SensorResponse;
}

const SensorDetails: React.FC<SensorDetailsProps> = ({ sensor }) => {
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
  
    const isLastReportedMoreThanAnHourAgo = latestReading && dayjs().diff(dayjs(latestReading.date), 'hour') >= 1;
  
    return (
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={4}>{formatEnumLabelToRemoveUnderscores(sensor.sensorType)} Sensor</Title>
                </Col>
                <Col>
                  <Tag color={getStatusColor(sensor.sensorStatus)} style={{ padding: '4px 8px', fontSize: '14px' }}>
                    {formatEnumLabelToRemoveUnderscores(sensor.sensorStatus)}
                  </Tag>
                </Col>
              </Row>
              <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Last Reported Value"
                      value={latestReading !== null ? latestReading.value.toFixed(2) : 'N/A'}
                      suffix={getSensorUnit(sensor.sensorType)}
                      valueStyle={{ color: 'black', fontSize: '24px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Last Reported Date"
                      value={latestReading?.date ? dayjs(latestReading.date).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}
                      valueStyle={{ color: 'black', fontSize: '24px' }}
                    />
                  </Col>
                </Row>
              </Card>
              {isLastReportedMoreThanAnHourAgo && (
                <Alert
                  message="Sensor Warning"
                  description="This sensor hasn't reported in over an hour. It may be faulty and require attention."
                  type="warning"
                  showIcon
                  icon={<InfoCircleOutlined />}
                />
              )}
            </Space>
          </Col>
          <Col span={24}>
            <Divider orientation="left">Sensor Readings</Divider>
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
      </Card>
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

export default SensorDetails;
