import React, { useEffect, useState } from 'react';
import {
  getSequestrationHistoryByAreaIdAndTimeFrame,
  SequestrationHistoryResponse,
  DecarbonizationAreaResponse,
} from '@lepark/data-access';
import { Card, DatePicker, Spin, message, Statistic, Row, Col, Select } from 'antd';
import dayjs from 'dayjs';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { StaffResponse, StaffType } from '@lepark/data-access';
import { useFetchDecarbonizationAreas } from '../../hooks/DecarbonizationArea/useFetchDecarbonizationAreas';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import PageHeader2 from '../../components/main/PageHeader2';
import SequestrationGraph from './components/SequestrationGraph';
import { formatDate } from './components/dateFormatter'; // Import the utility function

const { RangePicker } = DatePicker;
const { Option } = Select;

const DecarbonizationAreaChart: React.FC = () => {
  const { decarbonizationAreas, loading: areasLoading } = useFetchDecarbonizationAreas();
  const { parks } = useFetchParks();
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SequestrationHistoryResponse[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);
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
      let filteredAreas: DecarbonizationAreaResponse[] = [];
      if (selectedArea === 'all') {
        filteredAreas = decarbonizationAreas.filter((area) => area.parkId === selectedParkId);
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
          date: formatDate(entry.date), // Use the formatDate utility function
        }));
        // Sort data by date in ascending order
        formattedData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Aggregate data by date and areaId
        const aggregatedData = formattedData.reduce((acc: any, entry: any) => {
          const existingEntry = acc.find((e: any) => e.date === entry.date && e.decarbonizationAreaId === entry.decarbonizationAreaId);
          if (existingEntry) {
            existingEntry.seqValue += entry.seqValue;
          } else {
            acc.push({ ...entry });
          }
          return acc;
        }, []);

        setData(aggregatedData);
        console.log('Aggregated Data:', aggregatedData);
        console.log('Filtered Areas:', filteredAreas);

        // Group data by area for bar chart using aggregated data
        const groupedData = filteredAreas.map((area) => {
          console.log('Area:', area);
          const areaData = aggregatedData.filter((entry: { decarbonizationAreaId: string }) => entry.decarbonizationAreaId === area.id);
          console.log('Area Data:', areaData);
          const totalSeqValue = areaData.reduce((sum: number, entry: { seqValue: number }) => sum + entry.seqValue, 0);
          return { areaName: area.name, totalSeqValue };
        });

        setBarChartData(groupedData);
        console.log('Grouped Data:', groupedData);

        // Aggregate data by date for line chart
        const lineChartData = aggregatedData.reduce((acc: any, entry: any) => {
          const existingEntry = acc.find((e: any) => e.date === entry.date);
          if (existingEntry) {
            existingEntry.seqValue += entry.seqValue;
          } else {
            acc.push({ date: entry.date, seqValue: entry.seqValue });
          }
          return acc;
        }, []);

        setData(lineChartData);
        console.log('Line Chart Data:', lineChartData);
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

  const lineChartData = {
    labels: data.map((entry: any) => entry.date),
    datasets: [
      {
        label: 'Sequestration Amount (kg)',
        data: data.map((entry: any) => entry.seqValue),
        fill: false,
        backgroundColor: '#a3d4c7',
        borderColor: '#a3d4c7',
      },
    ],
  };

  const barChartDataConfig = {
    labels: barChartData.map((entry) => entry.areaName),
    datasets: [
      {
        label: 'Total Sequestration by Area (kg)',
        data: barChartData.map((entry) => entry.totalSeqValue),
        backgroundColor: '#a3d4c7',
        borderColor: '#a3d4c7',
        borderWidth: 1,
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
                <Statistic title="Total Sequestration (kg)" value={metrics.total} />
              </Col>
              <Col span={6}>
                <Statistic title="Average Sequestration (kg)" value={metrics.average} />
              </Col>
              <Col span={6}>
                <Statistic title="Max Sequestration (kg)" value={metrics.max} />
              </Col>
              <Col span={6}>
                <Statistic title="Min Sequestration (kg)" value={metrics.min} />
              </Col>
              <Col span={6}>
                <Statistic title="Trend (per day) (kg)" value={metrics.trend} />
              </Col>
            </Row>
            <SequestrationGraph lineChartData={lineChartData} barChartData={barChartDataConfig} showBarChart={selectedArea === 'all'} />
          </>
        ) : (
          <p>No data available</p>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default DecarbonizationAreaChart;
