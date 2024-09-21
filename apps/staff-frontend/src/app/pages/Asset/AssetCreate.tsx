import { useEffect, useRef, useState } from 'react';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import {
  ParkAssetTypeEnum,
  ParkAssetStatusEnum,
  ParkAssetConditionEnum,
  createParkAsset,
  ParkAssetData,
  StaffResponse,
} from '@lepark/data-access';
import { Button, Card, DatePicker, Form, Input, InputNumber, message, Modal, notification, Result, Select, Space, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import useUploadImages from '../../hooks/Images/useUploadImages';
import dayjs from 'dayjs';

const formatEnumLabel = (enumValue: string): string => {
  return enumValue
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const AssetCreate = () => {
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const navigate = useNavigate();
  const [createdAsset, setCreatedAsset] = useState<any | null>();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id !== '') {
      if (!['MANAGER', 'SUPERADMIN', 'PARK_RANGER','LANDSCAPE_ARCHITECT'].includes(user.role)) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Access Denied',
            description: 'You are not allowed to access the Create Asset page!',
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

  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();

  const [form] = Form.useForm();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [createdAssetName, setCreatedAssetName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState<dayjs.Dayjs | null>(null);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState<dayjs.Dayjs | null>(null);


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
       const assetData: ParkAssetData = {
        parkAssetName: values.parkAssetName,
        parkAssetType: values.parkAssetType,
        parkAssetDescription: values.parkAssetDescription,
        parkAssetStatus: values.parkAssetStatus,
        acquisitionDate: dayjs(values.acquisitionDate).toISOString(),
        recurringMaintenanceDuration: values.recurringMaintenanceDuration,
        lastMaintenanceDate: dayjs(values.lastMaintenanceDate).toISOString(),
        nextMaintenanceDate: dayjs(values.nextMaintenanceDate).toISOString(),
        supplier: values.supplier,
        supplierContactNumber: values.supplierContactNumber,
        parkAssetCondition: values.parkAssetCondition,
        images: [],
        remarks: values.remarks,
        facilityId: values.facilityId,
      };

      if (selectedFiles.length === 0) {
        Modal.error({
          title: 'Error',
          content: 'Please upload at least one image.',
        });
        return;
      }

      const response = await createParkAsset(assetData, selectedFiles);
      console.log('Asset created:', response.data);
      setCreatedAssetName(values.parkAssetName);
      setCreatedAsset(response.data);
      setShowSuccessAlert(true);
      form.resetFields();
    } catch (error) {
      message.error(String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

   const disabledLastMaintenanceDate = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf('day');
  };

  const disabledNextMaintenanceDate = (current: dayjs.Dayjs) => {
    if (!lastMaintenanceDate) return false;

    const today = dayjs().startOf('day');
    const lastMaintenanceIsBeforeToday = lastMaintenanceDate.isBefore(today, 'day');
    const lastMaintenanceIsToday = lastMaintenanceDate.isSame(today, 'day');

    if (lastMaintenanceIsBeforeToday) {
      return current.isBefore(today, 'day');
    } else if (lastMaintenanceIsToday) {
      return current.isBefore(today.add(1, 'day'), 'day');
    } else {
      return current.isBefore(lastMaintenanceDate.add(1, 'day'), 'day');
    }
  };

  const onLastMaintenanceDateChange = (date: dayjs.Dayjs | null) => {
    setLastMaintenanceDate(date);
    if (date) {
      const today = dayjs().startOf('day');
      const currentNextMaintenanceDate = form.getFieldValue('nextMaintenanceDate');

      if (date.isSame(today, 'day') && currentNextMaintenanceDate && currentNextMaintenanceDate.isSame(today, 'day')) {
        const tomorrow = today.add(1, 'day');
        setNextMaintenanceDate(tomorrow);
        form.setFieldsValue({ nextMaintenanceDate: tomorrow });
      }
    }
  };

  const onNextMaintenanceDateChange = (date: dayjs.Dayjs | null) => {
    setNextMaintenanceDate(date);
  };


  const onReset = () => {
    form.resetFields();
  };

   const onRecurringMaintenanceChange = (value: number | null) => {
    if (value && lastMaintenanceDate) {
      const newNextMaintenanceDate = lastMaintenanceDate.add(value, 'day');
      setNextMaintenanceDate(newNextMaintenanceDate);
      form.setFieldsValue({ nextMaintenanceDate: newNextMaintenanceDate });
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
      title: 'Asset Management',
      pathKey: '/parkasset',
      isMain: true,
    },
    {
      title: 'Create Asset',
      pathKey: `/parkasset/create`,
      isCurrent: true,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
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
              <Input.TextArea />
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

                 <Form.Item name="lastMaintenanceDate" label="Last Maintenance Date" rules={[{ required: true }]}>
              <DatePicker
                className="w-full"
                disabledDate={disabledLastMaintenanceDate}
                onChange={onLastMaintenanceDateChange}
              />
            </Form.Item>

            <Form.Item name="nextMaintenanceDate" label="Next Maintenance Date" rules={[{ required: true }]}>
              <DatePicker
                className="w-full"
                disabledDate={disabledNextMaintenanceDate}
                onChange={onNextMaintenanceDateChange}
              />
            </Form.Item>

               <Form.Item
              name="recurringMaintenanceDuration"
              label="Recurring Maintenance (days)"
              rules={[{ required: true, type: 'number', min: 1, message: 'Please enter a valid number of days' }]}
            >
              <InputNumber
                className="w-full"
                min={1}
                onChange={onRecurringMaintenanceChange}
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
              <Input.TextArea />
            </Form.Item>

             <Form.Item
              name="facilityId"
              label="Facility ID"
              rules={[
                { required: true, message: 'Please input the facility ID!' },
                { whitespace: true, message: 'Facility ID cannot be empty!' },
              ]}
              getValueFromEvent={(e) => e.target.value.trim()} // Trim leading and trailing spaces
            >
              <Input />
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
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
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
            title="Created new Asset"
            subTitle={createdAssetName && <>Asset name: {createdAssetName}</>}
            extra={[
              <Button key="back" onClick={() => navigate('/parkasset')}>
                Back to Asset Management
              </Button>,
              <Button type="primary" key="view" onClick={() => navigate(`/parkasset/${createdAsset?.id}`)}>
                View new Asset
              </Button>,
            ]}
          />
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default AssetCreate;
