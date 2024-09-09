import { ContentWrapper, ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Descriptions, Card, Button, Input, Tooltip, Tag, message } from 'antd';
import { RiEdit2Line, RiArrowLeftLine, RiInformationLine } from 'react-icons/ri';
import type { DescriptionsProps } from 'antd';
import { UserOutlined, LogoutOutlined, LockOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/main/PageHeader';
import { StaffUpdateData, updateStaffDetails, viewStaffDetails } from '@lepark/data-access';
import { StaffResponse } from '@lepark/data-access';
// import backgroundPicture from '@lepark//common-ui/src/lib/assets/Seeding-rafiki.png';

const initialUser = {
  id: '',
  firstName: '',
  lastName: '',
  contactNumber: '',
  role: '',
  email: '',
  isActive: false,
};

const StaffProfile = () => {
  const { user, updateUser } = useAuth<StaffResponse>();

  const [inEditMode, setInEditMode] = useState(false);
  const [userState, setUser] = useState<StaffResponse | null>(null);
  const [editedUser, setEditedUser] = useState<StaffResponse | null>(null);

  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setUser(user);
        setEditedUser(user);
      } catch (error) {
        console.error(error);
        message.error('Failed to fetch user details');
      }
    };

    if (user && user.id) {
      fetchUserDetails();
    }
  }, []);

  const toggleEditMode = () => {
    if (inEditMode && userState) {
      setEditedUser(userState); // Reset changes if canceling edit
    }
    setInEditMode(!inEditMode);
  };

  const handleInputChange = (key: keyof StaffResponse, value: string) => {
    setEditedUser((prev) => {
      if (!prev) return null; // Handle case where prev might be null

      return {
        ...prev,
        [key]: value, // Only update the specific key
      };
    });
  };

  const validateInputs = () => {
    if (!editedUser) return false;
    const { firstName, lastName, email, contactNumber, role } = editedUser;
    return firstName && lastName && email && contactNumber && role;
  };

  // const refreshUserData = async () => {
  //   try {
  //     const updatedUser = await viewStaffDetails(staffId);
  //     setUser(updatedUser.data);
  //   } catch (error) {
  //     console.error('Failed to fetch user data:', error);
  //   }
  // };

  const onFinish = async (values: any) => {
    try {
      const updatedStaffDetails: StaffUpdateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        contactNumber: values.contactNumber,
        email: values.email,
      };

      if (user) {
        const responseStaffDetails = await updateStaffDetails(user.id, updatedStaffDetails);
        // console.log('Staff details updated successfully:', responseStaffDetails.data);
        message.success('Staff details updated successfully!');
        updateUser(responseStaffDetails.data); // Update user details in the context
        setUser(responseStaffDetails.data); // Update user details in the state
        // await refreshUserData(); // Refresh user data to load the latest values
        setInEditMode(false); // Exit edit mode
      }
    } catch (error: any) {
      console.error(error);
      // TODO: filter out specific error messages from the response
      message.error('Failed to update staff details.');
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

  const handleChangePassword = () => {
    // change password functionality goes here
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const descriptionsItems = [
    {
      key: 'firstName',
      label: 'First Name',
      children: !inEditMode ? (
        userState?.firstName
      ) : (
        <Input required defaultValue={editedUser?.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} />
      ),
      span: 2,
    },
    {
      key: 'lastName',
      label: 'Last Name',
      children: !inEditMode ? (
        userState?.lastName
      ) : (
        <Input required defaultValue={editedUser?.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} />
      ),
      span: 2,
    },
    {
      key: 'id',
      label: 'ID',
      children: userState?.id, // not allowed to change id
      span: 2,
    },
    {
      key: 'role',
      label: 'Role',
      children: <Tag>{userState?.role}</Tag>, // not allowed to change role
      span: 2,
    },
    {
      key: 'email',
      label: 'Email',
      children: (
        <div className="flex items-center">
          {userState?.email}
          {inEditMode && (
            <Tooltip title="To change your email, please contact your manager.">
              <RiInformationLine className="ml-2 text-lg text-green-500 cursor-pointer" />
            </Tooltip>
          )}
        </div>
      ), // not allowed to change email
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      children: !inEditMode ? (
        userState?.contactNumber
      ) : (
        <Input required defaultValue={editedUser?.contactNumber} onChange={(e) => handleInputChange('contactNumber', e.target.value)} />
      ),
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader>My Profile</PageHeader>
      <div className="flex justify-end items-center mb-4">
        <Button type="primary" onClick={handleChangePassword} icon={<LockOutlined />} className="mr-5">
          Change Password
        </Button>
        <Button onClick={handleLogout} icon={<LogoutOutlined />}>
          Logout
        </Button>
      </div>
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
                  <div>{`${userState?.firstName} ${userState?.lastName}`}</div>
                  <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />
                </>
              ) : (
                <>
                  <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={toggleEditMode}>
                    Return
                  </Button>
                  <div className="text-secondary">Edit My Profile </div>
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

export default StaffProfile;
