import React from 'react';
import { Button, Card } from 'antd';

interface EventCardProps {
  title: string;
  url?: string | null;
  extra?: React.ReactNode;
  width?: string;
  height?: string;
  children?: React.ReactNode;
  gradient?: string;
}

const EventCard: React.FC<EventCardProps> = ({ title, url, extra, width = '13rem', height = '15rem', gradient ="bg-gradient-to-t from-green-500 via-green-600/70 to-transparent", children }) => {
  return (
    // <div style={{ padding: '0' }} className='lg:flex-[1]'>
      <Card
        size="small"
        style={{
          width: width,
          overflow: 'hidden',
        }}
        styles={{ body: { padding: 0 } }}
        className={`lg:w-auto lg:flex-[1] flex-none lg:min-h-[13.5rem]`}
      >
        <div
          style={{
            width: "full",
            height: "9rem",
            backgroundImage: `url('${url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div className={`absolute w-full h-full px-4 ${gradient} text-white flex justify-end items-end `}>
            <div className="text-right">
              <div className="mb-2 font-bold text-lg">{title}</div>
              
            </div>
          </div>
        </div>
        <div className="text-sm p-2">{children}</div>
      </Card>
    // </div>
  );
};

export default EventCard;
