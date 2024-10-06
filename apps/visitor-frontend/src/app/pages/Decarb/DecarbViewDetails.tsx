import { LogoText, useAuth } from '@lepark/common-ui';
import {
  getDecarbonizationAreaById,
  DecarbonizationAreaResponse,
  VisitorResponse,
  getParkById,
  ParkResponse,
  getOccurrencesByParkId,
  OccurrenceResponse
} from '@lepark/data-access';
import { Button, Carousel, Tabs, Typography, Tag, Divider } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import DecarbOccurrenceTab from './components/DecarbOccurrenceTab';
import { usePark } from '../../park-context/ParkContext';
import { PiPlantFill } from 'react-icons/pi';
import { FiInfo } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import { GeomType } from '../../components/map/interfaces/interfaces';
import { useFetchOccurrencesForDecarbArea } from '../../hooks/Decarb/useFetchOccurrrencesForDecarbArea';
import PictureMarker from './components/PictureMarker';
import { COLORS } from '../../config/colors';

const DecarbViewDetails = () => {
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




  const parseGeom = (geomString: string | undefined): GeomType | undefined => {
    if (!geomString) return undefined;

    // Extract coordinates from the geom string
    const coordsMatch = geomString.match(/POLYGON\(\((.*?)\)\)/);
    if (!coordsMatch) return undefined;

    // Parse coordinates into an array of [longitude, latitude] pairs
    const coords = coordsMatch[1].split(',').map(pair =>
      pair.trim().split(' ').map(Number)
    );

    return {
      coordinates: [coords]
    };
  };

  const parsedGeom = parseGeom(decarbArea?.geom);

 const calculateAreaFromGeom = (geomString: string | undefined): number => {
    if (!geomString) return 0;

    // Extract coordinates from the geom string
    const coordsMatch = geomString.match(/POLYGON\(\((.*?)\)\)/);
    if (!coordsMatch) return 0;

    // Parse coordinates into an array of [latitude, longitude] pairs
    const coords = coordsMatch[1].split(',').map(pair =>
      pair.trim().split(' ').map(Number).reverse()
    );

    // Function to calculate distance between two points using Haversine formula
    const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Calculate area using shoelace formula
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      const [lat1, lon1] = coords[i];
      const [lat2, lon2] = coords[j];
      area += (lon2 - lon1) * (2 + Math.sin(lat1 * Math.PI / 180) + Math.sin(lat2 * Math.PI / 180));
    }
    area = Math.abs(area * 6378137 * 6378137 / 4);

    return area;
  };

  const areaSize = decarbArea?.geom ? calculateAreaFromGeom(decarbArea.geom) : 0;


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
          <Divider>
            <LogoText className="text-lg font-bold md:font-semibold md:py-2 md:m-0 mb-2">Decarbonization Area Details</LogoText>
          </Divider>
          <Typography.Paragraph>
            <strong>Park:</strong> {park?.name}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Area Size:</strong> {areaSize.toFixed(0)} m²
          </Typography.Paragraph>
          <div className="flex-[1] bg-green-50 h-72 rounded-xl overflow-hidden md:h-96">
              <MapContainer
                key="park-map-tab"
                center={[1.287953, 103.851784]}
                zoom={11}
                className="leaflet-mapview-container h-full w-full"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {parsedGeom && (
                <PolygonFitBounds geom={parsedGeom} polygonFields={{ fillOpacity: 0.5 }} polygonLabel={decarbArea?.name} color="transparent" />
                )}
              </MapContainer>
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
          <div className="h-96 md:h-[16rem] bg-green-100 flex items-center justify-center">
            {!park || !park.images || park.images.length === 0 ? (
              <PiPlantFill className="text-6xl text-green-500" />
            ) : (
              <Carousel>
                <div>
                  <img src={park.images[0]} alt={park?.name || 'Park image'} />
                </div>
              </Carousel>
            )}
          </div>
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

export default DecarbViewDetails;
