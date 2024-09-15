import React from 'react';
import { Carousel, Empty } from 'antd';

interface SpeciesCarouselProps {
  images: string[];
}

const SpeciesCarousel: React.FC<SpeciesCarouselProps> = ({ images }) => {
  const carouselSettings = {
    arrows: true,
  };

  console.log(images);

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
              <img
                src={image}
                alt={`Species ${index + 1}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  minWidth: '400px',
                  minHeight: '450px',
                  objectFit: 'cover',
                  borderRadius: '8px', // Added this line to make the image rounded
                }}
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

export default SpeciesCarousel;
