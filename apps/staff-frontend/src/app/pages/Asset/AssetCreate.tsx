import { useEffect, useState } from 'react';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import {
  ParkAssetTypeEnum,
  ParkAssetStatusEnum,
  ParkAssetConditionEnum,
  createParkAsset,
  ParkAssetData,
  StaffResponse,
  FacilityResponse,
  getAllFacilities,
  ParkResponse,
  getAllParks,
  StaffType,
  getParkById,
  getFacilitiesByParkId,
  checkParkAssetDuplicateSerialNumber,
} from '@lepark/data-access';
import { Button, Card, DatePicker, Form, Checkbox, Input, InputNumber, message, Result, Select, Space, Spin, Divider, Tooltip, Radio } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImagesAssets from '../../hooks/Images/useUploadImagesAssets';
import dayjs from 'dayjs';
import { FacilityStatusEnum, FacilityTypeEnum } from '@prisma/client';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { TextArea } = Input;

const formatEnumLabel = formatEnumLabelToRemoveUnderscores;

const AssetCreate = () => {
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const navigate = useNavigate();
  const [createdAsset, setCreatedAsset] = useState<any | null>();
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(true);
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [filteredFacilities, setFilteredFacilities] = useState<FacilityResponse[]>([]);

  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick, clearAllImages } = useUploadImagesAssets();

  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [createdAssetName, setCreatedAssetName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createMultiple, setCreateMultiple] = useState(false);
  const [assetQuantity, setAssetQuantity] = useState<number>(1);
  const [messageApi, contextHolder] = message.useMessage();
  const [hasSerialNumber, setHasSerialNumber] = useState(false);

  const handleSerialNumberChange = (value: string) => {
    const checked = value === 'yes';
    setHasSerialNumber(checked);
    if (checked) {
      setCreateMultiple(false);
      setAssetQuantity(1);
      form.setFieldsValue({ createMultiple: 'no', assetQuantity: undefined });
    }
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

  useEffect(() => {
    const fetchParksAndFacilities = async () => {
      try {
        if (user?.role === StaffType.SUPERADMIN) {
          const [parksResponse, facilitiesResponse] = await Promise.all([getAllParks(), getAllFacilities()]);
          setParks(parksResponse.data);
          setFacilities(facilitiesResponse.data);
        } else {
          const park = await getParkById(user?.parkId as number);
          setPark(park.data);
          const facilities = await getFacilitiesByParkId(user?.parkId as number);
          setFacilities(facilities.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching parks and facilities:', error);
        message.error('Failed to fetch parks and facilities');
        setLoading(false);
      }
    };

    fetchParksAndFacilities();
  }, []);

  useEffect(() => {
    if (selectedParkId) {
      const filtered = facilities.filter(
        (facility) =>
          facility.parkId === selectedParkId &&
          facility.facilityStatus === FacilityStatusEnum.OPEN &&
          facility.facilityType === FacilityTypeEnum.STOREROOM,
      );
      setFilteredFacilities(filtered);
    } else {
      setFilteredFacilities(
        facilities.filter(
          (facility) =>
            facility.parkId === user?.parkId &&
            facility.facilityStatus === FacilityStatusEnum.OPEN &&
            facility.facilityType === FacilityTypeEnum.STOREROOM,
        ),
      );
    }
  }, [selectedParkId, facilities]);

  const handleParkChange = (parkId: number) => {
    setSelectedParkId(parkId);
    form.setFieldsValue({ facilityId: undefined });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();

      // Check for duplicate serial number only if hasSerialNumber is true
      if (hasSerialNumber && values.serialNumber) {
        const isDuplicate = await checkParkAssetDuplicateSerialNumber(values.serialNumber);
        if (isDuplicate) {
          messageApi.error('This Serial Number already exists. Please enter a unique Serial Number.');
          setIsSubmitting(false);
          return;
        }
      }

      const baseAssetData: ParkAssetData = {
        name: values.name,
        serialNumber: hasSerialNumber ? values.serialNumber : undefined,
        parkAssetType: values.parkAssetType,
        description: values.description,
        parkAssetStatus: values.parkAssetStatus,
        acquisitionDate: dayjs(values.acquisitionDate).toISOString(),
        supplier: values.supplier,
        supplierContactNumber: values.supplierContactNumber,
        parkAssetCondition: values.parkAssetCondition,
        images: [],
        remarks: values.remarks,
        facilityId: values.facilityId,
      };

      let response;
      if (createMultiple) {
        const createdAssets = [];
        for (let i = 0; i < assetQuantity; i++) {
          const result = await createParkAsset(baseAssetData, selectedFiles);
          createdAssets.push(result.data);
        }
        // Use the last created asset as the response
        response = { data: createdAssets[createdAssets.length - 1] };
      } else {
        response = await createParkAsset(baseAssetData, selectedFiles);
      }

      setCreatedAsset(response.data);
      setCreatedAssetName(values.name);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error creating Asset', error);
      messageApi.error('Unable to create Asset. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatePhoneNumber = (_: any, value: string) => {
    const phoneRegex = /^[689]\d{7}$/;
    if (!value || phoneRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Please enter a valid 8-digit phone number starting with 6, 8, or 9');
  };

  const breadcrumbItems = [
    {
      title: 'Park Asset Management',
      pathKey: '/parkasset',
      isMain: true,
    },
    {
      title: 'Create',
      pathKey: '/parkasset/create',
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : !showSuccessAlert ? (
          <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: '600px', margin: '0 auto' }}
          >
            {user?.role === StaffType.SUPERADMIN ? (
              <Divider orientation="left">Select Park and Facility</Divider>
            ) : (
              <Divider orientation="left">Select Facility</Divider>
            )}
            {user?.role !== StaffType.SUPERADMIN && park ? (
              <Form.Item label="Park">{park.name}</Form.Item>
            ) : (
              <Form.Item name="parkId" label="Park" rules={[{ required: true, message: 'Please select a park!' }]}>
                <Select placeholder="Select a park" onChange={handleParkChange}>
                  {parks.map((park) => (
                    <Select.Option key={park.id} value={park.id}>
                      {park.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item name="facilityId" label="Facility" rules={[{ required: true, message: 'Please select a facility!' }]}>
              <Select
                placeholder={selectedParkId || user?.role !== StaffType.SUPERADMIN ? 'Select a facility' : 'Please select a park first'}
                disabled={user?.role === StaffType.SUPERADMIN && !selectedParkId}
              >
                {filteredFacilities.map((facility) => (
                  <Select.Option key={facility.id} value={facility.id}>
                    {facility.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Divider orientation="left">Asset Details</Divider>

            <Form.Item name="name" label="Asset Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <TextArea placeholder="Enter Description" autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>
            <Form.Item name="hasSerialNumber" label="Has Serial Number" rules={[{ required: true }]}>
              <Radio.Group onChange={(e) => handleSerialNumberChange(e.target.value)} optionType='button'>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </Radio.Group>
            </Form.Item>
            {hasSerialNumber && (
              <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true, message: 'Please enter Serial Number' }]}>
                <Input placeholder="Enter Serial Number" />
              </Form.Item>
            )}
            <Form.Item name="parkAssetType" label="Asset Type" rules={[{ required: true }]}>
              <Select placeholder="Select asset type">
                {Object.values(ParkAssetTypeEnum).map((type) => (
                  <Select.Option key={type} value={type}>
                    {formatEnumLabel(type)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="parkAssetStatus" label="Asset Status" rules={[{ required: true }]}>
              <Select placeholder="Select asset status">
                {Object.values(ParkAssetStatusEnum).map((status) => (
                  <Select.Option key={status} value={status}>
                    {formatEnumLabel(status)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="parkAssetCondition" label="Asset Condition" rules={[{ required: true }]}>
              <Select placeholder="Select asset condition">
                {Object.values(ParkAssetConditionEnum).map((condition) => (
                  <Select.Option key={condition} value={condition}>
                    {formatEnumLabel(condition)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="acquisitionDate" label="Acquisition Date" rules={[{ required: true }]}>
              <DatePicker className="w-full" disabledDate={(current) => current && current > dayjs().endOf('day')} />
            </Form.Item>
            <Form.Item name="remarks" label="Remarks">
              <TextArea placeholder="Enter any remarks" autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>
            {!hasSerialNumber && (
              <Form.Item name="createMultiple" label="Create multiple assets?" rules={[{ required: true }]}>
                <Radio.Group onChange={(e) => setCreateMultiple(e.target.value === 'yes')} optionType='button'>
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </Form.Item>
            )}
            {!hasSerialNumber && createMultiple && (
              <Form.Item
                name="assetQuantity"
                label="Park Asset Quantity"
                required
                tooltip="Maximum of 10 assets can be created at a time"
                rules={[{ required: true, type: 'number', min: 1, max: 10 }]}
              >
                <InputNumber onChange={(value) => setAssetQuantity(value as number)} min={1} max={10} />
              </Form.Item>
            )}
            <Form.Item label="Upload Images">
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
            <Divider orientation="left">Supplier Details</Divider>
            <Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="supplierContactNumber"
              label="Supplier Contact"
              rules={[{ required: true, message: 'Please input the supplier contact number' }, { validator: validatePhoneNumber }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label={" "} colon={false}>
              <Button type="primary" htmlType="submit" loading={isSubmitting} className="w-full">
                Submit
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Result
            status="success"
            title={createMultiple ? `Created ${assetQuantity} new Assets` : 'Created new Asset'}
            subTitle={createdAssetName && <>Asset name: {createdAssetName}</>}
            extra={[
              <Button key="back" onClick={() => navigate('/parkasset')}>
                Back to Park Asset Management
              </Button>,
              !createMultiple && (
                <Button type="primary" key="view" onClick={() => navigate(`/parkasset/${createdAsset?.id}`)}>
                  View new Asset
                </Button>
              ),
            ].filter(Boolean)}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default AssetCreate;