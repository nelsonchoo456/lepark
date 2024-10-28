import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  DatePicker,
  Select,
  Row,
  Col,
  Typography,
  Radio,
  Button,
  InputNumber,
  Modal,
  Form,
  Tag,
  Slider,
  Checkbox,
  Space,
  Spin,
  Tooltip,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import dayjs, { Dayjs } from 'dayjs';
import {
  getAggregatedCrowdDataForPark,
  getAllParks,
  getAllSensorReadingsByParkIdAndSensorType,
  getPredictedCrowdLevelsForPark,
  getSensorReadingsByZoneIdAndSensorTypeByDateRange,
  getZonesByParkId,
  ParkResponse,
  predictCrowdLevels,
  SensorTypeEnum,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { SensorReading } from '@prisma/client';
import PageHeader2 from '../../components/main/PageHeader2';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import ParkCrowdLevelsCalendar from './ParkCrowdLevelsCalendar';
import { useParkThresholds } from '../../hooks/CrowdInsights/CalculateCrowdThresholds';
import moment from 'moment-timezone';
import { groupBy, mapValues, merge, sumBy, uniqBy } from 'lodash';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { ColumnType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useRestrictPark } from '../../hooks/Parks/useRestrictPark';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, Legend, annotationPlugin);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

interface CrowdData {
  date: string;
  crowdLevel: number | null;
  predictedCrowdLevel: number | null;
}

