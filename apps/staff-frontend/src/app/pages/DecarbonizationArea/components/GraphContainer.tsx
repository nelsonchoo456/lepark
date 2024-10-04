import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import './GraphContainer.css'; // Import the CSS file

interface GraphContainerProps {
  title: string;
  data: any;
  type: 'line' | 'bar';
  options: any;
}

const GraphContainer: React.FC<GraphContainerProps> = ({ title, data, type, options }) => {
  const [isLargeView, setIsLargeView] = useState(false);
  const [isSingleColumn, setIsSingleColumn] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsSingleColumn(window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleView = (e: React.MouseEvent) => {
    if (!isSingleColumn) {
      e.stopPropagation(); // Prevent event bubbling
      setIsLargeView(!isLargeView);
    }
  };

  const containerClass = isLargeView ? 'graph-container large' : 'graph-container';

  // Check if data is empty
  if (!data || !data.labels || data.labels.length === 0) {
    return null;
  }

  return (
    <div
      className={containerClass}
      onClick={toggleView}
      onMouseEnter={(e) => {
        if (!isSingleColumn) {
          e.currentTarget.style.boxShadow = '0 4px 8px #a3d4c7';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSingleColumn) {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <div className="graph-title">{title}</div>
      <div className="graph-wrapper">
        <div className="graph">{type === 'line' ? <Line data={data} options={options} /> : <Bar data={data} options={options} />}</div>
      </div>
    </div>
  );
};

export default GraphContainer;
