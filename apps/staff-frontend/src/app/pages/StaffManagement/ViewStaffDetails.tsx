import { ContentWrapper, ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Descriptions, Card, Button, Input, Tooltip, Tag, message, Select, Switch, notification, Spin } from 'antd';
import { RiEdit2Line, RiArrowLeftLine, RiInformationLine } from 'react-icons/ri';
import type { DescriptionsProps } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { Layout } from 'antd';
import PageHeader from '../../components/main/PageHeader';
import {
  getAllParks,
  ParkResponse,
  StaffResponse,
  StaffType,
  StaffUpdateData,
  updateStaffDetails,
  updateStaffIsActive,
  updateStaffRole,
  viewStaffDetails,
} from '@lepark/data-access';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictStaff } from '../../hooks/Staffs/useRestrictStaff';
import EntityNotFound from '../EntityNotFound.tsx/EntityNotFound';

const initialUser = {
  id: '',
  firstName: '',
  lastName: '',
  contactNumber: '',
  role: '',
  email: '',
  password: '',
  isActive: false,
  parkId: undefined,
};

const ViewStaffDetails = () => {
  const { staffId = '' } = useParams();
  const { user, updateUser } = useAuth<StaffResponse>();
  const { staff, loading, notFound } = useRestrictStaff(staffId);
  const [inEditMode, setInEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<StaffResponse>(initialUser);
  const [emailError, setEmailError] = useState('');
  const [contactNumberError, setContactNumberError] = useState('');
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const notificationShown = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && staff) {
      // Fetch parks data from the database
      getAllParks()
        .then((response) => {
          setParks(response.data);
        })
        .catch((error) => {
          console.error('There was an error fetching the parks data!', error);
        });
      
      setEditedUser(staff);
    }
  }, [loading, staff]);

  const getParkName = (parkId?: number) => {
    const park = parks.find((park) => park.id === parkId);
    return parkId && park ? park.name : 'NParks';
  };

  const toggleEditMode = () => {
    if (inEditMode && staff) {
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
      setEditedUser(updatedUser.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const onFinish = async (values: any) => {
    try {
      if (!user) {
        throw new Error('User not found.');
      } else if (!(user.role == StaffType.MANAGER || user.role == StaffType.SUPERADMIN)) {
        throw new Error('Not allowed to edit staff details.');
      }

      const updatedStaffDetails: StaffUpdateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        contactNumber: values.contactNumber,
        email: values.email,
      };

      const responseStaffRole = await updateStaffRole(staffId, values.role, user.id);
      // console.log('Staff role updated successfully:', responseStaffRole.data);

      const responseStaffActiveStatus = await updateStaffIsActive(staffId, values.isActive, user.id);
      // console.log('Staff active status updated successfully:', responseStaffActiveStatus.data);

      const responseStaffDetails = await updateStaffDetails(staffId, updatedStaffDetails);
      // console.log('Staff details updated successfully:', responseStaffDetails.data);

      message.success('Staff details updated successfully!');
      await refreshUserData(); // Refresh user data to load the latest values
      setInEditMode(false); // Exit edit mode
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('Unique constraint failed on the fields: (`email`)')) {
        message.error('The email address is already in use. Please use a different email.');
      } else if (errorMessage.includes('Invalid email address')) {
        message.error('Invalid email format.');
      } else {
        message.error(errorMessage || 'Failed to update staff details.');
      }
    }
  };

  const handleSave = () => {
    const isContactNumberValid = validateContactNumber(editedUser?.contactNumber ?? '');
    const isEmailValid = validateEmail(editedUser?.email ?? '');
    if (isContactNumberValid && isEmailValid && validateInputs()) {
      onFinish(editedUser);
      setInEditMode(false);
    } else {
      message.warning('All fields are required.');
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validateContactNumber = (value: string) => {
    const pattern = /^[689]\d{7}$/;
    if (!pattern.test(value)) {
      setContactNumberError('Contact number must consist of exactly 8 digits and be a valid Singapore contact number');
      return false;
    } else {
      setContactNumberError('');
      return true;
    }
  };

  const handleEmailChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    validateEmail(value);
    handleInputChange('email', value);
  };

  const handleContactNumberChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    validateContactNumber(value);
    handleInputChange('contactNumber', value);
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
    // {
    //   key: 'id',
    //   label: 'ID',
    //   children: staff?.id ?? null, // not allowed to change id
    //   span: 2,
    // },
    {
      key: 'park',
      label: 'Park',
      children: getParkName(editedUser?.parkId),
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
          {Object.values(StaffType)
            .filter((role) => {
              if (user?.role === StaffType.MANAGER) {
                return role !== StaffType.MANAGER && role !== StaffType.SUPERADMIN;
              } else if (user?.role === StaffType.SUPERADMIN) {
                return role !== StaffType.SUPERADMIN;
              }
              return true;
            })
            .map((role) => (
              <Select.Option key={role} value={role}>
                {role.replace(/_/g, ' ')}
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
        <Tooltip title={emailError} visible={!!emailError} placement="right" color="#73a397">
        <Input
          placeholder="Email"
          value={editedUser?.email ?? ''}
          onChange={handleEmailChange}
          required
          pattern='^[^\s@]+@[^\s@]+\.[^\s@]+$'
        />
      </Tooltip>
         ) : (
        <div className="flex items-center">{staff?.email ?? null}</div>
      ),
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      children: inEditMode ? (
        <Tooltip title={contactNumberError} visible={!!contactNumberError} placement="right" color="#73a397">
          <Input
            placeholder="Contact Number"
            value={editedUser?.contactNumber ?? ''}
            onChange={handleContactNumberChange}
            required
            pattern="^[689]\d{7}$"
          />
        </Tooltip>
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

  const breadcrumbItems = [
    {
      title: "Staff Management",
      pathKey: '/staff-management',
      isMain: true,
    },
    {
      title: staff ? `${staff.firstName} ${staff.lastName}` : "Staff Details",
      pathKey: `/staff-management/${staffId}`,
      isCurrent: true
    },
  ];

  if (loading) {
    return (
      <ContentWrapperDark>
        <Card>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Card>
      </ContentWrapperDark>
    );
  }

  if (notFound) {
    return <EntityNotFound entityName="Staff" listPath="/staff-management" />;
  }

  if (!staff) {
    return null; // or you could return a loading state or error message
  }

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
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
                  <div>{`${staff.firstName} ${staff.lastName}`}</div>
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
    </ContentWrapperDark>
  );
};

export default ViewStaffDetails;
