import { useAuth } from '@lepark/common-ui';
import { deleteOccurrence, getAllParks, getZonesByParkId, OccurrenceResponse, ParkResponse, StaffResponse, ZoneResponse } from '@lepark/data-access';
import { Button, Flex, message, Table, TableProps, Tag, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { FiArchive, FiEye } from 'react-icons/fi';
import { MdArrowOutward, MdClose, MdDeleteOutline, MdMap } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useFetchOccurrencesForSpecies } from '../../../hooks/Occurrences/useFetchOccurrencesForSpecies';
import { useFetchOccurrences } from '../../../hooks/Occurrences/useFetchOccurrences';
import { Input } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { SCREEN_LG } from '../../../config/breakpoints';
import { MapContainer, TileLayer } from 'react-leaflet';
import PictureMarker from '../../../components/map/PictureMarker';
import { PiPlantFill } from 'react-icons/pi';
import { COLORS } from '../../../config/colors';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import UserLiveLocationMap from '../../../components/map/userLocation/UserLiveLocation';

interface OccurrenceTableProps {
  speciesId: string;
  loading: boolean;
  excludeOccurrenceId?: string; // Optional prop to exclude a specific occurrence
  selectedPark?: { id: number; geom: any }; // Optional prop to filter occurrences by park
}

