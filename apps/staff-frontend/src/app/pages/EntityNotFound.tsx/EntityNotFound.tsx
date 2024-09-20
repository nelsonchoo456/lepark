import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import { ContentWrapperDark } from '@lepark/common-ui';

interface EntityNotFoundProps {
  entityName: string;
  listPath: string;
}

const EntityNotFound: React.FC<EntityNotFoundProps> = ({ entityName, listPath }) => {
  return (
    <ContentWrapperDark className="h-screen flex items-center justify-center">
      <Result
        status="404"
      title={`${entityName} Not Found`}
      subTitle={`Sorry, the ${entityName.toLowerCase()} you are looking for does not exist.`}
      extra={
        <Link to={listPath}>
          {listPath === '/' ? <Button type="primary">Return to Home Page</Button> : <Button type="primary">Back to List</Button>}
        </Link>
        }
      />
    </ContentWrapperDark>
  );
};

export default EntityNotFound;