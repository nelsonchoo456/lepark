import { ContentWrapper, useAuth } from '@lepark/common-ui';
import MainLayout from '../../components/main/MainLayout';
import { StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

const Task = () => {
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

    return <ContentWrapper>Task</ContentWrapper>;
}

export default Task;
