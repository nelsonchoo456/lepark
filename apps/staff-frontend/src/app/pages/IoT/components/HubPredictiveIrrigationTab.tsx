import {
  getHistoricalSensorsRainfallDataByHub,
  getModelForHub,
  getPredictionForHub,
  HubResponse,
  PredictiveIrrigation,
  SensorTypeEnum,
  trainModelForHub,
} from '@lepark/data-access';
import { Button, Col, Flex, Row, Space, DatePicker, Card, Spin, Empty, Tag, Statistic, Divider, message } from 'antd';
import { TiWeatherCloudy } from 'react-icons/ti';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { RangePickerProps } from 'antd/es/date-picker';
import { Line } from 'react-chartjs-2';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { getSensorIcon } from '../ZoneIoTDetailsPage';
import { IconType } from 'react-icons';
import { WiRain, WiThunderstorm, WiShowers } from 'react-icons/wi';
const { RangePicker } = DatePicker;

interface HubPredictiveIrrigationTabProps {
  hub: HubResponse;
}

export const getWeatherForecast = (textForecast: string) => {
  let Icon: IconType;
  let color: string;

  // Determine icon and color based on forecast severity
  switch (textForecast) {
    case 'Light Rain':
    case 'Light Showers':
      Icon = WiRain;
      color = '#ADD8E6'; // Light blue
      break;
    case 'Moderate Rain':
    case 'Showers':
    case 'Passing Showers':
      Icon = WiShowers;
      color = '#0000FF'; // Blue
      break;
    case 'Heavy Rain':
    case 'Heavy Showers':
    case 'Thundery Showers':
      Icon = WiThunderstorm;
      color = '#1E90FF'; // Dodger blue
      break;
    case 'Heavy Thundery Showers':
    case 'Heavy Thundery Showers with Gusty Winds':
      Icon = WiThunderstorm;
      color = '#FF0000'; // Red
      break;
    default:
      Icon = WiShowers;
      color = '#808080'; // Grey for undefined cases
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', color }}>
      <Icon size={33} style={{ marginRight: '8px' }} />
      <span className='text-xl'>{textForecast}</span>
    </div>
  );
};

