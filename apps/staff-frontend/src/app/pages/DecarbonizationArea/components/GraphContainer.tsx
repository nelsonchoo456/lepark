import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './GraphContainer.css';

// Register the required components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface GraphContainerProps {
  title: string;
  data: any;
  type: 'line' | 'bar';
  options: any;
  isSingleColumn: boolean;
}

const GraphContainer: React.FC<GraphContainerProps> = ({ title, data, type, options, isSingleColumn }) => {
  const containerClass = isSingleColumn ? 'graph-container large' : 'graph-container';

  // Check if data is empty
  if (!data || !data.labels || data.labels.length === 0) {
    return null;
  }

  return (
    <div className={containerClass}>
      <div className="graph-title">{title}</div>
      <div className="graph-wrapper">
        <div className="graph">{type === 'line' ? <Line data={data} options={options} /> : <Bar data={data} options={options} />}</div>
      </div>
    </div>
  );
};

export default GraphContainer;
