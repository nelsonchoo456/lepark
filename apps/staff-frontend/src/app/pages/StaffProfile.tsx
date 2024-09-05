import { ContentWrapper } from '@lepark/common-ui';
import { Descriptions, Card, Tag, Button, Input } from 'antd';
import { RiEdit2Line, RiArrowLeftLine } from 'react-icons/ri';
import type { DescriptionsProps } from 'antd';
import { useState } from 'react';

// Temp User JSON

const user = {
  id: 'dj2hhnjkwbn1k122',
  firstName: 'John',
  lastName: 'Doe',
  role: 'MANAGER',
  email: 'john.doe@example.com',
  contactNumber: '992292929',
};

const StaffProfile = () => {
  const [inEditMode, setInEditMode] = useState(false);

  const descriptionsItems = [
    {
      key: 'firstName',
      label: 'First Name',
      children: user.firstName,
      span: 2,
    },
    {
      key: 'lastName',
      label: 'Last Name',
      children: user.lastName,
      span: 2,
    },
    {
      key: 'id',
      label: 'ID',
      children: user.id,
      span: 2,
    },
    {
      key: 'role',
      label: 'Role',
      children: <Tag>{user.role}</Tag>,
      span: 2,
    },
    {
      key: 'email',
      label: 'Email',
      children: user.email,
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      children: user.contactNumber,
    },
  ];

  const toggleEditMode = () => {
    setInEditMode(!inEditMode);
  };

  return (
    <ContentWrapper>
      <Card>
        {inEditMode ? (
          <Descriptions
            items={descriptionsItems}
            bordered
            column={2}
            size='middle'
            title={
              <div className="w-full flex justify-between">
                <div>{`${user?.firstName} ${user?.lastName}`}</div>
                <Button
                  icon={<RiEdit2Line className="text-lg" />}
                  type="text"
                  onClick={toggleEditMode}
                />
              </div>
            }
          />
        ) : (
          <Descriptions
            items={descriptionsItems.map(({ children, ...item }) => ({ ...item, children: <Input/>}))}
            bordered
            column={2}
            size='middle'
            title={
              <div className="w-full flex justify-between">
                
                <Button
                  icon={<RiArrowLeftLine className="text-lg" />}
                  type="text"
                  onClick={toggleEditMode}
                >
                  Return
                </Button>
                <div className='text-secondary'>Editing Mode</div>
              </div>
            }
          />
        )}
      </Card>
    </ContentWrapper>
  );
};

export default StaffProfile;
