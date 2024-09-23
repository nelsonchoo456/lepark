import { useCallback, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, Tooltip } from 'react-leaflet';
import { AdjustLatLngInterface } from '../../pages/Occurrence/OccurrenceCreate';
import { renderToStaticMarkup } from 'react-dom/server';
import { HtmlPictureMarker, PictureMarkerInner } from '@lepark/common-ui';
import { COLORS } from '../../config/colors';
import PictureMarker from './PictureMarker';
import { FaFemale, FaMale } from 'react-icons/fa';
import { FacilityTypeEnum } from '@prisma/client';
import { PiFirstAidFill } from 'react-icons/pi';
import { IoInformationSharp } from 'react-icons/io5';
// import { FaMale, FaFemale, FaParking, FaCampground, FaWater, FaCar } from 'react-icons/fa';
// import { IoInformationSharp, IoBarbecue, IoAccessibilitySharp } from 'react-icons/io5';
// import { GiStage, GiPicnicTable, GiFirstAidKit, GiAmphitheater, GiGazebo } from 'react-icons/gi';
// import { MdLocalPlayground, MdOutlineStorage } from 'react-icons/md';
// import { PiFirstAidFill } from 'react-icons/pi';
// import { BsFillHeartPulseFill } from 'react-icons/bs';

interface FacilityPictureMarkerProps {
  lat: number;
  lng: number;
  circleWidth?: number;
  innerBackgroundColor?: string;
  tooltipLabel?: string | JSX.Element | JSX.Element[];
  tooltipLabelPermanent?: boolean;
  facilityType: string;
}

function FacilityPictureMarker({ lat, lng, circleWidth, tooltipLabel, innerBackgroundColor, facilityType }: FacilityPictureMarkerProps) {
  return (
    <PictureMarker
      circleWidth={circleWidth}
      lat={lat}
      lng={lng}
      innerBackgroundColor={facilityType === 'FIRST_AID' ? '#ff0000' : facilityType === 'INFORMATION' ? '#ff0000' : innerBackgroundColor}
      icon={
        facilityType === 'TOILET' ? (
          <div className="flex gap-0 justify-center">
            <FaMale className="text-white drop-shadow-lg border-r-2 border-white" style={{ fontSize: '1rem' }} />
            <FaFemale className="text-white drop-shadow-lg -ml-[1px]" style={{ fontSize: '1rem' }} />
          </div>
        ) : facilityType === 'FIRST_AID' ? (
          <PiFirstAidFill className="text-white" style={{ fontSize: '1rem' }} />
        ) : facilityType === 'INFORMTION' ? (
          <IoInformationSharp className="text-white" style={{ fontSize: '1.2rem' }} />
        ) : (
          <IoInformationSharp className="text-white" style={{ fontSize: '1.2rem' }} />
        )
      }
      tooltipLabel={tooltipLabel}
      teardrop={false}
    />
  );
}

export default FacilityPictureMarker;
