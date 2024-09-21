import { getOccurrencesByParkId, getZoneById, getZonesByParkId, OccurrenceResponse, ParkResponse, ZoneResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Checkbox, Space, Tooltip } from 'antd';
import { TbEdit, TbTree } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { GetProp } from 'antd';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { COLORS } from '../../../config/colors';
import PictureMarker from '../../../components/map/PictureMarker';
import { PiPlantFill } from 'react-icons/pi';

interface MapTabProps {
  park: ParkResponse;
}
const MapTab = ({ park }: MapTabProps) => {
  const navigate = useNavigate();
  const [zones, setZones] = useState<ZoneResponse[]>();
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>();
  // const [attractions, setAttractions] = useState<AttractionResponse[]>();

  const [showZones, setShowZones] = useState<boolean>(false);
  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);
  const [showAttractions, setShowAttractions] = useState<boolean>(false);
  const [showFacilities, setShowFacilities] = useState<boolean>(false);

  useEffect(() => {
    if (park.id) {
      fetchZones();
      fetchOccurrences();
    }
  }, [park])

  const fetchZones = async () => {
    const zonesRes = await getZonesByParkId(park.id);
    if (zonesRes.status === 200) {
      const zonesData = zonesRes.data;
      setZones(zonesData);
    }
  }
  
  const fetchOccurrences = async () => {
    const occurrenceRes = await getOccurrencesByParkId(park.id);
    if (occurrenceRes.status === 200) {
      const occurrenceData = occurrenceRes.data;
      setOccurrences(occurrenceData);
    }
  }


  return (
    <>
      <Space className="mb-4">
        <Checkbox onChange={(e) => setShowZones(e.target.checked)}>Zones</Checkbox>
        <Checkbox onChange={(e) => setShowOccurrences(e.target.checked)}>Occurrences</Checkbox>
        <Checkbox onChange={(e) => setShowAttractions(e.target.checked)}>Attractions</Checkbox>
        <Checkbox onChange={(e) => setShowFacilities(e.target.checked)}>Facilities</Checkbox>
      </Space>
      <div
        style={{
          height: '60vh',
          zIndex: 1,
        }}
        className="rounded-xl overflow-hidden"
      >
        <Tooltip title="Edit Boundaries">
          <div className="absolute z-20 flex justify-end w-full mt-4 pr-4">
            <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`/park/${park.id}/edit-map`)}>
              Edit{' '}
            </Button>
          </div>
        </Tooltip>
        <MapContainer
          center={[1.287953, 103.851784]}
          zoom={11}
          className="leaflet-mapview-container"
          style={{ height: '100%', width: '100%', zIndex: 10 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.9 }} />
          {showZones && zones &&
            zones.map((zone) => (
              <PolygonWithLabel
                key={zone.id}
                entityId={zone.id}
                geom={zone.geom}
                polygonLabel={
                  <div className="flex items-center gap-2">
                    <TbTree className="text-xl" />
                    {zone.name}
                  </div>
                }
                color={COLORS.green[600]}
                fillColor={'transparent'}
                labelFields={{ color: COLORS.green[800], textShadow: 'none' }}
              />
            ))}
          {showOccurrences && occurrences &&
            occurrences.map((occurrence) => (
              <PictureMarker circleWidth={30} lat={occurrence.lat} lng={occurrence.lng} backgroundColor={COLORS.green[300]} icon={<PiPlantFill className='text-green-600 drop-shadow-lg' style={{ fontSize: "3rem" }}/>} tooltipLabel={occurrence.title} />
            ))}
        </MapContainer>
      </div>
    </>
  );
};

export default MapTab;
