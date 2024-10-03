import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { AnnouncementStatusEnum, createAnnouncement, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, DatePicker, Divider, Form, Input, Select, message, Result } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import dayjs from 'dayjs';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

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
    { value: AnnouncementStatusEnum.ACTIVE, label: 'Active' },
    { value: AnnouncementStatusEnum.INACTIVE, label: 'Inactive' },
    { value: AnnouncementStatusEnum.UPCOMING, label: 'Upcoming' },
    { value: AnnouncementStatusEnum.EXPIRED, label: 'Expired' },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);

      const finalData = {
        ...values,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
      };

      console.log('finalData', finalData);

      const response = await createAnnouncement(finalData);
      console.log('response', response);
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
              <RangePicker className="w-full" />
            </Form.Item>

            {user?.role === StaffType.SUPERADMIN && (
              <Form.Item name="parkId" label="Park">
                <Select
                  placeholder="Select a Park (Optional)"
                  options={parks?.map((park) => ({ key: park.id, value: park.id, label: park.name }))}
                  allowClear
                />
              </Form.Item>
            )}

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
