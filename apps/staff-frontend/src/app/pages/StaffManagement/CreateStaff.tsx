import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Select, Descriptions, Switch, Space, message, Typography, notification, Card, Divider, Flex, Result, Steps } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { registerStaff, RegisterStaffData, StaffResponse, StaffType, ParkResponse, getParkById, getAllParks } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import CreateDetailsStep from './components/CreateDetailsStep';

const { Option } = Select;

const CreateStaff: React.FC = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const { Text } = Typography;
  const notificationShown = useRef(false);
  const [currStep, setCurrStep] = useState<number>(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [createdData, setCreatedData] = useState<StaffResponse | null>(null);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const generatedPassword = Array.from(window.crypto.getRandomValues(new Uint32Array(10)))
        .map((value) => characters[value % characters.length])
        .join('');

      const newStaffDetails: RegisterStaffData = {
        firstName: values.firstNameInput,
        lastName: values.lastNameInput,
        contactNumber: values.contactNumberInput,
        email: values.emailInput,
        password: generatedPassword,
        role: values.roleSelect,
        parkId: values.parkSelect,
        isFirstLogin: true,
      };

      const response = await registerStaff(newStaffDetails);
      setCurrStep(1);
      setCreatedData(response.data);
      messageApi.success('Staff added successfully!');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('Invalid email address')) {
        messageApi.error('Invalid email format.');
      } else {
        messageApi.error(errorMessage || 'Failed to update staff details.');
      }
    }
  };

  useEffect(() => {
    if (user?.role !== StaffType.MANAGER && user?.role !== StaffType.SUPERADMIN) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Staff Management page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    } else {
      getAllParks()
        .then((response) => {
          setParks(response.data);
        })
        .catch((error) => {
          console.error('There was an error fetching the parks data!', error);
        });
    }
  }, [user, navigate]);

  const getParkName = (parkId?: number) => {
    const park = parks.find((park) => park.id === parkId);
    return parkId && park ? park.name : 'NParks';
  };

  const breadcrumbItems = [
    {
      title: 'Staff Management',
      pathKey: '/staff-management',
      isMain: true,
    },
    {
      title: 'Create',
      pathKey: `/staff-management/create-staff`,
      isCurrent: true,
    },
  ];

  const content = [
    {
      key: 'details',
      children: (
        <CreateDetailsStep
          form={form}
          parks={parks}
          user={user}
        />
      ),
    },
    {
      key: 'complete',
      children: <>Created</>,
    },
  ];

  if (user?.role !== StaffType.SUPERADMIN && user?.role !== StaffType.MANAGER) {
    return <></>;
  }

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Steps
          current={currStep}
          items={[
            {
              title: 'Details',
              description: 'Input Staff details',
            },
            {
              title: 'Complete',
            },
          ]}
        />
        {currStep === 0 && (
          <>
            {content[0].children}
            <Form.Item wrapperCol={{ offset: 8, span: 16 }} className="max-w-[600px] mx-auto">
              <Button type="primary" className="w-full" onClick={handleSubmit} disabled={parks.length === 0}>
                Submit
              </Button>
            </Form.Item>
          </>
        )}
        {currStep === 1 && (
          <Flex justify="center" className="py-4">
            <Result
              status="success"
              title="Created new Staff"
              extra={[
                <Button key="back" onClick={() => navigate('/staff-management')}>
                  Back to Staff Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/staff-management/${createdData?.id}`)}>
                  View new Staff
                </Button>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default CreateStaff;
