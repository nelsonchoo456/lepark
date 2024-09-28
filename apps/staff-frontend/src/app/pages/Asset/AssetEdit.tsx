import { useEffect, useState } from 'react';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import {
  ParkAssetTypeEnum,
  ParkAssetStatusEnum,
  ParkAssetConditionEnum,
  updateParkAssetDetails,
  ParkAssetData,
  StaffResponse,
  FacilityResponse,
  getAllFacilities,
  ParkResponse,
  getAllParks,
  ParkAssetUpdateData
} from '@lepark/data-access';
import { Button, Card, DatePicker, Form, Input, InputNumber, message, Modal, Result, Select, Space, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import dayjs from 'dayjs';
import { useRestrictAsset } from '../../hooks/Asset/useRestrictAsset';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';

const formatEnumLabel = (enumValue: string): string => {
  return enumValue
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const AssetEdit = () => {
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const navigate = useNavigate();
  const [updatedAsset, setUpdatedAsset] = useState<ParkAssetData | null>(null);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { assetId = '' } = useParams<{ assetId: string }>();
  const { asset, loading: assetLoading, notFound } = useRestrictAsset(assetId);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<FacilityResponse[]>([]);

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
        const [parksResponse, facilitiesResponse] = await Promise.all([
          getAllParks(),
          getAllFacilities()
        ]);
        const parksWithFacilities = parksResponse.data.filter(park =>
          facilitiesResponse.data.some(facility => facility.parkId === park.id)
        );
        setParks(parksWithFacilities);
        setFacilities(facilitiesResponse.data);
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
    if (asset && facilities.length > 0) {
      setCurrentImages(asset.images || []);
      const assetFacility = facilities.find(f => f.id === asset.facilityId);
      if (assetFacility) {
        handleParkChange(assetFacility.parkId, asset.facilityId);
      }
      form.setFieldsValue({
        ...asset,
        acquisitionDate: asset.acquisitionDate ? dayjs(asset.acquisitionDate) : undefined,
        parkId: assetFacility?.parkId,
        facilityId: asset.facilityId,
      });
    }
  }, [asset, form, facilities]);

  const handleParkChange = (parkId: number, initialFacilityId?: string) => {
    const parkFacilities = facilities.filter(facility => facility.parkId === parkId);
    setFilteredFacilities(parkFacilities);
    if (initialFacilityId === undefined || !parkFacilities.some(f => f.id === initialFacilityId)) {
      form.setFieldsValue({ facilityId: undefined });
    }
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const onFinish = async (values: any) => {
   setIsSubmitting(true);
  try {
    const assetData: ParkAssetUpdateData = {
      parkAssetName: values.parkAssetName,
      parkAssetType: values.parkAssetType,
      parkAssetDescription: values.parkAssetDescription,
      parkAssetStatus: values.parkAssetStatus,
      acquisitionDate: values.acquisitionDate ? dayjs(values.acquisitionDate).toISOString() : undefined,
      recurringMaintenanceDuration: values.recurringMaintenanceDuration,
      supplier: values.supplier,
      supplierContactNumber: values.supplierContactNumber,
      parkAssetCondition: values.parkAssetCondition,
      images: currentImages,
      remarks: values.remarks,
      facilityId: values.facilityId,
    };

      if (currentImages.length === 0 && selectedFiles.length === 0) {
        Modal.error({
          title: 'Error',
          content: 'Please upload at least one image.',
        });
        return;
      }

      if (!assetId) {
        throw new Error('Asset ID is missing');
      }

      const response = await updateParkAssetDetails(assetId, assetData, selectedFiles);
      setUpdatedAsset(response.data);
      setShowSuccessAlert(true);
    } catch (error) {
      message.error(String(error));
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
      title: 'Edit Asset',
      pathKey: `/parkasset/edit/${assetId}`,
      isCurrent: true,
    },
  ];

  const handleCurrentImageClick = (index: number) => {
    setCurrentImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  if (assetLoading || loading) {
    return (
      <ContentWrapperDark>
        <Card>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Card>
      </ContentWrapperDark>
    );
  }

  if (notFound) {
    // [ ENTITY NOT FOUND MERGE ISSUE ]
    return <></>
    // return <EntityNotFound entityName="Asset" listPath="/parkasset" />;
  }

  if (!asset) {
    return null;
  }

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!showSuccessAlert && (
          <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} disabled={isSubmitting} className="max-w-[600px] mx-auto">
            <Form.Item name="parkAssetName" label="Asset Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="parkAssetType" label="Asset Type" rules={[{ required: true }]}>
              <Select placeholder="Select asset type">
                {Object.values(ParkAssetTypeEnum).map((type) => (
                  <Select.Option key={type} value={type}>
                    {formatEnumLabel(type)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="parkAssetDescription" label="Description">
              <TextArea />
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

            <Form.Item name="acquisitionDate" label="Acquisition Date" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="recurringMaintenanceDuration"
              label="Recurring Maintenance"
              rules={[{ required: true, type: 'number', min: 1, max: 500, message: 'Please enter a number between 1 and 500' }]}
            >
              <InputNumber
                className="w-full"
                min={1}
                max={500}
                placeholder='Enter Recurring Maintenance in days'
              />
            </Form.Item>

            <Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item
              name="supplierContactNumber"
              label="Supplier Contact"
              rules={[
                { required: true, message: 'Please input the supplier contact number!' },
                { validator: validatePhoneNumber }
              ]}
            >
              <Input />
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

            <Form.Item name="remarks" label="Remarks">
              <TextArea />
            </Form.Item>

            {user?.role === 'SUPERADMIN' && (
              <Form.Item name="parkId" label="Park" rules={[{ required: true, message: 'Please select a park' }]}>
                <Select placeholder="Select a park" onChange={(value) => handleParkChange(Number(value))}>
                  {parks.map((park) => (
                    <Select.Option key={park.id} value={park.id}>
                      {park.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              name="facilityId"
              label="Facility"
              rules={[{ required: true, message: 'Please select a facility' }]}
            >
              <Select placeholder="Select a facility">
                {filteredFacilities.map((facility) => (
                  <Select.Option key={facility.id} value={facility.id}>
                    {facility.facilityName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Upload Images" required tooltip="At least one image is required">
              <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
            </Form.Item>

            <Form.Item label="Current Images">
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
              </div>
            </Form.Item>

            <Form.Item label="New Images">
              <div className="flex flex-wrap gap-2">
                {previewImages.length > 0 &&
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
                  Update
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
        {showSuccessAlert && (
          <Result
            status="success"
            title="Updated Asset"
            subTitle={updatedAsset?.parkAssetName && <>Asset name: {updatedAsset.parkAssetName}</>}
            extra={[
              <Button key="back" onClick={() => navigate('/parkasset')}>
                Back to Park Asset Management
              </Button>,
              <Button type="primary" key="view" onClick={() => navigate(`/parkasset/${assetId}`)}>
                View Updated Asset
              </Button>,
            ]}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default AssetEdit;
