import React, { useEffect, useState } from 'react';
import { getSequestrationHistory, getSequestrationHistoryByAreaIdAndTimeFrame, SequestrationHistoryResponse } from '@lepark/data-access';
import { Card, DatePicker, Spin, message, Statistic, Row, Col, Switch } from 'antd';
import GraphContainer from '../../DecarbonizationArea/components/GraphContainer';
import dayjs from 'dayjs';
import { formatDate } from '../../DecarbonizationArea/components/dateFormatter';

const { RangePicker } = DatePicker;

const SequestrationHistoryTab = ({ areaId }: { areaId: string }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SequestrationHistoryResponse[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isSingleColumn, setIsSingleColumn] = useState(false);

  const toggleSingleColumn = () => {
    setIsSingleColumn((prev) => !prev);
  };

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
        date: formatDate(entry.date),
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
          date: formatDate(entry.date),
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

  const cumulativeLineChartData = {
    labels: data.map((entry: any) => entry.date),
    datasets: [
      {
        label: 'Cumulative Sequestration Amount (kg)',
        data: data.reduce((acc: number[], entry: any, index: number) => {
          if (index === 0) {
            acc.push(entry.seqValue);
          } else {
            acc.push(acc[index - 1] + entry.seqValue);
          }
          return acc;
        }, []),
        fill: false,
        backgroundColor: '#f39c12',
        borderColor: '#f39c12',
      },
    ],
  };

  const aggregateDataByPeriod = (data: SequestrationHistoryResponse[], period: 'year' | 'month') => {
    const aggregatedData: { [key: string]: number } = {};

    data.forEach((entry) => {
      const periodKey = dayjs(entry.date).format(period === 'year' ? 'YYYY' : 'YYYY-MM');
      if (!aggregatedData[periodKey]) {
        aggregatedData[periodKey] = 0;
      }
      aggregatedData[periodKey] += entry.seqValue;
    });

    return Object.keys(aggregatedData).map((key) => ({
      period: key,
      value: aggregatedData[key],
    }));
  };

  const annualData = aggregateDataByPeriod(data, 'year');
  const monthlyData = aggregateDataByPeriod(data, 'month');

  const annualChartData = {
    labels: annualData.map((entry) => entry.period),
    datasets: [
      {
        label: 'Annual Sequestration Amount (kg)',
        data: annualData.map((entry) => entry.value),
        fill: false,
        backgroundColor: '#2ecc71',
        borderColor: '#2ecc71',
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyData.map((entry) => entry.period),
    datasets: [
      {
        label: 'Monthly Sequestration Amount (kg)',
        data: monthlyData.map((entry) => entry.value),
        fill: false,
        backgroundColor: '#3498db',
        borderColor: '#3498db',
      },
    ],
  };

  return (
    <Card>
      {startDate && endDate ? (
        <Row gutter={12} style={{ marginBottom: '10px', justifyContent: 'right', alignItems: 'center' }}>
          {data.length > 0 && (
            <Col>
              <Switch checkedChildren="Expanded" unCheckedChildren="Compact" checked={isSingleColumn} onChange={toggleSingleColumn} />
              {/* <span style={{ marginLeft: '8px' }}>Enlarge Visualizations</span> */}
            </Col>
          )}
          <Col>
            <RangePicker
              onChange={handleDateChange}
              defaultValue={[dayjs(startDate), dayjs(endDate)]}
              value={[dayjs(startDate), dayjs(endDate)]}
              style={{ marginLeft: '16px' }}
            />
          </Col>
        </Row>
      ) : (
        loading && <Spin />
      )}
      {loading ? (
        <Spin />
      ) : data.length > 0 ? (
        <>
          <Row gutter={12} style={{ marginTop: '15px', marginBottom: '10px', justifyContent: 'center' }}>
            <Col span={4}>
              <Statistic title="Total Sequestration (kg)" value={metrics.total} />
            </Col>
            <Col span={4}>
              <Statistic title="Average Sequestration (kg)" value={metrics.average} />
            </Col>
            <Col span={4}>
              <Statistic title="Max Sequestration (kg)" value={metrics.max} />
            </Col>
            <Col span={4}>
              <Statistic title="Min Sequestration (kg)" value={metrics.min} />
            </Col>
            <Col span={4}>
              <Statistic title="Trend (per day) (kg)" value={metrics.trend} />
            </Col>
          </Row>
          <Row gutter={12} style={{ justifyContent: 'center' }}>
            <Col span={isSingleColumn ? 24 : 12}>
              <GraphContainer
                title="Sequestration Amount (kg)"
                data={lineChartData}
                type="line"
                options={{ maintainAspectRatio: true, responsive: true }}
                isSingleColumn={isSingleColumn}
              />
            </Col>
            <Col span={isSingleColumn ? 24 : 12}>
              <GraphContainer
                title="Cumulative Sequestration Amount (kg)"
                data={cumulativeLineChartData}
                type="line"
                options={{ maintainAspectRatio: true, responsive: true }}
                isSingleColumn={isSingleColumn}
              />
            </Col>
            <Col span={isSingleColumn ? 24 : 12}>
              <GraphContainer
                title="Annual Sequestration Amount (kg)"
                data={annualChartData}
                type="bar"
                options={{ maintainAspectRatio: true, responsive: true }}
                isSingleColumn={isSingleColumn}
              />
            </Col>
            <Col span={isSingleColumn ? 24 : 12}>
              <GraphContainer
                title="Monthly Sequestration Amount (kg)"
                data={monthlyChartData}
                type="bar"
                options={{ maintainAspectRatio: true, responsive: true }}
                isSingleColumn={isSingleColumn}
              />
            </Col>
          </Row>
        </>
      ) : (
        <p>No data available</p>
      )}
    </Card>
  );
};

export default SequestrationHistoryTab;
