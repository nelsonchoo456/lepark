import React, { useEffect, useState, useCallback } from 'react';
import { LogoText, useAuth } from '@lepark/common-ui';
import {
  getDecarbonizationAreaById,
  DecarbonizationAreaResponse,
  VisitorResponse,
  getParkById,
  ParkResponse,
  OccurrenceResponse
} from '@lepark/data-access';
import { Button, Carousel, Tabs, Typography, Tag, Divider, Checkbox, Space, Card } from 'antd';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import DecarbOccurrenceTab from './components/DecarbOccurrenceTab';
import { usePark } from '../../park-context/ParkContext';
import { PiPlantFill } from 'react-icons/pi';
import { FiInfo } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import { GeomType } from '../../components/map/interfaces/interfaces';
import { useFetchOccurrencesForDecarbArea } from '../../hooks/Decarb/useFetchOccurrrencesForDecarbArea';
import PictureMarker from './components/PictureMarker';
import { COLORS } from '../../config/colors';

const useMapEvents = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    console.log('Map created');

    const onZoomEnd = () => {
      console.log('Zoom ended');
    };

    map.on('zoomend', onZoomEnd);

    return () => {
      map.off('zoomend', onZoomEnd);
    };
  }, [map]);

  return map;
};

interface MapContentProps {
  parkGeom: GeomType | undefined;
  parsedGeom: GeomType | undefined;
  showOccurrences: boolean;
  occurrencesLoading: boolean;
  occurrences: OccurrenceResponse[] | null;
  park: ParkResponse | null;
  decarbArea: DecarbonizationAreaResponse | null;
}

