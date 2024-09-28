import React, { useState } from 'react';
import { Empty, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

interface SensorCarouselProps {
  images: string[];
}

const SensorCarousel: React.FC<SensorCarouselProps> = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        className="bg-gray-200"
      >
        <Empty description="No Images" />
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div style={{ width: '100%', margin: '0 auto', position: 'relative' }} className="bg-gray-200 rounded">
      <Carousel
        dots={false}
        afterChange={setCurrentSlide}
        className="sensor-carousel"
      >
        {images.map((image, index) => (
          <div key={index}>
            <img
              src={image}
              alt={`Sensor ${index + 1}`}
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
        ))}
      </Carousel>
      {images.length > 1 && (
        <>
          <LeftOutlined className="carousel-arrow left-arrow" onClick={prevSlide} />
          <RightOutlined className="carousel-arrow right-arrow" onClick={nextSlide} />
          <div className="carousel-indicator">
            {currentSlide + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default SensorCarousel;
