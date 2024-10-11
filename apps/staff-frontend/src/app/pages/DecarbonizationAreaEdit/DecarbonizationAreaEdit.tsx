import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { getDecarbonizationAreaById, updateDecarbonizationArea, ParkResponse, StaffResponse, StaffType, DecarbonizationAreaResponse } from '@lepark/data-access';
import { Button, Card, Divider, Form, Input, Select, message, Typography, Popconfirm } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useRestrictDecarbonizationArea } from '../../hooks/DecarbonizationArea/useRestrictDecarbonizationArea';

const { TextArea } = Input;
const { Text } = Typography;

const parseGeom = (geom: string) => {
  //console.log('Parsing geom:', geom); // Log the geom string

  // Check if the string is a GeoJSON format
  if (geom.startsWith('SRID=4326;')) {
    const wktString = geom.substring(10); // Remove the 'SRID=4326;' prefix

    // Handle WKT format
    const match = wktString.match(/POLYGON\s*\(\(([^)]+)\)\)/);
    if (!match) {
      throw new Error(`Invalid WKT format: ${wktString}`);
    }

    const coordinates = match[1].split(',').map((coord) => {
      const [lng, lat] = coord.trim().split(' ').map(Number);
      return [lng, lat];
    });

    return {
      type: 'Polygon',
      coordinates: [coordinates],
    };
  }

  // If it's not WKT, try to parse it as GeoJSON
  try {
    const geoJson = JSON.parse(geom);
    return geoJson;
  } catch (error) {
    throw new Error(`Invalid GeoJSON format: ${geom}`);
  }
};

const DecarbonizationAreaEdit = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const navigate = useNavigate();
  const { parks, loading: parksLoading } = useFetchParks();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const { decarbonizationArea, loading } = useRestrictDecarbonizationArea(id);


  useEffect(() => {
    if (decarbonizationArea) {
          form.setFieldsValue(decarbonizationArea);
        }
      
    }, [decarbonizationArea]);

  const handleSubmit = async () => {
    if (!decarbonizationArea) return;
    try {
      const formValues = await form.validateFields();

      const finalData = { ...formValues };

      const changedData: Partial<DecarbonizationAreaResponse> = Object.keys(finalData).reduce((acc, key) => {
        const typedKey = key as keyof DecarbonizationAreaResponse;
        if (JSON.stringify(finalData[typedKey]) !== JSON.stringify(decarbonizationArea?.[typedKey])) {
          acc[typedKey] = finalData[typedKey];
        }
        return acc;
      }, {} as Partial<DecarbonizationAreaResponse>);

      const response = await updateDecarbonizationArea(decarbonizationArea.id, changedData);
      if (response.status === 200) {
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Decarbonization Area. Redirecting to Decarbonization Area details page...',
        });
        setTimeout(() => {
          navigate(`/decarbonization-area/${decarbonizationArea.id}`);
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: 'error',
          content: error.message || 'Unable to save changes to Decarbonization Area. Please try again later.',
        });
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the Decarbonization Area.',
        });
      }
    }
  };

  const breadcrumbItems = [
    {
      title: 'Decarbonization Area Management',
      pathKey: '/decarbonization-area',
      isMain: true,
    },
    {
      title: decarbonizationArea?.name ? decarbonizationArea?.name : 'Details',
      pathKey: `/decarbonization-area/${decarbonizationArea?.id}`,
    },
    {
      title: 'Edit',
      pathKey: `/decarbonization-area/${decarbonizationArea?.id}/edit`,
      isCurrent: true,
    },
  ];

  if (parksLoading) {
    return <div>Loading...</div>;
  }

  if (!decarbonizationArea) {
    return <div>Decarbonization Area not found</div>;
  }

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Form form={form} onFinish={handleSubmit} labelCol={{ span: 8 }} className="max-w-[600px] mx-auto mt-8">
          {contextHolder}
          <Divider orientation="left">Decarbonization Area Details</Divider>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Decarbonization Area Name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea placeholder="Description" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8 }}>
            <Button type="primary" htmlType="submit" className="w-full">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ContentWrapperDark>
  );
};

export default DecarbonizationAreaEdit;
