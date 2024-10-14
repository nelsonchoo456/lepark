import { useEffect, useState } from 'react';
import { Button, Card, Checkbox, Space, Tooltip } from 'antd';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { useAuth } from '@lepark/common-ui';
import {
  DecarbonizationAreaResponse,
  getDecarbonizationAreasByParkId,
  getOccurrencesByParkId,
  getParkById,
  getZonesByParkId,
  OccurrenceResponse,
  ParkResponse,
  StaffResponse,
  StaffType,
  ZoneResponse,
} from '@lepark/data-access';
import { TbEdit, TbTree } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import PictureMarker from '../../../components/map/PictureMarker';
import { PiPlantFill } from 'react-icons/pi';
import { COLORS } from '../../../config/colors';

interface MapTabProps {
  decarbonizationArea: DecarbonizationAreaResponse;
}

export const parseGeom = (geom: string) => {
  // Check if the string is a GeoJSON format
  if (geom.startsWith('SRID=4326;')) {
    const wktString = geom.substring(10); // Remove the 'SRID=4326;' prefix

    // Handle WKT format
    const match = wktString.match(/POLYGON\s*\(\(([^)]+)\)\)/);
    if (!match) {
      throw new Error(`Invalid WKT format: ${wktString}`);
    }

    const coordinates = match[1].split(',').map((coord) => {
      const [lng, lat] = coord.trim().split(' ').map(Number);
      return [lng, lat];
    });

    return {
      type: 'Polygon',
      coordinates: [coordinates],
    };
  }

  // If it's not WKT, try to parse it as GeoJSON
  try {
    const geoJson = JSON.parse(geom);
    return geoJson;
  } catch (error) {
    throw new Error(`Invalid GeoJSON format: ${geom}`);
  }
};

const MapTab = ({ decarbonizationArea }: MapTabProps) => {
  const { user } = useAuth<StaffResponse>();
  const [park, setPark] = useState<ParkResponse>();
  const [zones, setZones] = useState<ZoneResponse[]>();
  const [showPark, setShowPark] = useState<boolean>(true);
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>();
  const [parkDecarbAreas, setParkDecarbAreas] = useState<DecarbonizationAreaResponse[]>();
  const [showParkDecarbAreas, setShowParkDecarbAreas] = useState<boolean>(false);
  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);
  const [showZones, setShowZones] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (decarbonizationArea.id) {
      fetchPark();
    }
  }, [decarbonizationArea]);

  const fetchPark = async () => {
    const parkRes = await getParkById(decarbonizationArea.parkId);
    if (parkRes.status === 200) {
      const parkData = parkRes.data;
      setPark(parkData);
    }
  };
  // Parse the geom string to GeoJSON object
  const decarbonizationAreaGeom = parseGeom(decarbonizationArea.geom);

  useEffect(() => {
    if (!decarbonizationArea) return;
    fetchParkDecarbAreasData();
    fetchOccurrencesData();
    fetchZones();
  }, [decarbonizationArea]);

  const fetchParkDecarbAreasData = async () => {
    if (!decarbonizationArea?.parkId) return;
    try {
      const parkDecarbAreasRes = await getDecarbonizationAreasByParkId(decarbonizationArea.parkId);
      if (parkDecarbAreasRes.status === 200) {
        let parkDecarbAreasData = parkDecarbAreasRes.data;
        parkDecarbAreasData = parkDecarbAreasData.filter((area) => area.id !== decarbonizationArea.id);
        setParkDecarbAreas(parkDecarbAreasData);
      }
    } catch (error) {
      // do nothing
    }
  };

  const fetchOccurrencesData = async () => {
    if (!decarbonizationArea?.parkId) return;
    try {
      const occurrencesRes = await getOccurrencesByParkId(decarbonizationArea.parkId);
      if (occurrencesRes.status === 200) {
        const occurrencesData = occurrencesRes.data;
        setOccurrences(occurrencesData);
        console.log('Occurrences:', occurrencesData);
      }
    } catch (error) {
      // do nothing
    }
  };

  const fetchZones = async () => {
    const zonesRes = await getZonesByParkId(decarbonizationArea.parkId);
    if (zonesRes.status === 200) {
      const zonesData = zonesRes.data;
      setZones(zonesData);
    }
  };

  return (
    <>
      <Card styles={{ body: { padding: 0 } }} className="px-4 py-3 mb-4">
        <Space size={20}>
          <div className="font-semibold">Display:</div>
          {park && (
            <Checkbox
              onChange={(e) => setShowPark(e.target.checked)}
              checked={showPark}
              className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
            >
              {park.name} (Park)
            </Checkbox>
          )}
          {zones && zones.length > 0 && (
            <Checkbox
              onChange={(e) => setShowZones(e.target.checked)}
              checked={showZones}
              className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
            >
              Zones
            </Checkbox>
          )}
          {parkDecarbAreas && parkDecarbAreas.length > 0 && (
            <Checkbox
              onChange={(e) => setShowParkDecarbAreas(e.target.checked)}
              checked={showParkDecarbAreas}
              className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
            >
              Other Decarbonization Areas
            </Checkbox>
          )}
          {occurrences && (
            <Checkbox
              onChange={(e) => setShowOccurrences(e.target.checked)}
              checked={showOccurrences}
              className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
            >
              Occurrences
            </Checkbox>
          )}
        </Space>
      </Card>
      <div
        style={{
          height: '60vh',
          position: 'relative',
        }}
        className="rounded-xl overflow-hidden"
      >
        <MapContainer
          center={[1.287953, 103.851784]}
          zoom={11}
          className="leaflet-mapview-container"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            // var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            //   maxZoom: 19,
            //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            // });
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {showPark && (
            <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.5 }} polygonLabel={park?.name} color="transparent" />
          )}
          <PolygonFitBounds geom={decarbonizationAreaGeom} polygonFields={{ fillOpacity: 0.9 }} polygonLabel={decarbonizationArea?.name} />

          {showParkDecarbAreas &&
            parkDecarbAreas?.map((area) => (
              <PolygonWithLabel
                key={area.id}
                entityId={area.id}
                geom={parseGeom(area.geom)}
                polygonLabel={area.name}
                color="green"
                fillColor={'transparent'}
                labelFields={{ color: 'green', textShadow: 'none' }}
              />
            ))}
          {showZones &&
            zones &&
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
              />
            ))}
        </MapContainer>

        {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.LANDSCAPE_ARCHITECT) && (
          <div className="absolute top-4 right-3 z-[1000]">
            <Tooltip title="Edit Boundaries">
              <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`/decarbonization-area/${decarbonizationArea.id}/edit-map`)}>
                Edit
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </>
  );
};

export default MapTab;
