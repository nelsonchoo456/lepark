import React, { useEffect, useState } from 'react';
import { getSequestrationHistory, getSequestrationHistoryByAreaIdAndTimeFrame, SequestrationHistoryResponse } from '@lepark/data-access';
import { Card, DatePicker, Spin, message, Statistic, Row, Col } from 'antd';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { RangePicker } = DatePicker;

const SequestrationHistoryTab = ({ areaId }: { areaId: string }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SequestrationHistoryResponse[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchSequestrationHistory();
    }
  }, [startDate, endDate]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const response = await getSequestrationHistory(areaId);
      const formattedData = response.data.map((entry: any) => ({
        ...entry,
        date: dayjs(entry.date).format('YYYY-MM-DD'),
      }));
      // Sort data by date in ascending order
      formattedData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setData(formattedData);

      if (formattedData.length > 0) {
        setStartDate(formattedData[0].date);
        setEndDate(formattedData[formattedData.length - 1].date);
      }
    } catch (error) {
      console.log(error);
      message.error('Error fetching initial sequestration history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSequestrationHistory = async () => {
    setLoading(true);
    try {
      if (startDate && endDate) {
        const inclusiveEndDate = dayjs(endDate).add(1, 'day').toISOString();
        const response = await getSequestrationHistoryByAreaIdAndTimeFrame(areaId, startDate, inclusiveEndDate);

        const formattedData = response.data.map((entry: any) => ({
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
    setStartDate(dayjs(dateStrings[0]).toISOString());
    setEndDate(dayjs(dateStrings[1]).toISOString());
  };

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

  console.log('chartData', chartData);

  return (
    <Card>
      {startDate && endDate ? (
        <RangePicker
          onChange={handleDateChange}
          defaultValue={[dayjs(startDate), dayjs(endDate)]}
          value={[dayjs(startDate), dayjs(endDate)]}
        />
      ) : (
        loading && <Spin />
      )}
      {loading ? (
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
  );
};

export default SequestrationHistoryTab;
