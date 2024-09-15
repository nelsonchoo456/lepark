import React from 'react';
import { Button, Card } from 'antd';
import defaultSpeciesImage from './genspeciesimage.png';

interface SpeciesCardProps {
  title: string;
  url: string;
  extra?: React.ReactNode;
  width?: string;
  height?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const SpeciesCard: React.FC<SpeciesCardProps> = ({
  title,
  url = defaultSpeciesImage, // Set default URL
  extra,
  width = '10rem',
  height = '13rem',
  children,
  onClick, // Destructure onClick prop
}) => {
  return (
    <div style={{ padding: '0' }}>
      <Card
        size="small"
        style={{
          width: width,
          height: height,
          backgroundImage: `url('${url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          overflow: 'hidden',
          cursor: 'pointer', // Add cursor pointer to indicate clickability
        }}
        onClick={onClick} // Add onClick handler
        styles={{ body: { padding: 0 } }}
      >
        <div className="absolute bottom-0 w-full h-full p-4 bg-gradient-to-t from-green-500/90 via-green-600/70 to-transparent text-white flex justify-end items-end ">
          <div className="text-right">
            <div className="mb-2 font-bold text-lg">{title}</div>
            <div className="text-sm opacity-60">{children}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SpeciesCard;
