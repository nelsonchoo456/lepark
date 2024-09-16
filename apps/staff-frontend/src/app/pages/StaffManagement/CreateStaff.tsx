import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Select, Descriptions, Switch, Space, message, Typography, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { registerStaff, RegisterStaffData, StaffResponse, StaffType, ParkResponse, getParkById, getAllParks } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import crypto from 'crypto';

const { Option } = Select;

const CreateStaff: React.FC = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const { Text } = Typography;
  const notificationShown = useRef(false);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const onFinish = async (values: any) => {
    try {
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

      // console.log('Received values of form:', newStaffDetails);
      const response = await registerStaff(newStaffDetails);
      // console.log('Success:', response.data);
      message.success('Staff added successfully!');
      // Navigate to another page or show success message
      navigate('/staff-management');
    } catch (error) {
      console.error(error);
      message.error('Failed to add staff: ' + error);
      // Handle error, show error message to user
    }
  };

  const onReset = () => {
    form.resetFields();
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
      // Fetch parks data from the database
      getAllParks()
        .then((response) => {
          setParks(response.data);
        })
        .catch((error) => {
          console.error('There was an error fetching the parks data!', error);
        });
    }
  }, [user]);

  const getParkName = (parkId?: number) => {
    const park = parks.find((park) => park.id === parkId);
    return parkId && park ? park.name : 'NParks';
  };

  const breadcrumbItems = [
    {
      title: "Staff Management",
      pathKey: '/staff-management',
      isMain: true,
    },
    {
      title: "Create",
      pathKey: `/staff-management/create-staff`,
      isCurrent: true
    },
  ]

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <Form
        {...layout}
        form={form}
        name="create_staff"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        // style={{ maxWidth: 50 }}
        className="max-w-[600px] mx-auto"
        autoComplete="off"
      >
        <Form.Item name="firstNameInput" label="First Name" rules={[{ required: true, message: 'Please enter a first name.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="lastNameInput" label="Last Name" rules={[{ required: true, message: 'Please enter a last name.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="roleSelect" label="Role" rules={[{ required: true, message: 'Please select a role.' }]}>
          <Select placeholder="Select a Role" allowClear>
            {Object.values(StaffType)
              .filter((role) => {
                if (user?.role === StaffType.MANAGER) {
                  return role !== StaffType.MANAGER && role !== StaffType.SUPERADMIN;
                } else if (user?.role === StaffType.SUPERADMIN) {
                  return role !== StaffType.SUPERADMIN; //removed option to create SUPERADMIN; we assume SUPERADMINs are created in system
                }
                return true;
              })
              .map((role) => (
                <Select.Option key={role} value={role}>
                  {role}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item name="emailInput" label="Email" rules={[{ required: true, message: 'Please enter an email.' }, { type: 'email', message: 'Please enter a valid email.' }]}>
          <Input />
        </Form.Item>
        {/* <Form.Item name="passwordInput" label="Password" rules={[
          { required: true, message: 'Please enter a password.' },
          { pattern: /^.{8,}$/, message: 'Password must be at least 8 characters long.' }
        ]}>
          <Input.Password />
        </Form.Item> */}
        <Form.Item
          name="contactNumberInput"
          label="Contact Number"
          rules={[
            { required: true, message: 'Please enter a contact number.' },
            {
              pattern: /^[689]\d{7}$/,
              message: 'Contact number must consist of exactly 8 digits and be a valid Singapore contact number',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="parkSelect" label="Park" rules={[{ required: true, message: 'Please select a park.' }]}>
          {parks.length === 0 ? (
            <Text type="secondary">There are no parks created yet!</Text>
          ) : user?.role === StaffType.MANAGER ? (
            <Select placeholder={getParkName(user?.parkId)} value={user?.parkId}>
              <Select.Option key={user?.parkId} value={user?.parkId}>
                {getParkName(user?.parkId)}
              </Select.Option>
            </Select>
          ) : (
            <Select placeholder="Select a Park" allowClear>
              {parks.map((park) => (
                <Select.Option key={park.id} value={park.id}>
                  {park.name}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {/* <Form.Item label="Active Status" name="activeStatus" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item> */}
        <Form.Item {...tailLayout}>
          <Space>
            <Button type="primary" htmlType="submit" disabled={parks.length === 0}>
              Submit
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </ContentWrapperDark>
  );
};

export default CreateStaff;
