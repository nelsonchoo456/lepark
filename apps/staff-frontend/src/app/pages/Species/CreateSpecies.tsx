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
import { CreateSpeciesData, ConservationStatusEnum, LightTypeEnum, SoilTypeEnum } from '@lepark/data-access';
import { plantTaxonomy } from '@lepark/data-utility';

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
  const [formValues, setFormValues] = useState<any>({});
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
  const [tempRange, setTempRange] = useState([1, 1]);

  const [classes, setClasses] = useState<string[]>([]);
  const [orders, setOrders] = useState<string[]>([]);

  const onPhylumChange = (value: string) => {
    const selectedPhylum = plantTaxonomy[value as keyof typeof plantTaxonomy];
    setClasses(Object.keys(selectedPhylum).filter(key => key !== 'classes'));
    setOrders([]);
    form.setFieldsValue({ classInput: undefined, orderInput: undefined });
  };

  const onClassChange = (value: string) => {
    const selectedPhylum = plantTaxonomy[form.getFieldValue('phylum') as keyof typeof plantTaxonomy];
    const selectedClass = selectedPhylum[value as keyof typeof selectedPhylum] as { orders?: string[] };
    if (selectedClass && Array.isArray(selectedClass.orders)) {
      setOrders(selectedClass.orders);
    } else {
      setOrders([]);
    }
    form.setFieldsValue({ orderInput: undefined });
  };

  const onFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      console.log('Form values:', values);
      const plantCharacteristics = values.plantCharacteristics || [];
      const speciesData: CreateSpeciesData = {
        phylum: values.phylum as string,
        class: values.classInput as string,
        order: values.orderInput as string,
        family: values.familyInput as string,
        genus: values.genusInput as string,
        speciesName: values.speciesInput as string,
        commonName: values.commonNameInput as string,
        speciesDescription: values.speciesDescriptionInput as string,
        conservationStatus: values.conservationStatusInput as ConservationStatusEnum,
        originCountry: values.regionOfOriginInput as string,
        lightType: values.lightTypeInput as LightTypeEnum,
        soilType: values.soilTypeInput as SoilTypeEnum,
        fertiliserType: values.fertiliserType as string,
        images: [] as string[],
        waterRequirement: values.waterRequirement as number,
        fertiliserRequirement: values.fertiliserRequirement as number,
        idealHumidity: values.idealHumidity as number,
        minTemp: values.tempRange[0] as number,
        maxTemp: values.tempRange[1] as number,
        idealTemp: values.idealTemp as number,
        isDroughtTolerant: plantCharacteristics.includes('droughtTolerant') as boolean,
        isFastGrowing: plantCharacteristics.includes('fastGrowing') as boolean,
        isSlowGrowing: plantCharacteristics.includes('slowGrowing') as boolean,
        isEdible: plantCharacteristics.includes('edible') as boolean,
        isDeciduous: plantCharacteristics.includes('deciduous') as boolean,
        isEvergreen: plantCharacteristics.includes('evergreen') as boolean,
        isToxic: plantCharacteristics.includes('toxic') as boolean,
        isFragrant: plantCharacteristics.includes('fragrant') as boolean,
      };
      if (values.tempRange[0] == values.tempRange[1]) {
        console.error('Min and max temperatures cannot be the same');
        Modal.error({
          title: 'Error',
          content: 'Min and max temperatures cannot be the same',
        });
        return;
      }
      if (values.tempRange[0] > values.idealTemp || values.tempRange[1] < values.idealTemp) {
        console.error('Ideal temperature must be between min and max temperatures');
        Modal.error({
          title: 'Error',
          content: 'Ideal temperature must be between min and max temperatures',
        });
        return;
      }
      console.log(speciesData);
      console.log('Species data to be submitted:', JSON.stringify(speciesData)); // For debugging

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


  //slider

  return (
    // <div className={`h-screen w-[calc(100vw-var(--sidebar-width))] overflow-auto z-[1]`}>
    <ContentWrapper>
      {/* <h1 className="header-1 mb-4">Create Species</h1> */}
      <PageHeader>Create Species</PageHeader>

      {
        <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} disabled={isSubmitting} className="max-w-[600px] mx-auto">
          <Form.Item name="phylum" label="Phylum" rules={[{ required: true }]}>
            <Select onChange={onPhylumChange} placeholder="Select a phylum">
              {Object.keys(plantTaxonomy).map((phylum) => (
                <Select.Option key={phylum} value={phylum}>{phylum}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="classInput" label="Class" rules={[{ required: true }]}>
            <Select
              onChange={onClassChange}
              placeholder="Select a class"
              disabled={classes.length === 0}
            >
              {classes.map((classItem) => (
                <Select.Option key={classItem} value={classItem}>{classItem}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="orderInput" label="Order" rules={[{ required: true }]}>
            <Select
              placeholder="Select an order"
              disabled={!orders || orders.length === 0}
            >
              {orders && orders.length > 0 ? (
                orders.map((order) => (

                  <Select.Option key={order} value={order}>{order}</Select.Option>
                ))
              ) : (
                <Select.Option value="" disabled>No orders available</Select.Option>
              )}
            </Select>
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
                  {type === 'FULL_SUN' ? 'Full Sun' :
                   type === 'PARTIAL_SHADE' ? 'Partial Shade' :
                   type === 'FULL_SHADE' ? 'Full Shade' :
                   type}
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
                  {type === 'SANDY' ? 'Sandy' :
                   type === 'CLAYEY' ? 'Clayey' :
                   type === 'LOAMY' ? 'Loamy' :
                   type}
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
                  {status === 'NEAR_THREATENED' ? 'Near Threatened' :
                   status === 'LEAST_CONCERN' ? 'Least Concern' :
                   status === 'VULNERABLE' ? 'Vulnerable' :
                   status === 'ENDANGERED' ? 'Endangered' :
                   status === 'CRITICALLY_ENDANGERED' ? 'Critically Endangered' :
                   status === 'EXTINCT_IN_THE_WILD' ? 'Extinct in the Wild' :
                   status === 'EXTINCT' ? 'Extinct' :
                   status}

                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="plantCharacteristics"
            label="Plant Characteristics"
            rules={[{ required: false }]}
            initialValue={[]}
          >
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Select plant characteristics"
              options={[
                { value: 'slowGrowing', label: 'Slow Growing' },
                { value: 'edible', label: 'Edible' },
                { value: 'toxic', label: 'Toxic' },
                { value: 'evergreen', label: 'Evergreen' },
                { value: 'fragrant', label: 'Fragrant' },
                { value: 'droughtTolerant', label: 'Drought Tolerant' },
                { value: 'deciduous', label: 'Deciduous' },
                { value: 'fastGrowing', label: 'Fast Growing' },
              ]}
              optionFilterProp="label"
            />
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
            <InputNumber min={1} max={100} />
          </Form.Item>
          <Form.Item name="tempRange" label="Min and Max Temp (C)" rules={[{ required: true }]}>
            <Slider
              range
              min={1}
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
              min={1}
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
  );
};

export default CreateSpecies;
