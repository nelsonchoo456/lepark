import React, { useEffect, useState } from 'react';
import {
  getSequestrationHistoryByAreaIdAndTimeFrame,
  SequestrationHistoryResponse,
  DecarbonizationAreaResponse,
} from '@lepark/data-access';
import { Card, DatePicker, Spin, message, Statistic, Row, Col, Select } from 'antd';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { StaffResponse, StaffType } from '@lepark/data-access';
import { useFetchDecarbonizationAreas } from '../../hooks/DecarbonizationArea/useFetchDecarbonizationAreas';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import PageHeader2 from '../../components/main/PageHeader2'; // Import PageHeader2

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { RangePicker } = DatePicker;
const { Option } = Select;

const DecarbonizationAreaChart: React.FC = () => {
  const { decarbonizationAreas, loading: areasLoading } = useFetchDecarbonizationAreas();
  const { parks } = useFetchParks();
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SequestrationHistoryResponse[]>([]);
  const [startDate, setStartDate] = useState<string | null>(dayjs().subtract(1, 'month').toISOString());
  const [endDate, setEndDate] = useState<string | null>(dayjs().toISOString());
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role === StaffType.SUPERADMIN && decarbonizationAreas.length > 0) {
      setSelectedArea('all');
    } else if (decarbonizationAreas.length > 0) {
      setSelectedArea('all');
      setSelectedParkId(decarbonizationAreas[0].parkId);
    }
  }, [user, decarbonizationAreas]);

  useEffect(() => {
    if (startDate && endDate && selectedArea) {
      fetchSequestrationHistory();
    }
  }, [startDate, endDate, selectedArea, selectedParkId]);

  const fetchSequestrationHistory = async () => {
    setLoading(true);
    setData([]); // Clear data before fetching new data
    try {
      const inclusiveEndDate = dayjs(endDate).add(1, 'day').toISOString();
      let response;
      if (selectedArea === 'all') {
        const filteredAreas = decarbonizationAreas.filter((area) => area.parkId === selectedParkId);
        if (filteredAreas.length === 0) {
          setData([]); // Ensure data is cleared if no areas are found
          setLoading(false);
          return;
        }
        const allData = await Promise.all(
          filteredAreas.map((area) => getSequestrationHistoryByAreaIdAndTimeFrame(area.id, startDate!, inclusiveEndDate)),
        );
        response = allData.flatMap((res) => res.data);
      } else {
        response = await getSequestrationHistoryByAreaIdAndTimeFrame(selectedArea!, startDate!, inclusiveEndDate);
        response = response.data;
      }

      if (response.length === 0) {
        setData([]); // Ensure data is cleared if no data is returned
      } else {
        const formattedData = response.map((entry: any) => ({
          ...entry,
          date: dayjs(entry.date).format('YYYY-MM-DD'),
        }));
        // Sort data by date in ascending order
        formattedData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setData(formattedData);
      }
    } catch (error) {
      console.log(error);
      message.error('Error fetching sequestration history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setData([]); // Clear data before changing date
    setStartDate(dayjs(dateStrings[0]).toISOString());
    setEndDate(dayjs(dateStrings[1]).toISOString());
  };

  const handleAreaChange = (value: string) => {
    setData([]); // Clear data before changing area
    setSelectedArea(value);
  };

  const handleParkChange = (value: number) => {
    setData([]); // Clear data immediately when park changes
    setSelectedParkId(value);
    setSelectedArea('all'); // Reset selected area to 'all' when park changes
  };

  useEffect(() => {
    if (selectedParkId !== null) {
      fetchSequestrationHistory();
    }
  }, [selectedParkId]);

  const calculateMetrics = (data: SequestrationHistoryResponse[]) => {
    const total = data.reduce((sum, entry) => sum + entry.seqValue, 0);
    const average = total / data.length;
    const max = Math.max(...data.map((entry) => entry.seqValue));
    const min = Math.min(...data.map((entry) => entry.seqValue));
    const trend = data.length > 1 ? (data[data.length - 1].seqValue - data[0].seqValue) / (data.length - 1) : 0;

    return {
      total: total.toFixed(2),
      average: average.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      trend: trend.toFixed(2),
    };
  };

  const metrics = calculateMetrics(data);

  const chartData = {
    labels: data.map((entry: any) => entry.date),
    datasets: [
      {
        label: 'Sequestration Amount',
        data: data.map((entry: any) => entry.seqValue), // Ensure the correct field is used here
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  const filteredDecarbonizationAreas = selectedParkId
    ? decarbonizationAreas.filter((area) => area.parkId === selectedParkId)
    : decarbonizationAreas;

  const breadcrumbItems = [
    {
      title: 'Decarbonization Areas Management',
      pathKey: '/decarbonization-area',
      isMain: true,
    },
    {
      title: 'Data Visualizations',
      pathKey: '/decarbonization-area/chart',
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Row gutter={16} justify="end">
          {user?.role === StaffType.SUPERADMIN && (
            <>
              <Col>
                <Select value={selectedParkId} onChange={handleParkChange} style={{ width: 300 }} placeholder="Select Park">
                  {parks.map((park) => (
                    <Option key={park.id} value={park.id}>
                      {park.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            </>
          )}
          <Col>
            <Select value={selectedArea} onChange={handleAreaChange} style={{ width: 300 }} placeholder="Select Area">
              <Option value="all">All Areas</Option>
              {filteredDecarbonizationAreas.map((area) => (
                <Option key={area.id} value={area.id}>
                  {area.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col>
            <RangePicker onChange={handleDateChange} defaultValue={[dayjs().subtract(1, 'month'), dayjs()]} />
          </Col>
        </Row>
        {loading || areasLoading ? (
          <Spin />
        ) : data.length > 0 ? (
          <>
            <Row gutter={16} style={{ marginTop: '10px' }}>
              <Col span={6}>
                <Statistic title="Total Sequestration" value={metrics.total} />
              </Col>
              <Col span={6}>
                <Statistic title="Average Sequestration" value={metrics.average} />
              </Col>
              <Col span={6}>
                <Statistic title="Max Sequestration" value={metrics.max} />
              </Col>
              <Col span={6}>
                <Statistic title="Min Sequestration" value={metrics.min} />
              </Col>
              <Col span={6}>
                <Statistic title="Trend (per day)" value={metrics.trend} />
              </Col>
            </Row>
            <Line data={chartData} />
          </>
        ) : (
          <p>No data available</p>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default DecarbonizationAreaChart;
