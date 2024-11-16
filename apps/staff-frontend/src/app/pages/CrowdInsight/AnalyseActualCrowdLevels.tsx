import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Row, Col, Radio, Button, Space, Spin, Tooltip, Typography, Statistic } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import dayjs, { Dayjs } from 'dayjs';
import { getAllParks, getZonesByParkId, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { useLocation } from 'react-router-dom';
import { useFetchCrowdData } from '../../hooks/CrowdInsights/useFetchCrowdData';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import moment from 'moment-timezone';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, Legend, annotationPlugin, Filler);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

type TimeGranularity = 'day' | 'week' | 'month';

const AnalyseActualCrowdLevels: React.FC = () => {
  const defaultDateRange: [Dayjs, Dayjs] = [dayjs().subtract(90, 'days'), dayjs()];
  const [selectedDate, setSelectedDate] = useState<[Dayjs, Dayjs]>(defaultDateRange);
  const { state } = useLocation();
  const [parkId, setParkId] = useState<number>(state?.selectedParkId);
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [restrictedParks, setRestrictedParks] = useState<ParkResponse[]>([]);
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>('day');
  const { user } = useAuth<StaffResponse>();
  // const [numZones, setNumZones] = useState<number>(0);

  // Use the custom hook for crowd data
  const { crowdData, isLoading, error } = useFetchCrowdData({
    parkId,
    parks,
  });

  useEffect(() => {
    fetchParks();
  }, []);

  // useEffect(() => {
  //   fetchNumZones();
  // }, [parkId]);

  const fetchParks = async () => {
    try {
      const parksResponse = await getAllParks();
      const allParks = parksResponse.data;
      const filteredParks = user?.role === StaffType.SUPERADMIN ? allParks : allParks.filter((park) => park.id === user?.parkId);

      setParks(allParks);
      setRestrictedParks(filteredParks);

      if (parkId === 0 && filteredParks.length === 1) {
        setParkId(filteredParks[0].id);
      }
    } catch (error) {
      console.error('Error fetching parks:', error);
    }
  };

  // const fetchNumZones = async () => {
  //   const numZonesResponse = await getZonesByParkId(parkId);
  //   setNumZones(numZonesResponse.data.length);
  // };

  const dateRanges = React.useMemo(() => new Map<string, string>(), []);

  // Filter data based on selected date range
  const filteredCrowdData = React.useMemo(() => {
    if (!selectedDate) return crowdData; // Return all data if no date range selected

    return crowdData.filter((d) => {
      const date = dayjs(d.date);
      const startDate = dayjs(selectedDate[0]).startOf('day');
      const endDate = dayjs(selectedDate[1]).endOf('day');
      return (date.isAfter(startDate) || date.isSame(startDate)) && (date.isBefore(endDate) || date.isSame(endDate));
    });
  }, [crowdData, selectedDate]);

  // Aggregate data based on selected time granularity
  // Update the aggregation logic
  const aggregatedData = React.useMemo(() => {
    dateRanges.clear(); // Clear previous entries
    const groupedData = new Map<string, number[]>();

    filteredCrowdData.forEach((d) => {
      if (d.crowdLevel === null) return;

      let key: string;
      const date = dayjs(d.date);

      switch (timeGranularity) {
        case 'week':
          // Get Sunday of current week
          const weekStart = moment(d.date).tz('Asia/Singapore').startOf('week').format('DD MMM');
          // Get Saturday of current week (don't subtract 1 day)
          const weekEnd = moment(d.date).tz('Asia/Singapore').endOf('week').format('DD MMM');
          key = `${weekStart} - ${weekEnd}`;
          dateRanges.set(key, key);
          break;
        case 'month':
          key = moment(d.date).tz('Asia/Singapore').format('MMM YYYY');
          dateRanges.set(key, key);
          break;
        default: // day
          key = date.format('YYYY-MM-DD');
      }

      if (!groupedData.has(key)) {
        groupedData.set(key, []);
      }
      groupedData.get(key)?.push(d.crowdLevel);
    });

    return Array.from(groupedData.entries()).map(([key, values]) => {
      const totalCrowdLevel = values.reduce((a, b) => a + b, 0);
      return {
        date: key,
        totalCrowdLevel: Math.round(totalCrowdLevel),
        // averageCrowdLevel: Math.round(totalCrowdLevel / numZones), // divide by number of zones
        dataPoints: values.length,
      };
    });
  }, [filteredCrowdData, timeGranularity, parks]);

  // const averageChartData = {
  //   labels: aggregatedData.map((d) => d.date),
  //   datasets: [
  //     {
  //       label: 'Average Crowd Level',
  //       data: aggregatedData.map((d) => d.averageCrowdLevel),
  //       borderColor: 'rgb(255, 159, 64)',
  //     },
  //   ],
  // };

  const totalChartData = {
    labels: aggregatedData.map((d) => d.date),
    datasets: [
      {
        label: 'Total Visitors',
        data: aggregatedData.map((d) => d.totalCrowdLevel),
        borderColor: 'rgb(75, 192, 192)',
      },
    ],
  };

  // Create separate chart options
  const createChartOptions = (yAxisTitle: string) => ({
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
          text: yAxisTitle,
        },
        beginAtZero: true,
      },
    },
    plugins: {
      filler: {
        propagate: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || '';
            const value = context.raw;
            return `${label}: ${value}`;
          },
        },
      },
      legend: {
        position: 'top' as const,
      },
    },
  });

  const breadcrumbItems = [
    {
      title: 'Crowd Insights',
      pathKey: '/crowdInsights/allParks',
      isMain: true,
      isCurrent: false,
    },
    {
      title: 'Details',
      pathKey: '/crowdInsights',
      isMain: false,
      isCurrent: false,
    },
    {
      title: 'Historical Analysis',
      pathKey: '/crowdInsights/analyse',
      isMain: false,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Row gutter={16} className="mb-4">
          {user?.role === StaffType.SUPERADMIN && (
            <Col span={8}>
              <div className="flex items-center">
                <span className="mr-2">Park:</span>
                <Select value={parkId} onChange={setParkId} className="w-full">
                  {restrictedParks.map((park) => (
                    <Option key={park.id} value={park.id}>
                      {park.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          )}
          <Col span={8}>
            <RangePicker
              value={selectedDate}
              onChange={(dates) => {
                // If dates is null (cleared), set back to default range
                setSelectedDate((dates as [Dayjs, Dayjs]) || defaultDateRange);
              }}
              className="w-full"
              defaultValue={defaultDateRange}
              disabledDate={(current) => {
                return !crowdData.some((d) => dayjs(d.date).format('YYYY-MM-DD') === current.format('YYYY-MM-DD'));
              }}
            />
          </Col>
          <Col span={8}>
            <Radio.Group value={timeGranularity} onChange={(e) => setTimeGranularity(e.target.value)}>
              <Radio.Button value="day">Daily</Radio.Button>
              <Radio.Button value="week">Weekly</Radio.Button>
              <Radio.Button value="month">Monthly</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Spin size="large" />
            <p className="mt-5">Loading historical data...</p>
          </div>
        ) : !parkId ? (
          <div className="h-[400px] flex items-center justify-center bg-gray-50">
            <Typography.Text className="text-gray-500">Please select a park to view historical crowd levels</Typography.Text>
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {/* <Col span={24}>
                <Card title="Average Crowd Levels (per zone)">
                  <div className="h-[300px]">
                    <Line data={averageChartData} options={createChartOptions('Average Crowd Level')} />
                  </div>
                </Card>
              </Col> */}
              <Col span={24}>
                <Card title="Total Visitors (per park)">
                  <div className="h-[300px]">
                    <Line data={totalChartData} options={createChartOptions('Total Visitors')} />
                  </div>
                </Card>
              </Col>
            </Row>

            <div className="mt-4">
              <Title level={5}>Analysis Statistics</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="Total Visitors"
                      value={Math.round(filteredCrowdData.reduce((sum, d) => sum + (d.crowdLevel || 0), 0))}
                    />
                  </Card>
                </Col>
                {/* <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Average Crowd Level"
                      value={Math.round(aggregatedData.reduce((sum, d) => sum + d.averageCrowdLevel, 0) / aggregatedData.length)}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="Peak Average" value={Math.max(...aggregatedData.map((d) => d.averageCrowdLevel))} />
                  </Card>
                </Col> */}
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="Average Visitors"
                      value={Math.round(aggregatedData.reduce((sum, d) => sum + d.totalCrowdLevel, 0) / aggregatedData.length)}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic title="Peak Total" value={Math.max(...aggregatedData.map((d) => d.totalCrowdLevel))} />
                  </Card>
                </Col>
              </Row>
            </div>
          </>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default AnalyseActualCrowdLevels;

function formatLabel(date: string) {
  throw new Error('Function not implemented.');
}
