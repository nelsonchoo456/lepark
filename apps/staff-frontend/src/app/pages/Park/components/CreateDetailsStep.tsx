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
      value: 'OPEN',
      label: 'Open',
    },
    {
      value: 'UNDER_CONSTRUCTION',
      label: 'Under Construction',
    },
    {
      value: 'LIMITED_ACCESS',
      label: 'Limites Access',
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
        <Input placeholder="Contact Number" />
      </Form.Item>
      
      <Divider orientation='left'>Park Hours</Divider>
      <Form.Item name="monday" label="Monday" rules={[{ required: true }]}>
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="tuesday" label="Tuesday" rules={[{ required: true }]}>
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="wednesday" label="Wednesday" rules={[{ required: true }]}>
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="thursday" label="Thursday" rules={[{ required: true }]}>
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="friday" label="Friday" rules={[{ required: true }]}>
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="saturday" label="Saturday" rules={[{ required: true }]}>
        <RangePicker className="w-full" use12Hours format="h:mm a"/>
      </Form.Item>
      <Form.Item name="sunday" label="Sunday" rules={[{ required: true }]}>
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
