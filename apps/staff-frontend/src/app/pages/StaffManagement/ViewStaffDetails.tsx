import { ContentWrapper, ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Descriptions, Card, Button, Input, Tooltip, Tag, message, Select, Switch } from 'antd';
import { RiEdit2Line, RiArrowLeftLine, RiInformationLine } from 'react-icons/ri';
import type { DescriptionsProps } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import {
  StaffResponse,
  StaffType,
  StaffUpdateData,
  updateStaffDetails,
  updateStaffIsActive,
  updateStaffRole,
  viewStaffDetails,
} from '@lepark/data-access';
import { useParams } from 'react-router-dom';
// import backgroundPicture from '@lepark//common-ui/src/lib/assets/Seeding-rafiki.png';

const initialUser = {
  id: '',
  firstName: '',
  lastName: '',
  contactNumber: '',
  role: '',
  email: '',
  password: '',
  isActive: false,
};

const ViewStaffDetails = () => {
  const { staffId = '' } = useParams();
  const { user, updateUser } = useAuth<StaffResponse>();
  const [inEditMode, setInEditMode] = useState(false);
  const [staff, setStaff] = useState<StaffResponse>(initialUser);
  const [editedUser, setEditedUser] = useState<StaffResponse>(initialUser);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await viewStaffDetails(staffId);
        setStaff(response.data);
        setEditedUser(response.data);
      } catch (error) {
        console.error(error);
        message.error('Failed to fetch user details');
      }
    };

    if (staffId) {
      fetchUserDetails();
    }
  }, [staffId]);

  const toggleEditMode = () => {
    if (inEditMode) {
      setEditedUser(staff); // Reset changes if canceling edit
    }
    setInEditMode(!inEditMode);
  };

  const handleInputChange = (key: string, value: any) => {
    setEditedUser((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateInputs = () => {
    const { firstName, lastName, email, contactNumber, role } = editedUser;
    return firstName && lastName && email && contactNumber && role;
  };

  const refreshUserData = async () => {
    try {
      const updatedUser = await viewStaffDetails(staffId);
      setStaff(updatedUser.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const onFinish = async (values: any) => {
    try {
      if (!user || user.role !== StaffType.MANAGER) {
        throw new Error('Only managers can update staff details.');
      }

      const updatedStaffDetails: StaffUpdateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        contactNumber: values.contactNumber,
        email: values.email,
      };

      const responseStaffRole = await updateStaffRole(staffId, values.role, user.id); 
      console.log('Staff role updated successfully:', responseStaffRole.data);

      const responseStaffActiveStatus = await updateStaffIsActive(staffId, values.isActive, user.id); 
      console.log('Staff active status updated successfully:', responseStaffActiveStatus.data);

      const responseStaffDetails = await updateStaffDetails(staffId, updatedStaffDetails);
      console.log('Staff details updated successfully:', responseStaffDetails.data);

      message.success('Staff details updated successfully!');
      await refreshUserData(); // Refresh user data to load the latest values
      setInEditMode(false); // Exit edit mode
    } catch (error: any) {
      console.error(error);
      // TODO: filter out specific error messages from the response
      message.error(error.message || 'Failed to update staff details.');
    }
  };

  const handleSave = () => {
    if (validateInputs()) {
      onFinish(editedUser);
      setInEditMode(false);
    } else {
      message.warning('All fields are required.');
    }
  };

  const descriptionsItems = [
    {
      key: 'firstName',
      label: 'First Name',
      children: !inEditMode ? (
        staff?.firstName ?? null
      ) : (
        <Input defaultValue={editedUser?.firstName ?? ''} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
      ),
      span: 2,
    },
    {
      key: 'lastName',
      label: 'Last Name',
      children: !inEditMode ? (
        staff?.lastName ?? null
      ) : (
        <Input defaultValue={editedUser?.lastName ?? ''} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
      ),
      span: 2,
    },
    {
      key: 'id',
      label: 'ID',
      children: staff?.id ?? null, // not allowed to change id
      span: 2,
    },
    {
      key: 'role',
      label: 'Role',
      children: inEditMode ? (
        <Select
          value={editedUser?.role ?? ''}
          onChange={(value) => handleInputChange('role', value)}
          style={{ minWidth: 200 }} // Set a minimum width to ensure full text is shown
        >
          {Object.values(StaffType).map((role) => (
            <Select.Option key={role} value={role}>
              {role}
            </Select.Option>
          ))}
        </Select>
      ) : (
        <Tag>{staff?.role}</Tag>
      ),
      span: 2,
    },
    {
      key: 'email',
      label: 'Email',
      children: inEditMode ? (
        <Input placeholder="Email" value={editedUser?.email ?? ''} onChange={(e) => handleInputChange('email', e.target.value)} required />
      ) : (
        <div className="flex items-center">{staff?.email ?? null}</div>
      ),
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      children: inEditMode ? (
        <Input
          placeholder="Contact Number"
          value={editedUser?.contactNumber ?? ''}
          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
          required
        />
      ) : (
        staff?.contactNumber ?? null
      ),
      span: 2,
    },
    {
      key: 'isActive',
      label: 'Active Status',
      children: inEditMode ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Switch checked={editedUser?.isActive ?? false} onChange={(checked) => handleInputChange('isActive', checked)} />
          <span style={{ marginLeft: 8 }}>{editedUser?.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      ) : (
        <Tag color={staff?.isActive ? 'green' : 'red'}>{staff?.isActive ? 'Active' : 'Inactive'}</Tag>
      ),
      span: 2,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader>Staff Management</PageHeader>
      <Card>
        <Descriptions
          items={descriptionsItems}
          bordered
          column={2}
          size="middle"
          title={
            <div className="w-full flex justify-between">
              {!inEditMode ? (
                <>
                  <div>{`${staff?.firstName} ${staff?.lastName}`}</div>
                  <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />
                </>
              ) : (
                <>
                  <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={toggleEditMode}>
                    Return
                  </Button>
                  <div className="text-secondary">Edit Staff Profile </div>
                  <Button type="primary" onClick={handleSave}>
                    Save
                  </Button>
                </>
              )}
            </div>
          }
        />
      </Card>
      {/* <div
          className="fixed bottom-0 right-0 w-full h-1/2 bg-no-repeat bg-right z-[-1]"
          style={{ backgroundImage: `url(${backgroundPicture})`, backgroundSize: 'contain' }}
        /> */}
    </ContentWrapperDark>
  );
};

export default ViewStaffDetails;