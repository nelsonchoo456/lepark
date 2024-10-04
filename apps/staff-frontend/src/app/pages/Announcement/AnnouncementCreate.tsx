import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { AnnouncementStatusEnum, createAnnouncement, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, DatePicker, Divider, Form, Input, Select, message, Result, Switch, Radio } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import dayjs from 'dayjs';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import moment from 'moment-timezone';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AnnouncementCreate = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks } = useFetchParks();
  const [messageApi, contextHolder] = message.useMessage();
  const [createdData, setCreatedData] = useState<any | null>();
  const navigate = useNavigate();

  const [form] = Form.useForm();

  const announcementStatusOptions = [
    { value: AnnouncementStatusEnum.ACTIVE, label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.ACTIVE) },
    { value: AnnouncementStatusEnum.INACTIVE, label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.INACTIVE) },
    { value: AnnouncementStatusEnum.UPCOMING, label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.UPCOMING) },
    { value: AnnouncementStatusEnum.EXPIRED, label: formatEnumLabelToRemoveUnderscores(AnnouncementStatusEnum.EXPIRED) },
  ];

  const parkWideOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // console.log('Values:', values);

      const { isParkWide, dateRange, ...otherValues } = values;

      if (isParkWide) {
        otherValues.parkId = null;
      }

      const finalData = {
        ...otherValues,
        startDate: dateToSGT(values.dateRange[0]).format(),
        endDate: dateToSGT(values.dateRange[1], true).format(),
        updatedAt: dateToSGT(moment()).format(),
        status: AnnouncementStatusEnum.ACTIVE,
      };

      // console.log('Final Data:', finalData);

      const response = await createAnnouncement(finalData);
      if (response?.status && response.status === 201) {
        setCreatedData(response.data);
      }
    } catch (error) {
      if ((error as { errorFields?: any }).errorFields) {
        console.log('Validation failed:', (error as { errorFields?: any }).errorFields);
      } else {
        console.log(error);
        messageApi.open({
          type: 'error',
          content: 'Unable to create Announcement. Please try again later.',
        });
      }
    }
  };

  const dateToSGT = (date: moment.Moment, isEndDate: boolean = false) => {
    return moment.tz(date.format('YYYY-MM-DD'), 'Asia/Singapore')[isEndDate ? 'endOf' : 'startOf']('day');
  };

  const onDateChange = (dates: [moment.Moment, moment.Moment] | null) => {
    if (dates) {
      const startDateSGT = dateToSGT(dates[0]);
      const endDateSGT = dateToSGT(dates[1], true);
      // console.log('Start Date (SGT):', startDateSGT.format('YYYY-MM-DD HH:mm:ss'));
      // console.log('End Date (SGT):', endDateSGT.format('YYYY-MM-DD HH:mm:ss'));
    }
  };

  const disabledDate = (current: moment.Moment) => {
    // Can't select days before today
    if (current < moment().startOf('day')) {
      return true;
    } else {
      return false;
    }
  };

  const breadcrumbItems = [
    {
      title: 'Announcement Management',
      pathKey: '/announcement',
      isMain: true,
    },
    {
      title: 'Create',
      pathKey: `/announcement/create`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!createdData ? (
          <Form form={form} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
            <Divider orientation="left">Announcement Details</Divider>

            {user?.role === StaffType.SUPERADMIN && (
              <>
                <Form.Item name="isParkWide" label="Publish to all Parks" rules={[{ required: true, message: 'Please select an option' }]}>
                  <Radio.Group options={parkWideOptions} optionType="button" />
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.isParkWide !== currentValues.isParkWide}>
                  {({ getFieldValue }) =>
                    getFieldValue('isParkWide') === false && (
                      <Form.Item name="parkId" label="Park" rules={[{ required: true }]}>
                        <Select
                          placeholder="Select a Park"
                          options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))}
                          allowClear
                        />
                      </Form.Item>
                    )
                  }
                </Form.Item>
              </>
            )}
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true }, { min: 3, message: 'Title must be at least 3 characters long' }]}
            >
              <Input
                placeholder="Enter Title"
                onBlur={(e) => {
                  const trimmedValue = e.target.value.trim();
                  form.setFieldsValue({ title: trimmedValue });
                }}
              />
            </Form.Item>

            <Form.Item name="content" label="Content" rules={[{ required: true }]}>
              <TextArea placeholder="Describe the Event" autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>

            <Form.Item name="dateRange" label="Published Dates" rules={[{ required: true, message: 'Please select the dates to publish' }]}>
              <RangePicker
                className="w-full"
                format="YYYY-MM-DD"
                disabledDate={(current) => disabledDate(moment(current.toDate()))}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    onDateChange([moment(dates[0].toDate()), moment(dates[1].toDate())]);
                  } else {
                    onDateChange(null);
                  }
                }}
              />
            </Form.Item>

            <Form.Item label={' '} colon={false}>
              <Button type="primary" className="w-full" onClick={handleSubmit}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="py-4">
            <Result
              status="success"
              title="Created new Announcement"
              subTitle={createdData && <>Announcement title: {createdData.title}</>}
              extra={[
                <Button key="back" onClick={() => navigate('/announcement')}>
                  Back to Announcement Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/announcement/${createdData?.id}`)}>
                  View new Announcement
                </Button>,
              ]}
            />
          </div>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default AnnouncementCreate;
