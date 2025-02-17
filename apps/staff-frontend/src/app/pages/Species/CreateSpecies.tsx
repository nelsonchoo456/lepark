import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ContentWrapper, ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
//species form
import {
  ConservationStatusEnum,
  createSpecies,
  CreateSpeciesData,
  LightTypeEnum,
  SoilTypeEnum,
  SpeciesResponse,
  StaffResponse,
} from '@lepark/data-access';
import { conservationStatus, lightType, plantTaxonomy, regions, soilType } from '@lepark/data-utility';
import { Button, Card, Form, Input, InputNumber, message, Modal, notification, Result, Select, Slider, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';

const CreateSpecies = () => {
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const navigate = useNavigate();
  const [createdSpecies, setCreatedSpecies] = useState<SpeciesResponse | null>();
  const { user, updateUser } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();

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
  const [tempRange, setTempRange] = useState([1, 50]);
  const [idealTemp, setIdealTemp] = useState(25);

  const [classes, setClasses] = useState<string[]>([]);
  const [orders, setOrders] = useState<string[]>([]);

  const onPhylumChange = (value: string) => {
    const selectedPhylum = plantTaxonomy[value as keyof typeof plantTaxonomy];
    setClasses(Object.keys(selectedPhylum).filter((key) => key !== 'classes'));
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
    if (selectedFiles.length === 0) {
      Modal.error({
        title: 'Error',
        content: 'Please upload at least one image.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // console.log('Form values:', values);
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
        soilMoisture: values.soilMoisture as number,
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

      if (selectedFiles.length === 0) {
        Modal.error({
          title: 'Error',
          content: 'Please upload at least one image.',
        });
        return;
      }
      // console.log(speciesData);
      // console.log('Species data to be submitted:', JSON.stringify(speciesData)); // For debugging

      const response = await createSpecies(speciesData, selectedFiles);
      console.log('Species created:', response.data);
      setCreatedSpeciesName(values.speciesInput);
      setCreatedSpecies(response.data);
      setShowSuccessAlert(true);
      form.resetFields();
    } catch (error) {
      message.error(String(error));
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

  const breadcrumbItems = [
    {
      title: 'Species Management',
      pathKey: '/species',
      isMain: true,
    },
    {
      title: 'Create Species',
      pathKey: `/species/create`,
      isCurrent: true,
    },
  ];

  // Add this function at the beginning of your component
  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!showSuccessAlert && (
          <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} disabled={isSubmitting} className="max-w-[600px] mx-auto">
            <Form.Item name="phylum" label="Phylum" rules={[{ required: true }]}>
              <Select
                showSearch
                onChange={onPhylumChange}
                placeholder="Select a phylum"
                optionFilterProp="label"
                filterOption={filterOption}
              >
                {Object.keys(plantTaxonomy).map((phylum) => (
                  <Select.Option key={phylum} value={phylum} label={phylum}>
                    {phylum}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="classInput" label="Class" rules={[{ required: true }]}>
              <Select
                showSearch
                onChange={onClassChange}
                placeholder="Select a class"
                disabled={classes.length === 0}
                optionFilterProp="label"
                filterOption={filterOption}
              >
                {classes.map((classItem) => (
                  <Select.Option key={classItem} value={classItem} label={classItem}>
                    {classItem}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="orderInput" label="Order" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Select an order"
                disabled={!orders || orders.length === 0}
                optionFilterProp="label"
                filterOption={filterOption}
              >
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <Select.Option key={order} value={order} label={order}>
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

            <Form.Item name="familyInput" label="Family" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="genusInput" label="Genus" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="speciesInput" label="Scientific Name" rules={[{ required: true }]}>
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
              <Select showSearch style={{ width: 400 }} placeholder="Select a region" optionFilterProp="label" filterOption={filterOption}>
                {regions.map((region) => (
                  <Select.Option key={region} value={region} label={region}>
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
                optionFilterProp="label"
                filterOption={filterOption}
              >
                {lightType.map((type) => (
                  <Select.Option
                    key={type}
                    value={type}
                    label={
                      type === 'FULL_SUN'
                        ? 'Full Sun'
                        : type === 'PARTIAL_SHADE'
                        ? 'Partial Shade'
                        : type === 'FULL_SHADE'
                        ? 'Full Shade'
                        : type
                    }
                  >
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

            <Form.Item name="soilTypeInput" label="Soil Type" rules={[{ required: true }]}>
              <Select
                showSearch
                style={{ width: 400 }}
                placeholder="Select a soil type"
                optionFilterProp="label"
                filterOption={filterOption}
              >
                {soilType.map((type) => (
                  <Select.Option
                    key={type}
                    value={type}
                    label={type === 'SANDY' ? 'Sandy' : type === 'CLAYEY' ? 'Clayey' : type === 'LOAMY' ? 'Loamy' : type}
                  >
                    {type === 'SANDY' ? 'Sandy' : type === 'CLAYEY' ? 'Clayey' : type === 'LOAMY' ? 'Loamy' : type}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="conservationStatusInput" label="Conservation Status" rules={[{ required: true }]}>
              <Select
                showSearch
                style={{ width: 400 }}
                placeholder="Select a conservation status"
                optionFilterProp="label"
                filterOption={filterOption}
              >
                {conservationStatus.map((status) => (
                  <Select.Option
                    key={status}
                    value={status}
                    label={
                      status === 'NEAR_THREATENED'
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
                        : status
                    }
                  >
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

            <Form.Item name="soilMoisture" label="Soil Moisture (%)" rules={[{ required: true }]}>
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
            <Form.Item name="tempRange" label="Min and Max Temp (°C)" rules={[{ required: true }]}>
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

                    // Adjust ideal temp if it's outside the new range
                    if (idealTemp < newValue[0] || idealTemp > newValue[1]) {
                      const newIdealTemp = Math.min(Math.max(idealTemp, newValue[0]), newValue[1]);
                      setIdealTemp(newIdealTemp);
                      form.setFieldsValue({ idealTemp: newIdealTemp });
                    }
                  }
                }}
              />
            </Form.Item>

            <Form.Item name="idealTemp" label="Ideal Temp (°C)" rules={[{ required: true }]}>
              <InputNumber
                min={tempRange[0]}
                max={tempRange[1]}
                step={0.1}
                value={idealTemp}
                onChange={(value) => {
                  if (value !== null) {
                    setIdealTemp(value);
                    form.setFieldsValue({ idealTemp: value });
                  }
                }}
              />
            </Form.Item>

            <Form.Item label="Temperature Values">
              <Space>
                <span>Min: {tempRange[0]}°C</span>
                <span>Max: {tempRange[1]}°C</span>
                <span>Ideal: {idealTemp}°C</span>
              </Space>
            </Form.Item>

            <Form.Item label="Upload Images" required tooltip="At least one image is required">
              <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
            </Form.Item>

            {previewImages.length > 0 && (
              <Form.Item label="Image Previews">
                <div className="flex flex-wrap gap-2">
                  {previewImages.map((imgSrc, index) => (
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
            )}

            <Form.Item {...tailLayout}>
              <Space>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
                <Button htmlType="button" onClick={onReset}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
        {showSuccessAlert && (
          <Result
            status="success"
            title="Created new Species"
            subTitle={createdSpeciesName && <>Species name: {createdSpeciesName}</>}
            extra={[
              <Button key="back" onClick={() => navigate('/species')}>
                Back to Species Management
              </Button>,
              <Button type="primary" key="view" onClick={() => navigate(`/species/${createdSpecies?.id}`)}>
                View new Species
              </Button>,
            ]}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default CreateSpecies;
