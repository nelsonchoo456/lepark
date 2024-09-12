import { useEffect, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import 'leaflet/dist/leaflet.css';
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ContentWrapper} from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
//species form
import React from 'react';
import { Button, Form, Input, Select, Space, Checkbox, InputNumber, Modal, message } from 'antd';
import type { GetProp } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  phylums,
  regions
} from '@lepark/data-utility';
import { getSpeciesById, SpeciesResponse, updateSpecies, OccurrenceResponse } from '@lepark/data-access';
import PageHeader from '../../components/main/PageHeader';


import { plantTaxonomy } from '@lepark/data-utility';

const ViewEditSpecies = () => {
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [savedSpeciesName, setSavedSpeciesName] = useState('');
  const [speciesObj, setSpeciesObj] = useState<SpeciesResponse>();
  const [speciesId, setSpeciesId] = useState<string>('');
  const location = useLocation();
  const speciesIdFromLocation = location.state?.speciesId;
  const [classes, setClasses] = useState<string[]>([]);
  const [orders, setOrders] = useState<string[]>([]);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

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
        speciesObj.isDeciduous && 'deciduous',
        speciesObj.isFastGrowing && 'fastGrowing',
      ].filter(Boolean);

      form.setFieldsValue({
        plantCharacteristics: characteristics,
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
  const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = (checkedValues) => {
    console.log('checked = ', checkedValues);
  };

  const lightTypeOptions = [
    { value: 'FULL_SUN', label: 'Full Sun' },
    { value: 'PARTIAL_SHADE', label: 'Partial Shade' },
    { value: 'FULL_SHADE', label: 'Full Shade' },
  ];

  const soilTypeOptions = [
    { value: 'SANDY', label: 'Sandy' },
    { value: 'CLAYEY', label: 'Clayey' },
    { value: 'LOAMY', label: 'Loamy' },
  ];

  const conservationStatusOptions = [
    { value: 'LEAST_CONCERN', label: 'Least Concern' },
    { value: 'NEAR_THREATENED', label: 'Near Threatened' },
    { value: 'VULNERABLE', label: 'Vulnerable' },
    { value: 'ENDANGERED', label: 'Endangered' },
    { value: 'CRITICALLY_ENDANGERED', label: 'Critically Endangered' },
    { value: 'EXTINCT_IN_THE_WILD', label: 'Extinct in the Wild' },
    { value: 'EXTINCT', label: 'Extinct' },
  ];

  const onFinish = async (values: any) => {
    try {
      const plantCharacteristics = values.plantCharacteristics || [];
      const speciesData: Partial<SpeciesResponse> = {
        id: speciesId,
        phylum: values.phylum,
        class: values.class,
        order: values.order,
        family: values.family,
        genus: values.genus,
        speciesName: values.speciesName,
        commonName: values.commonName,
        speciesDescription: values.speciesDescription,
        conservationStatus: values.conservationStatus,
        originCountry: values.originCountry,
        lightType: values.lightType,
        soilType: values.soilType,
        fertiliserType: values.fertiliserType,
        images: [],
        waterRequirement: values.waterRequirement,
        fertiliserRequirement: values.fertiliserRequirement,
        idealHumidity: values.idealHumidity,
        minTemp: values.minTemp,
        maxTemp: values.maxTemp,
        idealTemp: values.idealTemp,
        isDroughtTolerant: plantCharacteristics.includes('droughtTolerant'),
        isFastGrowing: plantCharacteristics.includes('fastGrowing'),
        isSlowGrowing: plantCharacteristics.includes('slowGrowing'),
        isEdible: plantCharacteristics.includes('edible'),
        isDeciduous: plantCharacteristics.includes('deciduous'),
        isEvergreen: plantCharacteristics.includes('evergreen'),
        isToxic: plantCharacteristics.includes('toxic'),
        isFragrant: plantCharacteristics.includes('fragrant'),
      };
      console.log('Species data to be submitted:', speciesData); // For debugging

      if (values.minTemp > values.ideaTemp || values.maxTemp < values.idealTemp) {
        console.error('Ideal temperature must be between min and max temperatures');
        Modal.error({
          title: 'Error',
          content: 'Ideal temperature must be between min and max temperatures',
        });
        return;
      }
      console.log('Species data to be submitted:', speciesData); // For debugging
      setSavedSpeciesName(values.speciesName);
      setIsSubmitting(true);
      const response = await updateSpecies(speciesId, speciesData);
      console.log('Species saved', response.data);

      messageApi.open({
        type: 'success',
        content: `Successfully edited ${values.speciesName}! Redirecting to Species details page...`,
      });

      // Add a 1-second delay before navigating
      setTimeout(() => {
        navigate(`/species/${speciesId}`);
      }, 1000);
    } catch (error) {
      console.error('Error saving species:', error);
      messageApi.open({
        type: 'error',
        content: 'Failed to save species. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPhylumChange = (value: string) => {
    const selectedPhylum = plantTaxonomy[value as keyof typeof plantTaxonomy];
    setClasses(Object.keys(selectedPhylum).filter(key => key !== 'classes'));
    setOrders([]);
    form.setFieldsValue({ class: undefined, order: undefined });
  };

  const onClassChange = (value: string) => {
    const selectedPhylum = plantTaxonomy[form.getFieldValue('phylum') as keyof typeof plantTaxonomy];
    const selectedClass = selectedPhylum[value as keyof typeof selectedPhylum] as { orders?: string[] };
    if (selectedClass && Array.isArray(selectedClass.orders)) {
      setOrders(selectedClass.orders);
    } else {
      setOrders([]);
    }
    form.setFieldsValue({ order: undefined });
  };

  useEffect(() => {
    if (speciesObj) {
      const selectedPhylum = plantTaxonomy[speciesObj.phylum as keyof typeof plantTaxonomy];
      if (selectedPhylum) {
        setClasses(Object.keys(selectedPhylum).filter(key => key !== 'classes'));
        const selectedClass = selectedPhylum[speciesObj.class as keyof typeof selectedPhylum] as { orders?: string[] };
        if (selectedClass && Array.isArray(selectedClass.orders)) {
          setOrders(selectedClass.orders);
        }
      }
    }
  }, [speciesObj]);

if (!webMode) {
    return (
      <div
        className="h-[calc(100vh-2rem)] w-screen p-4" // page wrapper - padding
      >
        {/* <h1 className="header-1 mb-4">Species Mobile Mode</h1> */}
        <PageHeader>Create Species (Mobile)</PageHeader>
        {/* Add your mobile content here */}
      </div>
    );
  }
  return (
    // <div className={`h-screen w-[calc(100vw-var(--sidebar-width))] overflow-auto z-[1]`}>
    <ContentWrapper>
      {contextHolder}
      <PageHeader>Edit Species</PageHeader>

      <Form
        {...layout}
        form={form}
        name="control-hooks"
        onFinish={onFinish}
        className="max-w-[600px] mx-auto"
        disabled={isSubmitting}
      >
        <Form.Item name="phylum" label="Phylum" rules={[{ required: true }]}>
          <Select onChange={onPhylumChange} placeholder="Select a phylum">
            {Object.keys(plantTaxonomy).map((phylum) => (
              <Select.Option key={phylum} value={phylum}>{phylum}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="class" label="Class" rules={[{ required: true }]}>
          <Select onChange={onClassChange} placeholder="Select a class">
            {classes.map((classItem) => (
              <Select.Option key={classItem} value={classItem}>{classItem}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="order" label="Order" rules={[{ required: true }]}>
          <Select placeholder="Select an order">
            {orders.map((order) => (
              <Select.Option key={order} value={order}>{order}</Select.Option>
            ))}
          </Select>
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
            optionFilterProp="label"
            options={lightTypeOptions}
          />
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
            optionFilterProp="label"
            options={soilTypeOptions}
          />
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
            optionFilterProp="label"
            options={conservationStatusOptions}
          />
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
          label            rules={[{ required: true }]}
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
      </Form>
    </ContentWrapper>
  );
};

export default ViewEditSpecies;
