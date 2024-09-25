import { useRef } from 'react';
import L from 'leaflet';
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
import { BiSolidCalendarEvent } from "react-icons/bi";

interface FacilityEventsPictureMarkerProps {
  lat: number;
  lng: number;
  facilityType?: string;
  events?: EventResponse[];
  circleWidth?: number;
  tooltipLabel?: string | JSX.Element | JSX.Element[];
  tooltipLabelPermanent?: boolean;
}

function FacilityEventsPictureMarker({
  lat,
  lng,
  facilityType,
  circleWidth = 32,
  tooltipLabel,
  tooltipLabelPermanent,
  events = [],
}: FacilityEventsPictureMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const eventMarkerGap = 16;

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
    const iconHTML = renderToStaticMarkup(
      <PictureMarkerInner circleWidth={circleWidth} innerBackgroundColor="transparent">
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('${event?.images && event?.images.length > 0 ? event.images[0] : ''}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // border: '1px solid green',
            // backgroundColor: '#DC9600',
          }}
          className="rounded-full flex items-center justify-center text-white shrink-0 border-2 border-sky-500 bg-sky-400"
        >
          {!(event?.images && event?.images.length > 0) && <BiSolidCalendarEvent className='text-lg'/>}
        </div>
      </PictureMarkerInner>,
    );

    return L.divIcon({
      html: iconHTML,
      iconSize: [circleWidth, circleWidth],
      iconAnchor: [circleWidth / 2 - (index + 1) * eventMarkerGap, circleWidth],
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
          // position={adjustMarkerPosition(index)}
          position={[lat, lng]}
          icon={getCustomIcon(event, index)}
          eventHandlers={{
            click: () => console.log(`Clicked on event with ID: ${event.id}`),
          }}
        >
          {event && (
            <Tooltip offset={[(index + 1) * eventMarkerGap, -circleWidth / 2]} permanent={tooltipLabelPermanent}>
              {event.title}
            </Tooltip>
          )}
        </Marker>
      ))}
    </>
  );
}

export default FacilityEventsPictureMarker;

// import { useCallback, useMemo, useRef, useState } from 'react';
// import L from 'leaflet';
// import { MapContainer, Marker, Popup, Tooltip } from 'react-leaflet';
// import { AdjustLatLngInterface } from '../../pages/Occurrence/OccurrenceCreate';
// import { renderToStaticMarkup } from 'react-dom/server';
// import { HtmlPictureMarker, PictureMarkerInner } from '@lepark/common-ui';
// import { COLORS } from '../../config/colors';
// import { EventResponse } from '@lepark/data-access';
// import { Avatar } from 'antd';

// interface FacilityEventsPictureMarkerProps {
//   lat: number;
//   lng: number;
//   events?: EventResponse[];
//   circleWidth?: number;
//   backgroundColor?: string;
//   innerBackgroundColor?: string;
//   icon?: string | JSX.Element | JSX.Element[];
//   tooltipLabel?: string | JSX.Element | JSX.Element[];
//   tooltipLabelPermanent?: boolean;
//   teardrop?: boolean;
// }

// function FacilityEventsPictureMarker({
//   lat,
//   lng,
//   circleWidth,
//   backgroundColor,
//   icon,
//   tooltipLabel,
//   tooltipLabelPermanent,
//   events,
// }: FacilityEventsPictureMarkerProps) {
//   const markerRef = useRef<L.Marker>(null);

//   const getCustomIcon = () => {
//     const iconHTML = renderToStaticMarkup(
//       <div className="flex relative -ml-1">
//         {events?.map((event, index) => (
//           <div
//             key={event.id}
//             onClick={() => console.log(event.id)}
//             style={{
//               width: circleWidth,
//               height: circleWidth,
//               zIndex: events.length - index,
//               backgroundImage: `url('${event?.images && event?.images?.length > 0 ? event?.images[0] : ""}')`,
//               backgroundSize: 'cover',
//               backgroundPosition: 'center',
//               overflow: 'hidden',
//             }}
//             className={`rounded-full flex items-center justify-center text-white border-[1px] border-green-500 bg-mustard-400 -ml-2 shrink-0`}
//           >
//             {!(event?.images && event?.images?.length > 0) && "k"

//             }
//           </div>
//         ))}
//       </div>,
//     );

//     return L.divIcon({
//       html: iconHTML,
//       iconSize: [32, 40],
//       iconAnchor: [16, 40],
//       className: '',
//     });
//   };

//   return (
//     <Marker position={[lat, lng]} ref={markerRef} icon={getCustomIcon()}>
//       {tooltipLabel && (
//         <Tooltip offset={[20, -10]} permanent={tooltipLabelPermanent}>
//           {tooltipLabel}
//         </Tooltip>
//       )}
//     </Marker>
//   );
// }

// export default FacilityEventsPictureMarker;
