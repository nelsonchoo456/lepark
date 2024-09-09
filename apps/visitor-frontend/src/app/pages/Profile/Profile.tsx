import { Card, Badge, Menu, Dropdown, message } from 'antd';
import { Input, Avatar, Button } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  EditOutlined,
  KeyOutlined,
  MailOutlined,
  DeleteOutlined,
  FrownOutlined,
} from '@ant-design/icons';
import { ContentWrapper, Divider, Content, Header, ListItemType, Logo, LogoText, CustButton, useAuth } from '@lepark/common-ui';
import { useState, useEffect } from 'react';
import { SCREEN_LG } from '../../config/breakpoints';
import { Color } from 'antd/es/color-picker';
import EventCard from '../MainLanding/components/EventCard';
import EditPasswordModal from './EditPasswordModal';
import EditEmailModal from './EditEmailModal';
import { useNavigate } from 'react-router-dom';
import DeleteAccountModal from './DeleteAccountModal';
import { updateVisitorDetails, viewVisitorDetails, VisitorResponse, VisitorUpdateData } from '@lepark/data-access';
import { PiSmiley } from 'react-icons/pi';

const initialVisitor = {
  id: '',
  firstName: '',
  lastName: '',
  contactNumber: '',
  email: '',
  password: '',
};

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth<VisitorResponse>();

  const [visitor, setVisitor] = useState<VisitorResponse | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [editedVisitor, setEditedVisitor] = useState<VisitorResponse | null>(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState<boolean>(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setVisitor(user);
        setEditedVisitor(user);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const validateInputs = () => {
    if (!editedVisitor) return false;
    const { firstName, lastName, email, contactNumber } = editedVisitor;
    return firstName && lastName && email && contactNumber;
  };

  const onFinish = async (values: any) => {
    try {
      const updatedVisitorDetails: VisitorUpdateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        contactNumber: values.contactNumber,
        email: values.email,
      };

      if (user) {
        const response = await updateVisitorDetails(user.id, updatedVisitorDetails);
        updateUser(response.data);
        setVisitor(response.data);
        setEditing(false);
        message.success('Profile updated successfully');
      }
    } catch (error) {
      console.error(error);
      // TODO: filter out specific error messages from the response
      message.error('Failed to update Visitor details.');
    }
  };

  const handleSave = async () => {
    if (validateInputs()) {
      onFinish(editedVisitor);
      setEditing(false);
    } else {
      message.warning('All fields are required.');
    }
  };

  const handleCancel = () => {
    setEditedVisitor(visitor);
    setEditing(false);
  };

  const handleEditPassword = () => {
    setIsPasswordModalVisible(true);
  };

  const handleEditEmail = () => {
    setIsEmailModalVisible(true);
  };

  const handlePasswordModalCancel = () => {
    setIsPasswordModalVisible(false);
  };

  const handleEmailModalCancel = () => {
    setIsEmailModalVisible(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      message.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    // Account deletion logic goes here
    // For example, make an API call to delete the account
    // On success:
    navigate('/'); // Redirect to home page
  };

  const handleInputChange = (key: keyof VisitorResponse, value: any) => {
    setEditedVisitor((prev) => {
      if (!prev) return null; // Handle case where prev might be null

      return {
        ...prev,
        [key]: value, // Only update the specific key
      };
    });
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={handleEditProfile} icon={<EditOutlined />}>
        Edit Profile
      </Menu.Item>
      <Menu.Item key="2" onClick={handleEditPassword} icon={<KeyOutlined />}>
        Change Password
      </Menu.Item>
      <Menu.Item key="3" onClick={handleEditEmail} icon={<MailOutlined />}>
        Change Email
      </Menu.Item>
      <Menu.Item key="4" onClick={handleDeleteAccount} icon={<DeleteOutlined />}>
        Delete Account
      </Menu.Item>
    </Menu>
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center pb-20">
        <PiSmiley className="text-6xl mb-4" />
        <h1 className="text-2xl">Hello!</h1>
        <p className="mb-4">Please log in to view your profile details.</p>
        <Button type="primary" onClick={handleLoginRedirect} className="px-4 py-2">
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <Card
        size="small"
        style={{
          backgroundImage: `url('https://images.template.net/97316/free-cute-green-aesthetic-background-u8pu8.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
        }}
        className="mb-2 w-full h-40 bg-green-400 rounded-2xl -z-10 md:w-full md:rounded md:h-64"
      >
        <div className="absolute top-0 left-0 w-full h-full p-4 bg-green-700/70 text-white flex">
          <div className="md:text-center md:mx-auto">
            <p className="font-medium text-2xl md:text-3xl">My Profile</p>
          </div>
        </div>
      </Card>

      <div className="relative flex items-center justify-between py-2 mx-4 bg-white rounded-2xl mt-[-2rem] shadow md:p-0">
        {/* Avatar container */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 mt-[-3rem]">
          <Avatar size={80} icon={<UserOutlined />} className="border-4 border-white bg-green-400" />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center w-full p-4 pt-10">
          {editing ? (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex flex-col items-start mb-2">
                <label className="mb-1">First Name:</label>
                <Input
                  value={editedVisitor?.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="w-full flex flex-col items-start mb-2">
                <label className="mb-1">Last Name:</label>
                <Input
                  value={editedVisitor?.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="w-full flex flex-col items-start mb-2">
                <label className="mb-1">Contact Number:</label>
                <Input
                  value={editedVisitor?.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <CustButton type="primary" onClick={handleSave} className="mb-2">
                Save
              </CustButton>
              <CustButton onClick={handleCancel} className="mb-2">
                Cancel
              </CustButton>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <h2 className="text-xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex space-x-2 mt-4">
                <Dropdown overlay={menu} placement="bottomRight">
                  <CustButton type="primary" className="w-auto sm:w-auto" icon={<SettingOutlined />}>
                    Settings
                  </CustButton>
                </Dropdown>
                <CustButton type="primary" onClick={handleLogout} icon={<LogoutOutlined />}>
                  Logout
                </CustButton>
                <EditPasswordModal open={isPasswordModalVisible} onClose={handlePasswordModalCancel} />
                <EditEmailModal open={isEmailModalVisible} onClose={handleEmailModalCancel} />
                <DeleteAccountModal
                  visible={isDeleteModalVisible}
                  onConfirm={handleDeleteConfirm}
                  onCancel={() => setIsDeleteModalVisible(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <ContentWrapper>
        <div className="relative py-2 bg-white rounded-2xl shadow ">
          <LogoText className="font-bold text-lg pl-3 pt-1">My Upcoming Events</LogoText>
          <div className="w-full overflow-scroll flex gap-2 py-2">
            <EventCard
              title="Event 1"
              url="https://media.cntraveler.com/photos/5a90b75389971c2c547af152/16:9/w_2560,c_limit/National-Orchid-Garden_2018_National-Orchid-Garden-(2)-Pls-credit-NParks-for-the-photos).jpg"
              extra={<a href="#">More</a>}
            >
              keewewk
            </EventCard>
            <EventCard
              title="Event 4"
              url="https://image-tc.galaxy.tf/wijpeg-bg2v4hnwseq2v8akq9py9df8w/singapore-botanic-gardens_standard.jpg?crop=57%2C0%2C867%2C650"
              extra={<a href="#">More</a>}
            >
              rwrewrkeek
            </EventCard>
            <EventCard
              title="Event 2"
              url="https://cdn.apartmenttherapy.info/image/upload/f_jpg,q_auto:eco,c_fill,g_auto,w_1500,ar_16:9/at%2Freal-estate%2Flongwood-gardens"
              extra={<a href="#">More</a>}
            >
              keewerewk
            </EventCard>
            <EventCard
              title="Event 3"
              url="https://thinkerten.com/wordpress/wp-content/uploads/2017/04/SBG.jpg"
              extra={<a href="#">More</a>}
            >
              keewerewrk
            </EventCard>
          </div>
        </div>
      </ContentWrapper>

      <ContentWrapper>
        <div className="relative py-2 bg-white rounded-2xl shadow md:p-0">
          <LogoText className="font-bold text-lg pl-3 pt-1">Favourite Species</LogoText>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default ProfilePage;