const ParkCrowdLevels: React.FC = () => {
  const [crowdData, setCrowdData] = useState<CrowdData[]>([]);
  const defaultDateRange: [Dayjs, Dayjs] = [dayjs().subtract(20, 'days'), dayjs().add(10, 'days')];
  const [selectedDate, setSelectedDate] = useState<[Dayjs, Dayjs]>(defaultDateRange);
  const [parkId, setParkId] = useState<number>(0);
  const [viewMode, setViewMode] = useState<string>('calendar');
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [restrictedParks, setRestrictedParks] = useState<ParkResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDataSeries, setSelectedDataSeries] = useState<string[]>(['actual', 'predicted']);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();

  // Fix: Handle the case when parkId is 0 separately
  const parkGeom = parkId === 0 ? undefined : parks.find((p) => p.id === parkId)?.geom;
  const thresholds = useParkThresholds(
    parkId,
    parkGeom,
    parks.map((p) => ({ ...p, geometry: p.geom })),
  );

  const { loading: parkLoading } = useRestrictPark(parkId ? parkId.toString() : undefined, {
    disableNavigation: true,
  });

  useEffect(() => {
    fetchParks();
  }, []);

  useEffect(() => {
    if (parks.length > 0) {
      fetchData();
    }
  }, [selectedDate, parkId, parks]);

  const fetchParks = async () => {
    try {
      const parksResponse = await getAllParks();
      const allParks = parksResponse.data;

      // Filter parks based on user role
      const filteredParks = user?.role === StaffType.SUPERADMIN ? allParks : allParks.filter((park) => park.id === user?.parkId);

      setParks(allParks);
      setRestrictedParks(filteredParks);

      // Set initial parkId if not already set
      if (parkId === 0 && filteredParks.length === 1) {
        setParkId(filteredParks[0].id);
      }
    } catch (error) {
      console.error('Error fetching parks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    if (parks.length === 0) return;
    setIsLoading(true);
    try {
      let allData;
      if (parkId === 0) {
        // Fetch data for all parks
        const allParksData = await Promise.all(
          parks.map((park) => getAllSensorReadingsByParkIdAndSensorType(park.id, SensorTypeEnum.CAMERA)),
        );
        // console.log("allParksData", allParksData);
        allData = { data: allParksData.flatMap((response) => response.data) };
      } else {
        allData = await getAllSensorReadingsByParkIdAndSensorType(parkId, SensorTypeEnum.CAMERA);
      }

      if (!allData.data || allData.data.length === 0) {
        console.log('No data available');
        setCrowdData([]);
        return;
      }

      const sortedData = allData.data
        .filter((item: any) => item && item.date) // Filter out undefined or invalid items
        .sort((a: any, b: any) => moment.tz(a.date, 'Asia/Singapore').valueOf() - moment.tz(b.date, 'Asia/Singapore').valueOf());

      if (sortedData.length === 0) {
        console.log('No valid data after filtering');
        setCrowdData([]);
        return;
      }

      const startDate = moment.tz(sortedData[0].date, 'Asia/Singapore').startOf('day');
      const endDate = moment.tz(sortedData[sortedData.length - 1].date, 'Asia/Singapore').endOf('day');
      const today = moment().tz('Asia/Singapore').endOf('day');
      const predictionEndDate = today.clone().add(1, 'month').endOf('day'); // Predict 1 month from today

      console.log('Fetching data for:', startDate.format('YYYY-MM-DD HH:mm:ss'), 'to', endDate.format('YYYY-MM-DD HH:mm:ss'));
      console.log('Today is:', today.format('YYYY-MM-DD HH:mm:ss'));
      console.log('Predicting data up to:', predictionEndDate.format('YYYY-MM-DD HH:mm:ss'));

      // Fetch historical data up to today
      const historicalEndDate = today.isBefore(endDate) ? today : endDate;
      let historicalData;
      if (parkId === 0) {
        // Manually aggregate data for all parks
        const parkHistoricalData = await Promise.all(
          parks.map((park) => getAggregatedCrowdDataForPark(park.id, startDate.toDate(), historicalEndDate.toDate())),
        );
        historicalData = parkHistoricalData[0].data.map((item: { date: any }, index: string | number) => ({
          date: item.date,
          crowdLevel: sumBy(parkHistoricalData, (parkData) => parkData.data[index].crowdLevel),
        }));
      } else {
        const historicalResponse = await getAggregatedCrowdDataForPark(parkId, startDate.toDate(), historicalEndDate.toDate());
        historicalData = historicalResponse.data;
      }

      // Fetch future predictions
      const predictionStartDate = today.clone().add(1, 'day').startOf('day');
      const daysToPredict = predictionEndDate.diff(predictionStartDate, 'days') + 1;
      let predictedData;
      if (parkId === 0) {
        const allParksPredictions = await Promise.all(parks.map((park) => predictCrowdLevels(park.id, daysToPredict)));
        predictedData = allParksPredictions[0].data.map((item: { date: any }, index: string | number) => ({
          date: item.date,
          predictedCrowdLevel: sumBy(allParksPredictions, (prediction) => prediction.data[index].predictedCrowdLevel),
        }));
      } else {
        const predictedResponse = await predictCrowdLevels(parkId, daysToPredict);
        predictedData = predictedResponse.data;
      }

      // Calculate the number of distinct days
      const distinctDays = uniqBy(sortedData, (item) => moment.tz(item.date, 'Asia/Singapore').format('YYYY-MM-DD')).length;
      const pastDaysToPredict = Math.max(distinctDays - 71, 0); // Ensure it's not negative

      // Fetch past predicted crowd levels
      let pastPredictedData;
      if (parkId === 0) {
        const allParksPastPredictions = await Promise.all(parks.map((park) => getPredictedCrowdLevelsForPark(park.id, pastDaysToPredict)));
        pastPredictedData = allParksPastPredictions[0].data.map((item: { date: any }, index: string | number) => ({
          date: item.date,
          predictedCrowdLevel: sumBy(allParksPastPredictions, (prediction) => prediction.data[index].predictedCrowdLevel),
        }));
      } else {
        const pastPredictedResponse = await getPredictedCrowdLevelsForPark(parkId, pastDaysToPredict);
        pastPredictedData = pastPredictedResponse.data;
      }

      // Normalize the date format for all data sets
      const normalizeDate = (date: string) => moment.tz(date, 'Asia/Singapore').format('YYYY-MM-DD');

      const normalizedHistoricalData = historicalData.map((item: { date: string }) => ({
        ...item,
        date: normalizeDate(item.date),
      }));

      const normalizedPredictedData = predictedData.map((item: { date: string }) => ({
        ...item,
        date: normalizeDate(item.date),
      }));

      const normalizedPastPredictedData = pastPredictedData.map((item: { date: string; predictedCrowdLevel: number }) => ({
        date: normalizeDate(item.date),
        predictedCrowdLevel: item.predictedCrowdLevel,
      }));

      // Combine all data
      const allDates = new Set([
        ...normalizedHistoricalData.map((item: { date: string }) => item.date),
        ...normalizedPredictedData.map((item: { date: string }) => item.date),
        ...normalizedPastPredictedData.map((item: { date: string }) => item.date),
      ]);

      const combinedData = Array.from(allDates).map((date: string) => {
        const historical = normalizedHistoricalData.find((item: { date: string }) => item.date === date);
        const predicted = normalizedPredictedData.find((item: { date: string }) => item.date === date);
        const pastPredicted = normalizedPastPredictedData.find((item: { date: string }) => item.date === date);

        return {
          date,
          crowdLevel: historical?.crowdLevel ?? null,
          predictedCrowdLevel: pastPredicted?.predictedCrowdLevel ?? predicted?.predictedCrowdLevel ?? null,
        };
      });

      // Sort the combined data by date
      const finalData = combinedData.sort((a, b) => moment(a.date).diff(moment(b.date)));

      //   console.log('Final data:', finalData);
      setCrowdData(finalData);
    } catch (error) {
      console.error('Error fetching crowd data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnType<any>[] = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Day',
      key: 'day',
      render: (_, record) => dayjs(record.date).format('dddd'),
      filters: [
        { text: 'Monday', value: 'Monday' },
        { text: 'Tuesday', value: 'Tuesday' },
        { text: 'Wednesday', value: 'Wednesday' },
        { text: 'Thursday', value: 'Thursday' },
        { text: 'Friday', value: 'Friday' },
        { text: 'Saturday', value: 'Saturday' },
        { text: 'Sunday', value: 'Sunday' },
      ],
      onFilter: (value, record) => dayjs(record.date).format('dddd') === value,
    },
    {
      title: 'Actual Crowd Level',
      dataIndex: 'crowdLevel',
      key: 'crowdLevel',
      sorter: (a, b) => (a.crowdLevel || 0) - (b.crowdLevel || 0),
      render: (level: number | null) => (level !== null ? Math.round(level) : '-'),
    },
    {
      title: 'Predicted Crowd Level',
      dataIndex: 'predictedCrowdLevel',
      key: 'predictedCrowdLevel',
      sorter: (a, b) => (a.predictedCrowdLevel || 0) - (b.predictedCrowdLevel || 0),
      render: (level: number | null) => (level !== null ? Math.round(level) : '-'),
    },
  ];

  // Remove the filtering for the calendar view
  const calendarCrowdData = crowdData;

  // Keep the filtered data for the graph view
  const filteredCrowdData = crowdData.filter((d) => {
    const date = dayjs(d.date);
    return (
      (date.isAfter(selectedDate[0]) || date.isSame(selectedDate[0])) && (date.isBefore(selectedDate[1]) || date.isSame(selectedDate[1]))
    );
  });

  const handleDataSeriesChange = (checkedValues: string[]) => {
    setSelectedDataSeries(checkedValues);
  };

  const chartData = {
    labels: filteredCrowdData.map((d) => dayjs(d.date).format('ddd DD/MM')),
    datasets: [
      ...(selectedDataSeries.includes('actual')
        ? [
            {
              label: 'Actual',
              data: filteredCrowdData.map((d) => (d.crowdLevel !== null ? Math.round(d.crowdLevel) : null)),
              borderColor: 'rgb(75, 192, 192)',
              fill: false,
            },
          ]
        : []),
      ...(selectedDataSeries.includes('predicted')
        ? [
            {
              label: 'Predicted',
              data: filteredCrowdData.map((d) =>
                d.predictedCrowdLevel !== null ? (d.predictedCrowdLevel !== undefined ? Math.round(d.predictedCrowdLevel) : null) : null,
              ),
              borderColor: 'rgb(255, 99, 132)',
              borderDash: [5, 5],
              fill: false,
            },
          ]
        : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Crowd Level',
        },
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: { dataset: { label: string }; parsed: { y: number | null } }) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += Math.round(context.parsed.y);
            }
            return label;
          },
        },
      },
      legend: {
        position: 'top' as const,
      },
      annotation: {
        annotations: {
          lowLine: {
            type: 'line',
            yMin: thresholds.low,
            yMax: thresholds.low,
            borderColor: '#a3d4c7',
            borderWidth: 1,
            label: {
              content: 'Low',
              enabled: true,
              position: 'left',
            },
          },
          mediumLine: {
            type: 'line',
            yMin: thresholds.moderate,
            yMax: thresholds.moderate,
            borderColor: '#ffe082',
            borderWidth: 1,
            label: {
              content: 'Medium',
              enabled: true,
              position: 'left',
            },
          },
          todayLine: {
            type: 'line',
            xMin: moment().format('ddd DD/MM'),
            xMax: moment().format('ddd DD/MM'),
            borderColor: 'rgba(200, 200, 200, 0.7)', // Lighter grey color
            borderWidth: 2,
            borderDash: [5, 5], // This creates the dotted effect
            label: {
              content: 'Today',
              enabled: true,
              position: 'top',
              backgroundColor: 'rgba(200, 200, 200, 0.7)', // Lighter grey background for label
              color: 'rgba(60, 60, 60, 1)', // Darker text for contrast
            },
          },
        },
      },
    },
  };

  const disabledDate = (current: Dayjs) => {
    // Convert current to YYYY-MM-DD format for comparison
    const currentDateString = current.format('YYYY-MM-DD');

    // Check if the current date exists in crowdData
    return !crowdData.some((data) => data.date === currentDateString);
  };

  const handleCompareParksCLick = () => {
    navigate('/crowdInsights/compareParks');
  };

  const breadcrumbItems = [
    {
      title: 'Crowd Insights',
      pathKey: '/crowdInsights',
      isMain: true,
      isCurrent: true,
    },
  ];

  const renderViewSelector = () => (
    <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="mb-4">
      <Radio.Button value="calendar">Calendar View</Radio.Button>
      <Radio.Button value="graph">Graph View</Radio.Button>
      <Radio.Button value="table">Table View</Radio.Button>
    </Radio.Group>
  );

  const ThresholdExplanation = () => (
    <div className="flex flex-col gap-2 text-gray-500 text-sm mt-2">
      <div className="flex items-center gap-2">
        <InfoCircleOutlined />
        <Tooltip
          title={
            <div>
              <p>Crowd levels are calculated by:</p>
              <ol className="pl-4 mt-1">
                <li>1. Averaging readings from cameras in each zone</li>
                <li>2. Summing the averages of all zones in the park</li>
                <li>3. Aggregating by hour to handle different camera frequencies</li>
              </ol>
            </div>
          }
        >
          <span className="cursor-help underline">How are crowd levels calculated?</span>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <InfoCircleOutlined />
        <Tooltip
          title={
            <div>
              <p>Crowd thresholds (Low, Moderate, High) are determined by:</p>
              <ol className="pl-4 mt-1">
                <li>1. Analyzing historical crowd patterns</li>
                <li>2. Considering park size and capacity</li>
                <li>3. Low threshold: 33% of max observed crowds</li>
                <li>4. Medium threshold: 66% of max observed crowds</li>
              </ol>
            </div>
          }
        >
          <span className="cursor-help underline">How are thresholds determined?</span>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Row gutter={16} className="mb-4">
          <Col span={12}>{renderViewSelector()}</Col>
          {user?.role === StaffType.SUPERADMIN && (
            <Col span={12}>
              <div className="flex items-center">
                <span className="mr-2">Park:</span>
                <Select value={parkId} onChange={setParkId} className="w-full">
                  <Option value={0}>All NParks</Option>
                  {restrictedParks.map((park) => (
                    <Option key={park.id} value={park.id}>
                      {park.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          )}
        </Row>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Spin size="large" />
            <p className="mt-5">This will take a moment...</p>
          </div>
        ) : viewMode === 'graph' ? (
          <div className="h-[500px] relative">
            <div className="flex justify-between items-center mb-4">
              <Space direction="vertical">
                <RangePicker
                  value={selectedDate}
                  onChange={(dates) => setSelectedDate(dates ? (dates as [Dayjs, Dayjs]) : defaultDateRange)}
                  disabledDate={disabledDate}
                />
                <Checkbox.Group
                  options={[
                    { label: 'Actual Crowd Levels', value: 'actual' },
                    { label: 'Predicted Crowd Levels', value: 'predicted' },
                  ]}
                  value={selectedDataSeries}
                  onChange={handleDataSeriesChange}
                />
              </Space>
              {user?.role === StaffType.SUPERADMIN && (
                <Button type="primary" onClick={handleCompareParksCLick}>
                  Compare Parks
                </Button>
              )}
            </div>
            <div className="h-[calc(100%-80px)]">
              <Line data={chartData} options={chartOptions as any} />
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <>
            <RangePicker
              value={selectedDate}
              onChange={(dates) => setSelectedDate(dates ? (dates as [Dayjs, Dayjs]) : defaultDateRange)}
              disabledDate={disabledDate}
            />
            <Table dataSource={filteredCrowdData} columns={columns} rowKey={(record) => record.date} className="mt-4" />
          </>
        ) : (
          <>
            <ParkCrowdLevelsCalendar crowdData={calendarCrowdData} parkId={parkId} thresholds={thresholds} allParks={parks} />
            <ThresholdExplanation />
          </>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default ParkCrowdLevels;
