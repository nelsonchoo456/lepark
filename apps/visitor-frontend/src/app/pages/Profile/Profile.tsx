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
import { ContentWrapper, LogoText, CustButton, useAuth } from '@lepark/common-ui';
import { useState, useEffect } from 'react';
import EditPasswordModal from './EditPasswordModal';
import EditEmailModal from './EditEmailModal';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BsCalendar4Event } from 'react-icons/bs';
import DeleteAccountModal from './DeleteAccountModal';
import {
  AttractionTicketTransactionResponse,
  deleteVisitor,
  DeleteVisitorRequestData,
  EventTicketTransactionResponse,
  getAttractionTicketTransactionsByVisitorId,
  getEventTicketTransactionsByVisitorId,
  getFavoriteSpecies,
  GetFavoriteSpeciesResponse,
  sendVerificationEmailWithEmail,
  SpeciesResponse,
  updateVisitorDetails,
  viewVisitorDetails,
  VisitorResponse,
  VisitorUpdateData,
  getAllFeedback,
  FeedbackResponse,
} from '@lepark/data-access';
import { PiSmiley } from 'react-icons/pi';
import SpeciesCard from './components/SpeciesCard';
import { FaSadTear } from 'react-icons/fa';
import { AiOutlineFrown, AiOutlineSmile } from 'react-icons/ai';
import { MdArrowForward } from 'react-icons/md';
import FeedbackCard from './components/FeedbackCard';
import AttractionBookingCard from './components/AttractionTransactionCard';
import AttractionTransactionCard from './components/AttractionTransactionCard';
import EventTransactionCard from './components/EventTransactionCard';
import BookingCard from './components/BookingCard';
import { getBookingsByVisitorId, BookingResponse } from '@lepark/data-access';

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
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [favoriteSpecies, setFavoriteSpecies] = useState<SpeciesResponse[]>([]);
  const [attractionTransactions, setAttractionTransactions] = useState<AttractionTicketTransactionResponse[]>([]);
  const [eventTransactions, setEventTransactions] = useState<EventTicketTransactionResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);

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
          // console.log('Email status updated, re-rendering.');
        } catch (error) {
          console.error('Error updating email status:', error);
        }
      };
      updateUserDetails();
    }
  }, [changeEmailStatus]);

  useEffect(() => {
    const fetchFavoriteSpecies = async () => {
      // console.log(user);
      if (!user) {
        console.warn('User is not logged in!');
        return;
      }
      try {
        const response = await getFavoriteSpecies(user.id);
        const data: SpeciesResponse[] = response.data;
        // console.log('Response:', response);
        // console.log('Data from response:', data);
        if (Array.isArray(data)) {
          setFavoriteSpecies(data);
        } else {
          console.warn('No favorite species found in the response or data is not an array.');
        }
        const attractionResponse = await getAttractionTicketTransactionsByVisitorId(user.id);
        const attractionData: AttractionTicketTransactionResponse[] = attractionResponse.data;
        if (Array.isArray(attractionData)) {
          setAttractionTransactions(attractionData);
        }

        const eventResponse = await getEventTicketTransactionsByVisitorId(user.id);
        const eventData: EventTicketTransactionResponse[] = eventResponse.data;
        if (Array.isArray(eventData)) {
          setEventTransactions(eventData);
        }
      } catch (error) {
        console.error('Error fetching favorite species:', error);
      }
    };

    if (user) {
      fetchFavoriteSpecies();
    }
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        console.warn('User is not logged in!');
        return;
      }
      try {
        const response = await getBookingsByVisitorId(user.id);
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    if (user) {
      fetchBookings();
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

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user) {
        console.warn('User is not logged in!');
        return;
      }
      try {
        const response = await getAllFeedback(user.id);
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    if (user) {
      fetchFeedbacks();
    }
  }, [user]);

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

  const navigateToViewAttractionTransactions = () => {
    navigate('/attraction-transaction');
  };

  const navigateToTransactionDetails = (transactionId: string) => {
    navigate(`/attraction-transaction/${transactionId}`);
  };

  const navigateToViewEventTransactions = () => {
    navigate('/event-transaction');
  };

  const navigateToEventTransactionDetails = (transactionId: string) => {
    navigate(`/event-transaction/${transactionId}`);
  };

  const handleSendVerificationEmail = async () => {
    try {
      const response = await sendVerificationEmailWithEmail(user?.email || '', user?.id || '');
      // console.log('Resend verification email', response);
      setResendEmailStatus(true);
    } catch (error) {
      console.error('Error resending verification email', error);
    }
  };

  const navigateToBookingDetails = (bookingId: string) => {
    navigate(`/booking/${bookingId}`);
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
          <p className="mb-4 mt-8">For any issues, contact customer support at admin@lepark.com</p>
          <p>
            Click <a onClick={handleLogout}>here</a> to logout.
          </p>
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
          <LogoText className="text-xl">My Upcoming Attraction Visits</LogoText>
          <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
            <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
            <Button
              icon={<MdArrowForward className="text-2xl" />}
              shape="circle"
              type="primary"
              size="large"
              className="md:bg-transparent md:text-green-500 md:shadow-none"
              onClick={navigateToViewAttractionTransactions}
            />
          </div>
        </div>
        <div className="w-full overflow-x-auto py-2 min-h-[13rem]">
          <div className="flex whitespace-nowrap">
            {attractionTransactions && attractionTransactions.length > 0 ? (
              attractionTransactions
                .filter((transaction) => {
                  const transactionDate = new Date(transaction.attractionDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Set time to the start of the day
                  return transactionDate >= today; // Filter for today and onwards
                })
                .sort((a, b) => new Date(a.attractionDate).getTime() - new Date(b.attractionDate).getTime()) // Sort by date
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="inline-block cursor-pointer"
                    onClick={() => navigateToTransactionDetails(transaction.id)}
                  >
                    <AttractionTransactionCard transaction={transaction} />
                  </div>
                ))
            ) : (
              <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
                <BsCalendar4Event className="text-4xl" />
                <br />
                No Attraction Bookings.
              </div>
            )}
          </div>
        </div>
      </ContentWrapper>

      <ContentWrapper>
        <div className="flex items-center">
          <LogoText className="text-xl">My Upcoming Events</LogoText>
          <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
            <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
            <Button
              icon={<MdArrowForward className="text-2xl" />}
              shape="circle"
              type="primary"
              size="large"
              className="md:bg-transparent md:text-green-500 md:shadow-none"
              onClick={navigateToViewEventTransactions}
            />
          </div>
        </div>
        <div className="w-full overflow-x-auto py-2 min-h-[13rem]">
          <div className="flex whitespace-nowrap">
            {eventTransactions && eventTransactions.length > 0 ? (
              eventTransactions
                .filter((transaction) => {
                  const transactionDate = new Date(transaction.eventDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Set time to the start of the day
                  return transactionDate >= today; // Filter for today and onwards
                })
                .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()) // Sort by date
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="inline-block cursor-pointer"
                    onClick={() => navigateToEventTransactionDetails(transaction.id)}
                  >
                    <EventTransactionCard transaction={transaction} />
                  </div>
                ))
            ) : (
              <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
                <BsCalendar4Event className="text-4xl" />
                <br />
                No Event Bookings.
              </div>
            )}
          </div>
        </div>
      </ContentWrapper>

      <ContentWrapper>
        <div className="flex items-center">
          <LogoText className="text-xl">My Upcoming Venue Bookings</LogoText>
          <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
            <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
            <Button
              icon={<MdArrowForward className="text-2xl" />}
              shape="circle"
              type="primary"
              size="large"
              className="md:bg-transparent md:text-green-500 md:shadow-none"
              onClick={() => navigate('/booking')}
            />
          </div>
        </div>
        <div className="w-full overflow-x-auto py-2 min-h-[13rem]">
          <div className="flex whitespace-nowrap">
            {bookings && bookings.length > 0 ? (
              bookings
                .filter((booking) => {
                  const bookingDate = new Date(booking.dateStart);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return bookingDate >= today && !['CANCELLED', 'REJECTED'].includes(booking.bookingStatus);
                })
                .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())
                .map((booking) => (
                  <div key={booking.id} className="inline-block cursor-pointer" onClick={() => navigateToBookingDetails(booking.id)}>
                    <BookingCard booking={booking} />
                  </div>
                ))
            ) : (
              <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
                <BsCalendar4Event className="text-4xl" />
                <br />
                No Facility Bookings.
              </div>
            )}
          </div>
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
              <div className="opacity-40 flex flex-col justify-center items-center text-center w-full min-h-[100px]">
                <p>No favorite species found.</p>
              </div>
            )}
          </div>
        </div>
      </ContentWrapper>
      <ContentWrapper>
        <div className="flex items-center">
          <LogoText className="text-xl">My Feedback</LogoText>
          <div className="flex flex-1 items-center md:flex-row-reverse md:ml-4">
            <div className="h-[1px] flex-1 bg-green-100/50 mx-2"></div>
            <Button
              icon={<MdArrowForward className="text-2xl" />}
              shape="circle"
              type="primary"
              size="large"
              className="md:bg-transparent md:text-green-500 md:shadow-none"
              onClick={() => navigate('/feedback')}
            />
          </div>
        </div>
        <div className="w-full h-64 overflow-y-auto py-2 scrollbar-hide">
          {feedbacks.length > 0 ? (
            feedbacks
              .sort((a, b) => {
                if (a.feedbackStatus === 'PENDING' && b.feedbackStatus !== 'PENDING') return -1;
                if (b.feedbackStatus === 'PENDING' && a.feedbackStatus !== 'PENDING') return 1;
                return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
              })
              .map((feedback) => (
                <FeedbackCard
                  key={feedback.id}
                  date={new Date(feedback.dateCreated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  title={feedback.title}
                  category={feedback.feedbackCategory}
                  parkId={feedback.parkId}
                  status={feedback.feedbackStatus}
                  onClick={() => {
                    /* Handle click, e.g., navigate to feedback detail */
                  }}
                />
              ))
          ) : (
            <div className="opacity-40 flex flex-col justify-center items-center text-center w-full h-full">
              <FrownOutlined className="text-4xl" />
              <br />
              No Feedbacks yet.
              <br />
              Share your thoughts about a park!
            </div>
          )}
        </div>
      </ContentWrapper>
    </div>
  );
};

export default ProfilePage;
