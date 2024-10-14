import { Descriptions } from 'antd';
import { SpeciesResponse, ConservationStatusEnum, LightTypeEnum, SoilTypeEnum } from '@lepark/data-access';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const InformationTab = ({ species }: { species: SpeciesResponse }) => {
  const formatBoolean = (value: boolean) =>
    value ? <AiOutlineCheck className="text-green-500" /> : <AiOutlineClose className="text-red-500" />;

  return (
    <div>
      <Descriptions bordered column={1} size="middle" labelStyle={{ width: '40%' }} contentStyle={{ width: '60%' }}>
        <Descriptions.Item label="Description">{species.speciesDescription}</Descriptions.Item>
        <Descriptions.Item label="Light Type">{formatEnumLabelToRemoveUnderscores(species.lightType)}</Descriptions.Item>
        <Descriptions.Item label="Soil Type">{formatEnumLabelToRemoveUnderscores(species.soilType)}</Descriptions.Item>
        <Descriptions.Item label="Fertiliser Type">{formatEnumLabelToRemoveUnderscores(species.fertiliserType)}</Descriptions.Item>
        <Descriptions.Item label="Fertiliser Requirement">{species.fertiliserRequirement}</Descriptions.Item>
        <Descriptions.Item label="Soil Moisture">{species.soilMoisture}%</Descriptions.Item>
        <Descriptions.Item label="Ideal Humidity">{species.idealHumidity}%</Descriptions.Item>
        <Descriptions.Item label="Minimum Temperature">{species.minTemp}°C</Descriptions.Item>
        <Descriptions.Item label="Maximum Temperature">{species.maxTemp}°C</Descriptions.Item>
        <Descriptions.Item label="Ideal Temperature">{species.idealTemp}°C</Descriptions.Item>
        <Descriptions.Item label="Drought Tolerant">{formatBoolean(species.isDroughtTolerant)}</Descriptions.Item>
        <Descriptions.Item label="Fast Growing">{formatBoolean(species.isFastGrowing)}</Descriptions.Item>
        <Descriptions.Item label="Slow Growing">{formatBoolean(species.isSlowGrowing)}</Descriptions.Item>
        <Descriptions.Item label="Edible">{formatBoolean(species.isEdible)}</Descriptions.Item>
        <Descriptions.Item label="Deciduous">{formatBoolean(species.isDeciduous)}</Descriptions.Item>
        <Descriptions.Item label="Evergreen">{formatBoolean(species.isEvergreen)}</Descriptions.Item>
        <Descriptions.Item label="Toxic">{formatBoolean(species.isToxic)}</Descriptions.Item>
        <Descriptions.Item label="Fragrant">{formatBoolean(species.isFragrant)}</Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default InformationTab;
