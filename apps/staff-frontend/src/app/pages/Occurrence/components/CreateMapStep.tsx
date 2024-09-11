import { SIDEBAR_WIDTH } from '@lepark/common-ui';
import { FeatureGroup, Polygon, Polyline, GeoJSON as PolygonGeoJson } from 'react-leaflet';
import { Button, DatePicker, Flex, Form, Input, InputNumber, Select, Space } from 'antd';
import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../../components/map/DraggableMarker';
import { AdjustLatLngInterface } from '../OccurrenceCreate';
import { ZoneResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
const { TextArea } = Input;

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
      const selectedZone = zones.find(z =>  z.id === formValues.zoneId);
      setSelectedZone(selectedZone);
    }  
  }, [zones])
  
  return (
    // <>
    <div
      style={{
        height: '40vh',
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
        <Polygon positions={selectedZone?.geom.coordinates[0].map((item: number[]) => [item[1], item[0]] )}/>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} />
      </MapContainer>
    </div>
    // </>
  );
};

export default CreateMapStep;
