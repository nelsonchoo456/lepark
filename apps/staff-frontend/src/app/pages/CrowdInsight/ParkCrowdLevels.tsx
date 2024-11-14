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
  MenuProps,
  Dropdown,
} from 'antd';
import { InfoCircleOutlined, LineChartOutlined, FileTextOutlined } from '@ant-design/icons';
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
import { useParkThresholds } from './CalculateCrowdThresholds';
import moment from 'moment-timezone';
import { groupBy, mapValues, merge, sumBy, uniqBy } from 'lodash';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { ColumnType } from 'antd/es/table';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRestrictPark } from '../../hooks/Parks/useRestrictPark';
import { useFetchCrowdData } from '../../hooks/CrowdInsights/useFetchCrowdData';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Chart } from 'chart.js';
import html2canvas from 'html2canvas';
import { Alignment } from 'pdfmake/interfaces';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, Legend, annotationPlugin, Filler);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

interface CrowdData {
  date: string;
  crowdLevel: number | null;
  predictedCrowdLevel: number | null;
}

const ParkCrowdLevels: React.FC = () => {
  const defaultDateRange: [Dayjs, Dayjs] = [dayjs().subtract(19, 'days'), dayjs().add(10, 'days')];
  const [selectedDate, setSelectedDate] = useState<[Dayjs, Dayjs]>(defaultDateRange);
  const { state } = useLocation();
  const [parkId, setParkId] = useState<number>(state?.selectedParkId || 0);
  const [viewMode, setViewMode] = useState<string>(state?.defaultView || 'calendar');
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [restrictedParks, setRestrictedParks] = useState<ParkResponse[]>([]);
  const [selectedDataSeries, setSelectedDataSeries] = useState<string[]>(['actual', 'predicted']);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const [resolvedThresholds, setResolvedThresholds] = useState<{ low: number; moderate: number }>({ low: 0, moderate: 0 });

  // Use the custom hook for crowd data
  const { crowdData, isLoading, error } = useFetchCrowdData({
    parkId,
    parks,
  });

  const parkGeom = parkId === 0 ? undefined : parks.find((p) => p.id === parkId)?.geom;
  useEffect(() => {
    const fetchThresholds = async () => {
      const thresholdsData = await useParkThresholds(
        parkId,
        parkGeom,
        parks.map((p) => ({ ...p, geometry: p.geom })),
      );
      setResolvedThresholds(thresholdsData);
    };
    fetchThresholds();
  }, [parkId, parkGeom, parks]);

  const { loading: parkLoading } = useRestrictPark(parkId ? parkId.toString() : undefined, {
    disableNavigation: true,
  });

  useEffect(() => {
    // Update parkId if it comes from navigation state
    if (state?.selectedParkId) {
      setParkId(state.selectedParkId);
    }
  }, [state]);

  useEffect(() => {
    fetchParks();
  }, []);

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
    const startDate = dayjs(selectedDate[0]).startOf('day');
    const endDate = dayjs(selectedDate[1]).endOf('day');
    return (date.isAfter(startDate) || date.isSame(startDate)) && (date.isBefore(endDate) || date.isSame(endDate));
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
              index: 0,
              label: 'Actual',
              data: filteredCrowdData.map((d) => (d.crowdLevel !== null ? Math.round(d.crowdLevel) : null)),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: {
                target: '+1', // Target the next dataset (Predicted) for filling
                above: 'rgba(75, 192, 192, 0.2)', // Color when Actual is above Predicted
                below: 'rgba(192, 75, 75, 0.2)', // Color when Actual is below Predicted
              },
            },
          ]
        : []),
      ...(selectedDataSeries.includes('predicted')
        ? [
            {
              index: 1,
              label: 'Predicted',
              data: filteredCrowdData.map((d) =>
                d.predictedCrowdLevel !== null ? (d.predictedCrowdLevel !== undefined ? Math.round(d.predictedCrowdLevel) : null) : null,
              ),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderDash: [5, 5],
              fill: {
                target: '-1', // Target the previous dataset (Actual) for filling
                above: 'rgba(255, 99, 132, 0.2)', // Color when Predicted is above Actual
                below: 'rgba(99, 132, 255, 0.2)', // Color when Predicted is below Actual
              },
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
      filler: {
        propagate: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: { dataset: { label: string }; raw: any; dataIndex: any; chart: { data: { datasets: any[] } } }) {
            const label = context.dataset.label || '';
            const currentValue = context.raw;
            const index = context.dataIndex;

            // Find the value of the other dataset at the same index
            const otherDataset = context.chart.data.datasets.find((dataset) => dataset.label !== label);
            const otherValue = otherDataset ? otherDataset.data[index] : null;

            // Calculate the difference, if both values exist
            let difference = '';
            if (currentValue !== null && otherValue !== null) {
              const diffValue = Math.abs(currentValue - otherValue);
              const direction = currentValue > otherValue ? 'higher' : 'lower';
              difference = ` (${diffValue} ${direction})`; // Add "higher" or "lower" based on the direction
            }

            return `${label}: ${currentValue}${difference}`;
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
            yMin: resolvedThresholds.low,
            yMax: resolvedThresholds.low,
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
            yMin: resolvedThresholds.moderate,
            yMax: resolvedThresholds.moderate,
            borderColor: '#ffe082',
            borderWidth: 1,
            label: {
              content: 'Medium',
              enabled: true,
              position: 'left',
            },
          },
          ...(dayjs().isAfter(selectedDate[0]) && dayjs().isBefore(selectedDate[1])
            ? {
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
              }
            : {}),
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

  const handleAnalyseCLick = () => {
    navigate('/crowdInsights/analyse');
  };

  const analysisMenuItems: MenuProps['items'] = [
    {
      key: 'compare',
      label: 'Compare Parks',
      onClick: handleCompareParksCLick,
    },
    {
      key: 'analyse',
      label: 'Analyse Historical Data',
      onClick: handleAnalyseCLick,
    },
  ];

  const breadcrumbItems =
    user?.role === StaffType.SUPERADMIN
      ? [
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
            isCurrent: true,
          },
        ]
      : [
          {
            title: 'Crowd Insights',
            pathKey: '/crowdInsights',
            isMain: true,
            isCurrent: true,
          },
        ];

  const HiddenChart: React.FC<{
    data: any;
    options: any;
    id: string;
  }> = ({ data, options, id }) => {
    return (
      <div
        style={{
          position: 'absolute',
          top: '-9999px', // Move it far off-screen
          left: '-9999px', // Move it far off-screen
          width: '800px',
          height: '400px',
          pointerEvents: 'none', // Prevent any interaction
          opacity: 0, // Make it invisible
        }}
      >
        <Line id={id} data={data} options={options} />
      </div>
    );
  };

  const HiddenCalendar: React.FC<{
    crowdData: any;
    parkId: number;
    thresholds: { low: number; moderate: number };
    allParks: ParkResponse[];
  }> = ({ crowdData, parkId, thresholds, allParks }) => {
    return (
      <div
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '1200px',
          height: 'auto',
          pointerEvents: 'none',
          opacity: 0,
          backgroundColor: '#ffffff',
          padding: '20px 60px', // Add horizontal padding to the container
        }}
      >
        <ParkCrowdLevelsCalendar crowdData={crowdData} parkId={parkId} thresholds={thresholds} allParks={allParks} />
      </div>
    );
  };

  const generateReport = async () => {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    // Get park name
    const parkName = parkId === 0 ? 'All Parks' : parks.find((park) => park.id === parkId)?.name || 'Unknown Park';

    // Prepare the timeframe text
    const timeframeText = `${selectedDate[0].format('D MMM YY')} to ${selectedDate[1].format('D MMM YY')}`;

    // Get chart image
    let chartImage: string;
    const chartInstances = Chart.instances;
    const hiddenChart = Object.values(chartInstances).find((chart) => chart.canvas.id === 'hidden-chart-for-pdf');
    chartImage = hiddenChart?.toBase64Image() || '';

    // Capture calendar image - always use hidden calendar
    let calendarImage = '';
    const calendarElement = document.querySelector('div[style*="-9999px"] .ant-picker-calendar'); // always use hidden calendar

    if (calendarElement) {
      try {
        const canvas = await html2canvas(calendarElement as HTMLElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          width: 1200,
          windowWidth: 1200,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('.ant-picker-calendar');
            if (clonedElement) {
              // Set explicit styles to ensure consistency
              (clonedElement as HTMLElement).style.width = '100%';
              (clonedElement as HTMLElement).style.height = 'auto';
              (clonedElement as HTMLElement).style.margin = '0'; // Reset margin
              (clonedElement as HTMLElement).style.padding = '0'; // Reset padding

              // Ensure the parent container is properly centered with consistent margins
              const parentElement = clonedElement.parentElement;
              if (parentElement) {
                parentElement.style.display = 'flex';
                parentElement.style.justifyContent = 'center';
                parentElement.style.width = '100%';
                parentElement.style.margin = '0'; // Reset margin
                parentElement.style.padding = '0'; // Reset padding
              }
            }
          },
        });
        calendarImage = canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error capturing calendar:', error);
      }
    }

    // Convert table data to format suitable for PDF
    const tableBody = [
      ['Date', 'Day', 'Actual Crowd Level', 'Predicted Crowd Level'],
      ...filteredCrowdData.map((row) => [
        dayjs(row.date).format('YYYY-MM-DD'),
        dayjs(row.date).format('dddd'),
        row.crowdLevel !== null ? Math.round(row.crowdLevel).toString() : '-',
        row.predictedCrowdLevel !== null ? Math.round(row.predictedCrowdLevel).toString() : '-',
      ]),
    ];

    // Prepare the document definition
    const docDefinition = {
      content: [
        { text: 'Crowd Levels Report', style: 'header' },
        { text: `Park: ${parkName}`, style: 'subheader' },
        { text: 'Thresholds', style: 'sectionHeader' },
        {
          ul: [
            `Low: ≤ ${resolvedThresholds.low}`,
            `Moderate: ${resolvedThresholds.low + 1} - ${resolvedThresholds.moderate}`,
            `High: > ${resolvedThresholds.moderate}`,
          ],
        },
        { text: 'Calendar View', style: 'sectionHeader' },
        // When adding to PDF
        calendarImage
          ? {
              image: calendarImage,
              width: 590,
              alignment: 'center' as Alignment,
              margin: [40, 10, 0, 10] as [number, number, number, number], // Consistent margins
            }
          : [],
        {
          text: timeframeText,
          style: 'subheader',
          pageBreak: 'before' as const,
        },
        { text: 'Visualizations', style: 'sectionHeader' },
        {
          image: chartImage,
          width: 500,
          alignment: 'center' as const,
          margin: [0, 10, 0, 10] as [number, number, number, number],
        },
        { text: 'Detailed Data', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: tableBody,
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5] as [number, number, number, number],
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5] as [number, number, number, number],
        },
      },
    };

    // Generate the PDF
    pdfMake.createPdf(docDefinition).download(`Crowd Levels Report - ${parkName} - ${dayjs().format('D MMM YY')}.pdf`);
  };

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
                <li>1. Grouping camera readings by zone, date, and hour</li>
                <li>2. For each zone: averaging the readings within each hour</li>
                <li>3. For each zone: averaging the hourly values to get daily zone average</li>
                <li>4. For the park: summing all zone averages to get total park crowd level</li>
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
          <Col span={12}>
            <div className="flex items-center">
              {user?.role === StaffType.SUPERADMIN ? (
                <>
                  <span className="mr-2">Park:</span>
                  <Select value={parkId} onChange={setParkId} className="w-full">
                    <Option value={0}>All NParks</Option>
                    {restrictedParks.map((park) => (
                      <Option key={park.id} value={park.id}>
                        {park.name}
                      </Option>
                    ))}
                  </Select>
                  <Button type="primary" onClick={generateReport} icon={<FileTextOutlined />} className="ml-2">
                    Generate Report
                  </Button>
                </>
              ) : (
                <div className="flex justify-end w-full">
                  <Button type="primary" onClick={generateReport} icon={<FileTextOutlined />}>
                    Generate Report
                  </Button>
                </div>
              )}
            </div>
          </Col>
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
                <Dropdown menu={{ items: analysisMenuItems }}>
                  <Button type="primary">
                    Analysis <LineChartOutlined />
                  </Button>
                </Dropdown>
              )}
            </div>
            <div className="h-[calc(100%-80px)]">
              <Line data={chartData} options={chartOptions as any} />
              {/* <TestChart /> */}
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
            <ParkCrowdLevelsCalendar crowdData={calendarCrowdData} parkId={parkId} thresholds={resolvedThresholds} allParks={parks} />
            <ThresholdExplanation />
          </>
        )}
      </Card>
      <HiddenChart id="hidden-chart-for-pdf" data={chartData} options={chartOptions} />
      <HiddenCalendar crowdData={calendarCrowdData} parkId={parkId} thresholds={resolvedThresholds} allParks={parks} />
    </ContentWrapperDark>
  );
};

export default ParkCrowdLevels;
