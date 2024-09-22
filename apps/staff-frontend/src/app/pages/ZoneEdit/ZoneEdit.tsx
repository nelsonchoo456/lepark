import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { updateZone, getZoneById, ZoneResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, Divider, Flex, Form, Input, Popconfirm, Typography, TimePicker, Select, message, notification } from 'antd';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon } from '../../components/map/functions/functions';
import dayjs from 'dayjs';
import useUploadImages from '../../hooks/Images/useUploadImages';
import PageHeader2 from '../../components/main/PageHeader2';
import CreateDetailsStep from '../ZoneCreate/components/CreateDetailsStep';
import CreateMapStep from '../ZoneCreate/components/CreateMapStep';

const { RangePicker } = TimePicker;
const { Text } = Typography;
const { TextArea } = Input;

const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ZoneEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const [zone, setZone] = useState<ZoneResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const { selectedFiles, previewImages, setPreviewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [form] = Form.useForm();

  // Map Values
  const [polygon, setPolygon] = useState<LatLng[][]>([]);
  const [lines, setLines] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const zoneRes = await getZoneById(parseInt(id));
        if (zoneRes.status === 200) {
          const zoneData = zoneRes.data;
          setZone(zoneData);
          const initialValues = {
            ...zoneData,
            sunday: [dayjs(zoneData.openingHours[0]), dayjs(zoneData.closingHours[0])],
            monday: [dayjs(zoneData.openingHours[1]), dayjs(zoneData.closingHours[1])],
            tuesday: [dayjs(zoneData.openingHours[2]), dayjs(zoneData.closingHours[2])],
            wednesday: [dayjs(zoneData.openingHours[3]), dayjs(zoneData.closingHours[3])],
            thursday: [dayjs(zoneData.openingHours[4]), dayjs(zoneData.closingHours[4])],
            friday: [dayjs(zoneData.openingHours[5]), dayjs(zoneData.closingHours[5])],
            saturday: [dayjs(zoneData.openingHours[6]), dayjs(zoneData.closingHours[6])],
          };
          if (zoneData.images) {
            setCurrentImages(zoneData.images);
          }
          
          form.setFieldsValue(initialValues);
          
          // Set polygon data if available
          if (zoneData.geom) {
            // Convert geom to LatLng[][] format
            setPolygon([zoneData.geom.coordinates[0].map((coord: number[]) => ({ lat: coord[1], lng: coord[0] }))]);
          }
        }
      } catch (error) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Error',
            description: 'An error occurred while fetching the zone details.',
          });
          notificationShown.current = true;
        }
        navigate('/');
      }
    };
    fetchData();
  }, [id, form, navigate]);

  const handleSubmit = async () => {
    if (!zone) return;
    try {
      const formValues = await form.validateFields();
      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, ...rest } = formValues;

      const openingHours: any[] = [];
      const closingHours: any[] = [];
      daysOfTheWeek.forEach((day, index) => {
        openingHours.push(formValues[day][0] ? formValues[day][0].toISOString() : null);
        closingHours.push(formValues[day][1] ? formValues[day][1].toISOString() : null);
      });

      const finalData = { ...rest, openingHours, closingHours };

      if (polygon && polygon[0] && polygon[0][0]) {
        const polygonData = latLngArrayToPolygon(polygon[0][0]);
        finalData.geom = polygonData;
      }

      const changedData: Partial<ZoneResponse> = Object.keys(finalData).reduce((acc, key) => {
        const typedKey = key as keyof ZoneResponse;
        if (JSON.stringify(finalData[typedKey]) !== JSON.stringify(zone?.[typedKey])) {
          acc[typedKey] = finalData[typedKey];
        }
        return acc;
      }, {} as Partial<ZoneResponse>);

      changedData.images = currentImages;
      const response = await updateZone(zone.id, changedData, selectedFiles);
      setPreviewImages([]);
      if (response.status === 200) {
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Zone. Redirecting to Zone details page...',
        });
        setTimeout(() => {
          navigate(`/zone/${zone.id}`);
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: 'error',
          content: error.message || 'Unable to save changes to Zone. Please try again later.',
        });
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the zone.',
        });
      }
    }
  };

  // ... (other helper functions like handleApplyToAllChange, handleCurrentImageClick)

  const breadcrumbItems = [
    {
      title: 'Zone Management',
      pathKey: '/zone',
      isMain: true,
    },
    {
      title: zone?.name ? zone?.name : "Details",
      pathKey: `/zone/${zone?.id}`,
    },
    {
      title: "Edit",
      pathKey: `/zone/${zone?.id}/edit`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <Card>
        <Form form={form} onFinish={handleSubmit} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
          {contextHolder}
          <Divider orientation="left">Zone Details</Divider>
          <CreateDetailsStep
            handleCurrStep={() => {}}
            form={form}
            parks={[]}  // You might need to fetch parks or pass them as props
            previewImages={previewImages}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
            onInputClick={onInputClick}
          />
          
          <Divider orientation="left">Zone Location</Divider>
          <CreateMapStep 
            handleCurrStep={() => {}} 
            polygon={polygon} 
            setPolygon={setPolygon} 
            lines={lines} 
            setLines={setLines} 
          />

          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button type="primary" className="w-full" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ContentWrapperDark>
  );
};

export default ZoneEdit;