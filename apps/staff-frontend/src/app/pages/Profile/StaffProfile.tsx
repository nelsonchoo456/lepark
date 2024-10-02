import { ContentWrapper, ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Descriptions, Card, Button, Input, Tooltip, Tag, message, Modal, Switch } from 'antd';
import { RiEdit2Line, RiArrowLeftLine, RiInformationLine } from 'react-icons/ri';
import type { DescriptionsProps } from 'antd';
import { UserOutlined, LogoutOutlined, LockOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  forgotStaffPassword,
  getAllParks,
  ParkResponse,
  StaffType,
  StaffUpdateData,
  updateStaffDetails,
  updateStaffIsActive,
  viewStaffDetails,
} from '@lepark/data-access';
import { StaffResponse } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import ChangePasswordModal from './ChangePasswordModal';
// import backgroundPicture from '@lepark//common-ui/src/lib/assets/Seeding-rafiki.png';

// const initialUser = {
//   id: '',
//   firstName: '',
//   lastName: '',
//   contactNumber: '',
//   role: '',
//   email: '',
//   isActive: false,
// };

const StaffProfile = () => {
  const { user, updateUser, logout } = useAuth<StaffResponse>();

  const [inEditMode, setInEditMode] = useState(false);
  const [userState, setUser] = useState<StaffResponse | null>(null);
  const [editedUser, setEditedUser] = useState<StaffResponse | null>(null);
  const [contactNumberError, setContactNumberError] = useState('');
  const [parks, setParks] = useState<ParkResponse[]>([]);

  // for change password

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    // Fetch parks data from the database
    getAllParks()
      .then((response) => {
        setParks(response.data);
      })
      .catch((error) => {
        console.error('There was an error fetching the parks data!', error);
      });

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

  const handleInputChange = (key: keyof StaffResponse, value: any) => {
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

        // const responseStaffActiveStatus = { data: { isActive: values.isActive } };
        // if (user.role == StaffType.SUPERADMIN || user.role == StaffType.MANAGER) {
        //   const responseStaffActiveStatus = await updateStaffIsActive(user.id, values.isActive, user.id);
        //   console.log('Staff active status updated successfully:', responseStaffActiveStatus.data);
        // }

        // Merge the updated details and active status
        const updatedUser = {
          ...responseStaffDetails.data,
          // isActive: responseStaffActiveStatus.data.isActive,
        };

        message.success('Staff details updated successfully!');
        updateUser(updatedUser); // Update user details in the context
        setUser(updatedUser); // Update user details in the state
        //await refreshUserData(); // Refresh user data to load the latest values
        setInEditMode(false); // Exit edit mode
      }
    } catch (error: any) {
      console.error(error);
      // TODO: filter out specific error messages from the response
      message.error('Failed to update staff details.');
    }
  };

  const getParkName = (parkId?: number) => {
    const park = parks.find((park) => park.id === parkId);
    return parkId && park ? park.name : 'NParks';
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

  const handleContactNumberChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    validateContactNumber(value);
    handleInputChange('contactNumber', value);
  };

  const handleSave = () => {
    const isContactNumberValid = validateContactNumber(editedUser?.contactNumber ?? '');
    if (isContactNumberValid && validateInputs()) {
      onFinish(editedUser);
      setInEditMode(false);
    } else {
      message.warning('All fields are required.');
    }
  };

  const handleChangePassword = () => {
    if (user) {
      setIsPopupVisible(true);
    }
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
    // {
    //   key: 'id',
    //   label: 'ID',
    //   children: userState?.id, // not allowed to change id
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
      children: <Tag>{userState?.role}</Tag>, // not allowed to change own role
      span: 2,
    },
    {
      key: 'email',
      label: 'Email',
      children: (
        <div className="flex items-center">
          {userState?.email}
          {inEditMode && userState?.role !== StaffType.SUPERADMIN && (
            <Tooltip title="To change your email, please contact your manager or superadmin.">
              <RiInformationLine className="ml-2 text-lg text-green-500 cursor-pointer" />
            </Tooltip>
          )}
        </div> // not allowed to change own email
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
        userState?.contactNumber ?? null
      ),
    },
    // {
    //   key: 'isActive',
    //   label: 'Active Status',
    //   children: (
    //     <div className="flex items-center">
    //       <Tag color={userState?.isActive ? 'green' : 'red'}>{userState?.isActive ? 'Active' : 'Inactive'}</Tag>
    //       {inEditMode && userState?.role !== StaffType.SUPERADMIN && (
    //         <Tooltip title="To change your active status, please contact your manager or superadmin.">
    //           <RiInformationLine className="ml-2 text-lg text-green-500 cursor-pointer" />
    //         </Tooltip>
    //       )}
    //     </div>
    //   ), // not allowed to change own active status 
    //   span: 2,
    // },
  ];

  const breadcrumbItems = [
    {
      title: "My Profile",
      pathKey: '/profile',
      isMain: true,
      isCurrent: true
    },
  ]

  return (
    <ContentWrapperDark>
       <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <div className="flex justify-end items-center mb-4">
        <Button type="primary" onClick={handleChangePassword} icon={<LockOutlined />} className="mr-5">
          Change Password
        </Button>
        <Button onClick={handleLogout} icon={<LogoutOutlined />}>
          Logout
        </Button>
        <ChangePasswordModal open={isPopupVisible} onClose={() => setIsPopupVisible(false)} user={user!} />
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
