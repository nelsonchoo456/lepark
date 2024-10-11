import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

// Register the necessary chart types and components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

interface SequestrationGraphProps {
  lineChartData: any;
  barChartData?: any;
  showBarChart: boolean;
}

const SequestrationGraph: React.FC<SequestrationGraphProps> = ({ lineChartData, barChartData, showBarChart }) => {
  const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
  };

  const chartContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '600px', // Adjust the height as needed
  };

  const sideBySideContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    height: '600px', // Adjust the height as needed
    overflow: 'hidden', // Prevent overflow
  };

  const chartStyle = {
    flex: 1,
    margin: '0 0px', // Adjust the margin as needed
    overflow: 'hidden', // Prevent overflow
  };

  if (!showBarChart) {
    return (
      <div style={chartContainerStyle}>
        <Line data={lineChartData} options={chartOptions} />
      </div>
    );
  }

  return (
    <div style={sideBySideContainerStyle}>
      <div style={chartStyle}>
        <Line data={lineChartData} options={chartOptions} />
      </div>
      <div style={chartStyle}>
        <Bar data={barChartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SequestrationGraph;
