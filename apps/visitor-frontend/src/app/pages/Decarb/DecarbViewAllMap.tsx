import { useAuth } from '@lepark/common-ui';
import { Button, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getDecarbonizationAreasByParkId,
  DecarbonizationAreaResponse,
  VisitorResponse,
  getOccurrencesWithinDecarbonizationArea,
} from '@lepark/data-access';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import withParkGuard from '../../park-context/withParkGuard';
import { MdInfoOutline, MdMap } from 'react-icons/md';
import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import { COLORS } from '../../config/colors';
import PolygonWithLabel from '../../components/map/PolygonWithLabel';
import { GeomType } from '../../components/map/interfaces/interfaces';

// Register the required Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const DecarbViewAllMap = () => {
  const navigate = useNavigate();
  const { user } = useAuth<VisitorResponse>();
  const { selectedPark } = usePark();
  const [loading, setLoading] = useState(false);
  const [fetchedAreas, setFetchedAreas] = useState<DecarbonizationAreaResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaDetails, setAreaDetails] = useState<{ [key: string]: { totalSequestration: number; occurrenceCount: number } }>({});

  useEffect(() => {
    const fetchDecarbAreas = async () => {
      setLoading(true);
      try {
        if (selectedPark) {
          const response = await getDecarbonizationAreasByParkId(selectedPark.id);
          setFetchedAreas(response.data);

          // Fetch details for each area
          const details = await Promise.all(
            response.data.map(async (area) => {
              const occurrences = await getOccurrencesWithinDecarbonizationArea(area.id);
              const totalSequestration = occurrences.data.reduce((sum: number, occ: any) => sum + occ.biomass, 0);
              return {
                id: area.id,
                totalSequestration,
                occurrenceCount: occurrences.data.length,
              };
            }),
          );
          const detailsObject = details.reduce<{ [key: string]: { totalSequestration: number; occurrenceCount: number } }>(
            (acc, detail) => {
              acc[detail.id] = {
                totalSequestration: detail.totalSequestration,
                occurrenceCount: detail.occurrenceCount,
              };
              return acc;
            },
            {},
          );

          setAreaDetails(detailsObject);
        }
      } catch (error) {
        console.error('Error fetching decarbonization areas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDecarbAreas();
  }, [selectedPark]);

  const navigateToDecarbArea = (areaId: string) => {
    navigate(`/decarb/${areaId}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const filteredAreas = useMemo(() => {
    if (loading) return [];
    return fetchedAreas.filter((area) => area.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [fetchedAreas, searchQuery, loading]);

  const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const donutChartData = {
    labels: filteredAreas.map((area) => area.name),
    datasets: [
      {
        data: filteredAreas.map((area) => areaDetails[area.id]?.totalSequestration || 0),
        backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
        hoverOffset: 4,
      },
    ],
  };

  const totalSequestration = donutChartData.datasets[0].data.reduce((a, b) => a + b, 0);

  const parseGeom = (geomString: string): GeomType => {
    if (typeof geomString === 'string' && geomString.startsWith('SRID=4326;')) {
      const wktString = geomString.substring(10);
      const match = wktString.match(/POLYGON\s*\(\(([^)]+)\)\)/);
      if (!match) {
        console.error(`Invalid WKT format: ${wktString}`);
        return {
          coordinates: []
        };
      }
      const coordinates = match[1].split(',').map((coord) => {
        const [lng, lat] = coord.trim().split(' ').map(Number);
        return [lng, lat];
      });
      return {
        coordinates: [coordinates]
      };
    }

    return {
      coordinates: []
    };
  };

  return (
    <div className="h-full bg-slate-100 flex flex-col overflow-hidden">
      <ParkHeader cardClassName="h-24 md:h-[160px] flex">
        <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
          <div className="flex-1 font-medium text-2xl md:text-3xl">
            Decarbonization Areas <br />
            <span className="text-sm md:text-md opacity-80">in {selectedPark?.name}</span>{' '}
            <Tooltip
              title="A Decarbonization Area is a group of plants (trees, shrubs) used to calculate carbon absorption based on their biomass. It tracks the overall carbon reduction impact of the area."
              trigger="click"
            >
              <span onClick={handleTooltipClick}>
                <MdInfoOutline className="inline-block text-white cursor-pointer md:text-md text-sm opacity-80" />
              </span>
            </Tooltip>
          </div>
        </div>
        <Tooltip title="Map View">
          <Button icon={<MdMap />} className="text-lg" type="primary"></Button>
        </Tooltip>
      </ParkHeader>
      <MapContainer key="decarb-map-tab" center={[1.287953, 103.851784]} zoom={11} className="leaflet-mapview-container h-full w-full">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <PolygonFitBounds geom={selectedPark?.geom} polygonFields={{ fillOpacity: 0.6, opacity: 0 }} />
        {fetchedAreas &&
            fetchedAreas.map((a) => (
              <PolygonWithLabel
                key={a.id}
                entityId={a.id}
                geom={parseGeom(a.geom)}
                polygonLabel={
                  <div className="flex items-center gap-2">
                    {a.name}
                  </div>
                }
                color={COLORS.green[600]}
                fillColor={'transparent'}
                labelFields={{ color: "white", outline: COLORS.green[700], textShadow: `-1px -1px 0 ${COLORS.green[600]}, 1px -1px 0 ${COLORS.green[600]}, -1px 1px 0 ${COLORS.green[600]}, 1px 1px 0 ${COLORS.green[600]}`, textWrap: "nowrap" }}
                handleMarkerClick={() => navigate(`/decarb/${a.id}`)}
                handlePolygonClick={() => navigate(`/decarb/${a.id}`)}
              />
            ))}
      </MapContainer>
    </div>
  );
};

export default withParkGuard(DecarbViewAllMap);
