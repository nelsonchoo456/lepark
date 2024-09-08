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
  Alert

} from 'antd';
import type { GetProp } from 'antd';
import { useNavigate } from 'react-router-dom';
import { phylums, regions, lightType, soilType, conservationStatus, plantCharacteristics, convertLightType, convertSoilType, convertConservationStatus } from '@lepark/data-utility';
import { getSpeciesById } from '@lepark/data-access';
import PageHeader from '../../components/main/PageHeader';

const ViewEditSpecies = () => {
  const [webMode, setWebMode] = useState<boolean>(
    window.innerWidth >= SCREEN_LG,
  );
  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [createdSpeciesName, setCreatedSpeciesName] = useState('');
  const [speciesObj, setSpeciesObj] = useState<Species>(null);
  const [speciesId, setSpeciesId] = useState<string>('');

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

  const[editing,setEditing] = useState<boolean>(false);
  const [initCharac, setInitCharac] = useState([]);

  // Species form
//fetch species by id
  useEffect(() => {
    setId("0f45c928-a0eb-40d1-b7a7-5eb32ae2e014");
    const fetchSingleSpeciesById = async () => {
      try {
        const species = await getSpeciesById(speciesId);
        setSpeciesObj(species.data);
        form.setFieldsValue(species.data);
        console.log(`fetched species id ${speciesId}`, speciesObj.data);
      } catch (error) {
        console.error('Error fetching species:', error);
      }
    };
    if (speciesId && speciesId.trim() !== '') {
        fetchSingleSpeciesById();

    }

  }, [speciesId]);





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
    //try catch
  };

  const { TextArea } = Input;
  const [value, setValue] = useState('');
  const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = (
    checkedValues,
  ) => {
    console.log('checked = ', checkedValues);
  };

  //slider

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
      {/* <h1 className="header-1 mb-4">Create Species</h1> */}
      <PageHeader>View Species</PageHeader>

      {
        <>
            <style jsx={"true"}>{`
        .species-form .ant-form-item .ant-input[disabled],
        .species-form .ant-form-item .ant-select-disabled .ant-select-selection-item,
        .species-form .ant-form-item .ant-input-number-disabled .ant-input-number-input,
        .species-form .ant-form-item .ant-checkbox-wrapper-disabled span,
        .species-form .ant-form-item .ant-slider-disabled .ant-slider-track,
        .species-form .ant-form-item .ant-slider-disabled .ant-slider-handle,
        .species-form .ant-form-item .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
          color: rgba(0, 0, 0, 0.85) !important;
          -webkit-text-fill-color: rgba(0, 0, 0, 0.85) !important;
          opacity: 1 !important;
        }
      `}</style>
      <Button onClick={() => {
        setEditing(!editing);

      }}>

      </Button>
        <Form
          {...layout}
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          disabled={!editing}
          variant={editing ? 'outlined' : 'borderless'}
          className="max-w-[600px] mx-auto species-form"
          requiredMark={false}
        >
          <Form.Item name="phylum" label="Phylum" rules={[{ required: true }]} >
            <Select  allowClear placeholder={speciesObj?.phylum}>
              {phylums.map((phylum) => (
                <Select.Option key={phylum} value={phylum} >
                  {phylum}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="class"
            label="Class"
            rules={[{ required: true }]}
            initialvalue={speciesObj?.class}
          >
            <Input placeholder={speciesObj?.class}  />
          </Form.Item>
          <Form.Item
            name="order"
            label="Order"
            rules={[{ required: true }]}
          >
            <Input placeholder={speciesObj?.order} />
          </Form.Item>
          <Form.Item
            name="family"
            label="Family"
            rules={[{ required: true }]}
          >
            <Input placeholder={speciesObj?.family} />
          </Form.Item>
          <Form.Item
            name="genus"
            label="Genus"
            rules={[{ required: true }]}
          >
            <Input placeholder={speciesObj?.genus} />
          </Form.Item>
          <Form.Item
            name="species"
            label="Species"
            rules={[{ required: true }]}
          >
            <Input placeholder={speciesObj?.species} />
          </Form.Item>
          <Form.Item
            name="commonName"
            label="Common Name"
            rules={[{ required: true }]}
          >
            <Input placeholder={speciesObj?.commonName} />
          </Form.Item>

          <Form.Item
            name="speciesDescription"
            label="Species Description"
            rules={[{ required: true }]}
          >
            <TextArea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={speciesObj?.description}
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
            placeholder={speciesObj?.originCountry}
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
              placeholder={speciesObj?.conservationStatus}
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
            name="initCharac"
            label="Plant Characteristics"
            rules={[{ required: true }]}
          >
            <Checkbox.Group
              options={initCharac}
              onChange={onChange}
            />
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
            name="tempRange"
            label="Min and Max Temp (C)"
            rules={[{ required: true }]}
          >
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

            </Space>
          </Form.Item>
        </Form>
        </>
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

export default ViewEditSpecies;
