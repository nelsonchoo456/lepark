// src/pages/NotFound/NotFound.tsx
import { ContentWrapperDark } from '@lepark/common-ui';
import { Button, Result } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <ContentWrapperDark className="h-screen flex items-center justify-center">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you are looking for does not exist."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Return to Home Page
          </Button>
        }
      />
    </ContentWrapperDark>
  );
};

export default PageNotFound;
