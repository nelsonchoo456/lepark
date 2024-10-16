import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../../components/map/DraggableMarker';
import { AdjustLatLngInterface } from '../SensorAddToHub';
import { getZonesByParkId, HubResponse, ZoneResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { COLORS } from '../../../config/colors';
import { Button, Divider, Form, message, Select, Tooltip } from 'antd';
import PictureMarker from '../../../components/map/PictureMarker';
import { TbBuildingEstate } from 'react-icons/tb';
import { MdOutlineHub } from 'react-icons/md';

interface PlaceZoneMapStepProps {
  lat: number;
  lng: number;
  adjustLatLng: (props: AdjustLatLngInterface) => void;
  selectedZone?: ZoneResponse;
  hub?: HubResponse,
  setSelectedZone: (zone: any) => void;
}

const PlaceZoneMapStep = ({ adjustLatLng, lat, lng, hub, selectedZone, }: PlaceZoneMapStepProps) => {
  

  return (
    <>
      <div>
        <span className="mr-1 text-error">*</span>Drag the Marker around within the boundaries of your selected Zone.
      </div>

      {/* {!selectedZone &&
        <Tooltip title="Please select a Zone"><div className='bg-gray-900/40 flex w-full h-full absolute' style={{ zIndex: 1000 }}>jeke</div></Tooltip>
      } */}

      {!selectedZone ? (
        <div
          style={{
            height: '45vh',
            zIndex: 1,
          }}
          className="my-4 rounded overflow-hidden relative"
        >
          <Tooltip title="Please select a Hub">
            <div className="bg-gray-900/40 flex w-full h-full absolute" style={{ zIndex: 1000 }}>
            </div>
          </Tooltip>
          <MapContainer
            center={[1.287953, 103.851784]}
            zoom={11}
            className="leaflet-mapview-container"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </MapContainer>
        </div>
      ) : (
        <div
          style={{
            height: '45vh',
            zIndex: 1,
          }}
          className="my-4 rounded overflow-hidden"
        >
          <MapContainer
            center={[1.287953, 103.851784]}
            zoom={11}
            className="leaflet-mapview-container"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <PolygonFitBounds geom={selectedZone?.geom} adjustLatLng={adjustLatLng} lat={lat} lng={lng} polygonLabel={selectedZone?.name} />
            {hub && hub.lat && hub.long &&
              <PictureMarker
                id={hub.id}
                entityType="HUB"
                circleWidth={37}
                lat={hub.lat}
                lng={hub.long}
                tooltipLabel={hub.name}
                backgroundColor={COLORS.gray[600]}
                icon={<MdOutlineHub className="text-gray-500 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />}
              />
            }
            <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} backgroundColor={COLORS.sky[400]} />
          </MapContainer>
        </div>
      )}
      {selectedZone?.geom?.coordinates && selectedZone?.geom.coordinates.length > 0 && (
        <div className="font-semibold mb-4 text-[#006400]">Displaying Zone: {selectedZone.name}</div>
      )}
    </>
  );
};

export default PlaceZoneMapStep;
