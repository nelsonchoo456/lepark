import React, { useMemo } from 'react';
import { Card, Row, Col, Tag, Button, Spin, Tooltip, Statistic, Progress } from 'antd';
import { ContentWrapperDark } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';
import { useNavigate } from 'react-router-dom';
import { useCrowdCounts } from '../../hooks/CrowdInsights/useCrowdCounts';
import { TeamOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { useFetchCrowdDataForCrowdAlerts } from '../../hooks/CrowdInsights/useFetchCrowdDataForCrowdAlerts';
import { ParkResponse, StaffType } from '@lepark/data-access';
import moment from 'moment';
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const AllParksCrowdLevels: React.FC = () => {
  const navigate = useNavigate();
  const { parks: parkCrowds, loading } = useCrowdCounts();
  const memoizedParks = useMemo(() => parkCrowds.map((p) => ({ id: p.parkId })) as ParkResponse[], [parkCrowds]);
  const { crowdData, isLoading: crowdDataLoading } = useFetchCrowdDataForCrowdAlerts({
    parkId: 0,
    parks: memoizedParks,
  });
  const defaultDateRange: [Dayjs, Dayjs] = [dayjs().subtract(7, 'days'), dayjs().add(7, 'days')];

  const getTrafficTag = (count: number, threshold: number) => {
    const ratio = count / threshold;
    if (ratio > 1) {
      return <Tag color="error">High Traffic</Tag>;
    } else if (ratio > 0.7) {
      return <Tag color="warning">Moderate Traffic</Tag>;
    } else {
      return <Tag color="success">Low Traffic</Tag>;
    }
  };

  // Summary statistics
  const totalCurrentVisitors = parkCrowds.reduce((sum, park) => sum + park.liveCount, 0);
  const totalWeeklyVisitors = parkCrowds.reduce((sum, park) => sum + park.weeklyCount, 0);
  const averageWeeklyPerPark = Math.round(totalWeeklyVisitors / parkCrowds.length);

  // Sort parks by current visitor count for the chart
  const sortedParks = [...parkCrowds].sort((a, b) => b.liveCount - a.liveCount);

  const chartData = {
    labels: sortedParks.map((park) => park.parkName),
    datasets: [
      {
        label: 'Current Visitors',
        data: sortedParks.map((park) => park.liveCount),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Visitor Distribution Today',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Visitors',
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const breadcrumbItems = [
    {
      title: 'Crowd Insights',
      pathKey: '/crowdInsights/allParks',
      isMain: true,
      isCurrent: true,
    },
  ];

  const getMiniChartData = (parkId: number) => {
    const filteredData = crowdData
      .filter((d) => d.parkId === parkId)
      .filter((d) => {
        const date = dayjs(d.date);
        return date.isAfter(defaultDateRange[0]) && date.isBefore(defaultDateRange[1]);
      });

    return {
      labels: filteredData.map((d) => dayjs(d.date).format('ddd DD/MM')),
      datasets: [
        {
          index: 0,
          label: 'Actual',
          data: filteredData.map((d) => (d.crowdLevel !== null ? Math.round(d.crowdLevel) : null)),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: {
            target: '+1', // Target the next dataset (Predicted) for filling
            above: 'rgba(75, 192, 192, 0.2)', // Color when Actual is above Predicted
            below: 'rgba(192, 75, 75, 0.2)', // Color when Actual is below Predicted
          },
        },
        {
          index: 1,
          label: 'Predicted',
          data: filteredData.map((d) => (d.predictedCrowdLevel !== null ? Math.round(d.predictedCrowdLevel) : null)),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderDash: [5, 5],
          fill: {
            target: '-1', // Target the previous dataset (Actual) for filling
            above: 'rgba(255, 99, 132, 0.2)', // Color when Predicted is above Actual
            below: 'rgba(99, 132, 255, 0.2)', // Color when Predicted is below Actual
          },
        },
      ],
    };
  };

  const miniChartOptions = {
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
          // lowLine: {
          //   type: 'line',
          //   yMin: resolvedThresholds.low,
          //   yMax: resolvedThresholds.low,
          //   borderColor: '#a3d4c7',
          //   borderWidth: 1,
          //   label: {
          //     content: 'Low',
          //     enabled: true,
          //     position: 'left',
          //   },
          // },
          // mediumLine: {
          //   type: 'line',
          //   yMin: resolvedThresholds.moderate,
          //   yMax: resolvedThresholds.moderate,
          //   borderColor: '#ffe082',
          //   borderWidth: 1,
          //   label: {
          //     content: 'Medium',
          //     enabled: true,
          //     position: 'left',
          //   },
          // },
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
        },
      },
    },
  };

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card className="w-full">
          <Statistic
            title={<span className="text-gray-600">Total NParks Visitors Today</span>}
            value={totalCurrentVisitors}
            prefix={<TeamOutlined className="text-green-500" />}
            valueStyle={{ color: '#558f7f' }}
          />
        </Card>
        <Card className="w-full">
          <Statistic
            title={<span className="text-gray-600">Weekly Total</span>}
            value={totalWeeklyVisitors}
            suffix="visitors"
            valueStyle={{ color: '#334155' }}
          />
        </Card>
        <Card className="w-full">
          <Statistic
            title={<span className="text-gray-600">Average Weekly per Park</span>}
            value={averageWeeklyPerPark}
            suffix="visitors/park"
            valueStyle={{ color: '#334155' }}
          />
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card title="Visitor Distribution" className="mb-4 w-full">
        <div className="h-[300px] w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>

      {/* Individual Park Cards */}
      <Card title="All Parks Crowd Levels" className="w-full">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Spin size="large" />
            <p className="mt-5 text-gray-500">Loading crowd data...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {parkCrowds.map((park) => (
              <div key={park.parkId} className="flex gap-4">
                {/* Park Card */}
                <div className="w-1/3">
                  <Card
                    hoverable
                    className={`h-full transition-all duration-200 hover:shadow-lg ${
                      park.isOverThreshold
                        ? 'border-l-4 border-l-red-400 hover:border-l-red-500'
                        : 'border-l-4 border-l-green-200 hover:border-l-green-300'
                    }`}
                    onClick={() =>
                      navigate('/crowdInsights', {
                        state: { selectedParkId: park.parkId },
                      })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-base font-medium text-gray-800">{park.parkName}</div>
                      <Tooltip title="Current Traffic Level">{getTrafficTag(park.liveCount, park.threshold)}</Tooltip>
                    </div>

                    <div className={`text-2xl font-bold mt-2 ${park.isOverThreshold ? 'text-red-500' : 'text-green-500'}`}>
                      {park.liveCount}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div className="text-sm">
                        <div className="text-gray-500 mb-1">Weekly Total</div>
                        <div className="font-semibold text-gray-700">{park.weeklyCount}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-500 mb-1">Daily Average</div>
                        <div className="font-semibold text-gray-700">{Math.round(park.weeklyCount / 7)}</div>
                      </div>
                    </div>

                    <button
                      className="mt-4 text-green-500 hover:text-green-600 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/crowdInsights', {
                          state: { selectedParkId: park.parkId },
                        });
                      }}
                    >
                      View More →
                    </button>
                  </Card>
                </div>

                {/* Chart */}
                <div
                  className="w-2/3 bg-white rounded-lg shadow-sm p-4 cursor-pointer"
                  onClick={() =>
                    navigate('/crowdInsights', {
                      state: {
                        selectedParkId: park.parkId,
                        defaultView: 'graph',
                      },
                    })
                  }
                >
                  <div className="h-[200px]">
                    {crowdDataLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Spin />
                      </div>
                    ) : (
                      <Line data={getMiniChartData(park.parkId)} options={miniChartOptions as any} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default AllParksCrowdLevels;
