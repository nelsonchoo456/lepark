import { Button, Card, Checkbox, Input, Space, message } from 'antd';
import { MapContainer, TileLayer } from 'react-leaflet';
import MapFeatureManager from '../../../components/map/MapFeatureManager';
import { useEffect, useState } from 'react';
import {
  getDecarbonizationAreasByParkId,
  ParkResponse,
  DecarbonizationAreaResponse,
  createDecarbonizationArea,
  OccurrenceResponse,
  getOccurrencesByParkId,
  getZonesByParkId,
  ZoneResponse,
  StaffResponse,
} from '@lepark/data-access';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { COLORS } from '../../../config/colors';
import node_image from '../../../assets/mapFeatureManager/line.png';
import polygon_image from '../../../assets/mapFeatureManager/polygon.png';
import edit_image from '../../../assets/mapFeatureManager/edit.png';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { TbTree } from 'react-icons/tb';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon, polygonHasOverlap, polygonIsWithin } from '../../../components/map/functions/functions';
import { useNavigate } from 'react-router-dom';
import PictureMarker from '../../../components/map/PictureMarker';
import { PiPlantFill } from 'react-icons/pi';
import { useAuth } from '@lepark/common-ui';

interface CreateMapStepProps {
  handleCurrStep: (step: number) => void;
  polygon: any[];
  setPolygon: (item: any[]) => void;
  lines: any[];
  setLines: (item: any[]) => void;
  formValues: any;
  parks: ParkResponse[];
}

const parseGeom = (geom: string) => {
  //console.log('Parsing geom:', geom); // Log the geom string

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

const CreateMapStep = ({ handleCurrStep, polygon, setPolygon, lines, setLines, formValues, parks }: CreateMapStepProps) => {
  const [selectedPark, setSelectedPark] = useState<ParkResponse>();
  const [parkDecarbAreas, setParkDecarbAreas] = useState<DecarbonizationAreaResponse[]>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>();
  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [zones, setZones] = useState<ZoneResponse[]>();
  const [showZones, setShowZones] = useState<boolean>(false);

  useEffect(() => {
    console.log('Parks:', parks);
    console.log('Form Values:', formValues);
    if (parks?.length > 0 && formValues && formValues.parkId) {
      const selectedPark = parks.find((z) => z.id === formValues.parkId);
      setSelectedPark(selectedPark);
      const fetchDecarbAreas = async () => {
        const decarbAreasRes = await getDecarbonizationAreasByParkId(formValues.parkId);
        if (decarbAreasRes.status === 200) {
          const decarbAreasData = decarbAreasRes.data;
          setParkDecarbAreas(decarbAreasData);
        }
      };

      fetchDecarbAreas();
    } else {
      setSelectedPark(parks[0]);
      if (selectedPark) {
        const fetchDecarbAreas = async () => {
          const decarbAreasRes = await getDecarbonizationAreasByParkId(selectedPark.id);
          if (decarbAreasRes.status === 200) {
            const decarbAreasData = decarbAreasRes.data;
            setParkDecarbAreas(decarbAreasData);
          }
        };

        fetchDecarbAreas();
      }
    }
  }, [parks, formValues.parkId]);

  useEffect(() => {
    if (selectedPark?.id) {
      fetchOccurrencesData();
      fetchZones();
    }
  }, [selectedPark]);

  const fetchOccurrencesData = async () => {
    if (!selectedPark?.id) {
      return;
    }
    try {
      const occurrencesRes = await getOccurrencesByParkId(selectedPark.id);
      if (occurrencesRes.status === 200) {
        const occurrencesData = occurrencesRes.data;
        setOccurrences(occurrencesData);
        console.log('Occurrences:', occurrencesData);
      }
    } catch (error) {
      // do nothing
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    if (!selectedPark?.id) {
      return;
    }
    const zonesRes = await getZonesByParkId(selectedPark.id);
    if (zonesRes.status === 200) {
      const zonesData = zonesRes.data;
      setZones(zonesData);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!polygon || !(polygon.length > 0) || !polygon[0][0]) {
        throw new Error('Please draw Decarbonization Area boundaries on the map.');
      }

      const finalData = {
        ...formValues,
        parkId: formValues.parkId, // Use the parkId from the form
      };

      if (polygon && polygon[0] && polygon[0][0]) {
        const polygonData = latLngArrayToPolygon(polygon[0][0]);
        finalData.geom = polygonData;
      }

      // Boundary validation
      const hasOverlap = polygonHasOverlap(
        polygon[0][0],
        parkDecarbAreas?.map((area) => parseGeom(area.geom).coordinates?.[0]),
      );
      const isWithinPark = polygonIsWithin(polygon[0][0], selectedPark?.geom?.coordinates?.[0]);
      if (hasOverlap) {
        messageApi.open({
          type: 'error',
          content: 'The Decarbonization Area boundaries overlap with other Decarbonization Area(s).',
        });
      }
      if (!isWithinPark) {
        messageApi.open({
          type: 'error',
          content: 'The Decarbonization Area boundaries are not within the Park.',
        });
      }
      if (hasOverlap || !isWithinPark) {
        return;
      }

      const response = await createDecarbonizationArea(finalData);
      if (response.status === 201) {
        messageApi.open({
          type: 'success',
          content: 'Decarbonization Area created successfully.',
        });
        navigate(`/decarbonization-area/${response.data.id}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: 'error',
          content: error.message,
        });
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred.',
        });
      }
    }
  };

  return (
    <>
      {contextHolder}
      <div className="mt-4">
        <div className="font-semibold">Instructions: </div>
        <Space>
          <img src={node_image} alt="node" height={'16px'} width={'16px'} /> - Draw Paths with the line tool
        </Space>
        <br />
        <Space>
          <img src={polygon_image} alt="node" height={'16px'} width={'16px'} /> - Draw Boundaries with the polygon tool
        </Space>
        <br />
        <Space>
          <img src={edit_image} alt="polygon-edit" height={'16px'} width={'16px'} /> - Edit Paths and Boundaries
        </Space>
      </div>
      <Card styles={{ body: { padding: 0 } }} className="px-4 py-3 mb-4 mt-2">
        <Space size={20}>
          <div className="font-semibold">Display:</div>
          {zones && zones.length > 0 && (
            <Checkbox
              onChange={(e) => setShowZones(e.target.checked)}
              checked={showZones}
              className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
            >
              Zones
            </Checkbox>
          )}
          {!loading && occurrences && (
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
          zIndex: 1,
        }}
        className="my-4 rounded overflow-hidden"
      >
        <MapContainer
          center={[1.287953, 103.851784]}
          zoom={11}
          className="leaflet-mapview-container"
          style={{ height: '60vh', width: '100%' }}
          key="decarb-create"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapFeatureManager polygon={polygon} setPolygon={setPolygon} lines={lines} setLines={setLines} />
          <PolygonFitBounds geom={selectedPark?.geom} polygonLabel={selectedPark?.name} />
          {parkDecarbAreas &&
            parkDecarbAreas.length > 0 &&
            parkDecarbAreas.map((area) => (
              <PolygonWithLabel
                key={area.id}
                entityId={area.id}
                geom={parseGeom(area.geom)}
                polygonLabel={
                  <div className="flex items-center gap-2">
                    {/* <TbTree className="text-xl" /> */}
                    {area.name}
                  </div>
                }
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
      </div>
      <div className="flex justify-center gap-2">
        <Button type="default" onClick={() => handleCurrStep(0)}>
          Previous
        </Button>
        <Button type="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </>
  );
};

export default CreateMapStep;
