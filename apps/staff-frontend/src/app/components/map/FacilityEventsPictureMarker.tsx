import { useRef, useState } from 'react';
import L, { DivIcon } from 'leaflet';
import { Tooltip as AntdTooltip, Button, Tag } from 'antd';
import { Marker, Tooltip } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventResponse, EventStatusEnum, FacilityResponse } from '@lepark/data-access';
import { FaMale, FaFemale, FaCampground, FaCar } from 'react-icons/fa';
import { FaPersonShelter } from 'react-icons/fa6';
import { IoInformationSharp, IoAccessibilitySharp } from 'react-icons/io5';
import { IoIosWater } from 'react-icons/io';
import { GiFirstAidKit, GiFireplace, GiTheaterCurtains } from 'react-icons/gi';
import { MdArrowOutward, MdOutlineStorage } from 'react-icons/md';
import { TbLocation, TbPlayFootball } from 'react-icons/tb';
import { PiPicnicTableBold } from 'react-icons/pi';
import { GrAed } from 'react-icons/gr';
import { PictureMarkerInner } from '@lepark/common-ui';
import { BiSolidCalendar, BiSolidCalendarEvent } from 'react-icons/bi';
import HoverInformation, { HoverItem } from './HoverInformation';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import ParkStatusTag from '../../pages/ParkDetails/components/ParkStatusTag';
import { COLORS } from '../../config/colors';
import dayjs from 'dayjs';
import EventStatusTag from '../../pages/EventDetails/components/EventStatusTag';
import { capitalizeFirstLetter } from '../textFormatters/textFormatters';

interface FacilityEventsPictureMarkerProps {
  lat: number;
  lng: number;
  facility: FacilityResponse;
  facilityType?: string;
  events?: EventResponse[];
  circleWidth?: number;
  tooltipLabel?: string | JSX.Element | JSX.Element[];
  tooltipLabelPermanent?: boolean;
  hovered?: HoverItem | null;
  setHovered: (hovered: any) => void;
}

