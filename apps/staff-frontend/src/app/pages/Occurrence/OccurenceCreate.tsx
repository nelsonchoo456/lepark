import { ContentWrapperDark } from '@lepark/common-ui';
import { Card, Form, Input, Select, Tabs } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import TextArea from 'antd/es/input/TextArea';

const OccurrenceCreate = () => {
  // Tabs Utility
  const tabsItems = [
    {
      key: 'About',
      label: 'About',
      children: (
        <Form
          // style={{ maxWidth: 50 }}
          labelCol={{ span: 8 }}
          className="max-w-[600px] mx-auto"
        >
          <Form.Item name="species" label="Species" rules={[{ required: true }]}>
            <Select />
          </Form.Item>
          <Form.Item name="numberOfPlants" label="Number of Plants" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="biomass" label="Biomass" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea
              // value={value}
              // onChange={(e) => setValue(e.target.value)}
              // placeholder="Share more details!"
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          <Form.Item name="decaronizationType" label="Decarbonization Type" rules={[{ required: true }]}>
            <Select />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      children: <></>,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader>Occurrence Management</PageHeader>
      <Card>
        <Tabs items={tabsItems} tabPosition={'left'} />
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceCreate;
