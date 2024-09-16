import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createPark, getParkById, ParkResponse, StaffResponse, StaffType, StringIdxSig, updatePark } from '@lepark/data-access';
import { Button, Card, Divider, Flex, Form, Input, Popconfirm, Typography, TimePicker, Select, message, notification } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import moment from 'moment';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon } from '../../components/map/functions/functions';
import dayjs from 'dayjs';
const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};
const { RangePicker } = TimePicker;
const { Text } = Typography;
const { TextArea } = Input;

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const daysOfTheWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const attributes = ['name', 'description', 'address', 'contactNumber', 'openingHours', 'closingHours'];

const ParkEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const [createdData, setCreatedData] = useState<ParkResponse>();
  const [park, setPark] = useState<ParkResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!id) return;

    if (!(user?.role === StaffType.MANAGER && user?.parkId === parseInt(id)) && user?.role !== StaffType.SUPERADMIN) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the details of this park!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    }

    const fetchData = async () => {
      try {
        const parkRes = await getParkById(parseInt(id));
        if (parkRes.status === 200) {
          const parkData = parkRes.data;
          setPark(parkData);
          const initialValues = {
            ...parkData,
            sunday: [dayjs(parkData.openingHours[0]), dayjs(parkData.closingHours[0])],
            monday: [dayjs(parkData.openingHours[1]), dayjs(parkData.closingHours[1])],
            tuesday: [dayjs(parkData.openingHours[2]), dayjs(parkData.closingHours[2])],
            wednesday: [dayjs(parkData.openingHours[3]), dayjs(parkData.closingHours[3])],
            thursday: [dayjs(parkData.openingHours[4]), dayjs(parkData.closingHours[4])],
            friday: [dayjs(parkData.openingHours[5]), dayjs(parkData.closingHours[5])],
            saturday: [dayjs(parkData.openingHours[6]), dayjs(parkData.closingHours[6])],
          };

          form.setFieldsValue(initialValues);
        }
      } catch (error) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Error',
            description: 'An error occurred while fetching the park details.',
          });
          notificationShown.current = true;
        }
        navigate('/');
      }
    };
    fetchData();
  }, [id, user]);

  // Form Values
  const [form] = Form.useForm();

  const parkStatusOptions = [
    {
      value: 'OPEN',
      label: 'Open',
    },
    {
      value: 'UNDER_CONSTRUCTION',
      label: 'Under Construction',
    },
    {
      value: 'LIMITED_ACCESS',
      label: 'Limited Access',
    },
  ];

  const handleSubmit = async () => {
    if (!park) return;
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

      const changedData: Partial<ParkResponse> = Object.keys(finalData).reduce((acc, key) => {
        const typedKey = key as keyof ParkResponse; // Cast key to the correct type
        if (JSON.stringify(finalData[typedKey]) !== JSON.stringify(park?.[typedKey])) {
          acc[typedKey] = finalData[typedKey];
        }
        return acc;
      }, {} as Partial<ParkResponse>);

      const response = await updatePark(park.id, changedData);
      if (response.status === 201) {
        setCreatedData(response.data);
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Park.',
        });
      }
    } catch (error) {
      console.error('Error creating Park', error);
      messageApi.open({
        type: 'error',
        content: 'Unable to save changes to Park. Please try again later.',
      });
    }
  };

  const handleApplyToAllChange = (day: string) => {
    try {
      const dayTime = form.getFieldValue(day);
      if (dayTime) {
        form.setFieldsValue({
          monday: dayTime,
          tuesday: dayTime,
          wednesday: dayTime,
          thursday: dayTime,
          friday: dayTime,
          saturday: dayTime,
          sunday: dayTime,
        });
      } else {
        messageApi.open({
          type: 'error',
          content: `Please put a valid Park Hour range for ${day}`,
        });
      }
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: `Please manually input the Park Hour ranges.`,
      });
    }
  };

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader>Edit Park</PageHeader>
      <Card>
        <Form form={form} onFinish={handleSubmit} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
          {contextHolder}
          <Divider orientation="left">Park Details</Divider>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Park Name" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea placeholder="Park Description" />
          </Form.Item>
          <Form.Item name="parkStatus" label="Park Status" rules={[{ required: true }]}>
            <Select placeholder="Select a Status" options={parkStatusOptions} />
          </Form.Item>

          <Divider orientation="left">Contact Details</Divider>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input placeholder="Park Address" />
          </Form.Item>
          <Form.Item
            name="contactNumber"
            label="Contact Number"
            rules={[
              { required: true },
              {
                pattern: /^[689]\d{7}$/,
                message: 'Contact number must consist of exactly 8 digits and be a valid Singapore contact number',
              },
            ]}
          >
            <Input placeholder="Contact Number" />
          </Form.Item>

          <Divider orientation="left">
            Park Hours <Text type="danger">{' *'}</Text>
          </Divider>

          <Form.Item label={'Sunday'} key="sunday">
            <Flex>
              <Form.Item name="sunday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('sunday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Monday'} key="monday">
            <Flex>
              <Form.Item name="monday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('monday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Tuesday'} key="tuesday">
            <Flex>
              <Form.Item name="tuesday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('tuesday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Wednesday'} key="wednesday">
            <Flex>
              <Form.Item name="wednesday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('wednesday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Thursday'} key="thursday">
            <Flex>
              <Form.Item name="thursday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('thursday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Friday'} key="friday">
            <Flex>
              <Form.Item name="friday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('friday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Saturday'} key="saturday">
            <Flex>
              <Form.Item name="saturday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="hh:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('saturday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

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

export default ParkEdit;
