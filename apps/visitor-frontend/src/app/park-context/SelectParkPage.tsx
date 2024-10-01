// SelectParkPage.tsx
import React, { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { usePark } from './ParkContext';
import { getAllParks, ParkResponse } from '@lepark/data-access';
import { ContentWrapperDark, LogoText } from '@lepark/common-ui';
import { Button, Card, Checkbox, Col, Collapse, Input, Row, Space, Typography } from 'antd';
import type { CollapseProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TbTrees } from 'react-icons/tb';
import { MdArrowOutward } from 'react-icons/md';
import moment from 'moment';
import dayjs from 'dayjs';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { FaLocationDot } from 'react-icons/fa6';

const SelectParkPage: React.FC = () => {
  const now = new Date();
  const currentDay = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const currentTime = now.getTime();

  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);

  const [searchValue, setSearchValue] = useState<string>('');

  const [checkedStatus, setCheckedStatus] = useState<string[]>([]);
  const [checkedAreas, setCheckedAreas] = useState<string[]>([]);

  const { setSelectedPark } = usePark();
  const [parks, setParks] = useState<ParkResponse[]>([]);

  const [filteredParks, setFilteredParks] = useState<ParkResponse[]>([]);

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

  useEffect(() => {
    let filteredParks = parks;
    if (searchValue && searchValue.length > 2) {
      filteredParks = filteredParks.filter((park) => {
        const val = searchValue.toLowerCase();
        return (
          park.name.toLowerCase().includes(val) ||
          park.description?.toLowerCase().includes(val) ||
          park.address?.toLowerCase().includes(val)
        );
      });
    }
    if (checkedStatus.length > 0) {
      filteredParks = filteredParks.filter((park) => {
        const parkIsOpen = isParkOpen(park);
        return (checkedStatus.includes('OPEN') && parkIsOpen) || (checkedStatus.includes('CLOSED') && !parkIsOpen);
      });
    }
    if (checkedAreas.length > 0) {
      // filteredParks = filteredParks.filter((park) => {
      //   const parkIsOpen = isParkOpen(park);
      //   return (checkedStatus.includes("OPEN") && parkIsOpen) || (checkedStatus.includes("CLOSED") && !parkIsOpen);
      // })
    }
    setFilteredParks(filteredParks);
  }, [searchValue, checkedAreas, checkedStatus, parks]);

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

  const onChangeCheckedStatus = (list: string[]) => {
    setCheckedStatus(list);
  };

  const onChangeCheckedAreas = (list: string[]) => {
    setCheckedAreas(list);
  };

  return (
    <div className="bg-gray-200 pb-4 relative overflow-x-scroll h-full">
      <div className="fixed w-full pt-4 px-4 pb-2 bg-gray-200 z-40 shadow">
        <div className="flex gap-2 justify-between md:pr-20">
          <LogoText className="text-xl pb-2">Select a Park to Explore</LogoText>
          <div className="flex gap-2">
            <div
              onClick={() => setShowFilter(!showFilter)}
              className={`${
                showFilter || checkedStatus.length > 0 || checkedAreas.length > 0 ? 'text-white bg-green-200' : 'text-green-400 bg-gray-400'
              } h-8 w-8 rounded-full flex justify-center items-center`}
            >
              <FiFilter />
            </div>
            <div
              onClick={() => setShowSearch(!showSearch)}
              className={`${
                showSearch || (searchValue && searchValue.length > 2) ? 'text-white bg-green-200' : 'text-green-400 bg-gray-400'
              } h-8 w-8 rounded-full flex justify-center items-center`}
            >
              <FiSearch />
            </div>
          </div>
        </div>
        <div
          className={`flex gap-2 md:pr-20 transition-all duration-300 ease-in-out transform ${
            showSearch ? 'opacity-100 scale-y-100' : 'scale-y-0 h-0 opacity-0'
          }`}
        >
          <Input
            variant="filled"
            placeholder="Search for a Park..."
            className="w-full bg-white/60"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.trim())}
          />
        </div>
        <div
          className={`flex gap-2 md:pr-20 transition-all duration-300 ease-in-out transform ${
            showFilter ? 'opacity-100 scale-y-100' : 'h-0 opacity-0'
          }`}
        >
          <Collapse
            defaultActiveKey={[]}
            bordered={false}
            size="small"
            expandIconPosition="end"
            className="w-full mt-2"
            items={[
              {
                key: 'parkStatus',
                label: <p className="font-semibold text-green-600">Open Now</p>,
                children: (
                  <div>
                    <Checkbox.Group onChange={setCheckedStatus}>
                      <Row gutter={[0, 8]}>
                        <Col span={24}>
                          <Checkbox value="OPEN" className="text-green-500">
                            Open Now
                          </Checkbox>
                        </Col>
                        <Col span={24}>
                          <Checkbox value="CLOSED" className="text-red-700">
                            Closed
                          </Checkbox>
                        </Col>
                      </Row>
                    </Checkbox.Group>
                  </div>
                ),
              },
              // {
              //   key: 'area',
              //   label: <p className="font-semibold text-green-600">Area</p>,
              //   children: (
              //     <div>
              //       <Checkbox.Group onChange={setCheckedAreas}>
              //         <Row gutter={[0, 8]}>
              //           <Col span={24}>
              //             <Checkbox value="NORTH" className="">
              //               North
              //             </Checkbox>
              //           </Col>
              //           <Col span={24}>
              //             <Checkbox value="SOUTH" className="">
              //               South
              //             </Checkbox>
              //           </Col>
              //           <Col span={24}>
              //             <Checkbox value="EAST" className="">
              //               East
              //             </Checkbox>
              //           </Col>
              //           <Col span={24}>
              //             <Checkbox value="WEST" className="">
              //               West
              //             </Checkbox>
              //           </Col>
              //         </Row>
              //       </Checkbox.Group>
              //     </div>
              //   ),
              // },
            ]}
          />
        </div>
      </div>
      <ul className={`${showSearch ? 'pt-24' : 'pt-20'} px-4`}>
        {filteredParks && filteredParks.length > 0 ? (
          filteredParks?.map((park) => (
            <div
              key={park.id}
              className="mb-4 rounded-xl overflow-hidden cursor-pointer shadow-custom hover:shadow-hoverCustom hover:shadow-lg"
              onClick={() => handleParkSelect(park)}
            >
              <div
                key={park.id}
                style={{
                  backgroundImage: `url('${park.images && park.images.length > 0 ? park.images[0] : ''}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  overflow: 'hidden',
                }}
                className="w-full h-32 bg-sky-600"
              >
                {/* // bg-gradient-to-t from-green-700/90 via-green-600/70 to-transparent flex items-center justify-center*/}
                {/* <div className="absolute top-0 left-0 max-w-[1/2] h-full p-4 text-white "> */}
                {/* <div className="absolute top-0 left-0 w-full h-full text-white "> */}
                <div className="w-full h-full text-white ">
                  <div className="bg-gradient-to-br from-green-400/90 via-green-600/40 to-transparent h-full p-4 flex w-full">
                    <div className="flex-[2] flex-col">
                      <p className="font-medium text-lg drop-shadow-md md:text-2xl">{park.name}</p>
                      <div className="flex gap-2 w-full">
                        <TbTrees className="shrink-0" />
                        <Typography.Paragraph
                          ellipsis={{ rows: 2 }}
                          className="text-green-50 font-light text-sm drop-shadow-[2px_1px_2px_rgba(0,0,0,0.6)]"
                        >
                          {park.description}
                        </Typography.Paragraph>
                      </div>
                    </div>
                    <div className="hidden pt-7 md:block md:flex-[1]">
                      {/* <Typography.Paragraph
                        ellipsis={{ rows: 2 }}
                        className="text-green-50 font-light text-sm drop-shadow-[2px_1px_2px_rgba(0,0,0,0.6)]"
                      >
                        {park.address}
                      </Typography.Paragraph> */}
                    </div>
                    <div className="hidden pt-7 md:block md:flex-[1] md:flex">
                      <FaLocationDot className="text-highlightGreen-200 mr-2 drop-shadow-[2px_1px_2px_rgba(0,0,0,0.2)]" />
                      <Typography.Paragraph
                        ellipsis={{ rows: 2 }}
                        className="text-green-50 font-light text-sm drop-shadow-[2px_1px_2px_rgba(0,0,0,0.6)]"
                      >
                        {park.address}
                      </Typography.Paragraph>
                    </div>
                    {isParkOpen(park) ? (
                      <div className="flex flex-col h-full justify-between items-end">
                        <div
                          className={`flex w-20 items-center justify-center backdrop-blur bg-green-50/90 px-4 h-8 rounded-full text-highlightGreen-500`}
                        >
                          Open
                        </div>
                        <Button
                          icon={<MdArrowOutward className="text-2xl" />}
                          shape="circle"
                          type="primary"
                          size="large"
                          onClick={(e) => {
                            setSelectedPark(park);
                            navigate(`/park/${park.id}`);
                            e.stopPropagation();
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-between items-end">
                        <div
                          className={`flex w-20 items-center justify-center backdrop-blur bg-green-700/30 px-4 h-8 rounded-full text-white/70`}
                        >
                          Closed
                        </div>
                        <Button
                          icon={<MdArrowOutward className="text-2xl" />}
                          shape="circle"
                          type="primary"
                          size="large"
                          onClick={(e) => {
                            setSelectedPark(park);
                            navigate(`/park/${park.id}`);
                            e.stopPropagation();
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
