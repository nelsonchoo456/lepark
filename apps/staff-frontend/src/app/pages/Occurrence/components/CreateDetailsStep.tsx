import { Button, DatePicker, Form, FormInstance, Input, InputNumber, Select, TreeSelect } from 'antd';
const { TextArea } = Input;

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
      <Form.Item name="decarbonizationType" label="Decarbonization Type" rules={[{ required: true }]}>
        <Select placeholder="Select a Decarbonization Type" options={decarbonizationTypeOptions}/>
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
