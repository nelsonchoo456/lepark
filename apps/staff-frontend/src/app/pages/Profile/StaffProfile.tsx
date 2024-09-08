import { ContentWrapper, LogoText, useAuth } from '@lepark/common-ui';
import { Descriptions, Card, Button, Input, Tooltip, Tag } from 'antd';
import { RiEdit2Line, RiArrowLeftLine, RiInformationLine } from 'react-icons/ri';
import type { DescriptionsProps } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
// import backgroundPicture from '@lepark//common-ui/src/lib/assets/Seeding-rafiki.png';

const { Header, Content } = Layout;

// Temp User JSON

const initialUser = {
  id: 'dj2hhnjkwbn1k122',
  firstName: 'John',
  lastName: 'Doe',
  role: 'MANAGER',
  email: 'john.doe@example.com',
  contactNumber: '992292929',
};

const StaffProfile = () => {
  const [inEditMode, setInEditMode] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [editedUser, setEditedUser] = useState(initialUser);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleEditMode = () => {
    if (inEditMode) {
      setEditedUser(user); // Reset changes if canceling edit
    }
    setInEditMode(!inEditMode);
  };

  const handleInputChange = (key: string, value: string) => {
    setEditedUser((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setUser(editedUser); // Save changes to the user state
    setInEditMode(false);
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
        user.firstName
      ) : (
        <Input defaultValue={editedUser.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} />
      ),
      span: 2,
    },
    {
      key: 'lastName',
      label: 'Last Name',
      children: !inEditMode ? (
        user.lastName
      ) : (
        <Input defaultValue={editedUser.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} />
      ),
      span: 2,
    },
    {
      key: 'id',
      label: 'ID',
      children: user.id, // not allowed to change id
      span: 2,
    },
    {
      key: 'role',
      label: 'Role',
      children: <Tag>{user.role}</Tag>, // not allowed to change role
      span: 2,
    },
    {
      key: 'email',
      label: 'Email',
      children: (
        <div className="flex items-center">
          {user.email}
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
        user.contactNumber
      ) : (
        <Input defaultValue={editedUser.contactNumber} onChange={(e) => handleInputChange('contactNumber', e.target.value)} />
      ),
    },
  ];

  return (
    <Layout>
      <Header className="bg-green-300"></Header>
      <ContentWrapper>
        <div className="flex justify-between items-center mb-4">
          <LogoText className="text-xl font-bold">My Profile</LogoText>
          <Button onClick={handleLogout} icon={<LogoutOutlined />} className="bg-green-300 text-white">
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
                    <div>{`${user?.firstName} ${user?.lastName}`}</div>
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
      </ContentWrapper>
    </Layout>
  );
};

export default StaffProfile;
