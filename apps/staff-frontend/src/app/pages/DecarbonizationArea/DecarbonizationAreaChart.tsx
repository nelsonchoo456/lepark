import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { SequestrationHistoryResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, Col, DatePicker, Row, Select, Spin, Statistic, Switch } from 'antd';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useEffect, useState } from 'react';
import PageHeader2 from '../../components/main/PageHeader2';
import { useFetchDecarbonizationAreas } from '../../hooks/DecarbonizationArea/useFetchDecarbonizationAreas';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import useSequestrationHistory from '../../hooks/SequestrationHistory/useSequestrationHistory';
import GraphContainer from './components/GraphContainer';
import { FileTextOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DecarbonizationAreaChart: React.FC = () => {
  const { decarbonizationAreas, loading: areasLoading } = useFetchDecarbonizationAreas();
  const { parks } = useFetchParks();
  const { user } = useAuth<StaffResponse>();
  const [startDate, setStartDate] = useState<string | null>(dayjs().subtract(1, 'month').toISOString());
  const [endDate, setEndDate] = useState<string | null>(dayjs().toISOString());
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const { loading, data, barChartData } = useSequestrationHistory(startDate, endDate, selectedArea, selectedParkId, decarbonizationAreas);
  const [isSingleColumn, setIsSingleColumn] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    if (user?.role === StaffType.SUPERADMIN && decarbonizationAreas.length > 0) {
      setSelectedArea('all');
    } else if (decarbonizationAreas.length > 0) {
      setSelectedArea('all');
      setSelectedParkId(decarbonizationAreas[0].parkId);
    }
  }, [user, decarbonizationAreas]);

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setStartDate(dayjs(dateStrings[0]).toISOString());
    setEndDate(dayjs(dateStrings[1]).toISOString());
  };

  const handleAreaChange = (value: string) => {
    setSelectedArea(value);
  };

  const handleParkChange = (value: number) => {
    setSelectedParkId(value);
    setSelectedArea('all'); // Reset selected area to 'all' when park changes
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

  const calculateCumulativeData = (data: SequestrationHistoryResponse[]) => {
    let cumulativeTotal = 0;
    return data.map((entry) => {
      cumulativeTotal += entry.seqValue;
      return {
        ...entry,
        cumulativeSeqValue: cumulativeTotal,
      };
    });
  };

  const cumulativeData = calculateCumulativeData(data);

  const cumulativeLineChartData = {
    labels: cumulativeData.map((entry: any) => entry.date),
    datasets: [
      {
        label: 'Cumulative Sequestration Amount (kg)',
        data: cumulativeData.map((entry: any) => entry.cumulativeSeqValue),
        fill: false,
        backgroundColor: '#f39c12',
        borderColor: '#f39c12',
      },
    ],
  };

  const aggregateDataByPeriod = (data: SequestrationHistoryResponse[], period: 'month' | 'year') => {
    const formatString = period === 'month' ? 'YYYY-MM' : 'YYYY';
    const aggregatedData = data.reduce((acc: any, entry: any) => {
      const periodKey = dayjs(entry.date).format(formatString);
      const existingEntry = acc.find((e: any) => e.period === periodKey);
      if (existingEntry) {
        existingEntry.seqValue += entry.seqValue;
      } else {
        acc.push({ period: periodKey, seqValue: entry.seqValue });
      }
      return acc;
    }, []);
    return aggregatedData;
  };

  const monthlyData = aggregateDataByPeriod(data, 'month');
  const yearlyData = aggregateDataByPeriod(data, 'year');

  const monthlyChartData =
    monthlyData.length > 0
      ? {
          labels: monthlyData.map((entry: any) => entry.period),
          datasets: [
            {
              label: 'Monthly Sequestration Amount (kg)',
              data: monthlyData.map((entry: any) => entry.seqValue),
              backgroundColor: '#3498db',
              borderColor: '#3498db',
              borderWidth: 1,
            },
          ],
        }
      : null;

  const yearlyChartData =
    yearlyData.length > 0
      ? {
          labels: yearlyData.map((entry: any) => entry.period),
          datasets: [
            {
              label: 'Yearly Sequestration Amount (kg)',
              data: yearlyData.map((entry: any) => entry.seqValue),
              backgroundColor: '#2ecc71',
              borderColor: '#2ecc71',
              borderWidth: 1,
            },
          ],
        }
      : null;

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

  const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
  };

  const toggleSingleColumn = () => {
    setIsSingleColumn((prev) => !prev);
  };
  const renderGraphs = () => {
    const graphs = [];

    if (lineChartData && lineChartData.labels) {
      graphs.push(
        <GraphContainer
          key="lineChart"
          title="Sequestration Amount (kg)"
          data={lineChartData}
          type="line"
          options={chartOptions}
          isSingleColumn={isSingleColumn}
        />,
      );
    }

    if (cumulativeLineChartData && cumulativeLineChartData.labels) {
      graphs.push(
        <GraphContainer
          key="cumulativeLineChart"
          title="Cumulative Sequestration Amount (kg)"
          data={cumulativeLineChartData}
          type="line"
          options={chartOptions}
          isSingleColumn={isSingleColumn}
        />,
      );
    }

    if (monthlyChartData && monthlyChartData.labels) {
      graphs.push(
        <GraphContainer
          key="monthlyChart"
          title="Monthly Sequestration Amount (kg)"
          data={monthlyChartData}
          type="bar"
          options={chartOptions}
          isSingleColumn={isSingleColumn}
        />,
      );
    }

    if (yearlyChartData && yearlyChartData.labels) {
      graphs.push(
        <GraphContainer
          key="yearlyChart"
          title="Yearly Sequestration Amount (kg)"
          data={yearlyChartData}
          type="bar"
          options={chartOptions}
          isSingleColumn={isSingleColumn}
        />,
      );
    }

    if (barChartDataConfig && barChartDataConfig.labels) {
      graphs.push(
        <GraphContainer
          key="barChart"
          title="Total Sequestration by Area (kg)"
          data={barChartDataConfig}
          type="bar"
          options={chartOptions}
          isSingleColumn={isSingleColumn}
        />,
      );
    }

    return graphs;
  };

  const generateReport = async () => {
    console.log('Generate Report button clicked');
    const doc = new jsPDF();

    // Use helvetica font
    doc.setFont('helvetica', 'normal');

    // Set the text color to grey (assuming the grey color used in your app is #808080)
    doc.setTextColor(128, 128, 128);

    const input = document.getElementById('report-content');

    if (input) {
      // Retrieve park and area names
      const selectedPark = parks.find((park) => park.id === selectedParkId)?.name || 'All Parks';
      const selectedAreaName = selectedArea === 'all' ? 'All' : filteredDecarbonizationAreas.find((area) => area.id === selectedArea)?.name;

      // Add the timeframe, park name, and area name to the PDF
      const timeframeText = `${dayjs(startDate).format('D MMM YY')} to ${dayjs(endDate).format('D MMM YY')}`;
      const headerText = `Park: ${selectedPark} | Area: ${selectedAreaName} | ${timeframeText}`;
      doc.setFontSize(14);
      doc.text(headerText, 10, 10);

      // Capture the entire report content
      try {
        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');

        // Calculate the height of the content
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const pageHeight = doc.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 20;

        // Add the first page
        doc.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, pdfHeight);
        heightLeft -= pageHeight - position;

        console.log('Report content captured');
      } catch (error) {
        console.error('Error capturing report content:', error);
      }

      // Save the PDF with formatted date and park/area names
      const formattedDate = dayjs().format('D MMM YY');
      const fileName = `Decarbonization Report ${selectedPark} Area-${selectedAreaName} ${formattedDate}.pdf`;
      doc.save(fileName);
    } else {
      console.warn('Report content not found');
    }
  };

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Row gutter={16} justify="end" align="middle" wrap={true}>
          {data.length > 0 && (
            <Col flex="none" style={{ marginBottom: '16px' }}>
              <Switch checkedChildren="Expanded" unCheckedChildren="Compact" checked={isSingleColumn} onChange={toggleSingleColumn} />
              {/* <span style={{ marginLeft: '8px' }}>Enlarge Visualizations</span> */}
            </Col>
          )}
          {data.length > 0 && (
            <Col flex="none" style={{ marginBottom: '16px' }}>
              <Button disabled={isSingleColumn} type="primary" onClick={generateReport} icon={<FileTextOutlined />}>
                Generate Report
              </Button>
            </Col>
          )}
          {user?.role === StaffType.SUPERADMIN && (
            <Col flex="none" style={{ marginBottom: '16px' }}>
              <Select value={selectedParkId} onChange={handleParkChange} style={{ width: 300 }} placeholder="Select Park">
                {parks.map((park) => (
                  <Option key={park.id} value={park.id}>
                    {park.name}
                  </Option>
                ))}
              </Select>
            </Col>
          )}
          <Col flex="none" style={{ marginBottom: '16px' }}>
            <Select value={selectedArea} onChange={handleAreaChange} style={{ width: 300 }} placeholder="Select Area">
              <Option value="all">All Areas</Option>
              {filteredDecarbonizationAreas.map((area) => (
                <Option key={area.id} value={area.id}>
                  {area.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col flex="none" style={{ marginBottom: '16px' }}>
            <RangePicker onChange={handleDateChange} defaultValue={[dayjs().subtract(1, 'month'), dayjs()]} />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: '15px', justifyContent: 'center' }}></Row>
        {loading || areasLoading ? (
          <Spin />
        ) : data.length > 0 ? (
          <>
            <div id="report-content">
              <Row gutter={12} style={{ marginTop: '15px', justifyContent: 'center' }} id="metrics-section">
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
              <div
                id="charts-section"
                style={{
                  display: 'flex',
                  flexDirection: isSingleColumn ? 'column' : 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-around',
                }}
              >
                {renderGraphs()}
              </div>
            </div>
          </>
        ) : (
          <p>No data available</p>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default DecarbonizationAreaChart;
