import PictureMarker from './PictureMarker';
// import { FaFemale, FaMale } from 'react-icons/fa';
// import { FacilityTypeEnum } from '@prisma/client';
// import { PiFirstAidFill } from 'react-icons/pi';
// import { IoInformationSharp } from 'react-icons/io5';
import { FaMale, FaFemale, FaCampground, FaCar } from 'react-icons/fa';
import { FaPersonShelter } from "react-icons/fa6";
import { IoInformationSharp, IoAccessibilitySharp } from 'react-icons/io5';
import { IoIosWater } from "react-icons/io";
import { GiFirstAidKit, GiFireplace, GiTheaterCurtains } from 'react-icons/gi';
import {  MdOutlineStorage } from 'react-icons/md';
import { TbPlayFootball } from "react-icons/tb";
import {  PiPicnicTableBold } from 'react-icons/pi';
import { GrAed } from 'react-icons/gr';
import { HoverItem } from './HoverInformation';

interface FacilityPictureMarkerProps {
  id: string;
  lat: number;
  lng: number;
  circleWidth?: number;
  innerBackgroundColor?: string;
  tooltipLabel?: string | JSX.Element | JSX.Element[];
  tooltipLabelPermanent?: boolean;
  facilityType: string;
  hovered?: HoverItem | null;
  setHovered?: (hovered: any) => void;
}

function FacilityPictureMarker({ id, lat, lng, circleWidth, tooltipLabel, innerBackgroundColor, facilityType, hovered, setHovered }: FacilityPictureMarkerProps) {
  const icon = facilityType === 'TOILET' ? (
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

  const backgroundColor = facilityType === 'FIRST_AID'
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
    : innerBackgroundColor; 

  return (
    <PictureMarker
      id={id}
      entityType='FACILITY'
      circleWidth={circleWidth}
      lat={lat}
      lng={lng}
      innerBackgroundColor={backgroundColor}
      icon={icon}
      tooltipLabel={tooltipLabel}
      teardrop={false}
      hovered={hovered}
      setHovered={setHovered}
    />
  );
}

export default FacilityPictureMarker;
