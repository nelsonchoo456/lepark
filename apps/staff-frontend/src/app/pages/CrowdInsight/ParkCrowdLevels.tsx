import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Select, Row, Col, Typography, Radio, Button, InputNumber, Modal, Form, Tag, Slider } from 'antd';
import { Line } from 'react-chartjs-2';
import dayjs, { Dayjs } from 'dayjs';
import {
  getAggregatedCrowdDataForPark,
  getAllParks,
  getAllSensorReadingsByParkIdAndSensorType,
  getSensorReadingsByZoneIdAndSensorTypeByDateRange,
  getZonesByParkId,
  ParkResponse,
  predictCrowdLevels,
  SensorTypeEnum,
} from '@lepark/data-access';
import { SensorReading } from '@prisma/client';
import PageHeader2 from '../../components/main/PageHeader2';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import ParkCrowdLevelsCalendar from './ParkCrowdLevelsCalendar';
import { useParkThresholds } from '../../hooks/CrowdInsights/CalculateCrowdThresholds';
import moment from 'moment-timezone';
import { sumBy } from 'lodash';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { ColumnType } from 'antd/es/table';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, annotationPlugin);

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
  const [isLoading, setIsLoading] = useState(true);

  // Fix: Handle the case when parkId is 0 separately
  const parkGeom = parkId === 0 ? undefined : parks.find((p) => p.id === parkId)?.geom;
  const thresholds = useParkThresholds(
    parkId,
    parkGeom,
    parks.map((p) => ({ ...p, geometry: p.geom })),
  );

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
      setParks(parksResponse.data);
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

      // Fetch predictions
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

      const combinedData = [
        ...historicalData.map((item: any) => ({
          date: moment.tz(item.date, 'Asia/Singapore').format('YYYY-MM-DD'),
          crowdLevel: item.crowdLevel,
          predictedCrowdLevel: null,
        })),
        ...predictedData.map((item: any) => ({
          date: moment.tz(item.date, 'Asia/Singapore').format('YYYY-MM-DD'),
          crowdLevel: null,
          predictedCrowdLevel: item.predictedCrowdLevel,
        })),
      ];

      // Sort combined data by date
      combinedData.sort((a, b) => moment.tz(a.date, 'Asia/Singapore').valueOf() - moment.tz(b.date, 'Asia/Singapore').valueOf());

      console.log('Combined data:', combinedData);
      setCrowdData(combinedData);
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

  const chartData = {
    labels: filteredCrowdData.map((d) => dayjs(d.date).format('ddd DD/MM')),
    datasets: [
      {
        label: 'Actual',
        data: filteredCrowdData.map((d) => (d.crowdLevel !== null ? Math.round(d.crowdLevel) : null)),
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
      },
      {
        label: 'Predicted',
        data: filteredCrowdData.map((d) =>
          d.predictedCrowdLevel !== null ? (d.predictedCrowdLevel !== undefined ? Math.round(d.predictedCrowdLevel) : null) : null,
        ),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        fill: false,
      },
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
        },
      },
    },
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
    </Radio.Group>
  );

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Row gutter={16} className="mb-4">
          <Col span={12}>{renderViewSelector()}</Col>
          <Col span={12}>
            <div className="flex items-center">
              <span className="mr-2">Park:</span>
              <Select value={parkId} onChange={setParkId} className="w-full">
                <Option value={0}>All NParks</Option>
                {parks.map((park) => (
                  <Option key={park.id} value={park.id}>
                    {park.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
        {viewMode === 'graph' ? (
          <div style={{ height: '300px' }}>
            <RangePicker value={selectedDate} onChange={(dates) => setSelectedDate(dates ? (dates as [Dayjs, Dayjs]) : defaultDateRange)} />
            <Line data={chartData} options={chartOptions as any} />
            <Table dataSource={filteredCrowdData} columns={columns} rowKey={(record) => record.date} className="mt-4" />
          </div>
        ) : (
          <>
            <ParkCrowdLevelsCalendar crowdData={calendarCrowdData} parkId={parkId} thresholds={thresholds} allParks={parks} />
          </>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default ParkCrowdLevels;
