import { Input, Space } from 'antd';
import { MapContainer, Polygon, TileLayer } from 'react-leaflet';
import MapFeatureManager from '../../../components/map/MapFeatureManager';
import { useEffect, useState } from 'react';
import { getZonesByParkId, ParkResponse, ZoneResponse } from '@lepark/data-access';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { COLORS } from '../../../config/colors';
import node_image from '../../../assets/mapFeatureManager/line.png';
import polygon_image from '../../../assets/mapFeatureManager/polygon.png';
import edit_image from '../../../assets/mapFeatureManager/edit.png';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { TbTree } from 'react-icons/tb';

interface CreateMapStepProps {
  handleCurrStep: (step: number) => void;
  polygon: any[]
  setPolygon: (item: any[]) => void;
  lines: any[]
  setLines: (item: any[]) => void;
  formValues: any;
  parks: ParkResponse[];
}

const CreateMapStep = ({ handleCurrStep, polygon, setPolygon, lines, setLines, formValues, parks }: CreateMapStepProps) => {
  const [selectedPark, setSelectedPark] = useState<ParkResponse>();
  const [selectedParkZones, setSelectedParkZones] = useState<ZoneResponse[]>();

  useEffect(() => {
    if (parks?.length > 0 && formValues && formValues.parkId) {
      const selectedPark = parks.find((z) => z.id === formValues.parkId);
      setSelectedPark(selectedPark);

      const fetchZones = async () => {
        const zonesRes = await getZonesByParkId(formValues.parkId);
        if (zonesRes.status === 200) {
          const zonesData = zonesRes.data;
          setSelectedParkZones(zonesData);
        }
      }
      fetchZones();
    }
  }, [parks, formValues.parkId]);

  return (
    <>
      <div className='mt-4'>
        <div className='font-semibold'>Instructions: </div>
        <Space><img src={node_image} alt="node" height={"16px"} width={"16px"}/> - Draw Paths with the line tool</Space><br/>
        <Space><img src={polygon_image} alt="node" height={"16px"} width={"16px"}/> - Draw Boundaries with the polygon tool</Space><br/>
        <Space><img src={edit_image} alt="polygon-edit" height={"16px"} width={"16px"}/> - Edit Paths and Boundaries</Space>
      </div>
      <div
        style={{
          height: '60vh',
          zIndex: 1,
        }}
        className='my-4 rounded overflow-hidden'
      >
        <MapContainer
          center={[1.287953, 103.851784]}
          zoom={11}
          className="leaflet-mapview-container"
          style={{ height: '60vh', width: '100%' }}
          key="zone-create"
        > 
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapFeatureManager polygon={polygon} setPolygon={setPolygon} lines={lines} setLines={setLines}/>
          <PolygonFitBounds geom={selectedPark?.geom} polygonLabel={selectedPark?.name}/>
          {selectedParkZones && selectedParkZones?.length > 0 &&
          selectedParkZones
            .map((zone) => (
              <PolygonWithLabel key={zone.id} entityId={zone.id} geom={zone.geom} polygonLabel={<div className='flex items-center gap-2'><TbTree className='text-xl'/>{zone.name}</div>} color={COLORS.green[600]} fillColor={"transparent"} labelFields={{ color: COLORS.green[800], textShadow: "none" }}/>
            ))}
        </MapContainer>
      </div>
    </>
  );
};

export default CreateMapStep;
