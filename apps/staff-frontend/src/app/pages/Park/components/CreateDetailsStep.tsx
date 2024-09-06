import { Button, DatePicker, Divider, Form, FormInstance, Input, InputNumber, Select, TimePicker, TreeSelect } from 'antd';
const { TextArea } = Input;
const { RangePicker } = TimePicker

interface CreateDetailsStepProps {
  handleCurrStep: (step: number) => void;
  form: FormInstance;
}

const CreateDetailsStep = ({ handleCurrStep, form }: CreateDetailsStepProps) => {

  const speciesOptions = [
    {
      value: 'genus',
      title: 'keke',
      children: [
        {
          value: 'orchid',
          title: 'Orchid'
        }
      ]
    }
  ]

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
  ]
  return (
    <Form
      form={form}
      // style={{ maxWidth: 50 }}
      labelCol={{ span: 8 }}
      className="max-w-[600px] mx-auto mt-8"
    >
      {/* <Form.Item name="species" label="Species" rules={[{ required: true }]}>
        <TreeSelect placeholder="Select a Species" treeData={speciesOptions}/>
      </Form.Item> */}
      <Divider orientation='left'>Park Details</Divider>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input placeholder="Park Name" />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true }]}>
        <Input placeholder="Park Description" />
      </Form.Item>
      <Form.Item name="parkStatus" label="Park Status" rules={[{ required: true }]}>
        <Select placeholder="Select a Status" options={decarbonizationTypeOptions}/>
      </Form.Item>

      <Divider orientation='left'>Contact Details</Divider>
      <Form.Item name="address" label="Address" rules={[{ required: true }]}>
        <Input placeholder="Park Address" />
      </Form.Item>
      <Form.Item name="contactNumber" label="Contact Number" rules={[{ required: true }]}>
        <Input placeholder="Park Address" />
      </Form.Item>
      
      <Divider orientation='left'>Park Hours</Divider>
      <Form.Item name="1" label="Monday">
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="2" label="Tuesday">
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="3" label="Wednesday">
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="4" label="Thursday">
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="5" label="Friday">
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="6" label="Saturday">
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="7" label="Sunday">
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8 }}>
        <Button type="primary" className="w-full" onClick={() => handleCurrStep(1)}>
          Next
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDetailsStep;
