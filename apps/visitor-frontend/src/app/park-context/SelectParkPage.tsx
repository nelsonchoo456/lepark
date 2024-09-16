// SelectParkPage.tsx
import React, { useEffect, useState } from 'react';
import { usePark } from './ParkContext';
import { getAllParks, ParkResponse } from '@lepark/data-access';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TbTrees } from 'react-icons/tb';
import { MdArrowOutward } from 'react-icons/md';
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
    navigate('/');
  };

  const isParkOpen = (park: ParkResponse) => {
    const now = dayjs();
    const currentDay = now.day(); // Sunday = 0, Monday = 1, ..., Saturday = 6

    const openingTime = dayjs(park.openingHours[currentDay]).format('HH:mm');
    let closingTime = dayjs(park.closingHours[currentDay]).format('HH:mm');
    if (closingTime === '00:00') {
      closingTime = '24:00';
    }

    const currentTime = now.format('HH:mm');

    // return now.isAfter(openingTime) && now.isBefore(closingTime);
    return currentTime >= openingTime && currentTime <= closingTime;
  };

  return (
    <div className="h-screen bg-slate-100 p-4">
      {/* <div className='pb-2 absolute z-20 bg-slate-100 w-full'> */}
        <LogoText className="text-xl pb-2">Select a Park to Explore</LogoText>
      {/* </div> */}
      <ul>
        {parks && parks.length > 0 ? (
          parks?.map((park) => (
            <Card
              key={park.id}
              styles={{ body: { padding: 0 } }}
              className="mb-2 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg"
              onClick={() => handleParkSelect(park)}
            >
              <div
                key={park.id}
                // size="small"
                style={{
                  backgroundImage: `url('${park.images && park.images.length > 0 ? park.images[0] : ''}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: 'white',
                  overflow: 'hidden',
                }}
                className="w-full h-32 bg-green-900 "
              >
                {/* // bg-gradient-to-t from-green-700/90 via-green-600/70 to-transparent flex items-center justify-center*/}
                {/* <div className="absolute top-0 left-0 max-w-[1/2] h-full p-4 text-white "> */}
                <div className="absolute top-0 left-0 w-full h-full  text-white ">
                  <div className="bg-gradient-to-br from-green-700/90 via-green-600/40 to-transparent h-full p-4 flex justify-between">
                    <div>
                      <p className="font-medium text-lg drop-shadow-md md:text-2xl">{park.name}</p>
                      <div className="flex gap-2">
                        <TbTrees className="shrink-0" />
                        <Typography.Paragraph
                          ellipsis={{ rows: 3 }}
                          className="text-green-50/80 font-light text-sm drop-shadow-[2px_2px_2px_rgba(0,0,0,0.5)]"
                        >
                          {park.description}
                        </Typography.Paragraph>
                      </div>
                    </div>
                    <div className="flex flex-col h-full justify-between items-end">
                      <div
                        className={`flex w-20 items-center justify-center backdrop-blur bg-green-700/30 px-4 h-8 rounded-full ${
                          isParkOpen(park) && 'text-highlightGreen-300'
                        }`}
                      >
                        {isParkOpen(park) ? 'Open' : 'Closed'}
                      </div>
                      <Button icon={<MdArrowOutward className="text-2xl" />} shape="circle" type="primary" size="large" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
            <TbTrees className="text-4xl mb-2 mt-10" />
            No Parks here.
          </div>
        )}
      </ul>
    </div>
  );
};

export default SelectParkPage;
