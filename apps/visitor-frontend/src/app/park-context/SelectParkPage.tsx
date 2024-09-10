// SelectParkPage.tsx
import React, { useEffect, useState } from 'react';
import { usePark } from './ParkContext';
import { getAllParks, ParkResponse } from '@lepark/data-access';
import { ContentWrapperDark } from '@lepark/common-ui';
import { Card, Typography } from 'antd';

const SelectParkPage: React.FC = () => {
  const { setSelectedPark } = usePark();
  const [parks, setParks] = useState<ParkResponse[]>([]);

  useEffect(() => {
    const fetchParks = async () => {
      const response = await getAllParks();
      if (response.status === 200) {
        const parksData = response.data;
        setParks(parksData);
      }
    };

    fetchParks();
  }, []);

  const handleParkSelect = (park: ParkResponse) => {
    setSelectedPark(park);
    // Redirect to the home or another page after selection
    window.location.href = '/';
  };

  return (
    <ContentWrapperDark>
      {/* <h1>Select a Park</h1> */}
      <ul>
        {parks?.map((park) => (
          <Card key={park.id} styles={{ body: { padding: 0 } }} className="mb-4 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg" onClick={() => handleParkSelect(park)}>
            <Card
              key={park.id}
              size="small"
              style={{
                backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/6/63/Kallang_River_at_Bishan_Park.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                overflow: 'hidden',
              }}
              className="w-full h-28 bg-green-400 "
            >
              <div className="absolute top-0 left-0 w-full h-full p-4 text-white bg-gradient-to-t from-green-700/90 via-green-600/70 to-transparent flex items-center justify-center">
                <div className="md:text-center md:mx-auto">
                  <p className="font-medium text-2xl md:text-3xl">{park.name}</p>
                </div>
              </div>
            </Card>
            <div className="p-4">
              <Typography.Paragraph
                ellipsis={{
                  rows: 1,
                  expandable: 'collapsible',
                }}
                className='text-green-600'
              >
                {park.description}
              </Typography.Paragraph>
              <div className='-mt-2 opacity-50'>
                {park.address}
              </div>
            </div>
          </Card>
        ))}
      </ul>
    </ContentWrapperDark>
  );
};

export default SelectParkPage;
