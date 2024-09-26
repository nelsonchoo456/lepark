import { useRef, useState } from 'react';
import L, { DivIcon } from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventResponse } from '@lepark/data-access';
import { FaMale, FaFemale, FaCampground, FaCar } from 'react-icons/fa';
import { FaPersonShelter } from 'react-icons/fa6';
import { IoInformationSharp, IoAccessibilitySharp } from 'react-icons/io5';
import { IoIosWater } from 'react-icons/io';
import { GiFirstAidKit, GiFireplace, GiTheaterCurtains } from 'react-icons/gi';
import { MdOutlineStorage } from 'react-icons/md';
import { TbPlayFootball } from 'react-icons/tb';
import { PiPicnicTableBold } from 'react-icons/pi';
import { GrAed } from 'react-icons/gr';
import { PictureMarkerInner } from '@lepark/common-ui';
import { BiSolidCalendarEvent } from 'react-icons/bi';
import HoverInformation, { HoverItem } from './HoverInformation';

interface FacilityEventsPictureMarkerProps {
  lat: number;
  lng: number;
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
  facilityType,
  circleWidth = 32,
  tooltipLabel,
  tooltipLabelPermanent,
  events = [],
  hovered,
  setHovered
}: FacilityEventsPictureMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

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
    const thisCircleWidth = hovered?.id === event.id ? circleWidth * 1.3 : circleWidth
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
        <Marker position={[lat, lng]} ref={markerRef} icon={getFacilityCustomIcon()}>
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
            click: () => setHovered({ ...event, image: event.images ? event.images[0] : null, entityType: "EVENT" }),
          }}
          riseOnHover
        >
          <Tooltip offset={[(index + 1) * eventMarkerGap, -circleWidth / 2]} permanent={tooltipLabelPermanent}>
            {event.title}
          </Tooltip> 
        </Marker>
      ))}
      {/* {hovered && (
        <HoverInformation
          key={hovered.id}
          title={hovered.title}
          setHoveredItem={setHoveredEvent}
          children={<></>}
        />
      )} */}
    </>
  );
}

export default FacilityEventsPictureMarker;
