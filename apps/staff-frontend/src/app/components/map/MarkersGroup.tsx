// MapMarkersSection.tsx
import React from 'react';
import PictureMarker from './PictureMarker';
import FacilityPictureMarker from './FacilityPictureMarker';
import { HoverItem } from './HoverInformation';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../config/colors';
import { Button, Tooltip, Typography, Tag } from 'antd';
import { MdArrowOutward } from 'react-icons/md';
import { BiSolidCalendar } from 'react-icons/bi';
import dayjs from 'dayjs';
import { EventStatusEnum, Facility } from '@prisma/client';
import ParkStatusTag from '../../pages/ParkDetails/components/ParkStatusTag';
import EventStatusTag from '../../pages/EventDetails/components/EventStatusTag';
import { PiPlantFill } from 'react-icons/pi';
import { TbLocation, TbTicket } from 'react-icons/tb';
import { AttractionResponse, FacilityWithEvents, OccurrenceResponse } from '@lepark/data-access';
import { capitalizeFirstLetter } from '../textFormatters/textFormatters';
import FacilityEventsPictureMarker from './FacilityEventsPictureMarker';

interface MarkersGroupProps {
  occurrences?: OccurrenceResponse[];
  attractions?: AttractionResponse[];
  facilities?: FacilityWithEvents[];
  facilityEvents?: FacilityWithEvents[];

  hovered?: HoverItem | null;
  setHovered?: React.Dispatch<React.SetStateAction<HoverItem | null>>;

  showOccurrences?: boolean;
  showAttractions?: boolean;
  showFacilities?: boolean;
  showEvents?: boolean;

  setShowEvents?: (show: boolean) => void;
}

const MarkersGroup = ({
  occurrences,
  attractions,
  facilities,
  facilityEvents,
  hovered,
  setHovered,
  showOccurrences,
  showAttractions,
  showFacilities,
  showEvents,
  setShowEvents,
}: MarkersGroupProps) => {
  const navigate = useNavigate();

  return (
    <>
      {showOccurrences &&
        occurrences &&
        occurrences.map((occurrence) => (
          <PictureMarker
            key={occurrence.id}
            id={occurrence.id}
            entityType="OCCURRENCE"
            circleWidth={30}
            lat={occurrence.lat}
            lng={occurrence.lng}
            backgroundColor={COLORS.green[300]}
            icon={<PiPlantFill className="text-green-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
            tooltipLabel={occurrence.title}
            hovered={hovered}
            setHovered={() =>
              setHovered &&
              setHovered({
                ...occurrence,
                image: occurrence.images ? occurrence.images[0] : null,
                entityType: 'OCCURRENCE',
                children: (
                  <div className="h-full w-full flex flex-col justify-between">
                    <div>
                      <p className="italic text-secondary">{occurrence.speciesName}</p>
                      <Tooltip title="View Zone details" placement="topLeft">
                        <p
                          className="text-green-600 cursor-pointer hover:text-green-900"
                          onClick={() => navigate(`/zone/${occurrence.zoneId}`)}
                        >
                          @ {occurrence.zone.name}
                        </p>
                      </Tooltip>
                    </div>
                    <div className="flex justify-end">
                      <Tooltip title="View Occurrence details">
                        <Button shape="circle" onClick={() => navigate(`/occurrences/${occurrence.id}`)}>
                          <MdArrowOutward />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                ),
              })
            }
          />
        ))}

      {showAttractions &&
        attractions &&
        attractions.map((attraction) => (
          <PictureMarker
            key={attraction.id}
            id={attraction.id}
            entityType="ATTRACTION"
            circleWidth={30}
            lat={attraction.lat}
            lng={attraction.lng}
            backgroundColor={COLORS.mustard[300]}
            icon={<TbTicket className="text-mustard-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
            tooltipLabel={attraction.title}
            hovered={hovered}
            setHovered={() =>
              setHovered &&
              setHovered({
                ...attraction,
                title: (
                  <div className="flex justify-between items-center">
                    {attraction.title}
                    <ParkStatusTag>{attraction.status}</ParkStatusTag>
                  </div>
                ),
                image: attraction.images ? attraction.images[0] : null,
                entityType: 'ATTRACTION',
                children: (
                  <div className="h-full w-full flex flex-col justify-between">
                    <div>
                      <Typography.Paragraph ellipsis={{ rows: 3 }}>{attraction.description}</Typography.Paragraph>
                    </div>
                    <div className="flex justify-end">
                      <Tooltip title="View Attraction details">
                        <Button shape="circle" onClick={() => navigate(`/attraction/${attraction.id}`)}>
                          <MdArrowOutward />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                ),
              })
            }
          />
        ))}

      {(showFacilities || showEvents) &&
        facilities &&
        facilities.map(
          (facility) =>
            facility.lat &&
            facility.long && (
              <FacilityEventsPictureMarker
                facility={{ ...facility, events: [] }}
                circleWidth={38}
                events={facility.events}
                lat={facility.lat}
                lng={facility.long}
                facilityType={facility.facilityType}
                showFacilities={showFacilities || false}
                showEvents={showEvents || false}
                hovered={hovered}
                setHovered={setHovered}
              />
            ),
        )}
    </>
  );
};

export default MarkersGroup;
