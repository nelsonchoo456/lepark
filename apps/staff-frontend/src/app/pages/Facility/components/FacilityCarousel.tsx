import React from 'react';
import { Carousel, Empty } from 'antd';

interface FacilityCarouselProps {
  images: string[];
}

const FacilityCarousel: React.FC<FacilityCarouselProps> = ({ images }) => {
  const carouselSettings = {
    arrows: true,
  };

  if (!images || images.length === 0) {
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
      {images && images.length > 0 ? (
        <Carousel {...carouselSettings}>
          {images.map((image, index) => (
            <div key={index}>
              <div
                style={{
                  backgroundImage: `url('${image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: 'white',
                  overflow: 'hidden',
                }}
                className="h-64 max-h-64 flex-1 rounded-lg shadow-lg p-4"
              />
            </div>
          ))}
        </Carousel>
      ) : (
        <div
          style={{
            width: '100%',
            height: '300px',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          No images available
        </div>
      )}
    </div>
  );
};

export default FacilityCarousel;
