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
import { useLocation, useNavigate } from 'react-router-dom';
import { BsCalendar4Event } from 'react-icons/bs';
import DeleteAccountModal from './DeleteAccountModal';
import {
  deleteVisitor,
  DeleteVisitorRequestData,
  getFavoriteSpecies,
  GetFavoriteSpeciesResponse,
  sendVerificationEmailWithEmail,
  SpeciesResponse,
  updateVisitorDetails,
  viewVisitorDetails,
  VisitorResponse,
  VisitorUpdateData,
} from '@lepark/data-access';
import { PiSmiley } from 'react-icons/pi';
import SpeciesCard from './components/SpeciesCard';
import { FaSadTear } from 'react-icons/fa';
import { AiOutlineFrown, AiOutlineSmile } from 'react-icons/ai';
import { MdArrowForward } from 'react-icons/md';

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
  const location = useLocation();
  const [resendEmailStatus, setResendEmailStatus] = useState(false);
  const [changeEmailStatus, setChangeEmailStatus] = useState(false);

  const [favoriteSpecies, setFavoriteSpecies] = useState<SpeciesResponse[]>([]);

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

  useEffect(() => {
    if (changeEmailStatus) {
      const updateUserDetails = async () => {
        try {
          const response = await viewVisitorDetails(user?.id || '');
          const updatedUser = response.data;
          updateUser(updatedUser);
          console.log('Email status updated, re-rendering.');
        } catch (error) {
          console.error('Error updating email status:', error);
        }
      };
      updateUserDetails();
    }
  }, [changeEmailStatus]);

  useEffect(() => {
    const fetchFavoriteSpecies = async () => {
      console.log(user);
      if (!user) {
        console.warn('User is not logged in!');
        return;
      }
      try {
        const response = await getFavoriteSpecies(user.id);
        const data: SpeciesResponse[] = response.data;
        console.log('Response:', response);
        console.log('Data from response:', data);
        if (Array.isArray(data)) {
          setFavoriteSpecies(data);
        } else {
          console.warn('No favorite species found in the response or data is not an array.');
        }
      } catch (error) {
        console.error('Error fetching favorite species:', error);
      }
    };

    if (user) {
      fetchFavoriteSpecies();
    }
  }, [user]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleEditProfile = () => {
    // setEditing(true);
    navigate('/edit-profile');
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

  const handleDeleteConfirm = async (password: string) => {
    try {
      const data: DeleteVisitorRequestData = {
        id: user?.id || '',
        password: password,
      };

      await deleteVisitor(data);
      message.success('Account deleted successfully!');
      await logout();
      navigate('/login');
    } catch (error) {
      message.error('Failed to delete account. Please try again later.');
    }
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

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/discover/${speciesId}`);
  };

  const handleSendVerificationEmail = async () => {
    try {
      const response = await sendVerificationEmailWithEmail(user?.email || '', user?.id || '');
      console.log('Resend verification email', response);
      setResendEmailStatus(true);
    } catch (error) {
      console.error('Error resending verification email', error);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={handleEditProfile} icon={<EditOutlined />}>
        Edit Profile
      </Menu.Item>
      <Menu.Item key="2" onClick={handleEditPassword} icon={<KeyOutlined />}>
        Reset Password
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

  if (user.isVerified === false || changeEmailStatus) {
    if (resendEmailStatus) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center pb-20 p-4">
          <AiOutlineSmile className="text-6xl mb-4" />
          <h1 className="text-2xl">Verification email has been sent!</h1>
          <p className="mb-4">Please check your inbox and click on the link to verify your account.</p>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center pb-20 p-4">
          <AiOutlineFrown className="text-6xl mb-4" />
          <h1 className="text-2xl">Your account is not verified!</h1>
          <p className="mb-4">Click below to resend the email verification link.</p>
          <Button type="primary" onClick={handleSendVerificationEmail} className="px-4 py-2">
            Resend Verification Email
          </Button>
          <p className="mb-4 mt-4">For any issues, contact customer support at admin@lepark.com</p>
        </div>
      );
    }
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
              <p className="text-gray-600">{user.contactNumber}</p>
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
                <EditEmailModal
                  open={isEmailModalVisible}
                  onClose={handleEmailModalCancel}
                  onResendEmail={() => setResendEmailStatus(true)}
                  onChangeEmail={() => setChangeEmailStatus(true)}
                  user={user}
                />
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

      {/* </div> */}
      <ContentWrapper>
        <div className="flex items-center">
          <LogoText className="text-xl">My Events</LogoText>
          <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
            <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
            <Button
              icon={<MdArrowForward className="text-2xl" />}
              shape="circle"
              type="primary"
              size="large"
              className="md:bg-transparent md:text-green-500 md:shadow-none"
            />
          </div>
        </div>
        <div className="w-full overflow-scroll flex gap-2 py-2 min-h-[13rem]">
          <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
            <BsCalendar4Event className="text-4xl" />
            <br />
            No Events here.
            <br />
            Check back soon for Events!
          </div>
          {/* <EventCard
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
          <EventCard title="Event 3" url="https://thinkerten.com/wordpress/wp-content/uploads/2017/04/SBG.jpg" extra={<a href="#">More</a>}>
            keewerewrk
          </EventCard> */}
        </div>
      </ContentWrapper>

      <ContentWrapper>
        <div className="relative py-2 bg-white rounded-2xl shadow md:p-0">
          <LogoText className="font-bold text-lg pl-3 pt-1">My Favorite Species</LogoText>
          <div className="w-full overflow-scroll flex gap-2 py-2">
            {favoriteSpecies && favoriteSpecies.length > 0 ? (
              favoriteSpecies.map((species) => (
                <SpeciesCard
                  key={species.id}
                  title={species.speciesName}
                  url={species.images[0]}
                  extra={<a href="#">More</a>}
                  onClick={() => navigateToSpecies(species.id)}
                >
                  {species.speciesDescription}
                </SpeciesCard>
              ))
            ) : (
              <p>No favorite species found.</p>
            )}
          </div>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default ProfilePage;
