import React from 'react';
import { Carousel, Empty } from 'antd';

interface PromotionCarouselProps {
  images: string[];
}

const PromotionCarousel: React.FC<PromotionCarouselProps> = ({ images }) => {
  const carouselSettings = {
    arrows: false,
  };

  // console.log(images)

  if (!images || images.length === 0) {
    return (
      <div className='h-64 bg-gray-200 flex items-center justify-center'><Empty description="No Image"/></div>
    )
  }

  return (
    <div className='bg-gray-200 rounded-b-3xl overflow-hidden md:rounded-xl'>
      {images && images.length > 0 ? (
        <Carousel {...carouselSettings}>
          {images.map((image, index) => (
            <div key={index}>
              <img
                src={image}
                alt={`Promotion ${index + 1}`}
                style={{
                  width: '100%',
                  minWidth: '400px',
                  objectFit: 'cover',
                }}
                className='h-96 md:h-[45rem]'
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

export default PromotionCarousel;
