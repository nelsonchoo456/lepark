import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark } from '@lepark/common-ui';
import {
  createPark,
  getOccurrenceById,
  getParkById,
  OccurrenceResponse,
  ParkResponse,
  StringIdxSig,
  updateOccurrenceDetails,
  updatePark,
} from '@lepark/data-access';
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Popconfirm,
  Typography,
  TimePicker,
  Select,
  DatePicker,
  InputNumber,
} from 'antd';
import PageHeader from '../../components/main/PageHeader';
import moment from 'moment';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon } from '../../components/map/functions/functions';
import dayjs from 'dayjs';
import PageHeader2 from '../../components/main/PageHeader2';
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

const OccurrenceEdit = () => {
  const { occurrenceId } = useParams();
  const [form] = Form.useForm();
  const [createdData, setCreatedData] = useState<OccurrenceResponse>();
  const [occurrence, setOccurrence] = useState<OccurrenceResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!occurrenceId) return;
    const fetchData = async () => {
      try {
        const occurrenceRes = await getOccurrenceById(occurrenceId);
        if (occurrenceRes.status === 200) {
          const occurrenceData = occurrenceRes.data;
          setOccurrence(occurrenceData);

          const dateOfBirth = moment(occurrenceData.dateOfBirth);
          const dateObserved = moment(occurrenceData.dateObserved);
          const finalData = { ...occurrenceData, dateObserved, dateOfBirth };

          form.setFieldsValue(finalData);
        }
      } catch (error) {
        //
      }
    };
    fetchData();
  }, [occurrenceId, form]);

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

  const handleSubmit = async () => {
    if (!occurrence) return;
    try {
      const formValues = await form.validateFields();
      console.log(formValues);

      const changedData: Partial<OccurrenceResponse> = Object.keys(formValues).reduce((acc, key) => {
        const typedKey = key as keyof OccurrenceResponse; // Cast key to the correct type
        if (JSON.stringify(formValues[typedKey]) !== JSON.stringify(occurrence?.[typedKey])) {
          acc[typedKey] = formValues[typedKey];
        }
        return acc;
      }, {} as Partial<OccurrenceResponse>);

      if (changedData.dateObserved) {
        changedData.dateObserved = dayjs(changedData.dateObserved).toISOString();
      }
      if (changedData.dateOfBirth) {
        changedData.dateOfBirth = dayjs(changedData.dateOfBirth).toISOString();
      }

      // console.log(changedData);
      const occurenceRes = await updateOccurrenceDetails(occurrence.id, changedData);
      if (occurenceRes.status === 200) {
        setCreatedData(occurenceRes.data);
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Occurrence. Redirecting to Occurrence details page...',
        });
        // Add a 3-second delay before navigating
        setTimeout(() => {
          navigate(`/occurrences/${occurrence.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating Occurrence', error);
      messageApi.open({
        type: 'error',
        content: 'Unable to update Occurrence. Please try again later.',
      });
    }
  };

  const speciesOptions = [
    {
      value: 'genus',
      title: 'keke',
      children: [
        {
          value: 'orchid',
          title: 'Orchid',
        },
      ],
    },
  ];

  const decarbonizationTypeOptions = [
    {
      value: 'TREE_TROPICAL',
      label: 'Tree Tropical',
    },
    {
      value: 'TREE_MANGROVE',
      label: 'Tree Mangronve',
    },
    {
      value: 'SHRUB',
      label: 'Shrub',
    },
  ];

  const occurrenceStatusOptions = [
    {
      value: 'HEALTHY',
      label: 'Healthy',
    },
    {
      value: 'MONITOR_AFTER_TREATMENT',
      label: 'Monitor After Treatment',
    },
    {
      value: 'NEEDS_ATTENTION',
      label: 'Needs Attention',
    },
    {
      value: 'URGENT_ACTION_NEEDED',
      label: 'Urgent Action Needed',
    },
    {
      value: 'REMOVED',
      label: 'Removed',
    },
  ];

  const breadcrumbItems = [
    {
      title: "Occurrence Management",
      pathKey: '/occurrences',
      isMain: true,
    },
    {
      title: occurrence?.title ? occurrence?.title : "Details",
      pathKey: `/occurrences/${occurrence?.id}`,
    },
    {
      title: "Edit",
      pathKey: `/occurrences/${occurrence?.id}/edit`,
      isCurrent: true
    }
  ]

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <Card>
        <Form
          form={form}
          // style={{ maxWidth: 50 }}
          labelCol={{ span: 8 }}
          className="max-w-[600px] mx-auto mt-8"
          onFinish={handleSubmit}
        >
          {/* <Form.Item name="species" label="Species" rules={[{ required: true }]}>
        <TreeSelect placeholder="Select a Species" treeData={speciesOptions}/>
      </Form.Item> */}
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Give this Plant Occurrence a title!" />
          </Form.Item>
          <Form.Item name="dateObserved" label="Date Observed" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="dateOfBirth" label="Date of Birth">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="numberOfPlants" label="Number of Plants" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" placeholder="Number of Plants" />
          </Form.Item>
          <Form.Item name="biomass" label="Biomass" rules={[{ required: true }]}>
            <InputNumber min={0} placeholder="Biomass" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea
              // value={value}
              // onChange={(e) => setValue(e.target.value)}
              placeholder="Share details about this Plant Occurrence!"
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          <Form.Item name="occurrenceStatus" label="Occurrence Status" rules={[{ required: true }]}>
            <Select placeholder="Select a Status for the Occurrence" options={occurrenceStatusOptions} />
          </Form.Item>
          <Form.Item name="decarbonizationType" label="Decarbonization Type" rules={[{ required: true }]}>
            <Select placeholder="Select a Decarbonization Type" options={decarbonizationTypeOptions} />
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

export default OccurrenceEdit;
