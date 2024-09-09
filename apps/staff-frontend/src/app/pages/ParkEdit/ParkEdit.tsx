import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark } from '@lepark/common-ui';
import { createPark, getParkById, ParkResponse } from '@lepark/data-access';
import { Button, Card, Divider, Flex, Form, Input, message, Popconfirm, Typography, TimePicker, Select } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import moment from 'moment';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon } from '../../components/map/functions/functions';
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

const ParkEdit = () => {
  const { id } = useParams();
  const [park, setPark] = useState<ParkResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const parkRes = await getParkById(parseInt(id));
        if (parkRes.status === 200) {
          const parkData = parkRes.data
          setPark(parkData);
          const initialValues = {
            ...parkData,
            monday: [moment(parkData.openingHours[0]), moment(parkData.closingHours[0])],
            tuesday: [moment(parkData.openingHours[1]), moment(parkData.closingHours[1])],
            wednesday: [moment(parkData.openingHours[2]), moment(parkData.closingHours[2])],
            thursday: [moment(parkData.openingHours[3]), moment(parkData.closingHours[3])],
            friday: [moment(parkData.openingHours[4]), moment(parkData.closingHours[4])],
            saturday: [moment(parkData.openingHours[5]), moment(parkData.closingHours[5])],
            sunday: [moment(parkData.openingHours[6]), moment(parkData.closingHours[6])],
          };
  
          form.setFieldsValue(initialValues);
        }
        console.log(parkRes.data)
      } catch (error) {
        //
      }
    };
    fetchData();
  }, [id]);

  // Form Values
  const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  // Map Values
  const [polygon, setPolygon] = useState<LatLng[][]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [lat, setLat] = useState(center.lat);
  const [lng, setLng] = useState(center.lng);

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

  const handleCurrStep = async (step: number) => {
    console.log(formValues);
    if (step === 0) {
      setCurrStep(0);
    } else if (step === 1) {
      try {
        const values = await form.validateFields(); // Get form data
        setFormValues(values); // Save form data
        setCurrStep(1); // Move to step 2
      } catch (error) {
        // console.error('Validation failed:', error);
      }
    } else {
      return;
    }
  };

  const handleSubmit = async () => {
    try {
      // console.log(formValues);
      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, ...rest } = formValues;

      const openingHours: any[] = [];
      const closingHours: any[] = [];
      daysOfTheWeek.forEach((day, index) => {
        openingHours.push(formValues[day][0] ? moment(formValues[day][0]).toISOString() : null);
        closingHours.push(formValues[day][1] ? moment(formValues[day][1]).toISOString() : null);
      });

      const finalData = { ...rest, openingHours, closingHours };

      if (polygon[0][0]) {
        const polygonData = latLngArrayToPolygon(polygon[0][0]);
        finalData.geom = polygonData;
      }

      const response = await createPark(finalData);
      if (response.status === 201) {
        setCreatedData(response.data);
        setCurrStep(2);
      }
    } catch (error) {
      console.error('Error creating Park', error);
      messageApi.open({
        type: 'error',
        content: 'Unable to create a Park. Please try again later.',
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
        <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
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

          <Form.Item label={'Monday'}>
            <Flex>
              <Form.Item name="monday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="h:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('monday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Tuesday'}>
            <Flex>
              <Form.Item name="tuesday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="h:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('tuesday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Wednesday'}>
            <Flex>
              <Form.Item name="wednesday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="h:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('wednesday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Thursday'}>
            <Flex>
              <Form.Item name="thursday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="h:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('thursday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Friday'}>
            <Flex>
              <Form.Item name="friday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="h:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('friday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Saturday'}>
            <Flex>
              <Form.Item name="saturday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="h:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('saturday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item label={'Sunday'}>
            <Flex>
              <Form.Item name="sunday" noStyle rules={[{ required: true, message: 'Please enter valid Park Hours' }]}>
                <RangePicker className="w-full" use12Hours format="h:mm a" />
              </Form.Item>
              <Popconfirm title="Input for all the other days will be overriden." onConfirm={() => handleApplyToAllChange('sunday')}>
                <Button style={{ marginLeft: 16 }}>Apply to all days</Button>
              </Popconfirm>
            </Flex>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button type="primary" className="w-full" htmlType='submit'>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ContentWrapperDark>
  );
};

export default ParkEdit;