const HubPredictiveIrrigationTab = ({ hub }: HubPredictiveIrrigationTabProps) => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(10, 'days'), dayjs()]);
  const [trainLoading, setTrainLoading] = useState(false);
  const [hasModel, setHasModel] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [predictiveLoading, setPredictiveLoading] = useState(false);
  const [predictive, setPredictive] = useState<PredictiveIrrigation>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (hasModel) {
      fetchReadings();
      fetchPredictive();
    }
  }, [hasModel, dateRange]);

  useEffect(() => {
    if (hub) {
      fetchModel(hub);
    }
  }, [hub]);

  const fetchModel = async (hub: HubResponse) => {
    try {
      const response = await getModelForHub(hub.id);
      if (response.data && response.data.rfModel) {
        setHasModel(true);
      } else {
        setHasModel(false);
      }
    } catch (error) {
      // if (error === "Insufficent sensors readings to train model") {
      //   messageApi.open({
      //     type: 'error',
      //     content: error,
      //   });
      // }
    }
  };

  const fetchReadings = async () => {
    try {
      setDataLoading(true);
      const response = await getHistoricalSensorsRainfallDataByHub(hub.id, dateRange[0].toDate(), dateRange[1].toDate());
      setData(response.data.data);
      setDataLoading(false);
    } catch (error) {
      setDataLoading(false);
      console.error('Error fetching sensor readings:', error);
    }
  };

  const fetchPredictive = async () => {
    try {
      setPredictiveLoading(true);
      const response = await getPredictionForHub(hub.id);
      console.log(response.data);
      setPredictive(response.data);
      setPredictiveLoading(false);
    } catch (error) {
      setPredictiveLoading(false);
      console.error('Error fetching sensor readings:', error);
    }
  };

  const handleTrainModelForThisHub = async () => {
    try {
      setTrainLoading(true);

      const response = await trainModelForHub(hub.id);
      setTrainLoading(false);
    } catch (error) {
      setTrainLoading(false);
      if (error === 'Insufficent sensors readings to train model') {
        messageApi.open({
          type: 'error',
          content: error,
        });
      }
    }
  };

  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates) {
      setDateRange([dates[0] as dayjs.Dayjs, dates[1] as dayjs.Dayjs]);
    }
  };

  const getSensorUnit = (type: string) => {
    switch (type) {
      case 'TEMPERATURE':
        return '°C';
      case 'HUMIDITY':
        return '%';
      case 'LIGHT':
        return 'Lux';
      case 'SOIL_MOISTURE':
        return '%';
      default:
        return '';
    }
  };

  const getChartOptions = (label: string) => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        // title: {
        //   display: true,
        //   text: `${formatEnumLabelToRemoveUnderscores('hehe')} Readings`,
        // },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              return label;
            },
          },
        },
        datalabels: {
          display: false, // Ensure data labels are not shown on the line
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: label,
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
  };

  const getChartData = (data: any, label: string) => {
    return {
      labels: data.map((reading: any) => dayjs(reading.date).format('YYYY-MM-DD HH:mm')),
      datasets: [
        {
          label: label,
          data: data.map((reading: any) => reading.average),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  };

  if (!hasModel) {
    return (
      <>
        {contextHolder}
        <Card styles={{ body: { padding: '1rem' } }} className="mb-4">
          Actions:
          <Button onClick={handleTrainModelForThisHub} loading={trainLoading} className="ml-4" type="primary">
            Train Model for this Hub
          </Button>
        </Card>
        <Empty description="No model trained for this hub" />
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <Divider orientation="left">Irrigation Recommendation</Divider>
      <Card styles={{ body: { padding: '1rem' } }} className="mb-4">
        {predictive && predictive.sensorData ? (
          <div className="w-full flex gap-2">
            <div className="flex-[1]">
              <Statistic
                title="Average Temperature"
                value={predictive.sensorData.temperature.toFixed(2)}
                prefix={getSensorIcon(SensorTypeEnum.TEMPERATURE)}
                suffix={getSensorUnit(SensorTypeEnum.TEMPERATURE)}
              />
              <span className="text-secondary italic">in past 1h</span>
            </div>
            <div className="flex-[1]">
              <Statistic
                title="Average Humidity"
                value={predictive.sensorData.humidity.toFixed(2)}
                prefix={getSensorIcon(SensorTypeEnum.HUMIDITY)}
                suffix={getSensorUnit(SensorTypeEnum.HUMIDITY)}
              />
              <span className="text-secondary italic">in past 1h</span>
            </div>
            <div className="flex-[1]">
              <Statistic
                title="Average Light"
                value={predictive.sensorData.light.toFixed(2)}
                prefix={getSensorIcon(SensorTypeEnum.LIGHT)}
                suffix={getSensorUnit(SensorTypeEnum.LIGHT)}
              />
              <span className="text-secondary italic">in past 1h</span>
            </div>
            <div className="flex-[1]">
              <span className="text-secondary">24h Weather Forecast</span>

              {getWeatherForecast(predictive.forecast)}
            </div>
            {predictive.irrigate > 0.5 ? (
              <div className="flex-[1] rounded border p-4 bg-green-50/60">
                <strong className="text-green-500">Irrigation Need</strong>
                <br />
                <Tag bordered={false} color="green">
                  <strong className="text-green-600 text-lg">Yes</strong>
                </Tag>
              </div>
            ) : (
              <div className="flex-[1] rounded border p-4 bg-gray-50">
                <strong className="text-gray-500">Irrigation Need</strong>
                <br />
                <Tag bordered={false} className="bg-gray-200">
                  <strong className="text-lg text-gray-700">No</strong>
                </Tag>
              </div>
            )}
          </div>
        ) : (
          <Empty description="No Predictions for today" />
        )}
      </Card>

      {dataLoading ? (
        <Flex justify="center" className="mt-10">
          <Spin />
        </Flex>
      ) : data ? (
        <>
          <Divider orientation="left">Historical Hourly Averages</Divider>
          <Flex justify="end">
            <Row justify="end" style={{ marginBottom: 16 }}>
              <Col>
                <Space>
                  <RangePicker value={dateRange} onChange={handleDateRangeChange} />
                </Space>
              </Col>
            </Row>
          </Flex>
          <Line height={120} data={getChartData(data.TEMPERATURE, 'Temperature')} options={getChartOptions('Temperature')} />
          <Line height={120} data={getChartData(data.HUMIDITY, 'Humidity')} options={getChartOptions('Humidity')} />
          <Line height={120} data={getChartData(data.SOIL_MOISTURE, 'Soil Moisture')} options={getChartOptions('Soil Moisture')} />
          <Line height={120} data={getChartData(data.LIGHT, 'Light')} options={getChartOptions('Light')} />
        </>
      ) : (
        <Empty description="No Sensor Data found for today" />
      )}
    </>
  );
};

export default HubPredictiveIrrigationTab;