const MapContent: React.FC<MapContentProps> = ({
  parkGeom,
  parsedGeom,
  showOccurrences,
  occurrencesLoading,
  occurrences,
  park,
  decarbArea
}) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      console.log('Map instance created');
      map.invalidateSize();
    }
  }, [map]);

  return (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {parkGeom && (
        <PolygonFitBounds
          geom={parkGeom}
          polygonFields={{ fillOpacity: 0.5 }}
          polygonLabel={park?.name}
          color="transparent"
        />
      )}
      {parsedGeom && (
        <PolygonFitBounds
          geom={parsedGeom}
          polygonFields={{ fillOpacity: 0.9 }}
          polygonLabel={decarbArea?.name}
        />
      )}
      {showOccurrences && !occurrencesLoading && occurrences && occurrences.map((occurrence) => (
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
    </>
  );
};

const DecarbViewDetails: React.FC = () => {
  const { decarbAreaId } = useParams<{ decarbAreaId: string }>();
  const [decarbArea, setDecarbArea] = useState<DecarbonizationAreaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth<VisitorResponse>();
  const { selectedPark } = usePark();
  const [park, setPark] = useState<ParkResponse | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const fromDiscoverPerPark = location.state?.fromDiscoverPerPark || false;
  const { occurrences, loading: occurrencesLoading } = useFetchOccurrencesForDecarbArea(decarbAreaId || '');
  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (decarbAreaId) {
        try {
          const decarbAreaResponse = await getDecarbonizationAreaById(decarbAreaId);
          setDecarbArea(decarbAreaResponse.data);
          if (decarbAreaResponse.data.parkId) {
            const parkResponse = await getParkById(Number(decarbAreaResponse.data.parkId));
            setPark(parkResponse.data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [decarbAreaId]);

  useEffect(() => {
    if (!occurrencesLoading && occurrences && occurrences.length > 0) {
      setShowOccurrences(true);
    }
  }, [occurrencesLoading, occurrences]);

  const parseGeom = useCallback((geomString: string | undefined): GeomType | undefined => {
    if (!geomString) return undefined;

    if (typeof geomString === 'string' && geomString.startsWith('SRID=4326;')) {
      const wktString = geomString.substring(10);
      const match = wktString.match(/POLYGON\s*\(\(([^)]+)\)\)/);
      if (!match) {
        console.error(`Invalid WKT format: ${wktString}`);
        return undefined;
      }
      const coordinates = match[1].split(',').map((coord) => {
        const [lng, lat] = coord.trim().split(' ').map(Number);
        return [lng, lat];
      });
      return {
        coordinates: [coordinates]
      };
    }

    try {
      return typeof geomString === 'string' ? JSON.parse(geomString) : geomString;
    } catch (error) {
      console.error(`Invalid GeoJSON format: ${geomString}`);
      return undefined;
    }
  }, []);

   const carouselSettings = {
    arrows: true,
  };

  const parsedGeom = parseGeom(decarbArea?.geom);
  const parkGeom = parseGeom(park?.geom);

  const calculateAreaFromGeom = useCallback((geomString: string | undefined): number => {
    if (!geomString) return 0;

    const coordsMatch = geomString.match(/POLYGON\(\((.*?)\)\)/);
    if (!coordsMatch) return 0;

    const coords = coordsMatch[1].split(',').map(pair =>
      pair.trim().split(' ').map(Number).reverse()
    );

    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      const [lat1, lon1] = coords[i];
      const [lat2, lon2] = coords[j];
      area += (lon2 - lon1) * (2 + Math.sin(lat1 * Math.PI / 180) + Math.sin(lat2 * Math.PI / 180));
    }
    area = Math.abs(area * 6378137 * 6378137 / 4);

    return area / 1000000; // Convert to square kilometers
  }, []);

  const areaSize = decarbArea?.geom ? calculateAreaFromGeom(decarbArea.geom) : 0;

  const renderMap = useCallback(() => (
  <MapContainer
    key="park-map-tab"
    center={[1.287953, 103.851784]}
    zoom={11}
    className="leaflet-mapview-container h-full w-full"
  >
    <MapContent
      parkGeom={parkGeom}
      parsedGeom={parsedGeom}
      showOccurrences={showOccurrences}
      occurrencesLoading={occurrencesLoading}
      occurrences={occurrences}
      park={park}
      decarbArea={decarbArea}
    />
  </MapContainer>
), [parkGeom, parsedGeom, showOccurrences, occurrencesLoading, occurrences, park, decarbArea]);
  const tabsItems = [
    {
      key: 'occurrences',
      label: (
        <div className="flex items-center">
          <PiPlantFill className="text-xl mr-2" />
          Occurrences
        </div>
      ),
      children: decarbArea ? (
        <DecarbOccurrenceTab
          decarbAreaId={decarbArea.id}
          loading={false}
          selectedPark={fromDiscoverPerPark && selectedPark ? selectedPark : undefined}
        />
      ) : (
        <p>Loading decarbonization area data...</p>
      ),
    },
    {
      key: 'information',
      label: (
        <div className="flex items-center">
          <FaLeaf className="text-xl mr-2" />
          Information
        </div>
      ),
      children: (
        <div className="px-4">
          <Typography.Paragraph>
            <strong>Located in:</strong> {park?.name}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Area Size:</strong> {areaSize.toFixed(4)} km²
          </Typography.Paragraph>
          <Card styles={{ body: { padding: 0 } }} className="px-4 py-3 mb-4">
            <Space size={20}>
              <div className="font-semibold">Display:</div>
              <Checkbox
                onChange={(e) => setShowOccurrences(e.target.checked)}
                checked={showOccurrences}
                disabled={occurrencesLoading || !occurrences || occurrences.length === 0}
              >
                Occurrences {occurrencesLoading ? '(Loading...)' :
                  (!occurrences || occurrences.length === 0) ? '(None available)' :
                  `(${occurrences.length})`}
              </Checkbox>
            </Space>
          </Card>
          <div className="flex-[1] bg-green-50 h-72 rounded-xl overflow-hidden md:h-96">
            {renderMap()}
          </div>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!decarbArea) {
    return <div>Decarbonization Area not found</div>;
  }

  return (
  <div className="md:h-screen md:overflow-y-scroll">
    <div className="w-full gap-4 md:h-full">
      <div className="bg-gray-200 rounded-b-3xl overflow-hidden md:rounded-none">
        {park && park.images && park.images.length > 0 ? (
          <Carousel {...carouselSettings}>
            {park.images.map((image, index) => (
              <div key={index}>
                <img
                  src={image}
                  alt={`Park ${index + 1}`}
                  style={{
                    width: '100%',
                    objectFit: 'cover',
                  }}
                  className="h-36 md:h-[16rem]"
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <div
            style={{
              width: '100%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            className="h-36 md:h-[16rem]"
          >
            <PiPlantFill className="text-6xl text-green-500" />
          </div>
        )}
      </div>
      <div className="py-4 md:p-0 md:pb-8 md:overflow-x-auto md:px-0">
        <div className="items-start px-4">
          <div className="">
            <div className="w-full md:flex">
              <div>
                <LogoText className="text-3xl font-bold md:font-semibold md:py-2 md:w-full">{decarbArea.name}</LogoText>
                <div className="w-10 h-[5px] bg-mustard-400 mb-4"></div>
              </div>
            </div>
            <Typography.Paragraph
              ellipsis={{
                rows: 3,
                expandable: true,
                symbol: 'more',
              }}
            >
              {decarbArea.description}
            </Typography.Paragraph>
            <div className='flex gap-2 items-center'>
            </div>
          </div>
        </div>
        <Tabs
          defaultActiveKey={'occurrences'}
          items={tabsItems}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="px-4" />}
        />
      </div>
    </div>
  </div>
);
};

export default React.memo(DecarbViewDetails);
