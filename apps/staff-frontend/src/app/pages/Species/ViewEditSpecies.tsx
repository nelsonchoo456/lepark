import { useEffect, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import 'leaflet/dist/leaflet.css';
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ContentWrapper, SIDEBAR_WIDTH } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
//species form
import React from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  Space,
  Checkbox,
  InputNumber,
  Slider,
  Alert,
  Result

} from 'antd';
import type { GetProp } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { phylums, regions, lightType, soilType, conservationStatus, plantCharacteristics, convertLightType, convertSoilType, convertConservationStatus } from '@lepark/data-utility';
import { getSpeciesById, updateSpecies } from '@lepark/data-access';
import PageHeader from '../../components/main/PageHeader';

const ViewEditSpecies = () => {
  const [webMode, setWebMode] = useState<boolean>(
    window.innerWidth >= SCREEN_LG,
  );
  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [savedSpeciesName, setSavedSpeciesName] = useState('');
  const [speciesObj, setSpeciesObj] = useState<Species>(null);
  const [speciesId, setSpeciesId] = useState<string>('');
  const location = useLocation();
  const speciesIdFromLocation = location.state?.speciesId;

  const setId = (id: string) => {
    setSpeciesId(id);
  };

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  // Species form
//fetch species by id
  useEffect(() => {
    if (speciesIdFromLocation) {
      setId(speciesIdFromLocation);
      const fetchSingleSpeciesById = async () => {
        try {
          const species = await getSpeciesById(speciesIdFromLocation);
          setSpeciesObj(species.data);
          form.setFieldsValue(species.data);

          console.log(`fetched species id ${speciesIdFromLocation}`, species.data);
        } catch (error) {
          console.error('Error fetching species:', error);
        }
      };
      fetchSingleSpeciesById();
    } else {
      console.error('No species ID provided');
    }
  }, [speciesIdFromLocation, form]);

  useEffect(() => {
    if (speciesObj) {
      const characteristics = [
        speciesObj.isSlowGrowing && 'slowGrowing',
        speciesObj.isEdible && 'edible',
        speciesObj.isToxic && 'toxic',
        speciesObj.isEvergreen && 'evergreen',
        speciesObj.isFragrant && 'fragrant',
        speciesObj.isDroughtTolerant && 'droughtTolerant',
        speciesObj.isFlowering && 'flowering',
        speciesObj.isDeciduous && 'deciduous',
        speciesObj.isFastGrowing && 'fastGrowing',
      ].filter(Boolean);

      form.setFieldsValue({
        plantCharacteristics: characteristics
      });
    }
  }, [speciesObj, form]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };




  const { TextArea } = Input;
  const [value, setValue] = useState('');
  const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = (
    checkedValues,
  ) => {
    console.log('checked = ', checkedValues);
  };

   const onFinish = async (values: any) => {

    try {
        const speciesData = {
      phylum: values.phylum,                class: values.class,               order: values.order,             family: values.family,           genus: values.genus,
      speciesName: values.speciesName,          commonName: values.commonName,     speciesDescription: values.speciesDescription,                    conservationStatus: convertConservationStatus(values.conservationStatus),
      originCountry: values.originCountry,  lightType: convertLightType(values.lightType),                      soilType: convertSoilType(values.soilType),
      fertiliserType: values.fertiliserType,images: [],                        waterRequirement: values.waterRequirement,
      fertiliserRequirement: values.fertiliserRequirement,                     idealHumidity: values.idealHumidity,
      minTemp: values.minTemp,              maxTemp: values.maxTemp,           idealTemp: values.idealTemp,
      isSlowGrowing: values.plantCharacteristics?.includes('slowGrowing') || false,
      isEdible: values.plantCharacteristics?.includes('edible') || false,
      isToxic: values.plantCharacteristics?.includes('toxic') || false,
      isEvergreen: values.plantCharacteristics?.includes('evergreen') || false,
      isFragrant: values.plantCharacteristics?.includes('fragrant') || false,
      isDroughtTolerant: values.plantCharacteristics?.includes('droughtTolerant') || false,
      isDeciduous: values.plantCharacteristics?.includes('deciduous') || false,
      isFastGrowing: values.plantCharacteristics?.includes('fastGrowing') || false,
    };
    console.log('Species data to be submitted:', speciesData);  // For debugging

      if (values.minTemp > values.ideaTemp || values.maxTemp < values.idealTemp) {
        console.error('Ideal temperature must be between min and max temperatures');
        Modal.error({
          title: 'Error',
          content: 'Ideal temperature must be between min and max temperatures',
        });
        return;
      }
      console.log('Species data to be submitted:', speciesData);  // For debugging
      setSavedSpeciesName(values.speciesName);
      setIsSubmitting(true);
      const response = await updateSpecies(speciesId,speciesData);
      console.log('Species saved', response.data);
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (error) {
      console.error('Error saving species:', error);
    }
  };

if (!webMode) {
    return (
    <div
      className="h-[calc(100vh-2rem)] w-screen p-4" // page wrapper - padding
    >
      {/* <h1 className="header-1 mb-4">Species Mobile Mode</h1> */}
      <PageHeader>Create Species (Mobile)</PageHeader>
      {/* Add your mobile content here */}
    </div>);
}
  return (
    // <div className={`h-screen w-[calc(100vw-var(--sidebar-width))] overflow-auto z-[1]`}>
    <ContentWrapper>

      <PageHeader>Edit Species</PageHeader>

        {!isSubmitting && <Form
          {...layout}
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          className="max-w-[600px] mx-auto"
          disabled={isSubmitting}
        >
          <Form.Item name="phylum" label="Phylum" rules={[{ required: true }]}>
            <Select
              placeholder="Select a phylum"
              allowClear
            >
              {phylums.map((phylum) => (
                <Select.Option key={phylum} value={phylum}>
                  {phylum}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="class"
            label="Class"
            rules={[{ required: true }]}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            name="order"
            label="Order"
            rules={[{ required: true }]}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            name="family"
            label="Family"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="genus"
            label="Genus"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="speciesName"
            label="Species"
            rules={[{ required: true }]}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            name="commonName"
            label="Common Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="speciesDescription"
            label="Species Description"
            rules={[{ required: true }]}
          >
            <TextArea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Share more details!"
              autoSize={{ minRows: 3, maxRows: 5 }}


            />
          </Form.Item>

          <Form.Item
            name="originCountry"
            label="Region of Origin"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              style={{ width: 400 }}
              placeholder="Select a region"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {regions.map((region) => (
                <Select.Option key={region} value={region}>
                  {region}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="lightType"
            label="Light Type"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              style={{ width: 400 }}
              placeholder="Select a light type"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {lightType.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="soilType"
            label="Soil Type"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              style={{ width: 400 }}
              placeholder="Select a soil type"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {soilType.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="conservationStatus"
            label="Conservation Status"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              style={{ width: 400 }}
              placeholder="Select a conservation status"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {conservationStatus.map((status) => (
                <Select.Option key={status} value={status}>
                  {status}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="plantCharacteristics"
            label="Plant Characteristics"
            rules={[{ required: false }]}
            initialValue={[]} // Ensure it starts as an empty array
          >
            <Checkbox.Group>
              <Checkbox value="slowGrowing">Slow Growing</Checkbox>
              <Checkbox value="edible">Edible</Checkbox>
              <Checkbox value="toxic">Toxic</Checkbox>
              <Checkbox value="evergreen">Evergreen</Checkbox>
              <Checkbox value="fragrant">Fragrant</Checkbox>
              <Checkbox value="droughtTolerant">Drought Tolerant</Checkbox>
              <Checkbox value="deciduous">Deciduous</Checkbox>
              <Checkbox value="fastGrowing">Fast Growing</Checkbox>
            </Checkbox.Group>
          </Form.Item>


          <Form.Item
            name="waterRequirement"
            label="Water Requirement"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            name="fertiliserRequirement"
            label="Fertiliser Requirement"
            rules={[{ required: true }]}
          >
            <InputNumber
              onChange={(value) =>
                console.log('Fertiliser Requirement:', value)
              }
            />
          </Form.Item>
          <Form.Item
            name="fertiliserType"
            label="Fertiliser Type"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="idealHumidity"
            label="Ideal Humidity (%)"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={100}

            />
          </Form.Item>

     <Form.Item
            name="minTemp"
            label="Min Temp (C)"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={50}
              step={0.1}

              onChange={() => {
              form.validateFields(['minTemp']);
            }}
            />
          </Form.Item>

           <Form.Item
            name="maxTemp"
            label="Max Temp (C)"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={50}
              step={0.1}

              onChange={() => {
              form.validateFields(['maxTemp']);
            }}
            />
          </Form.Item>

          <Form.Item
            name="idealTemp"
            label="Ideal Temp (C)"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={50}
              step={0.1}

              onChange={() => {
              form.validateFields(['idealTemp']);
            }}
            />
          </Form.Item>



          <Form.Item {...tailLayout}>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Save
              </Button>

            </Space>
          </Form.Item>
        </Form> }
      {isSubmitting && (
         <Result
    status="success"
    title={`Successfully edited ${savedSpeciesName}!`}
  />
      )}

    </ContentWrapper>

  );
};

export default ViewEditSpecies;
