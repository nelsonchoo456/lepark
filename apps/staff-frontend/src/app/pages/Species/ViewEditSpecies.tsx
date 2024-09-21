import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { ContentWrapper, ContentWrapperDark, ImageInput } from '@lepark/common-ui';
import { getSpeciesById, SpeciesResponse, updateSpecies } from '@lepark/data-access';
import { conservationStatus, lightType, plantTaxonomy, regions, soilType } from '@lepark/data-utility';
import type { Checkbox, GetProp } from 'antd';
import { Button, Card, Form, Input, InputNumber, message, Modal, Select, Space, Spin } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/main/PageHeader';
import useUploadImages from '../../hooks/Images/useUploadImages';
import PageHeader2 from '../../components/main/PageHeader2';
import { SCREEN_LG } from '../../config/breakpoints';

const ViewEditSpecies = () => {
  const { speciesId } = useParams<{ speciesId: string }>();
  const [form] = Form.useForm();
  const [speciesObj, setSpeciesObj] = useState<SpeciesResponse>();
  const [classes, setClasses] = useState<string[]>([]);
  const [orders, setOrders] = useState<string[]>([]);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [loading, setLoading] = useState(true);
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const [minTemp, setMinTemp] = useState(1);
  const [maxTemp, setMaxTemp] = useState(50);
  const [idealTemp, setIdealTemp] = useState(25);

  // Fetch species by id
  useEffect(() => {
    if (!speciesId) {
      return;
    }
    const fetchSingleSpeciesById = async () => {
      try {
        const species = await getSpeciesById(speciesId);
        if (species.status === 200) {
          setSpeciesObj(species.data);
          setCurrentImages(species.data.images);
          form.setFieldsValue(species.data);
        }
      } catch (error) {
        console.error('Error fetching species:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSingleSpeciesById();
  }, [speciesId, form]);

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

      setMinTemp(speciesObj.minTemp);
      setMaxTemp(speciesObj.maxTemp);
      setIdealTemp(speciesObj.idealTemp);
    }
  }, [speciesObj, form]);

  const updateTemperatures = (newMin: number | null, newMax: number | null, newIdeal: number | null) => {
    const updatedMin = newMin ?? minTemp;
    const updatedMax = newMax ?? maxTemp;
    const updatedIdeal = newIdeal ?? idealTemp;

    setMinTemp(updatedMin);
    setMaxTemp(updatedMax);
    setIdealTemp(Math.min(Math.max(updatedIdeal, updatedMin), updatedMax));

    form.setFieldsValue({
      minTemp: updatedMin,
      maxTemp: updatedMax,
      idealTemp: Math.min(Math.max(updatedIdeal, updatedMin), updatedMax),
    });
  };

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
      pathKey: `/species/${speciesId}/edit`,
      isCurrent: true,
    },
  ];

  const onFinish = async (values: any) => {
    try {
      if (values.minTemp === values.maxTemp) {
        Modal.error({
          title: 'Error',
          content: 'Min and max temperatures cannot be the same',
        });
        return;
      }
      if (values.minTemp > values.idealTemp || values.maxTemp < values.idealTemp) {
        Modal.error({
          title: 'Error',
          content: 'Ideal temperature must be between min and max temperatures',
        });
        return;
      }

      // Check if there's at least one image
      if (currentImages.length === 0 && selectedFiles.length === 0) {
        Modal.error({
          title: 'Error',
          content: 'At least one image is required for the species.',
        });
        return;
      }

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
        images: currentImages,
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

      setIsSubmitting(true);
      if (speciesId) {
        const response = await updateSpecies(speciesId, speciesData, selectedFiles);
        setPreviewImages([]); // Clear preview images after successful submission
      } else {
        throw new Error('Species ID is undefined');
      }

      messageApi.open({
        type: 'success',
        content: `Saved changes to Species. Redirecting to Species details page...`,
      });

      setTimeout(() => {
        navigate(`/species/${speciesId}`);
      }, 1000);
    } catch (error) {
      message.error(String(error));
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

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!loading && (
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
              <Select onChange={onClassChange} placeholder="Select a class" disabled={classes.length === 0}>
                {classes.map((classItem) => (
                  <Select.Option key={classItem} value={classItem}>
                    {classItem}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="order" label="Order" rules={[{ required: true }]}>
              <Select placeholder="Select an order" disabled={!orders || orders.length === 0}>
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <Select.Option key={order} value={order}>
                      {order}
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option value="" disabled>
                    No orders available
                  </Select.Option>
                )}
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
              <Select
                showSearch
                style={{ width: 400 }}
                placeholder="Select a light type"
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
              >
                {lightType.map((type) => (
                  <Select.Option key={type} value={type}>
                    {type === 'FULL_SUN'
                      ? 'Full Sun'
                      : type === 'PARTIAL_SHADE'
                      ? 'Partial Shade'
                      : type === 'FULL_SHADE'
                      ? 'Full Shade'
                      : type}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="soilType" label="Soil Type" rules={[{ required: true }]}>
              <Select
                showSearch
                style={{ width: 400 }}
                placeholder="Select a soil type"
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
              >
                {soilType.map((type) => (
                  <Select.Option key={type} value={type}>
                    {type === 'SANDY' ? 'Sandy' : type === 'CLAYEY' ? 'Clayey' : type === 'LOAMY' ? 'Loamy' : type}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="conservationStatus" label="Conservation Status" rules={[{ required: true }]}>
              <Select
                showSearch
                style={{ width: 400 }}
                placeholder="Select a conservation status"
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
              >
                {conservationStatus.map((status) => (
                  <Select.Option key={status} value={status}>
                    {status === 'NEAR_THREATENED'
                      ? 'Near Threatened'
                      : status === 'LEAST_CONCERN'
                      ? 'Least Concern'
                      : status === 'VULNERABLE'
                      ? 'Vulnerable'
                      : status === 'ENDANGERED'
                      ? 'Endangered'
                      : status === 'CRITICALLY_ENDANGERED'
                      ? 'Critically Endangered'
                      : status === 'EXTINCT_IN_THE_WILD'
                      ? 'Extinct in the Wild'
                      : status === 'EXTINCT'
                      ? 'Extinct'
                      : status}
                  </Select.Option>
                ))}
              </Select>
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
              <InputNumber min={1} max={100} />
            </Form.Item>

            <Form.Item name="fertiliserRequirement" label="Fertiliser Requirement" rules={[{ required: true }]}>
              <InputNumber min={1} max={100} onChange={(value) => console.log('Fertiliser Requirement:', value)} />
            </Form.Item>
            <Form.Item name="fertiliserType" label="Fertiliser Type" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="idealHumidity" label="Ideal Humidity (%)" rules={[{ required: true }]}>
              <InputNumber min={1} max={100} />
            </Form.Item>

            <Form.Item label="Min Temperature (°C)" required>
              <Form.Item
                name="minTemp"
                noStyle
                rules={[
                  { required: true, message: 'Please input the minimum temperature' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('maxTemp') > value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Min temperature must be less than max temperature'));
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={1}
                  max={49}
                  step={0.1}
                  value={minTemp}
                  onChange={(value) => updateTemperatures(value, null, null)}
                />
              </Form.Item>
            </Form.Item>

            <Form.Item label="Max Temperature (°C)" required>
              <Form.Item
                name="maxTemp"
                noStyle
                rules={[
                  { required: true, message: 'Please input the maximum temperature' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('minTemp') < value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Max temperature must be greater than min temperature'));
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={2}
                  max={50}
                  step={0.1}
                  value={maxTemp}
                  onChange={(value) => updateTemperatures(null, value, null)}
                />
              </Form.Item>
            </Form.Item>

            <Form.Item name="idealTemp" label="Ideal Temp (°C)" rules={[{ required: true }]}>
              <InputNumber
                min={Math.min(minTemp, maxTemp)}
                max={Math.max(minTemp, maxTemp)}
                step={0.1}
                value={idealTemp}
                onChange={(value) => updateTemperatures(null, null, value)}
              />
            </Form.Item>

            <Form.Item label="Temperature Values">
              <Space>
                <span>Min: {minTemp}°C</span>
                <span>Max: {maxTemp}°C</span>
                <span>Ideal: {idealTemp}°C</span>
              </Space>
            </Form.Item>

            <Form.Item label="Upload Images">
              <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
            </Form.Item>

            <Form.Item label="Images">
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
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default ViewEditSpecies;
