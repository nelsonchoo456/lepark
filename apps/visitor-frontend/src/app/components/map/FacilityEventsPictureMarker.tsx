import { useRef } from 'react';
import L, { DivIcon } from 'leaflet';
import { Tooltip as AntdTooltip, Button, Tag } from 'antd';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventResponse, EventStatusEnum, FacilityResponse, FacilityStatusEnum } from '@lepark/data-access';
import { MdArrowOutward } from 'react-icons/md';
import { TbLocation } from 'react-icons/tb';
import { InnerPictureMarkerGlow, PictureMarkerInner } from '@lepark/common-ui';
import { BiSolidCalendar, BiSolidCalendarEvent } from 'react-icons/bi';
import { HoverItem } from './interfaces/interfaces';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
// import ParkStatusTag from '../../pages/ParkDetails/components/ParkStatusTag';
import { COLORS } from '../../config/colors';
import dayjs from 'dayjs';
// import EventStatusTag from '../../pages/EventDetails/components/EventStatusTag';
// import { capitalizeFirstLetter } from '../textFormatters/textFormatters';
import FacilityPictureMarker from './FacilityPictureMarker';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { PiStarFill } from 'react-icons/pi';

interface FacilityEventsPictureMarkerProps {
  lat: number;
  lng: number;
  facility: FacilityResponse;
  facilityType?: string;
  events?: EventResponse[];
  circleWidth?: number;
  tooltipLabel?: string | JSX.Element | JSX.Element[];
  tooltipLabelPermanent?: boolean;

  showFacilities: boolean;
  showEvents: boolean;
  setShowEvents?: (show: boolean) => void;

  hovered?: HoverItem | null;
  setHovered?: (hovered: any) => void;
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

  showFacilities,
  showEvents,
  setShowEvents,

