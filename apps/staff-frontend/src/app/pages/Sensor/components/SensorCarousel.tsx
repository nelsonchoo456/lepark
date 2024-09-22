import React from 'react';
import { Empty } from 'antd';

interface SensorCarouselProps {
  image: string;
}

const SensorCarousel: React.FC<SensorCarouselProps> = ({ image }) => {
  if (!image) {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        className="bg-gray-200"
      >
        <Empty description="No Image" />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', margin: '0 auto' }} className="bg-gray-200 rounded">
      <img
        src={image}
        alt="Sensor"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '450px',
          minWidth: '400px',
          minHeight: '450px',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};

export default SensorCarousel;
