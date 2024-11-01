import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Typography, Button, Space, Spin, Checkbox } from 'antd';
import { Line } from 'react-chartjs-2';
import dayjs, { Dayjs } from 'dayjs';
import {
  getAggregatedCrowdDataForPark,
  getAllParks,
  getAllSensorReadingsByParkIdAndSensorType,
  getPredictedCrowdLevelsForPark,
  ParkResponse,
  predictCrowdLevels,
  SensorTypeEnum,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { ContentWrapperDark } from '@lepark/common-ui';
import moment from 'moment-timezone';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { uniqBy } from 'lodash';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const { RangePicker } = DatePicker;
const { Option } = Select;

interface CrowdData {
  date: string;
  crowdLevel: number | null;
  predictedCrowdLevel: number | null;
  parkId: number;
  parkName: string;
}

const CHART_COLORS = [
  'rgb(255, 205, 86)',
  'rgb(54, 162, 235)',
  'rgb(153, 102, 255)',
  'rgb(255, 159, 64)',
  'rgb(201, 203, 207)',
  'rgb(75, 192, 192)',
  'rgb(255, 99, 132)',
];

const CompareParkCrowdLevels: React.FC = () => {
  const defaultHistoricalRange: [Dayjs, Dayjs] = [dayjs().subtract(20, 'days'), dayjs()];
  const defaultPredictionRange: [Dayjs, Dayjs] = [dayjs(), dayjs().add(30, 'days')];

  const [selectedHistoricalDate, setSelectedHistoricalDate] = useState<[Dayjs, Dayjs]>(defaultHistoricalRange);
  const [selectedPredictionDate, setSelectedPredictionDate] = useState<[Dayjs, Dayjs]>(defaultPredictionRange);
  const [selectedParks, setSelectedParks] = useState<number[]>([]);
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [crowdData, setCrowdData] = useState<CrowdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParks();
  }, []);

  useEffect(() => {
    if (selectedParks.length > 0) {
      fetchData();
    }
  }, [selectedHistoricalDate, selectedPredictionDate, selectedParks]);

  const fetchParks = async () => {
    try {
      const parksResponse = await getAllParks();
      setParks(parksResponse.data);
    } catch (error) {
      console.error('Error fetching parks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const parkDataPromises = selectedParks.map(async (parkId) => {
        // First get all sensor readings to find the earliest date
        const sensorData = await getAllSensorReadingsByParkIdAndSensorType(parkId, SensorTypeEnum.CAMERA);

        if (!sensorData.data || sensorData.data.length === 0) {
          console.log('No sensor data available for park:', parkId);
          return [];
        }

        // Sort sensor data to find earliest and latest dates
        const sortedData = sensorData.data
          .filter((item: any) => item && item.date)
          .sort((a: any, b: any) => moment.tz(a.date, 'Asia/Singapore').valueOf() - moment.tz(b.date, 'Asia/Singapore').valueOf());

        if (sortedData.length === 0) {
          console.log('No valid sensor data after filtering for park:', parkId);
          return [];
        }

        // Get date ranges
        const startDate = moment.tz(sortedData[0].date, 'Asia/Singapore').startOf('day');
        const endDate = moment.tz(sortedData[sortedData.length - 1].date, 'Asia/Singapore').endOf('day');
        const today = moment().tz('Asia/Singapore').endOf('day');
        const predictionEndDate = today.clone().add(1, 'month').endOf('day');

        console.log(
          'Fetching data for park',
          parkId,
          ':',
          startDate.format('YYYY-MM-DD HH:mm:ss'),
          'to',
          endDate.format('YYYY-MM-DD HH:mm:ss'),
        );

        // Get historical data from earliest sensor date
        const historicalEndDate = today.isBefore(endDate) ? today : endDate;
        const historicalResponse = await getAggregatedCrowdDataForPark(parkId, startDate.toDate(), historicalEndDate.toDate());

        // Get future predictions
        const daysToPredict = predictionEndDate.diff(today, 'days') + 1;
        const predictedResponse = await predictCrowdLevels(parkId, daysToPredict);

        // Calculate past predictions based on actual data range
        const distinctDays = uniqBy(sortedData, (item: { date: any }) =>
          moment.tz(item.date, 'Asia/Singapore').format('YYYY-MM-DD'),
        ).length;
        const pastDaysToPredict = Math.max(distinctDays - 71, 0);
        const pastPredictedResponse = await getPredictedCrowdLevelsForPark(parkId, pastDaysToPredict);

        const parkName = parks.find((p) => p.id === parkId)?.name || 'Unknown Park';

        // Normalize dates to SGT
        const normalizeDate = (date: string) => {
          return moment.tz(date, 'Asia/Singapore').startOf('day').format('YYYY-MM-DD');
        };

        // Normalize each dataset with SGT dates
        const normalizedHistoricalData = historicalResponse.data.map((item: any) => ({
          date: normalizeDate(item.date),
          crowdLevel: item.crowdLevel,
          predictedCrowdLevel: null,
          parkId,
          parkName,
        }));

        const normalizedPredictedData = predictedResponse.data.map((item: any) => ({
          date: normalizeDate(item.date),
          crowdLevel: null,
          predictedCrowdLevel: item.predictedCrowdLevel,
          parkId,
          parkName,
        }));

        const normalizedPastPredictedData = pastPredictedResponse.data.map((item: any) => ({
          date: normalizeDate(item.date),
          crowdLevel: null,
          predictedCrowdLevel: item.predictedCrowdLevel,
          parkId,
          parkName,
        }));

        // Combine and sort all data
        const combinedData = [...normalizedHistoricalData, ...normalizedPastPredictedData, ...normalizedPredictedData];

        const sortByDate = (a: { date: string }, b: { date: string }) =>
          moment.tz(a.date, 'Asia/Singapore').valueOf() - moment.tz(b.date, 'Asia/Singapore').valueOf();

        combinedData.sort(sortByDate);

        return combinedData;
      });

      const allParkData = await Promise.all(parkDataPromises);
      setCrowdData(allParkData.flat());
    } catch (error) {
      console.error('Error fetching crowd data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistoricalData = crowdData.filter((d) => {
    const date = dayjs(d.date);
    return date.isBetween(selectedHistoricalDate[0], selectedHistoricalDate[1], 'day', '[]') && d.crowdLevel !== null;
  });

  const filteredPredictionData = crowdData.filter((d) => {
    const date = dayjs(d.date);
    return date.isBetween(selectedPredictionDate[0], selectedPredictionDate[1], 'day', '[]') && d.predictedCrowdLevel !== null;
  });

  const disabledHistoricalDate = (current: Dayjs) => {
    // Convert current to YYYY-MM-DD format for comparison
    const currentDateString = current.format('YYYY-MM-DD');

    // Check if the current date exists in historical data
    return !crowdData.some((data) => data.date === currentDateString && data.crowdLevel !== null);
  };

  const disabledPredictionDate = (current: Dayjs) => {
    // Convert current to YYYY-MM-DD format for comparison
    const currentDateString = current.format('YYYY-MM-DD');

    // Check if the current date exists in prediction data
    return !crowdData.some((data) => data.date === currentDateString && data.predictedCrowdLevel !== null);
  };

  const historicalChartData = {
    labels: Array.from(new Set(filteredHistoricalData.map((d) => dayjs(d.date).format('ddd DD/MM')))),
    datasets: selectedParks.map((parkId, index) => {
      const parkData = filteredHistoricalData.filter((d) => d.parkId === parkId);
      const parkName = parks.find((p) => p.id === parkId)?.name || 'Unknown Park';

      return {
        label: parkName,
        data: parkData.map((d) => (d.crowdLevel !== null ? Math.round(d.crowdLevel) : null)),
        borderColor: CHART_COLORS[index % CHART_COLORS.length],
        fill: false,
      };
    }),
  };

  const predictedChartData = {
    labels: Array.from(new Set(filteredPredictionData.map((d) => dayjs(d.date).format('ddd DD/MM')))),
    datasets: selectedParks.map((parkId, index) => {
      const parkData = filteredPredictionData.filter((d) => d.parkId === parkId);
      const parkName = parks.find((p) => p.id === parkId)?.name || 'Unknown Park';

      return {
        label: parkName,
        data: parkData.map((d) => (d.predictedCrowdLevel !== null ? Math.round(d.predictedCrowdLevel) : null)),
        borderColor: CHART_COLORS[index % CHART_COLORS.length],
        borderDash: [5, 5],
        fill: false,
      };
    }),
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
          label: function (context: any) {
            return `${context.dataset.label}: ${Math.round(context.parsed.y)}`;
          },
        },
      },
      legend: {
        position: 'top' as const,
      },
    },
  };

  const breadcrumbItems = [
    {
      title: 'Crowd Insights',
      pathKey: '/crowdInsights',
      isMain: true,
    },
    {
      title: 'Compare Parks',
      pathKey: '/crowdInsights/compareParks',
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <div className="mb-4">
          <Space direction="vertical" className="w-full">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span>Select Parks:</span>
              <Select
                mode="multiple"
                value={selectedParks}
                onChange={setSelectedParks}
                className="w-full"
                placeholder="Select parks to compare"
              >
                {parks.map((park) => (
                  <Option key={park.id} value={park.id}>
                    {park.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Space>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Spin size="large" />
            <p className="mt-5">Loading comparison data...</p>
          </div>
        ) : selectedParks.length === 0 ? (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <Typography.Title level={4}>Historical Crowd Levels</Typography.Title>
                <RangePicker
                  value={selectedHistoricalDate}
                  onChange={(dates) => setSelectedHistoricalDate(dates ? (dates as [Dayjs, Dayjs]) : defaultHistoricalRange)}
                  disabledDate={disabledHistoricalDate}
                />
              </div>
              <div className="h-[400px] flex items-center justify-center bg-gray-50">
                <Typography.Text className="text-gray-500">Please select one or more parks to view historical crowd levels</Typography.Text>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <Typography.Title level={4}>Predicted Crowd Levels</Typography.Title>
                <RangePicker
                  value={selectedPredictionDate}
                  onChange={(dates) => setSelectedPredictionDate(dates ? (dates as [Dayjs, Dayjs]) : defaultPredictionRange)}
                  disabledDate={disabledPredictionDate}
                />
              </div>
              <div className="h-[400px] flex items-center justify-center bg-gray-50">
                <Typography.Text className="text-gray-500">Please select one or more parks to view predicted crowd levels</Typography.Text>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <Typography.Title level={4}>Historical Crowd Levels</Typography.Title>
                <RangePicker
                  value={selectedHistoricalDate}
                  onChange={(dates) => setSelectedHistoricalDate(dates ? (dates as [Dayjs, Dayjs]) : defaultHistoricalRange)}
                  disabledDate={disabledHistoricalDate}
                />
              </div>
              <div className="h-[400px]">
                <Line data={historicalChartData} options={chartOptions as any} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <Typography.Title level={4}>Predicted Crowd Levels</Typography.Title>
                <RangePicker
                  value={selectedPredictionDate}
                  onChange={(dates) => setSelectedPredictionDate(dates ? (dates as [Dayjs, Dayjs]) : defaultPredictionRange)}
                  disabledDate={disabledPredictionDate}
                />
              </div>
              <div className="h-[400px]">
                <Line data={predictedChartData} options={chartOptions as any} />
              </div>
            </div>
          </>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default CompareParkCrowdLevels;
