import { useEffect, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import "leaflet/dist/leaflet.css";
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { SIDEBAR_WIDTH } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import { CustButton } from '@lepark/common-ui';
//species form
import React from 'react';
import { Button, Form, Input, Select, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { phylums, regions, lightType, soilType, conservationStatus } from '@lepark/data-utility';
const { Option } = Select;

const CreateSpecies = () => {
  const [webMode, setWebMode] = useState<boolean>(
    window.innerWidth >= SCREEN_LG
  );

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Species form
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
    const onFinish = (values: any) => {
    console.log(values);
  };
  const onReset = () => {
    form.resetFields();
  };
  const {TextArea} = Input;
  const [value, setValue] = useState('');

  return webMode ? (
    <div
      className="h-screen w-[calc(100vw-var(--sidebar-width))] p-10" // page wrapper - padding
      style={{
        zIndex: 1,
      }}
    >
      <h1 className="header-1 mb-4">Create Species</h1>

      {<Form
      {...layout}
      form={form}
      name="control-hooks"
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
    >
      <Form.Item name="phylum" label="Phylum" rules={[{ required: true }]}>
        <Select placeholder="Select a phylum" allowClear>
          {phylums.map(phylum => (
            <Option key={phylum} value={phylum}>{phylum}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="classInput" label="Class" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="orderInput" label="Order" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="familyInput" label="Family" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="genusInput" label="Genus" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="speciesInput" label="Species" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="commonNameInput" label="Common Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="speciesDescriptionInput" label="Species Description" rules={[{ required: true }]}>
        <TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Share more details!"
        autoSize={{ minRows: 3, maxRows: 5 }}
      />
      </Form.Item>

      <Form.Item name="regionOfOriginInput" label="Region of Origin" rules={[{ required: true }]}>
        <Select
        showSearch
        style={{ width: 400 }}
        placeholder="Select a region"
        optionFilterProp="children"
        filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        >
        {regions.map((region) => (
            <Option key={region} value={region}>
            {region}
            </Option>
        ))}
        </Select>
    </Form.Item>

      <Form.Item name="lightTypeInput" label="Light Type" rules={[{ required: true }]}>
        <Select
          showSearch
          style={{ width: 400 }}
          placeholder="Select a light type"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {lightType.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="soilTypeInput" label="Soil Type" rules={[{ required: true }]}>
        <Select
          showSearch
          style={{ width: 400 }}
          placeholder="Select a soil type"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {soilType.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="conservationStatusInput" label="Conservation Status" rules={[{ required: true }]}>
        <Select
          showSearch
          style={{ width: 400 }}
          placeholder="Select a conservation status"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {conservationStatus.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.gender !== currentValues.gender}
      >
        {({ getFieldValue }) =>
          getFieldValue('gender') === 'other' ? (
            <Form.Item name="customizeGender" label="Customize Gender" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          ) : null
        }
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>

        </Space>
      </Form.Item>
    </Form>}
    </div>
  ) : (
    <div
      className="h-[calc(100vh-2rem)] w-screen p-4" // page wrapper - padding
    >
       <h1 className="header-1 mb-4">Species Mobile Mode</h1>
       {/* Add your mobile content here */}
    </div>
  );
};

export default CreateSpecies;