const OccurrenceTable: React.FC<OccurrenceTableProps> = ({ speciesId, excludeOccurrenceId, selectedPark }) => {
  const { occurrences, loading, triggerFetch } = useFetchOccurrences(selectedPark?.id);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [parks, setParks] = useState<ParkResponse[]>();
  const [zones, setZones] = useState<ZoneResponse[]>();
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'map' | 'details'>('details');
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (selectedPark) {
      fetchZones(selectedPark.id);
    } else {
      fetchParks();
    }
  }, [selectedPark]);

  const fetchZones = async (parkId: number) => {
    try {
      const zonesRes = await getZonesByParkId(parkId);
      if (zonesRes.status === 200) {
        setZones(zonesRes.data);
      }
    } catch (e) {
      setZones([]);
    }
  };

  const fetchParks = async () => {
    try {
      const parksRes = await getAllParks();
      if (parksRes.status === 200) {
        setParks(parksRes.data);
      }
    } catch (e) {
      setParks([]);
    }
  };

  const filteredOccurrences = useMemo(() => {
    return occurrences
      .filter((occurrence) => occurrence.speciesId === speciesId)
      .filter((occurrence) => occurrence.id !== excludeOccurrenceId) // Exclude the specified occurrence if provided
      .filter((occurrence) =>
        Object.values(occurrence).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())),
      );
  }, [searchQuery, occurrences, speciesId, excludeOccurrenceId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (occurrenceId: string) => {
    navigate(`/occurrence/${occurrenceId}`, { state: { fromDiscoverPerPark: !!selectedPark } });
  };

  const columns: TableProps<OccurrenceResponse>['columns'] = [
    {
      title: 'Occurrence Name',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text,
      sorter: (a, b) => {
        return a.title.localeCompare(b.title);
      },
      width: '25%',
    },
    selectedPark
      ? {
          title: 'Zone',
          dataIndex: 'zoneName',
          key: 'zoneName',
          render: (text, record) => (
            <Flex justify="space-between" align="center">
              {text}
            </Flex>
          ),
          sorter: (a, b) => {
            if (a.zoneName && b.zoneName) {
              return a.zoneName.localeCompare(b.zoneName);
            }
            return a.zoneId - b.zoneId;
          },
          width: '25%',
        }
      : {
          title: 'Park, Zone',
          render: (_, record) => (
            <div>
              <p className="font-semibold">{record.parkName}</p>
              <div className="flex">
                <p className="opacity-50 mr-2">Zone:</p>
                {record.zoneName}
              </div>
            </div>
          ),
          sorter: (a, b) => {
            if (a.parkName && b.parkName) {
              return a.parkName.localeCompare(b.parkName);
            }
            return a.zoneId - b.zoneId;
          },
          // width: '33%',
        },
    {
      title: 'Last Observed',
      dataIndex: 'dateObserved',
      key: 'dateObserved',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => {
        return moment(a.dateObserved).valueOf() - moment(b.dateObserved).valueOf();
      },
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="left" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
        </Flex>
      ),
      width: '10%',
    },
  ];

  const handleParkPolygonClick = (map: L.Map, geom: [number, number][], entityId: string | number) => {
    map.fitBounds(geom);
    // map.setZoom(SHOW_ZONES_ZOOM);
  };

  return (
    <>
      {contextHolder}
      <div className="flex flex-row-reverse gap-2">
        <span>
          <Button icon={<MdMap />} className="mb-3" type="primary" onClick={() => setView('map')}>
            View on Map
          </Button>
        </span>
        <Input suffix={<FiSearch />} placeholder="Search in Occurrences..." className="mb-4" variant="filled" onChange={handleSearch} />
      </div>
      <Table dataSource={filteredOccurrences} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }} />
      {view === 'map' &&
        (webMode ? (
          <div
            className="fixed top-0 left-0 w-full h-full bg-white z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
          >
            <MapContainer
              key="decarb-map-tab"
              center={[1.287953, 103.851784]}
              zoom={11}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <div
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '1rem',
                  zIndex: 400,
                }}
              >
                <Button onClick={() => setView('details')} icon={<MdClose />} shape="circle" type="primary" />
              </div>
              {parks?.map((park) => (
                <PolygonWithLabel
                  key={park.id}
                  entityId={park.id}
                  geom={park.geom}
                  polygonLabel={park.name}
                  image={park.images && park.images.length > 0 ? park.images[0] : ''}
                  color="transparent"
                  fillOpacity={0.6}
                />
              ))}
              {selectedPark && <PolygonFitBounds geom={selectedPark?.geom} polygonFields={{ fillOpacity: 0.4, opacity: 0 }} />}
              {zones?.map((zone) => (
                <PolygonWithLabel
                  entityId={zone.id}
                  geom={zone.geom}
                  color="transparent"
                  fillOpacity={0.5}
                  polygonLabel={zone.name}
                  labelFields={{ fontSize: '14px' }}
                  // handlePolygonClick={() => setHovered()}
                />
              ))}
              {filteredOccurrences.map((occurrence) => (
                <PictureMarker
                  id={occurrence.id}
                  entityType="OCCURRENCE"
                  circleWidth={30}
                  lat={occurrence.lat}
                  lng={occurrence.lng}
                  backgroundColor={COLORS.green[500]}
                  icon={<PiPlantFill className="text-green-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
                  tooltipLabel={occurrence.title}
                  // hovered={hovered}
                  // setHovered={() =>
                  //   setHovered({
                  //     ...occurrence,
                  //     image: occurrence.images ? occurrence.images[0] : null,
                  //     entityType: 'OCCURRENCE',
                  //     children: (
                  //       <div className="h-full w-full flex flex-col justify-between">
                  //         <div>
                  //           <p className="italic text-secondary">{occurrence.speciesName}</p>
                  //           <Tooltip title="View Zone details" placement="topLeft">
                  //             <p
                  //               className="text-green-600 cursor-pointer hover:text-green-900"
                  //               onClick={() => navigate(`/zone/${occurrence.zoneId}`)}
                  //             >
                  //               @ {occurrence.zoneName}
                  //             </p>
                  //           </Tooltip>
                  //         </div>
                  //         <div className="flex justify-end">
                  //           <Tooltip title="View Occurrence details">
                  //             <Button shape="circle" onClick={() => navigate(`/occurrences/${occurrence.id}`)}>
                  //               <MdArrowOutward />
                  //             </Button>
                  //           </Tooltip>
                  //         </div>
                  //       </div>
                  //     ),
                  //   })
                  // }
                />
              ))}
              <UserLiveLocationMap />
            </MapContainer>
          </div>
        ) : (
          <div
            className="fixed top-0 left-0 w-full h-full bg-white z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
          >
            <MapContainer
              key="decarb-map-tab"
              center={[1.287953, 103.851784]}
              zoom={11}
              style={{ width: '100%', height: '100%', top: '3rem' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <div
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '1rem',
                  zIndex: 400,
                }}
              >
                <Button onClick={() => setView('details')} icon={<MdClose />} shape="circle" type="primary" />
              </div>
              {parks?.map((park) => (
                <PolygonWithLabel
                  key={park.id}
                  entityId={park.id}
                  geom={park.geom}
                  polygonLabel={park.name}
                  image={park.images && park.images.length > 0 ? park.images[0] : ''}
                  color="transparent"
                  fillOpacity={0.6}
                />
              ))}
              {selectedPark && <PolygonFitBounds geom={selectedPark?.geom} polygonFields={{ fillOpacity: 0.4, opacity: 0 }} />}
              {zones?.map((zone) => (
                <PolygonWithLabel
                  entityId={zone.id}
                  geom={zone.geom}
                  color="transparent"
                  fillOpacity={0.5}
                  polygonLabel={zone.name}
                  labelFields={{ fontSize: '14px' }}
                  // handlePolygonClick={() => setHovered()}
                />
              ))}
              {filteredOccurrences.map((occurrence) => (
                <PictureMarker
                  id={occurrence.id}
                  entityType="OCCURRENCE"
                  circleWidth={30}
                  lat={occurrence.lat}
                  lng={occurrence.lng}
                  backgroundColor={COLORS.green[500]}
                  icon={<PiPlantFill className="text-green-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
                  tooltipLabel={occurrence.title}
                  // hovered={hovered}
                  // setHovered={() =>
                  //   setHovered({
                  //     ...occurrence,
                  //     image: occurrence.images ? occurrence.images[0] : null,
                  //     entityType: 'OCCURRENCE',
                  //     children: (
                  //       <div className="h-full w-full flex flex-col justify-between">
                  //         <div>
                  //           <p className="italic text-secondary">{occurrence.speciesName}</p>
                  //           <Tooltip title="View Zone details" placement="topLeft">
                  //             <p
                  //               className="text-green-600 cursor-pointer hover:text-green-900"
                  //               onClick={() => navigate(`/zone/${occurrence.zoneId}`)}
                  //             >
                  //               @ {occurrence.zoneName}
                  //             </p>
                  //           </Tooltip>
                  //         </div>
                  //         <div className="flex justify-end">
                  //           <Tooltip title="View Occurrence details">
                  //             <Button shape="circle" onClick={() => navigate(`/occurrences/${occurrence.id}`)}>
                  //               <MdArrowOutward />
                  //             </Button>
                  //           </Tooltip>
                  //         </div>
                  //       </div>
                  //     ),
                  //   })
                  // }
                />
              ))}
              <UserLiveLocationMap />
            </MapContainer>
          </div>
        ))}
    </>
  );
};

export default OccurrenceTable;
