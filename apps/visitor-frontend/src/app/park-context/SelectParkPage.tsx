// SelectParkPage.tsx
import React, { useEffect, useState } from 'react';
import { usePark } from './ParkContext';
import { getAllParks, ParkResponse } from '@lepark/data-access';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TbTrees } from 'react-icons/tb';
import { MdArrowOutward } from "react-icons/md";
import moment from 'moment';
import dayjs from 'dayjs';

const SelectParkPage: React.FC = () => {
  const now = new Date();
  const currentDay = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const currentTime = now.getTime();

  const { setSelectedPark } = usePark();
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const navigate = useNavigate();

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
    // window.location.href = '/';
    navigate('/');
  };

  const isParkOpen = (park: ParkResponse) => {
    const now = dayjs();
    const currentDay = now.day(); // Sunday = 0, Monday = 1, ..., Saturday = 6

    const openingTime = dayjs(park.openingHours[currentDay]);
    const closingTime = dayjs(park.closingHours[currentDay]);

    return now.isAfter(openingTime) && now.isBefore(closingTime);
  };
  

  return (
    <ContentWrapperDark>
      <div className='pb-2 absolute z-20 bg-slate-100 w-full'>
      <LogoText className='text-xl'>
        Select a Park to Explore
      </LogoText>
      </div>
      <ul className='mt-10'>
        {parks?.map((park) => (
          <Card key={park.id} styles={{ body: { padding: 0 } }} className="mb-2 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg" onClick={() => handleParkSelect(park)}>
            <div
              key={park.id}
              // size="small"
              style={{
                backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/6/63/Kallang_River_at_Bishan_Park.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                overflow: 'hidden',
              }}
              className="w-full h-32 bg-green-400 "
            >
              {/* // bg-gradient-to-t from-green-700/90 via-green-600/70 to-transparent flex items-center justify-center*/}
              {/* <div className="absolute top-0 left-0 max-w-[1/2] h-full p-4 text-white "> */}
              <div className="absolute top-0 left-0 w-full h-full  text-white ">
                <div className="bg-gradient-to-br from-green-700/90 via-green-600/40 to-transparent h-full p-4 flex justify-between">
                  <div><p className="font-medium text-lg md:text-3xl">{park.name}</p>
                  <div className='flex gap-2'>
                    <TbTrees/> 
                    <Typography.Paragraph
                      ellipsis={{ rows: 1 }}
                      className='text-white font-light text-sm'
                    >
                      {park.description}
                    </Typography.Paragraph>
                  </div>
                  </div>
                  <div className='flex flex-col h-full justify-between items-end'>
                    <div className='flex w-20 items-center justify-center backdrop-blur bg-green-700/30 px-4 h-8 rounded-full'>
                      {isParkOpen(park) ? 'Open Now' : 'Closed'}
                    </div>
                    <Button icon={<MdArrowOutward className='text-2xl'/>} shape="circle" type="primary" size='large'/>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </ul>
    </ContentWrapperDark>
  );
};

export default SelectParkPage;
