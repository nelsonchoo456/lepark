import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { createHub, StaffResponse, StaffType } from '@lepark/data-access';
import { Button, Card, Form, message, notification, Result } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import CreateDetailsStep from './components/CreateDetailsStep';
import dayjs from 'dayjs';
import useUploadImages from '../../hooks/Images/useUploadImages';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { useFetchFacilities } from '../../hooks/Facilities/useFetchFacilities';

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const HubCreate = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks } = useFetchParks();
  const { facilities } = useFetchFacilities();
  const [messageApi, contextHolder] = message.useMessage();
  const [createdData, setCreatedData] = useState<any | null>();
  const { selectedFiles, previewImages, handleFileChange, removeImage, onInputClick } = useUploadImages();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  // Form Values
  const [form] = Form.useForm();
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); // Get form data
      console.log(values);

      // Remove parkId from values
      const { parkId, ...filteredValues } = values;

      const finalData = {
        ...filteredValues,
        acquisitionDate: filteredValues.acquisitionDate ? dayjs(filteredValues.acquisitionDate).toISOString() : null,
        nextMaintenanceDate: filteredValues.nextMaintenanceDate ? dayjs(filteredValues.nextMaintenanceDate).toISOString() : null,
        images: selectedFiles.length > 0 ? selectedFiles.map((file) => file.name) : [], // Ensure images are sent as an array of strings
        lat: filteredValues.lat !== undefined ? parseFloat(filteredValues.lat) : undefined,
        long: filteredValues.long !== undefined ? parseFloat(filteredValues.long) : undefined,
      };

      const response = await createHub(finalData, selectedFiles.length > 0 ? selectedFiles : undefined);
      if (response?.status && response.status === 201) {
        setCreatedData(response.data);
      }
    } catch (error) {
      console.log(error);
      messageApi.open({
        type: 'error',
        content: 'Unable to create Hub. Please try again later.',
      });
    }
  };
  const breadcrumbItems = [
    {
      title: 'Hub Management',
      pathKey: '/hubs',
      isMain: true,
    },
    {
      title: 'Create',
      pathKey: `/hubs/create`,
      isCurrent: true,
    },
  ];
  
  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!createdData ? (
          <CreateDetailsStep
            handleCurrStep={handleSubmit}
            form={form}
            previewImages={previewImages}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
            onInputClick={onInputClick}
            parks={parks}
            selectedParkId={selectedParkId}
            setSelectedParkId={setSelectedParkId}
            facilities={facilities}
            selectedFacilityId={selectedFacilityId}
            setSelectedFacilityId={setSelectedFacilityId}
            user={user}
          />
        ) : (
          <div className="py-4">
            <Result
              status="success"
              title="Created new Hub"
              subTitle={createdData && <>Hub name: {createdData.name}</>}
              extra={[
                <Button key="back" onClick={() => navigate('/hubs')}>
                  Back to Hub Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/hubs/${createdData?.id}`)}>
                  View new Hub
                </Button>,
              ]}
            />
          </div>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default HubCreate;
