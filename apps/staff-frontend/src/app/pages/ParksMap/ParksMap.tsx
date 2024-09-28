// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useRef, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvent } from 'react-leaflet';
import { ContentWrapperDark, SIDEBAR_WIDTH, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import { Avatar, Button, Drawer, List, notification, Result, Select, Space, Table, Tooltip, Typography } from 'antd';
import { IoIosInformationCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { COLORS } from '../../config/colors';
import PolygonWithLabel from '../../components/map/PolygonWithLabel';
import { MdArrowOutward } from 'react-icons/md';
import PageHeader2 from '../../components/main/PageHeader2';
import { FiEye } from 'react-icons/fi';
import { TbEdit, TbTree } from 'react-icons/tb';
import ParkStatusTag from '../ParkDetails/components/ParkStatusTag';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import React from 'react';

const ParksMap = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks, restrictedParkId, loading, triggerFetch } = useFetchParks();
  const { zones } = useFetchZones();
  const navigate = useNavigate();
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const notificationShown = useRef(false);
  const [filteredParks, setFilteredParks] = useState<ParkResponse[]>([]);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string | null>();
  const [selectedParkId, setSelectedParkId] = useState<string | null>();

  // Map utilities
  const [zoomLevel, setZoomLevel] = useState(11);
  const SHOW_ZONES_ZOOM = 13;

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
    if (zoomLevel < SHOW_ZONES_ZOOM) {
      setSelectedParkId(null);
    }
  }, [zoomLevel]);

  const MapZoomListener = () => {
    const map = useMapEvent('zoomend', () => {
      setZoomLevel(map.getZoom());
    });
    return null;
  };

  const handleParkPolygonClick = (map: L.Map, geom: [number, number][], entityId: string | number) => {
    setSelectedParkId(entityId.toString());
    map.fitBounds(geom);
    // map.setZoom(SHOW_ZONES_ZOOM);
  };

  const breadcrumbItems = [
    {
      title: 'Parks Management',
      pathKey: '/park/map',
      isMain: true,
      isCurrent: true,
    },
  ];

  return webMode ? (
    <div
      style={{
        height: '100vh',
        width: `calc(100vw - ${SIDEBAR_WIDTH} - 300px)`,
        zIndex: 1,
      }}
    >
      <Drawer open={true} closable={false} width={300} key="maps" mask={false} styles={{ body: { padding: '1rem' } }}>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        {parks &&
          parks.map((park) => (
            <React.Fragment key={park.id}>
              <div className="border-b-[1px] border-black/10 py-4 px-2 hover:bg-green-400/10">
                <div className="flex justify-between gap-2 ">
                  <div className="flex-auto">
                    <span className="font-semibold text-wrap">{park.name}</span>
                  </div>
                </div>
                <div className="flex mt-2 justify-between">
                  <ParkStatusTag>{park.parkStatus}</ParkStatusTag>
                  <div className="flex gap-2">
                    <Tooltip title="Edit Boundaries">
                      <div className="">
                        <Button
                          icon={<TbEdit />}
                          shape="circle"
                          size="small"
                          onClick={() => navigate(`/park/${park.id}/edit-map`)}
                        ></Button>
                      </div>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <div className="">
                        <Button icon={<FiEye />} shape="circle" size="small" onClick={() => navigate(`/park/${park.id}`)}></Button>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
              {/* SUPERADMIN */}
              {user?.role === StaffType.SUPERADMIN && park.id.toString() === selectedParkId && (
                <div className="bg-green-800/10 px-4 pb-4 rounded">
                  <div className="font-semibold py-2 opacity-50">Zones</div>
                  <div className="h-full border-l-[3px] border-black/10 pl-4">
                    {zones.filter((zone) => zone?.parkId.toString() === selectedParkId).length === 0 ? (
                      <div className="py-2 opacity-50">No zones here.</div>
                    ) : (
                      zones
                        .filter((zone) => zone.parkId.toString() === selectedParkId)
                        .map((zone) => (
                          <div key={zone.id} className="border-b-[1px] border-black/10 py-2">
                            {zone.name}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* NON-SUPERADMIN */}
              {/* user?.role !== StaffType.SUPERADMIN && (
                <div className="bg-green-800/10 px-4 pb-4 rounded">
                <div className="font-semibold py-2 opacity-50">Zones</div>
                <div className="h-full border-l-[3px] border-black/10 pl-4">
                  {zones.length === 0 ? (
                    <div className="py-2 opacity-50">No zones here.</div>
                  ) : (
                    zones
                      .map((zone) => (
                        <div key={zone.id} className="border-b-[1px] border-black/10 py-2">
                          {zone.name}
                        </div>
                      ))
                  )}
                </div>
              </div>
              )
              */}
            </React.Fragment>
          ))}
      </Drawer>
      <MapContainer
        center={[1.287953, 103.851784]}
        zoom={11}
        className="leaflet-mapview-container"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          // url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          // url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
          // url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapZoomListener />

        {parks?.length > 0 &&
          parks.map((park) => (
            <PolygonWithLabel
              key={park.id}
              entityId={park.id}
              geom={park.geom}
              polygonLabel={park.name}
              image={park.images && park.images.length > 0 ? park.images[0] : ''}
              color="transparent"
              fillOpacity={0.8}
              handlePolygonClick={handleParkPolygonClick}
            />
          ))}

        {/* SUPERADMIN */}
        {user?.role === StaffType.SUPERADMIN &&
          // && zoomLevel >= SHOW_ZONES_ZOOM
          zones?.length > 0 &&
          zones
            .filter((zone) => zone.parkId.toString() === selectedParkId)
            .map((zone) => (
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

        {/* NON-SUPERADMIN */}
        {/* user?.role !== StaffType.SUPERADMIN && zoomLevel >= SHOW_ZONES_ZOOM &&
          zones?.length > 0 &&
          zones
            .map((zone) => (
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
            )) */}
      </MapContainer>
    </div>
  ) : (
    <div
      style={{
        paddingTop: '3rem',
        height: 'calc(100vh)',
        width: `100vw`,
      }}
    >
      <MapContainer
        center={[1.287953, 103.851784]}
        zoom={11}
        className="leaflet-mapview-container"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          // url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          // url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
          // url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapZoomListener />

        {parks?.length > 0 &&
          parks.map((park) => (
            <PolygonWithLabel
              key={park.id}
              entityId={park.id}
              geom={park.geom}
              polygonLabel={park.name}
              image={park.images && park.images.length > 0 ? park.images[0] : ''}
              color="transparent"
              fillOpacity={0.8}
              handlePolygonClick={handleParkPolygonClick}
            />
          ))}

        {/* SUPERADMIN */}
        {user?.role === StaffType.SUPERADMIN &&
          // && zoomLevel >= SHOW_ZONES_ZOOM
          zones?.length > 0 &&
          zones
            .filter((zone) => zone.parkId.toString() === selectedParkId)
            .map((zone) => (
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

        {/* NON-SUPERADMIN */}
        {/* user?.role !== StaffType.SUPERADMIN && zoomLevel >= SHOW_ZONES_ZOOM &&
          zones?.length > 0 &&
          zones
            .map((zone) => (
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
            )) */}
      </MapContainer>
    </div>
  );
};

export default ParksMap;
