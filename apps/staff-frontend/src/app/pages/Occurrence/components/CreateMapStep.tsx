import { SIDEBAR_WIDTH } from '@lepark/common-ui';
import { Polygon, GeoJSON as PolygonGeoJson, useMap } from 'react-leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../../components/map/DraggableMarker';
import { AdjustLatLngInterface } from '../OccurrenceCreate';
import { ZoneResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { getCentroidOfGeom } from '../../../components/map/functions/functions';
import { COLORS } from '../../../config/colors';

interface CreateMapStepProps {
  handleCurrStep: (step: number) => void;
  lat: number;
  lng: number;
  formValues: any;
  adjustLatLng: (props: AdjustLatLngInterface) => void;
  zones: ZoneResponse[];
}

const CreateMapStep = ({ handleCurrStep, adjustLatLng, lat, lng, formValues, zones }: CreateMapStepProps) => {
  const [selectedZone, setSelectedZone] = useState<ZoneResponse>();

  useEffect(() => {
    if (zones?.length > 0 && formValues && formValues.zoneId) {
      const selectedZone = zones.find((z) => z.id === formValues.zoneId);
      setSelectedZone(selectedZone);
    }
  }, [zones, formValues.zoneId]);

  return (
    <>
      <div className='mt-4'>
        <div className='font-semibold'>Instructions: 
        </div> Drag the Marker around within the boundaries of your selected Zone.
      </div>
      <div
        style={{
          height: '45vh',
          zIndex: 1,
        }}
        className="py-4 rounded overflow-hidden"
      >
        <MapContainer
          center={[1.287953, 103.851784]}
          zoom={11}
          className="leaflet-mapview-container"
          style={{ height: '100%', width: '100%' }}
        >
          {/* {selectedZone?.geom?.coordinates && selectedZone.geom.coordinates.length > 0 && (
            <Polygon
              positions={selectedZone?.geom.coordinates[0].map((item: number[]) => [item[1], item[0]])}
              pathOptions={{ color: 'transparent', fillColor: '#006400' }}
            />
          )} */}
          
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <PolygonFitBounds geom={selectedZone?.geom} adjustLatLng={adjustLatLng} lat={lat} lng={lng} polygonLabel={selectedZone?.name}/>
          <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} backgroundColor={COLORS.sky[400]} />
        </MapContainer>
      </div>
      {selectedZone?.geom?.coordinates && selectedZone?.geom.coordinates.length > 0 && 
        <div className='font-semibold mb-4 text-[#006400]'>Displaying Zone: {selectedZone.name}</div>}
    </>
  );
};

export default CreateMapStep;
