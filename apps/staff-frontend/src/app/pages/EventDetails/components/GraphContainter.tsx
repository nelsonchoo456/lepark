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
}

const GraphContainer: React.FC<GraphContainerProps> = ({ title, data, type, options }) => {
  // Check if data is empty
  if (!data || !data.labels || data.labels.length === 0) {
    return null;
  }

  return (
    <div className="graph-container">
      <h3 className="graph-title">{title}</h3>
      <div className="graph-wrapper">
        {type === 'line' ? <Line data={data} options={options} /> : <Bar data={data} options={options} />}
      </div>
    </div>
  );
};

export default GraphContainer;
