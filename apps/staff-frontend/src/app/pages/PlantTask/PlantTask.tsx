import { ContentWrapper, ContentWrapperDark, useAuth } from '@lepark/common-ui';
import MainLayout from '../../components/main/MainLayout';
import { StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, notification, Result } from 'antd';
import { IoIosInformationCircle } from 'react-icons/io';

const PlantTask = () => {
  const { user, updateUser, logout } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (user?.role == StaffType.LANDSCAPE_ARCHITECT) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Task page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    } else {
      // do tasks stuff here
    }
  }, [user]);

  return (
    <ContentWrapperDark className="h-screen flex items-center justify-center">
      <Result
        icon={<IoIosInformationCircle className="text-5xl mx-auto text-mustard-500/50" />}
        title="Coming Soon"
        subTitle="Plant Tasks Page coming soon."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Return to Home Page
          </Button>
        }
      />
    </ContentWrapperDark>
  );
};

export default PlantTask;
