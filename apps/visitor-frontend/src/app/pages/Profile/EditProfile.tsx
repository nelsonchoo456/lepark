import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { Card, Button, Input, Tooltip, Tag, message } from 'antd';
import { RiArrowLeftLine, RiInformationLine } from 'react-icons/ri';
import { LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VisitorResponse, VisitorUpdateData, updateVisitorDetails } from '@lepark/data-access';

const EditProfile = () => {
  const { user, updateUser, logout } = useAuth<VisitorResponse>();
  const [userState, setUser] = useState<VisitorResponse | null>(null);
  const [editedUser, setEditedUser] = useState<VisitorResponse | null>(null);
  const [contactNumberError, setContactNumberError] = useState('');
  //   const [isPopupVisible, setIsPopupVisible] = useState(false);
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
  }, [user]);

  const handleInputChange = (key: keyof VisitorResponse, value: any) => {
    setEditedUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const validateInputs = () => {
    if (!editedUser) return false;
    const { firstName, lastName, email, contactNumber } = editedUser;
    return firstName && lastName && email && contactNumber && validateContactNumber(contactNumber);
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

  const handleSave = async () => {
    if (validateInputs()) {
      try {
        const updatedVisitorDetails: VisitorUpdateData = {
          firstName: editedUser!.firstName,
          lastName: editedUser!.lastName,
          contactNumber: editedUser!.contactNumber,
          email: editedUser!.email,
        };

        const responseVisitorDetails = await updateVisitorDetails(user!.id, updatedVisitorDetails);
        const updatedUser = {
          ...responseVisitorDetails.data,
        };

        message.success('Visitor details updated successfully!');
        updateUser(updatedUser);
        setUser(updatedUser);
        navigate('/profile');
      } catch (error: any) {
        console.error(error);
        message.error('Failed to update visitor details.');
      }
    } else {
      message.warning('All fields are required.');
    }
  };

  return (
    <ContentWrapperDark>
      <Card title="Edit My Profile">
        <div className="mb-4">
          <label className="font-bold">First Name</label>
          <Input required value={editedUser?.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="font-bold">Last Name</label>
          <Input required value={editedUser?.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="font-bold">Email</label>
          <div className="flex items-center">{userState?.email}</div>
        </div>
        <div className="mb-4">
          <label className="font-bold">Contact Number</label>
          <Tooltip title={contactNumberError} visible={!!contactNumberError} placement="top" color="#73a397">
            <Input
              placeholder="Contact Number"
              value={editedUser?.contactNumber ?? ''}
              onChange={handleContactNumberChange}
              required
              pattern="^[689]\d{7}$"
            />
          </Tooltip>
        </div>
        <div className="w-full flex justify-between mt-4">
          <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={() => navigate('/profile')}>
            Return
          </Button>
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </Card>
    </ContentWrapperDark>
  );
};

export default EditProfile;