  hovered,
  setHovered,
}: FacilityEventsPictureMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const navigate = useNavigate();
  const map = useMap(); 

  const zoom = (lat: number, lng: number) => {
    map.setView([lat, lng], 18)
  }

  const eventMarkerGap = 16;

  const getCustomIcon = (event: EventResponse, index: number) => {
    if (hovered && hovered?.id === event?.id) {
      const thisCircleWidth = hovered?.id === event.id ? circleWidth * 1.3 : circleWidth;
      const iconHTML = renderToStaticMarkup(
        <InnerPictureMarkerGlow>
          <PictureMarkerInner $circleWidth={thisCircleWidth} $innerBackgroundColor="transparent">
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url('${event?.images && event?.images.length > 0 ? event.images[0] : ''}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              className="rounded-full shadow-md flex items-center justify-center text-white shrink-0 border-2 border-highlightGreen-400 bg-highlightGreen-400"
            >
              {!(event?.images && event?.images.length > 0) && <PiStarFill className="text-lg" />}
            </div>
          </PictureMarkerInner>
        </InnerPictureMarkerGlow>,
      );

      return L.divIcon({
        html: iconHTML,
        iconSize: [thisCircleWidth, thisCircleWidth],
        iconAnchor: [thisCircleWidth / 2 - (index + 1) * eventMarkerGap, thisCircleWidth / 2],
        className: '',
      });
    }

    const iconHTML = renderToStaticMarkup(
      <PictureMarkerInner $circleWidth={circleWidth} $innerBackgroundColor="transparent">
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('${event?.images && event?.images.length > 0 ? event.images[0] : ''}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className="rounded-full shadow-md flex items-center justify-center text-white shrink-0 border-2 border-highlightGreen-500 bg-highlightGreen-400"
        >
          {!(event?.images && event?.images.length > 0) && <BiSolidCalendarEvent className="text-lg" />}
        </div>
      </PictureMarkerInner>,
    );

    return L.divIcon({
      html: iconHTML,
      iconSize: [circleWidth, circleWidth],
      iconAnchor: [circleWidth / 2 - (index + 1) * eventMarkerGap, circleWidth / 2],
      className: '',
    });
  };

  const onEventCardClick = (event: EventResponse) => {
    setShowEvents && setShowEvents(true);
    zoom(lat, lng)
    setHovered &&
      setHovered({
        ...event,
        title: <div className="flex justify-between items-center">{event.title}</div>,
        image: event.images ? event.images[0] : null,
        entityType: 'EVENT',
        children: (
          <div className="h-full w-full flex flex-col justify-between">
            <div>
              <Typography.Paragraph
                ellipsis={{
                  rows: 2,
                }}
              >
                {event.description}
              </Typography.Paragraph>
              <div className="-mt-2 ">
                <span className="text-secondary">Date: </span>
                {dayjs(event?.startDate).format('D MMM YYYY') + ' - ' + dayjs(event?.endDate).format('D MMM YYYY')}
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
                  @ {facility.name}
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
      });
  };

  return (
    <>
      {showFacilities && (
        <FacilityPictureMarker
          key={facility.id}
          id={facility.id}
          circleWidth={38}
          lat={lat}
          lng={lng}
          innerBackgroundColor={COLORS.highlightGreen[400]}
          // tooltipLabel={facility.name}
          facilityType={facility.facilityType}
          hovered={hovered}
          setHovered={() => {
            zoom(lat, lng)
            setHovered &&
            setHovered({
              ...facility,
              title: facility.name,
              image: facility.images ? facility.images[0] : null,
              entityType: 'FACILITY',
              children: (
                <div className="h-full w-full flex flex-col justify-between">
                  <div className="flex justify-between flex-wrap mb-2">
                    <p className="">{formatEnumLabelToRemoveUnderscores(facility.facilityType)}</p>
                    <Tag
                      color={
                        facility.facilityStatus === FacilityStatusEnum.OPEN
                          ? 'green'
                          : facility.facilityStatus === FacilityStatusEnum.CLOSED
                          ? 'red'
                          : 'yellow'
                      }
                      bordered={false}
                    >
                      {formatEnumLabelToRemoveUnderscores(facility.facilityStatus)}
                    </Tag>
                  </div>

                  {events && events.length > 0 && (
                    <div className="">
                      <div className="flex w-full items-center mb-2">
                        <div className="font-semibold text-highlightGreen-400 mr-2">Upcoming Events</div>
                        <div className="flex-[1] h-[1px] bg-highlightGreen-400/30" />
                      </div>
                      <div className="h-42 flex gap-2 pb-3 overflow-x-scroll flex-nowrap">
                        {events.map((event) => (
                          <div
                            className="bg-gray-50/40 h-full w-32 rounded overflow-hidden flex-shrink-0 cursor-pointer shadow hover:text-highlightGreen-400"
                            onClick={() => onEventCardClick(event)}
                          >
                            <AntdTooltip title="View Event Details">
                              <div>
                                <div
                                  style={{
                                    backgroundImage: `url('${event.images && event.images.length > 0 ? event.images[0] : ''}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                  }}
                                  className="rounded-b-lg h-16 w-full shadow-md text-white flex-0 flex items-center justify-center bg-highlightGreen-200 opacity-50 overflow-hidden"
                                >
                                  {(!event.images || event.images.length === 0) && <PiStarFill className="opacity-75 text-lg" />}
                                </div>
                                <div className="font-semibold px-2 mt-1">{event.title}</div>
                                <div className="text-xs px-2">
                                  {dayjs(event?.startDate).format('D MMM') + ' - ' + dayjs(event?.endDate).format('D MMM')}
                                </div>
                              </div>
                            </AntdTooltip>
                          </div>
                        ))}
                      </div>
                      <div className="flex w-full items-center mb-2">
                        <div className="flex-[1] h-[1px] bg-highlightGreen-400/30" />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <AntdTooltip title="View Facility details">
                      <Button shape="circle" onClick={() => navigate(`/facilities/${facility.id}`)}>
                        <MdArrowOutward />
                      </Button>
                    </AntdTooltip>
                  </div>
                </div>
              ),
            })
          }}
        />
      )}
      {showEvents &&
        events.map((event, index) => (
          <Marker
            key={event.id}
            position={[lat, lng]}
            icon={getCustomIcon(event, index)}
            eventHandlers={{
              click: () => onEventCardClick(event)
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
