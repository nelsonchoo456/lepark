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
  ParkAssetUpdateData,
  StaffType,
  getParkById,
  getFacilitiesByParkId,
  getFacilityById,
  checkParkAssetDuplicateSerialNumber,
} from '@lepark/data-access';
import { Button, Card, DatePicker, Form, Input, InputNumber, Select, Space, Spin, message as antMessage, Divider } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImagesAssets from '../../hooks/Images/useUploadImagesAssets';
import dayjs from 'dayjs';
import { useRestrictAsset } from '../../hooks/Asset/useRestrictAsset';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';
import { FacilityStatusEnum, FacilityTypeEnum } from '@prisma/client';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { message } from 'antd';

const { TextArea } = Input;

const formatEnumLabel = formatEnumLabelToRemoveUnderscores;

const AssetEdit = () => {
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { assetId = '' } = useParams<{ assetId: string }>();
  const { asset, loading: assetLoading, } = useRestrictAsset(assetId);
  const {
    selectedFiles,
    previewImages,
    existingImages,
    handleFileChange,
    removeImage,
    onInputClick,
    setPreviewImages,
    setExistingImages,
    setSelectedFiles,
  } = useUploadImagesAssets();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<FacilityResponse[]>([]);
  const [messageApi, contextHolder] = antMessage.useMessage();

  const breadcrumbItems = [
    {
      title: 'Park Asset Management',
      pathKey: '/parkasset',
      isMain: true,
    },
    {
      title: asset?.identifierNumber ? asset.identifierNumber : 'Details',
      pathKey: `/parkasset/${assetId}`,
    },
    {
      title: 'Edit',
      pathKey: `/parkasset/${assetId}/edit`,
      isCurrent: true,
    },
  ];

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
    const fetchFacilities = async () => {
      try {
        if (user?.role === StaffType.SUPERADMIN) {
          const facilitiesResponse = await getAllFacilities();
          setFacilities(facilitiesResponse.data);
        } else {
          const facilities = await getFacilitiesByParkId(user?.parkId as number);
          setFacilities(facilities.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        messageApi.error('Failed to fetch facilities');
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [messageApi, user]);

  useEffect(() => {
    if (asset && asset.facilityId) {
      const assetFacility = facilities.find((f) => f.id === asset.facilityId);
      if (assetFacility) {
        const filtered = facilities.filter(
          (facility) =>
            facility.parkId === assetFacility.parkId &&
            facility.facilityStatus === FacilityStatusEnum.OPEN &&
            facility.facilityType === FacilityTypeEnum.STOREROOM,
        );
        setFilteredFacilities(filtered);
      }
    }
  }, [asset, facilities]);

  useEffect(() => {
    if (asset && facilities.length > 0) {
      setExistingImages(asset.images || []);
      setSelectedFiles([]);
      setPreviewImages([]);
      const assetFacility = facilities.find((f) => f.id === asset.facilityId);
      if (assetFacility) {
        form.setFieldsValue({
          ...asset,
          acquisitionDate: asset.acquisitionDate ? dayjs(asset.acquisitionDate) : undefined,
          facilityId: asset.facilityId,
        });
      }
    }
  }, [asset, form, facilities]);

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
        name: values.name,
        parkAssetType: values.parkAssetType,
        description: values.description,
        parkAssetStatus: values.parkAssetStatus,
        acquisitionDate: values.acquisitionDate ? dayjs(values.acquisitionDate).toISOString() : undefined,
        supplier: values.supplier,
        supplierContactNumber: values.supplierContactNumber,
        parkAssetCondition: values.parkAssetCondition,
        images: [...existingImages],
        remarks: values.remarks,
        facilityId: values.facilityId,
      };

      if (!assetId) {
        throw new Error('Asset ID is missing');
      }

      const isDuplicate = await checkParkAssetDuplicateSerialNumber(values.serialNumber, assetId);
      if (isDuplicate) {
        messageApi.error('This Serial Number already exists. Please enter a unique Serial Number.');
        return;
      }

      const response = await updateParkAssetDetails(assetId, assetData, selectedFiles);
      messageApi.open({
        type: 'success',
        content: 'Saved changes to Asset. Redirecting to Asset details page...',
      });
      setTimeout(() => {
        navigate(`/parkasset/${assetId}`);
      }, 1000);
    } catch (error) {
      messageApi.error(String(error));
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

  const handleImageClick = (index: number) => {
    removeImage(index);
  };

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {loading || assetLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            name="control-hooks"
            onFinish={onFinish}
            layout="horizontal"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: '600px', margin: '0 auto' }}
          >
            <Divider orientation="left">Select the Facility</Divider>
            <Form.Item name="facilityId" label="Facility" rules={[{ required: true, message: 'Please select a facility!' }]}>
              <Select placeholder="Select a facility">
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
              <TextArea />
            </Form.Item>
            <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true, message: 'Please enter Serial Number' }]}>
              <Input placeholder="Enter Serial Number" />
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
              <DatePicker
                className="w-full"
                disabledDate={(current) => {
                  return current && current > dayjs().endOf('day');
                }}
              />
            </Form.Item>
            <Form.Item name="remarks" label="Remarks">
              <TextArea />
            </Form.Item>
            <Form.Item label="Image">
              <ImageInput type="file" multiple onChange={handleFileChange} accept="image/png, image/jpeg" onClick={onInputClick} />
            </Form.Item>

            <Form.Item label="Images">
              <div className="flex flex-wrap gap-2">
                {[...existingImages, ...previewImages].map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`Preview ${index}`}
                    className="w-20 h-20 object-cover rounded border-[1px] border-green-100"
                    onClick={() => handleImageClick(index)}
                  />
                ))}
              </div>
            </Form.Item>
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

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" className="w-full">
                Update
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default AssetEdit;
