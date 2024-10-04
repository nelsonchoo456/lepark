import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';

interface GraphContainerProps {
  title: string;
  data: any;
  type: 'line' | 'bar';
  options: any;
}

const GraphContainer: React.FC<GraphContainerProps> = ({ title, data, type, options }) => {
  const [isLargeView, setIsLargeView] = useState(false);

  const toggleView = () => {
    setIsLargeView(!isLargeView);
  };

  const containerStyle: React.CSSProperties = isLargeView
    ? {
        width: '100%',
        margin: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid #f0f0f0',
        borderRadius: '4px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s',
      }
    : {
        flex: '1 1 45%',
        margin: '20px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid #f0f0f0',
        borderRadius: '4px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s',
      };

  const titleStyle: React.CSSProperties = {
    marginBottom: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
  };

  const graphWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom: '56.25%', // 16:9 aspect ratio
    height: 0,
    overflow: 'hidden',
  };

  const graphStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  // Check if data is empty
  if (!data || !data.labels || data.labels.length === 0) {
    return null;
  }

  return (
    <div
      style={containerStyle}
      onClick={toggleView}
      onMouseEnter={(e) => {
        if (window.innerWidth > 768) {
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (window.innerWidth > 768) {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <div style={titleStyle}>{title}</div>
      <div style={graphWrapperStyle}>
        <div style={graphStyle}>{type === 'line' ? <Line data={data} options={options} /> : <Bar data={data} options={options} />}</div>
      </div>
    </div>
  );
};

export default GraphContainer;
