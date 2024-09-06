import { SIDEBAR_WIDTH } from '@lepark/common-ui';
import { Button, DatePicker, Flex, Form, Input, InputNumber, Select, Space } from 'antd';
import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../../components/map/DraggableMarker';
import { AdjustLatLngInterface } from '../OccurenceCreate';
const { TextArea } = Input;

interface CreateMapStepProps {
  handleCurrStep: (step: number) => void;
  lat: number;
  lng: number;
  adjustLatLng: (props: AdjustLatLngInterface) => void;
}

const CreateMapStep = ({ handleCurrStep, adjustLatLng, lat, lng }: CreateMapStepProps) => {

  return (
    <>
      <div
        style={{
          height: '40vh',
          zIndex: 1,
        }}
        className='py-4 rounded overflow-hidden'
      >
        <MapContainer
          center={[1.287953, 103.851784]}
          zoom={11}
          className="leaflet-mapview-container"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng}/>
        </MapContainer>
      </div>

      <Flex className="w-full max-w-[600px] mx-auto pb-4" gap={10}>
        <div className="flex-1">Latitude: <Input value={lat}/></div>
        <div className="flex-1">Latitude: <Input value={lng}/></div>
      </Flex>
      <Flex className="w-full max-w-[600px] mx-auto" gap={10}>
        <Button type="default" className="w-full" onClick={() => handleCurrStep(0)}>
          Previous
        </Button>
        <Button type="primary" className="w-full" htmlType="submit">
          Submit
        </Button>
      </Flex>
    </>
  );
};

export default CreateMapStep;
