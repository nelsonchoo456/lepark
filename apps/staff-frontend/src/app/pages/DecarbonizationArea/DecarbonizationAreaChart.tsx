import { FileTextOutlined, InfoCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { SequestrationHistoryResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, Col, DatePicker, Row, Select, Spin, Statistic, Switch, Tooltip, Alert, Progress, Typography } from 'antd';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useCallback, useEffect, useState } from 'react';
import { GiOakLeaf, GiPalmTree, GiTreehouse } from 'react-icons/gi';
import PageHeader2 from '../../components/main/PageHeader2';
import { useFetchDecarbonizationAreas } from '../../hooks/DecarbonizationArea/useFetchDecarbonizationAreas';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import useSequestrationHistory from '../../hooks/SequestrationHistory/useSequestrationHistory';
import GraphContainer from './components/GraphContainer';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Chart } from 'chart.js';
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

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
  const [benchmarkValue, setBenchmarkValue] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role === StaffType.SUPERADMIN && decarbonizationAreas.length > 0) {
      setSelectedArea('all');
    } else if (decarbonizationAreas.length > 0) {
      setSelectedArea('all');
      setSelectedParkId(decarbonizationAreas[0].parkId);
    }
  }, [user, decarbonizationAreas]);

  useEffect(() => {
    setBenchmarkValue(calculateBenchmarkValue());
  }, [selectedArea, selectedParkId, decarbonizationAreas]);

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

  const calculateAreaFromGeom = useCallback((geomString: string | undefined): number => {
    if (!geomString) return 0;

    const coordsMatch = geomString.match(/POLYGON\(\((.*?)\)\)/);
    if (!coordsMatch) return 0;

    const coords = coordsMatch[1].split(',').map((pair) => pair.trim().split(' ').map(Number).reverse());

    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      const [lat1, lon1] = coords[i];
      const [lat2, lon2] = coords[j];
      area += (lon2 - lon1) * (2 + Math.sin((lat1 * Math.PI) / 180) + Math.sin((lat2 * Math.PI) / 180));
    }
    area = Math.abs((area * 6378137 * 6378137) / 4);
    //console.log('area', area);
    return area;
  }, []);

  const calculateTotalAreaInPark = useCallback(() => {
    const filteredAreas = selectedParkId ? decarbonizationAreas.filter((area) => area.parkId === selectedParkId) : decarbonizationAreas;
    return filteredAreas.reduce((total, area) => total + calculateAreaFromGeom(area.geom), 0);
  }, [selectedParkId, decarbonizationAreas, calculateAreaFromGeom]);

  const averageSequestrationPerDayPerm2 = 1.953 / 365;

  const calculateBenchmarkValue = useCallback(() => {
    let area = 0;
    if (selectedArea === 'all') {
      area = calculateTotalAreaInPark();
    } else {
      const selectedAreaObj = decarbonizationAreas.find((area) => area.id === selectedArea);
      if (selectedAreaObj) {
        area = calculateAreaFromGeom(selectedAreaObj.geom);
      }
    }
    // console.log('averageSequestrationPerDayPerArea', averageSequestrationPerDayPerm2);
    // console.log('area', area);
    // console.log('benchmarkValue', averageSequestrationPerDayPerm2 * area);
    return averageSequestrationPerDayPerm2 * area;
  }, [selectedArea, decarbonizationAreas, calculateAreaFromGeom, calculateTotalAreaInPark]);

  const calculateTotalArea = useCallback(() => {
    if (selectedArea === 'all') {
      return calculateTotalAreaInPark();
    } else {
      const selectedAreaObj = decarbonizationAreas.find((area) => area.id === selectedArea);
      if (selectedAreaObj) {
        return calculateAreaFromGeom(selectedAreaObj.geom);
      }
      return 0;
    }
  }, [selectedArea, decarbonizationAreas, calculateTotalAreaInPark, calculateAreaFromGeom]);

  const totalArea = calculateTotalArea();

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
      {
        label: 'Average',
        data: data.map(() => benchmarkValue), // Create an array of the same length as the data, filled with the benchmark value
        borderColor: '#1363b8',
        borderDash: [5, 5], // This creates the dotted line effect
        borderWidth: 2,
        pointRadius: 0, // Hide the points
        fill: false,
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
    plugins: {
      legend: {
        display: true,
      },
    },
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
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    // Retrieve park and area names
    const selectedPark = parks.find((park) => park.id === selectedParkId)?.name || 'All Parks';
    const selectedAreaName = selectedArea === 'all' ? 'All' : filteredDecarbonizationAreas.find((area) => area.id === selectedArea)?.name;

    // Prepare the timeframe text
    const timeframeText = `${dayjs(startDate).format('D MMM YY')} to ${dayjs(endDate).format('D MMM YY')}`;

    // Function to convert a chart to a base64 image
    const chartToBase64 = (chart: Chart): Promise<string> => {
      return new Promise((resolve) => {
        resolve(chart.toBase64Image());
      });
    };

    // Get all chart instances
    const chartInstances = Chart.instances;
    const chartImages: string[] = await Promise.all(
      Object.values(chartInstances).map((chart) => chartToBase64(chart))
    );

    // Calculate sequestration performance
    const average = benchmarkValue;
    const actual = calculateActualSequestration(data, selectedArea, selectedParkId);
    const shortfall = average ? average - actual : -actual;
    const percentageAchieved = average ? (actual / average) * 100 : 0;

    // Calculate plants needed
    const treesNeeded = calculatePlantsNeeded(shortfall, 'TREE_TROPICAL', 7000);
    const mangrovesNeeded = calculatePlantsNeeded(shortfall, 'TREE_MANGROVE', 5000);
    const shrubsNeeded = calculatePlantsNeeded(shortfall, 'SHRUB', 500);

    // Prepare the document definition
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Decarbonization Report', style: 'header' },
        { text: `Park: ${selectedPark} | Area: ${selectedAreaName}`, style: 'subheader' },
        { text: timeframeText, style: 'subheader' },
        { text: 'Metrics', style: 'sectionHeader' },
        {
          columns: [
            { text: `Total: ${metrics.total} kg`, style: 'metric' },
            { text: `Average: ${metrics.average} kg`, style: 'metric' },
            { text: `Max: ${metrics.max} kg`, style: 'metric' },
            { text: `Min: ${metrics.min} kg`, style: 'metric' },
            { text: `Trend: ${metrics.trend} kg/day`, style: 'metric' },
          ],
        },
        { text: 'Sequestration Performance', style: 'sectionHeader' },
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: `${Math.round(percentageAchieved)}% of target achieved`, style: 'performanceMetric' },
                { text: `${shortfall.toFixed(2)} kg below average`, style: 'performanceMetric' },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'To reach the target, plant:', style: 'plantAdvice' },
                { text: `${treesNeeded} Tropical Trees`, style: 'plantOption' },
                { text: `${mangrovesNeeded} Mangrove Trees`, style: 'plantOption' },
                { text: `${shrubsNeeded} Shrubs`, style: 'plantOption' },
              ],
            },
          ],
        },
        { text: 'Charts', style: 'sectionHeader' },
        ...chartImages.map((image, index) => ({
          image: image,
          width: 500,
          alignment: 'center' as const,
          margin: [0, 10, 0, 10] as [number, number, number, number],
        })),
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 15, 0, 5] },
        metric: { fontSize: 12, margin: [0, 5, 0, 5] },
        performanceMetric: { fontSize: 12, margin: [0, 5, 0, 5], color: 'red' },
        plantAdvice: { fontSize: 12, bold: true, margin: [0, 5, 0, 5] },
        plantOption: { fontSize: 12, margin: [0, 2, 0, 2] },
      },
    };

    // Generate the PDF
    pdfMake.createPdf(docDefinition).download(`Decarbonization Report ${selectedPark} Area-${selectedAreaName} ${dayjs().format('D MMM YY')}.pdf`);
  };

  const sequestrationFactors = {
    TREE_TROPICAL: 0.47,
    TREE_MANGROVE: 0.44,
    SHRUB: 0.5,
  };

  const CO2_SEQUESTRATION_FACTOR = 3.67;

  const calculateSequestration = (
    numberOfPlants: number,
    biomass: number,
    decarbonizationType: keyof typeof sequestrationFactors,
  ): number => {
    const carbonFraction = sequestrationFactors[decarbonizationType];
    const annualSequestration = numberOfPlants * biomass * carbonFraction * CO2_SEQUESTRATION_FACTOR;
    return annualSequestration / 365; // Convert annual sequestration to daily rate
  };

  const calculatePlantsNeeded = (shortfall: number, decarbonizationType: keyof typeof sequestrationFactors, biomass: number) => {
    return Math.ceil(shortfall / calculateSequestration(1, biomass, decarbonizationType));
  };

  const calculateActualSequestration = (
    data: SequestrationHistoryResponse[],
    selectedArea: string | null,
    selectedParkId: number | null,
  ) => {
    if (selectedArea === 'all') {
      const latestValues = data.filter((entry) => entry.date === data[data.length - 1].date);
      return latestValues.reduce((sum, entry) => sum + entry.seqValue, 0);
    } else {
      const filteredEntries = data.filter((entry) => entry.decarbonizationAreaId === selectedArea);

      if (filteredEntries.length === 0) {
        console.warn(`No entries found for selected area: ${selectedArea}`);
        return 0;
      }

      const latestEntry = filteredEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      return latestEntry ? latestEntry.seqValue : 0;
    }
  };

  const renderAdvice = () => {
    const average = benchmarkValue;
    const actual = calculateActualSequestration(data, selectedArea, selectedParkId);
    const shortfall = average ? average - actual : -actual;
    const percentageAchieved = average ? (actual / average) * 100 : 0;

    const PlantOption = ({ icon, count, type }: { icon: React.ElementType; count: number; type: string }) => (
      <Card size="small" style={{ marginBottom: '10px' }}>
        <Row align="middle" gutter={8}>
          {React.createElement(icon, { style: { fontSize: '32px', color: '#1890ff' } })}
          <Col>
            <Text strong>{count}</Text>
            <br />
            <Text type="secondary">{type}</Text>
          </Col>
        </Row>
      </Card>
    );

    if (average && actual >= average) {
      return (
        <Alert
          message="Excellent Performance!"
          description="The sequestration amount is above the internationally benchmarked average."
          type="success"
          showIcon
        />
      );
    } else {
      const treesNeeded = calculatePlantsNeeded(shortfall, 'TREE_TROPICAL', 7000);
      const mangrovesNeeded = calculatePlantsNeeded(shortfall, 'TREE_MANGROVE', 5000);
      const shrubsNeeded = calculatePlantsNeeded(shortfall, 'SHRUB', 500);

      return (
        <Card title="Sequestration Performance" extra={<InfoCircleOutlined />}>
          <Row gutter={16} align="middle">
            <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="dashboard"
                  percent={Math.round(percentageAchieved)}
                  size={200}
                  format={(percent) => (
                    <span>
                      {percent}%<br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        of target
                      </Text>
                    </span>
                  )}
                />
              </div>
            </Col>
            <Col span={12}>
              <Title level={4} type="danger">
                {shortfall.toFixed(2)} kg
              </Title>
              <Text type="secondary">below the average</Text>
              <br />
              <br />
              <Text>To reach the target, plant any of the following:</Text>
              <br />
              <PlantOption icon={GiPalmTree} count={treesNeeded} type="Tropical Trees" />
              <PlantOption icon={GiTreehouse} count={mangrovesNeeded} type="Mangrove Trees" />
              <PlantOption icon={GiOakLeaf} count={shrubsNeeded} type="Shrubs" />
            </Col>
          </Row>
        </Card>
      );
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
            <Row gutter={12} style={{ marginTop: '15px', justifyContent: 'center' }}>
              <Col span={24}>{renderAdvice()}</Col>
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
        ) : (
          <p>No data available</p>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default DecarbonizationAreaChart;