import { useEffect, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import 'leaflet/dist/leaflet.css';
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ContentWrapper, SIDEBAR_WIDTH } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
//species form
import React from 'react';
import { Button, Form, Input, Select, Space, Checkbox, InputNumber, Slider, Alert, Modal } from 'antd';
import type { GetProp } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  phylums,
  regions,
  lightType,
  soilType,
  conservationStatus,
  plantCharacteristics,
  convertLightType,
  convertSoilType,
  convertConservationStatus,
} from '@lepark/data-utility';
import { createSpecies } from '@lepark/data-access';
import PageHeader from '../../components/main/PageHeader';
import { CreateSpeciesData } from 'libs/data-access/src/lib/types/species';

const CreateSpecies = () => {
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

  // Species form
  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [createdSpeciesName, setCreatedSpeciesName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  const [tempRange, setTempRange] = useState([0, 35]);

  const onFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      const plantCharacteristics = values.plantCharacteristics || [];
      const speciesData: CreateSpeciesData = {
        phylum: values.phylum,
        class: values.classInput,
        order: values.orderInput,
        family: values.familyInput,
        genus: values.genusInput,
        speciesName: values.speciesInput,
        commonName: values.commonNameInput,
        speciesDescription: values.speciesDescriptionInput,
        conservationStatus: values.conservationStatusInput,
        originCountry: values.regionOfOriginInput,
        lightType: values.lightTypeInput,
        soilType: values.soilTypeInput,
        fertiliserType: values.fertiliserType,
        images: [],
        waterRequirement: values.waterRequirement,
        fertiliserRequirement: values.fertiliserRequirement,
        idealHumidity: values.idealHumidity,
        minTemp: values.tempRange[0],
        maxTemp: values.tempRange[1],
        idealTemp: values.idealTemp,
        isSlowGrowing: plantCharacteristics.includes('slowGrowing'),
        isEdible: plantCharacteristics.includes('edible'),
        isToxic: plantCharacteristics.includes('toxic'),
        isEvergreen: plantCharacteristics.includes('evergreen'),
        isFragrant: plantCharacteristics.includes('fragrant'),
        isDroughtTolerant: plantCharacteristics.includes('droughtTolerant'),
        isDeciduous: plantCharacteristics.includes('deciduous'),
        isFastGrowing: plantCharacteristics.includes('fastGrowing'),
      };

      if (values.tempRange[0] > values.idealTemp || values.tempRange[1] < values.idealTemp) {
        console.error('Ideal temperature must be between min and max temperatures');
        Modal.error({
          title: 'Error',
          content: 'Ideal temperature must be between min and max temperatures',
        });
        return;
      }
      console.log('Species data to be submitted:', speciesData); // For debugging

      const response = await createSpecies(speciesData);
      console.log('Species created:', response.data);
      setCreatedSpeciesName(values.speciesInput);
      setShowSuccessAlert(true);
      form.resetFields();
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (error) {
      console.error('Error creating species:', error);
      // Handle error (e.g., show an error message)
    } finally {
      setIsSubmitting(false);
    }
  };
  const onReset = () => {
    form.resetFields();
  };
  const { TextArea } = Input;
  const [value, setValue] = useState('');
  const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = (checkedValues) => {
    console.log('checked = ', checkedValues);
  };

  //slider

  return webMode ? (
    // <div className={`h-screen w-[calc(100vw-var(--sidebar-width))] overflow-auto z-[1]`}>
    <ContentWrapper>
      {/* <h1 className="header-1 mb-4">Create Species</h1> */}
      <PageHeader>Create Species</PageHeader>

      {
        <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} disabled={isSubmitting} className="max-w-[600px] mx-auto">
          <Form.Item name="phylum" label="Phylum" rules={[{ required: true }]}>
            <Select placeholder="Select a phylum" allowClear>
              {phylums.map((phylum) => (
                <Select.Option key={phylum} value={phylum}>
                  {phylum}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="classInput" label="Class" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="orderInput" label="Order" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="familyInput" label="Family" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="genusInput" label="Genus" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="speciesInput" label="Species" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="commonNameInput" label="Common Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="speciesDescriptionInput" label="Species Description" rules={[{ required: true }]}>
            <TextArea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Share more details!"
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>

          <Form.Item name="regionOfOriginInput" label="Region of Origin" rules={[{ required: true }]}>
            <Select
              showSearch
              style={{ width: 400 }}
              placeholder="Select a region"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            >
              {regions.map((region) => (
                <Select.Option key={region} value={region}>
                  {region}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="lightTypeInput" label="Light Type" rules={[{ required: true }]}>
            <Select
              showSearch
              style={{ width: 400 }}
              placeholder="Select a light type"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            >
              {lightType.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="soilTypeInput" label="Soil Type" rules={[{ required: true }]}>
            <Select
              showSearch
              style={{ width: 400 }}
              placeholder="Select a soil type"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            >
              {soilType.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="conservationStatusInput" label="Conservation Status" rules={[{ required: true }]}>
            <Select
              showSearch
              style={{ width: 400 }}
              placeholder="Select a conservation status"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
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

          <Form.Item name="waterRequirement" label="Water Requirement" rules={[{ required: true }]}>
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item name="fertiliserRequirement" label="Fertiliser Requirement" rules={[{ required: true }]}>
            <InputNumber onChange={(value) => console.log('Fertiliser Requirement:', value)} />
          </Form.Item>
          <Form.Item name="fertiliserType" label="Fertiliser Type" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="idealHumidity" label="Ideal Humidity (%)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} />
          </Form.Item>
          <Form.Item name="tempRange" label="Min and Max Temp (C)" rules={[{ required: true }]}>
            <Slider
              range
              min={0}
              max={50}
              step={0.1}
              value={tempRange}
              onChange={(newValue) => {
                if (Array.isArray(newValue) && newValue.length === 2) {
                  setTempRange(newValue);
                  form.setFieldsValue({ tempRange: newValue });
                }
              }}
            />
          </Form.Item>

          <Form.Item name="idealTemp" label="Ideal Temp (C)" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              max={50}
              step={0.1}
              onChange={() => {
                form.validateFields(['idealTemp']);
              }}
            />
          </Form.Item>

          <Form.Item label="Temperature Values">
            <Space>
              <span>Min: {tempRange[0]}°C</span>
              <span>Max: {tempRange[1]}°C</span>
            </Space>
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Submit
              </Button>
              <Button htmlType="button" onClick={onReset}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      }
      {showSuccessAlert && (
        <Alert
          message={`Species "${createdSpeciesName}" created successfully`}
          type="success"
          closable
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
    </ContentWrapper>
  ) : (
    <div
      className="h-[calc(100vh-2rem)] w-screen p-4" // page wrapper - padding
    >
      {/* <h1 className="header-1 mb-4">Species Mobile Mode</h1> */}
      <PageHeader>Create Species (Mobile)</PageHeader>
      {/* Add your mobile content here */}
    </div>
  );
};

export default CreateSpecies;