function FacilityEventsPictureMarker({
  lat,
  lng,
  facility,
  facilityType,
  circleWidth = 32,
  tooltipLabel,
  tooltipLabelPermanent,
  events = [],
  hovered,
  setHovered,
}: FacilityEventsPictureMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const navigate = useNavigate();

  const eventMarkerGap = 16;

  // const handleMouseOut = () => {
  //   setTimeout(() => {
  //     setHoveredEvent(null);
  //   }, 7000);
  // };

  // Make sure consistent with FacilityPictureMarker
  const icon =
    facilityType === 'TOILET' ? (
      <div className="flex gap-0 justify-center">
        <FaMale className="text-white drop-shadow-lg border-r-2 border-white" style={{ fontSize: '1rem' }} />
        <FaFemale className="text-white drop-shadow-lg -ml-[1px]" style={{ fontSize: '1rem' }} />
      </div>
    ) : facilityType === 'FIRST_AID' ? (
      <GiFirstAidKit className="text-white" style={{ fontSize: '1rem' }} />
    ) : facilityType === 'INFORMATION' ? (
      <IoInformationSharp className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'CARPARK' ? (
      <FaCar className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'ACCESSIBILITY' ? (
      <IoAccessibilitySharp className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'PLAYGROUND' ? (
      <TbPlayFootball className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'STAGE' ? (
      <FaPersonShelter className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'WATER_FOUNTAIN' ? (
      <IoIosWater className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'PICNIC_AREA' ? (
      <PiPicnicTableBold className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'BBQ_PIT' ? (
      <GiFireplace className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'CAMPING_AREA' ? (
      <FaCampground className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'AED' ? (
      <GrAed className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'AMPHITHEATER' ? (
      <GiTheaterCurtains className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'GAZEBO' ? (
      <FaPersonShelter className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : facilityType === 'STOREROOM' ? (
      <MdOutlineStorage className="text-white" style={{ fontSize: '1.2rem' }} />
    ) : (
      <IoInformationSharp className="text-white" style={{ fontSize: '1.2rem' }} /> // Default icon
    );

  const backgroundColor =
    facilityType === 'FIRST_AID'
      ? '#ff0000'
      : facilityType === 'INFORMATION'
      ? '#007bff'
      : facilityType === 'CARPARK'
      ? '#4caf50'
      : facilityType === 'ACCESSIBILITY'
      ? '#ff9800'
      : facilityType === 'PLAYGROUND'
      ? '#ff5722'
      : facilityType === 'STAGE'
      ? '#8e44ad'
      : facilityType === 'WATER_FOUNTAIN'
      ? '#00bcd4'
      : facilityType === 'PICNIC_AREA'
      ? '#4caf50'
      : facilityType === 'BBQ_PIT'
      ? '#795548'
      : facilityType === 'CAMPING_AREA'
      ? '#388e3c'
      : facilityType === 'AED'
      ? '#ff0000'
      : facilityType === 'AMPHITHEATER'
      ? '#9c27b0'
      : facilityType === 'GAZEBO'
      ? '#3f51b5'
      : facilityType === 'STOREROOM'
      ? '#607d8b'
      : '#4caf50';

  // Function to generate individual marker icons
  const getFacilityCustomIcon = () => {
    const iconHTML = renderToStaticMarkup(
      <PictureMarkerInner circleWidth={circleWidth} innerBackgroundColor={backgroundColor}>
        {icon}
      </PictureMarkerInner>,
    );

    return L.divIcon({
      html: iconHTML,
      iconSize: [32, 40],
      iconAnchor: [circleWidth / 2, circleWidth],
      // iconAnchor: [16, 40],
      className: '',
    });
  };

  const getCustomIcon = (event: EventResponse, index: number) => {
    const thisCircleWidth = hovered?.id === event.id ? circleWidth * 1.3 : circleWidth;
    const iconHTML = renderToStaticMarkup(
      <PictureMarkerInner circleWidth={thisCircleWidth} innerBackgroundColor="transparent">
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('${event?.images && event?.images.length > 0 ? event.images[0] : ''}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className="rounded-full shadow-md flex items-center justify-center text-white shrink-0 border-2 border-sky-500 bg-sky-400"
        >
          {!(event?.images && event?.images.length > 0) && <BiSolidCalendarEvent className="text-lg" />}
        </div>
      </PictureMarkerInner>,
    );

    return L.divIcon({
      html: iconHTML,
      iconSize: [thisCircleWidth, thisCircleWidth],
      iconAnchor: [thisCircleWidth / 2 - (index + 1) * eventMarkerGap, thisCircleWidth],
      className: '',
    });
  };

  return (
    <>
      {
        <Marker
          position={[lat, lng]}
          ref={markerRef}
          icon={getFacilityCustomIcon()}
          eventHandlers={{
            click: () =>
              setHovered({
                ...facility,
                title: facility.facilityName,
                image: facility.images ? facility.images[0] : null,
                entityType: 'FACILITY',
                children: (
                  <div className="h-full w-full flex flex-col justify-between">
                    <div className="flex justify-between flex-wrap mb-2">
                      <p className="">{capitalizeFirstLetter(facility.facilityType)}</p>
                      <ParkStatusTag>{facility.facilityStatus}</ParkStatusTag>
                    </div>

                    <div className="">
                      <div className="flex w-full items-center mb-2">
                        <div className="font-semibold text-sky-400 mr-2">Upcoming Events</div>
                        <div className="flex-[1] h-[1px] bg-sky-400/30" />
                      </div>
                      <div className="h-42 flex gap-2 pb-3 overflow-x-scroll flex-nowrap">
                        {events.map((event) => (
                          <div
                            className="bg-gray-50/40 h-full w-36 rounded overflow-hidden flex-shrink-0 cursor-pointer shadow hover:text-sky-400"
                          >
                            <AntdTooltip title="View Event Details">
                              <div onClick={() => navigate(`/event/${event.id}`)}>
                                <div
                                  style={{
                                    backgroundImage: `url('${event.images && event.images.length > 0 ? event.images[0] : ''}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                  }}
                                  className="rounded-b-lg h-18 w-full shadow-md text-white flex-0 flex items-center justify-center  bg-sky-200 opacity-50 overflow-hidden"
                                >
                                  {(!event.images || event.images.length === 0) && (
                                    <BiSolidCalendar className="opacity-75 text-lg" />
                                  )}
                                </div>
                                <div className="font-semibold px-2 mt-1">{event.title}</div>
                                <div className="text-xs px-2">
                                  {dayjs(event?.startDate).format('D MMM') + ' - ' + dayjs(event?.endDate).format('D MMM')}
                                </div>
                              </div>
                            </AntdTooltip>
                            <div className="flex justify-end mb-2 px-2">
                              <AntdTooltip title="View on Map">
                                <Button
                                  shape="circle"
                                  icon={<TbLocation />}
                                  onClick={() =>{
                                    setHovered({
                                      ...event,
                                      title: (
                                        <div className="flex justify-between items-center">
                                          {event.title}
                                          <EventStatusTag status={event?.status as EventStatusEnum} />
                                        </div>
                                      ),
                                      image: event.images ? event.images[0] : null,
                                      entityType: 'EVENT',
                                      children: (
                                        <div className="h-full w-full flex flex-col justify-between">
                                          <div>
                                            <Typography.Paragraph
                                              ellipsis={{
                                                rows: 3,
                                              }}
                                            >
                                              {event.description}
                                            </Typography.Paragraph>
                                            <div className="-mt-2 ">
                                              <span className="text-secondary">Date: </span>
                                              {dayjs(event?.startDate).format('D MMM YYYY') +
                                                ' - ' +
                                                dayjs(event?.endDate).format('D MMM YYYY')}
                                            </div>
                                            <div>
                                              <span className="text-secondary">Time:</span>
                                              <Tag bordered={false}>{dayjs(event?.startDate).format('h:mm A')}</Tag>-{' '}
                                              <Tag bordered={false}>{dayjs(event?.endDate).format('h:mm A')}</Tag> daily
                                            </div>
                                            <AntdTooltip title="View Facility details" placement="topLeft">
                                              <p
                                                className="text-green-500 cursor-pointer font-semibold hover:text-green-900"
                                                onClick={() => navigate(`/facilities/${facility.id}`)}
                                              >
                                                @ {facility.facilityName}
                                              </p>
                                            </AntdTooltip>
                                          </div>
                                          <div className="flex justify-end">
                                            <AntdTooltip title="View Event details">
                                              <Button shape="circle" onClick={() => navigate(`/event/${event.id}`)}>
                                                <MdArrowOutward />
                                              </Button>
                                            </AntdTooltip>
                                          </div>
                                        </div>
                                      ),
                                    })
                                  }}
                                />
                              </AntdTooltip>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex w-full items-center mb-2">
                        <div className="flex-[1] h-[1px] bg-sky-400/30" />
                      </div>
                    </div>
                    {/* <Collapse
                      bordered={false}
                      defaultActiveKey={[]}
                      size="small"
                      expandIconPosition="end"
                      className="mb-2"
                      items={facility.events.map((event, index) => ({
                        key: `${index}`,
                        label: (
                          <div className='flex items-center gap-2'>
                            <div
                              style={{
                                backgroundImage: `url('${event.images && event.images.length > 0 ? event.images[0] : ''}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }}
                              className="rounded-full h-8 w-8 shadow-md text-white flex-0 flex items-center justify-center  bg-gray-400 overflow-hidden"
                            >
                              {(!event.images || event.images.length === 0) && <BiSolidCalendar className='opacity-75 text-lg'/>}
                            </div>
                            {event.title}
                          </div>
                        ),
                        children: 'keke',
                      }))}
                    /> */}
                    <div className="flex justify-end">
                      <AntdTooltip title="View Facility details">
                        <Button shape="circle" onClick={() => navigate(`/facility/${facility.id}`)}>
                          <MdArrowOutward />
                        </Button>
                      </AntdTooltip>
                    </div>
                  </div>
                ),
              })
          }}
          riseOnHover
        >
          {tooltipLabel && (
            <Tooltip offset={[20, -10]} permanent={tooltipLabelPermanent}>
              {tooltipLabel}
            </Tooltip>
          )}
        </Marker>
      }
      {events.map((event, index) => (
        <Marker
          key={event.id}
          position={[lat, lng]}
          icon={getCustomIcon(event, index)}
          eventHandlers={{
            click: () =>
              setHovered({
                ...event,
                title: <div className='flex justify-between items-center'>{event.title}<EventStatusTag status={event?.status as EventStatusEnum}/></div>,
                image: event.images ? event.images[0] : null,
                entityType: 'EVENT',
                children: (
                  <div className="h-full w-full flex flex-col justify-between">
                    <div>
                      <Typography.Paragraph
                        ellipsis={{
                          rows: 3,
                        }}
                      >
                        {event.description}
                      </Typography.Paragraph>
                      <div className='-mt-2 '><span className='text-secondary'>Date: </span>{dayjs(event?.startDate).format('D MMM YYYY') + ' - ' + dayjs(event?.endDate).format('D MMM YYYY')}</div>
                      <div>
                        <span className='text-secondary'>Time:</span>
                        <Tag bordered={false}>{dayjs(event?.startDate).format('h:mm A')}</Tag>- {' '}
                        <Tag bordered={false}>{dayjs(event?.endDate).format('h:mm A')}</Tag> daily
                      </div>
                      <AntdTooltip title="View Facility details" placement="topLeft">
                        <p
                          className="text-green-500 cursor-pointer font-semibold hover:text-green-900"
                          onClick={() => navigate(`/facilities/${facility.id}`)}
                        >
                          @ {facility.facilityName}
                        </p>
                      </AntdTooltip>
                    </div>
                    <div className="flex justify-end">
                      <AntdTooltip title="View Event details">
                        <Button shape="circle" onClick={() => navigate(`/event/${event.id}`)}>
                          <MdArrowOutward />
                        </Button>
                      </AntdTooltip>
                    </div>
                  </div>
                ),
              }),
          }}
          riseOnHover
        >
          <Tooltip offset={[(index + 1) * eventMarkerGap, -circleWidth / 2]} permanent={tooltipLabelPermanent}>
            {event.title}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

export default FacilityEventsPictureMarker;
