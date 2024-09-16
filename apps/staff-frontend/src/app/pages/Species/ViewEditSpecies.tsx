import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ContentWrapper, ImageInput, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
//species form
import { getSpeciesById, SpeciesResponse, StaffResponse, StaffType, updateSpecies } from '@lepark/data-access';
import { regions } from '@lepark/data-utility';
import type { GetProp } from 'antd';
import { Button, Checkbox, Form, Input, InputNumber, message, Modal, notification, Select, Space, Spin } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/main/PageHeader';
import useUploadImages from '../../hooks/Images/useUploadImages';

import { plantTaxonomy } from '@lepark/data-utility';
import PageHeader2 from '../../components/main/PageHeader2';

const ViewEditSpecies = () => {
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const [form] = Form.useForm();
  const [speciesObj, setSpeciesObj] = useState<SpeciesResponse>();
  const [speciesId, setSpeciesId] = useState<string>('');
  const location = useLocation();
  const speciesIdFromLocation = location.state?.speciesId;
  const [classes, setClasses] = useState<string[]>([]);
  const [orders, setOrders] = useState<string[]>([]);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const { user, updateUser } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id !== '') {
      if (!['MANAGER', 'SUPERADMIN', 'BOTANIST', 'ARBORIST'].includes(user.role)) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Access Denied',
            description: 'You are not allowed to access the Edit Species page!',
          });
          notificationShown.current = true;
        }
        navigate('/');
      } else {
        setLoading(false);
      }
    }
  }, [user, navigate]);

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
    if (!speciesIdFromLocation) {
      return;
    }
    const fetchSingleSpeciesById = async () => {
      try {
        const species = await getSpeciesById(speciesIdFromLocation);
        if (species.status === 200) {
          setSpeciesObj(species.data);
          setCurrentImages(species.data.images);
          form.setFieldsValue(species.data);
        }
        console.log(`fetched species id ${speciesIdFromLocation}`, species.data);
      } catch (error) {
        console.error('Error fetching species:', error);
      }
    };
    fetchSingleSpeciesById();
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

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

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

  const breadcrumbItems = [
    {
      title: 'Species Management',
      pathKey: '/species',
      isMain: true,
    },
    {
      title: speciesObj?.speciesName ? speciesObj?.speciesName : 'Details',
      pathKey: `/species/${speciesObj?.id}`,
    },
    {
      title: 'Edit Species',
      pathKey: `/species/edit`,
      isCurrent: true,
    },
  ];

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
        id: speciesIdFromLocation,
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
      speciesData.images = currentImages;
      console.log('Species data to be submitted:', speciesData); // For debugging

      setIsSubmitting(true);
      console.log('currentImages', currentImages);
      console.log('selectedFiles', selectedFiles);
      console.log('species ID', speciesIdFromLocation);
      const response = await updateSpecies(speciesIdFromLocation, speciesData, selectedFiles);
      console.log('Species saved', response.data);

      messageApi.open({
        type: 'success',
        content: `Successfully edited ${values.speciesName}! Redirecting to Species details page...`,
      });

      // Add a 1-second delay before navigating
      setTimeout(() => {
        navigate(`/species/${speciesIdFromLocation}`);
      }, 1000);
    } catch (error) {
      message.error(String(error));
      /*messageApi.open({
        type: 'error',
        content: 'Failed to save species. Please try again.',
      });*/
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPhylumChange = (value: string) => {
    const selectedPhylum = plantTaxonomy[value as keyof typeof plantTaxonomy];
    setClasses(Object.keys(selectedPhylum).filter((key) => key !== 'classes'));
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

  // dropdown filter
  useEffect(() => {
    if (speciesObj) {
      const selectedPhylum = plantTaxonomy[speciesObj.phylum as keyof typeof plantTaxonomy];
      if (selectedPhylum) {
        setClasses(Object.keys(selectedPhylum).filter((key) => key !== 'classes'));
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

  if (loading) { // this displays the loading spinner, if removed the page will display before redirecting for unauthorized users
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" /> {/* Loading spinner */}
      </div>
    );
  }

  return (
    // <div className={`h-screen w-[calc(100vw-var(--sidebar-width))] overflow-auto z-[1]`}>
    <ContentWrapper>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />

      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} className="max-w-[600px] mx-auto" disabled={isSubmitting}>
        <Form.Item name="phylum" label="Phylum" rules={[{ required: true }]}>
          <Select onChange={onPhylumChange} placeholder="Select a phylum">
            {Object.keys(plantTaxonomy).map((phylum) => (
              <Select.Option key={phylum} value={phylum}>
                {phylum}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="class" label="Class" rules={[{ required: true }]}>
          <Select onChange={onClassChange} placeholder="Select a class">
            {classes.map((classItem) => (
              <Select.Option key={classItem} value={classItem}>
                {classItem}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="order" label="Order" rules={[{ required: true }]}>
          <Select placeholder="Select an order">
            {orders.map((order) => (
              <Select.Option key={order} value={order}>
                {order}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="family" label="Family" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="genus" label="Genus" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="speciesName" label="Species" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="commonName" label="Common Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="speciesDescription" label="Species Description" rules={[{ required: true }]}>
          <TextArea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Share more details!"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>

        <Form.Item name="originCountry" label="Region of Origin" rules={[{ required: true }]}>
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

        <Form.Item name="lightType" label="Light Type" rules={[{ required: true }]}>
          <Select showSearch style={{ width: 400 }} placeholder="Select a light type" optionFilterProp="label" options={lightTypeOptions} />
        </Form.Item>

        <Form.Item name="soilType" label="Soil Type" rules={[{ required: true }]}>
          <Select showSearch style={{ width: 400 }} placeholder="Select a soil type" optionFilterProp="label" options={soilTypeOptions} />
        </Form.Item>

        <Form.Item name="conservationStatus" label="Conservation Status" rules={[{ required: true }]}>
          <Select
            showSearch
            style={{ width: 400 }}
            placeholder="Select a conservation status"
            optionFilterProp="label"
            options={conservationStatusOptions}
          />
        </Form.Item>

        <Form.Item name="plantCharacteristics" label="Plant Characteristics" rules={[{ required: false }]} initialValue={[]}>
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
          <InputNumber min={0} max={100} />
        </Form.Item>

        <Form.Item name="minTemp" label="Min Temp (C)" rules={[{ required: true }]}>
          <InputNumber
            min={0}
            max={50}
            step={0.1}
            onChange={() => {
              form.validateFields(['minTemp']);
            }}
          />
        </Form.Item>

        <Form.Item name="maxTemp" label rules={[{ required: true }]}>
          <InputNumber
            min={0}
            max={50}
            step={0.1}
            onChange={() => {
              form.validateFields(['maxTemp']);
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

        <Form.Item label={'Image'}>
          <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
        </Form.Item>

        <Form.Item label={'Images'}>
          <div className="flex flex-wrap gap-2">
            {currentImages?.length > 0 &&
              currentImages.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Preview ${index}`}
                  className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
                  onClick={() => handleCurrentImageClick(index)}
                />
              ))}

            {previewImages?.length > 0 &&
              previewImages.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Preview ${index}`}
                  className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
                  onClick={() => removeImage(index)}
                />
              ))}
          </div>
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
