import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Typography, Tag, message, Button, Input, Select, Modal } from 'antd';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import {
  getAttractionTicketListingById,
  updateAttractionTicketListingDetails,
  getAttractionById,
  UpdateAttractionTicketListingData,
  getAttractionTicketListingsByAttractionId,
} from '@lepark/data-access';
import {
  AttractionTicketListingResponse,
  AttractionResponse,
  AttractionTicketCategoryEnum,
  AttractionTicketNationalityEnum,
} from '@lepark/data-access';
import { RiEdit2Line, RiArrowLeftLine } from 'react-icons/ri';
import { StaffType, StaffResponse } from '@lepark/data-access';
import PageHeader2 from '../../../components/main/PageHeader2';
import { useRestrictAttractionTicketListing } from '../../../hooks/Attractions/useRestrictAttractionTicketListing';
import TextArea from 'antd/es/input/TextArea';

const TicketListingDetails: React.FC = () => {
  const { ticketListingId } = useParams<{ ticketListingId: string }>();
  const { ticketListing, attraction, loading, refreshTicketListing } = useRestrictAttractionTicketListing(ticketListingId);
  const [editedTicketListing, setEditedTicketListing] = useState<AttractionTicketListingResponse | null>(null);
  const [inEditMode, setInEditMode] = useState(false);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [existingActiveListing, setExistingActiveListing] = useState<AttractionTicketListingResponse | null>(null);

  const { user } = useAuth<StaffResponse>();

  const canEdit = user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER;

  useEffect(() => {
    if (ticketListing) {
      setEditedTicketListing(ticketListing);
    }
  }, [ticketListing]);

  const toggleEditMode = () => {
    if (inEditMode) {
      setEditedTicketListing(ticketListing);
    }
    setInEditMode(!inEditMode);
  };

  const handleInputChange = (key: string, value: any) => {
    setEditedTicketListing((prev) => {
      if (prev === null) return null;
  
      // Handle price input
      if (key === 'price') {
        const regex = /^\d*\.?\d{0,2}$/;
        if (regex.test(value) || value === '') {
          return {
            ...prev,
            [key]: value,
          };
        }
        return prev;
      }
  
      // Handle all other inputs, including description
      return {
        ...prev,
        [key]: value,
      };
    });
  
    // Check for existing active listing when changing to active
    if (key === 'isActive' && value === true) {
      checkExistingActiveListing();
    }
  };

  const checkExistingActiveListing = async () => {
    if (!editedTicketListing || !attraction) return;

    try {
      const response = await getAttractionTicketListingsByAttractionId(attraction.id);
      const existingListing = response.data.find(
        (listing) =>
          listing.id !== editedTicketListing.id &&
          listing.category === editedTicketListing.category &&
          listing.nationality === editedTicketListing.nationality &&
          listing.isActive,
      );

      if (existingListing) {
        setExistingActiveListing(existingListing);
        setPromptModalVisible(true);
      }
    } catch (error) {
      console.error('Error checking existing active listings:', error);
    }
  };

  const validateInputs = () => {
    if (editedTicketListing === null) return false;
    const { category, nationality, description, isActive, price } = editedTicketListing;
    return category && nationality && description && isActive !== undefined && price !== undefined;
  };

  const handleSave = async () => {
    if (validateInputs()) {
      if (editedTicketListing?.isActive && existingActiveListing) {
        setPromptModalVisible(true);
        return;
      }
      await updateTicketListing();
    } else {
      message.warning('All fields are required.');
    }
  };

  const updateTicketListing = async () => {
    try {
      const updatedTicketListingData: UpdateAttractionTicketListingData = {
        category: ticketListing?.category,
        nationality: ticketListing?.nationality,
        description: editedTicketListing?.description,
        price: parseFloat(editedTicketListing?.price.toString() || '0'),
        isActive: editedTicketListing?.isActive,
        attractionId: ticketListing?.attractionId,
      };

      if (!ticketListingId) {
        message.error('No ticket listing ID provided.');
        return;
      }
      const response = await updateAttractionTicketListingDetails(ticketListingId, updatedTicketListingData);
      refreshTicketListing(response.data);
      setInEditMode(false);
      message.success('Ticket listing updated successfully!');
    } catch (error) {
      console.error(error);
      message.error('Failed to update ticket listing.');
    }
  };

  const handleMakeInactiveAndUpdate = async () => {
    if (existingActiveListing && editedTicketListing) {
      try {
        // Make the existing listing inactive
        await updateAttractionTicketListingDetails(existingActiveListing.id, {
          ...existingActiveListing,
          isActive: false,
        });

        // Update the current listing
        await updateTicketListing();

        setPromptModalVisible(false);
        setExistingActiveListing(null);
      } catch (error) {
        console.error('Error updating ticket listings:', error);
        message.error('Failed to update ticket listings');
      }
    }
  };

  const handleCancelPrompt = () => {
    setPromptModalVisible(false);
    setExistingActiveListing(null);
    setEditedTicketListing((prev) => (prev ? { ...prev, isActive: false } : null));
  };

  const getDescriptionItems = () => [
    {
      key: 'attractionTitle',
      label: 'Attraction',
      children: attraction?.title || 'Loading...',
    },
    {
      key: 'category',
      label: 'Category',
      children: ticketListing?.category,
    },
    {
      key: 'nationality',
      label: 'Nationality',
      children: ticketListing?.nationality,
    },
    {
      key: 'description',
      label: 'Description',
      children: inEditMode ? (
        <TextArea
          value={editedTicketListing?.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          autoSize={{ minRows: 3, maxRows: 5 }}
        />
      ) : (
        <div style={{ whiteSpace: 'pre-wrap' }}>{ticketListing?.description}</div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      children: inEditMode ? (
        <div className="flex items-center">
          <span className="mr-2">$</span>
          <Input
            type="number"
          value={editedTicketListing?.price}
          onChange={(e) => {
            const value = e.target.value;
            const regex = /^(\d+(\.\d{0,2})?)?$/;
            if (regex.test(value)) {
              handleInputChange('price', value);
            } else {
              e.target.value = value.replace(/[^\d.]/g, '');
              const parts = e.target.value.split('.');
              if (parts[1] && parts[1].length > 2) {
                parts[1] = parts[1].slice(0, 2);
              }
              const newValue = parts.join('.');
              handleInputChange('price', newValue);
            }
          }}
          step="0.01"
          min="0"
            style={{ width: '100%' }}
          />
        </div>
      ) : (
        `$${parseFloat(ticketListing?.price.toString() || '0').toFixed(2)}`
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      children: (
        <div style={{ minWidth: '100px' }}>
          {' '}
          {/* Add a minimum width */}
          {!inEditMode ? (
            <Tag color={ticketListing?.isActive ? 'green' : 'red'}>{ticketListing?.isActive ? 'Active' : 'Inactive'}</Tag>
          ) : (
            <Select
              value={editedTicketListing?.isActive}
              onChange={(value) => handleInputChange('isActive', value)}
              style={{ width: '100%' }}
            >
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
          )}
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Attraction Management',
      pathKey: '/attraction',
      isMain: true,
    },
    {
      title: attraction?.title || 'Attraction Details',
      pathKey: `/attraction/${attraction?.id}?tab=tickets`,
    },
    {
      title: 'Ticket Listing Details',
      pathKey: `/attraction/${attraction?.id}/ticketlisting/${ticketListing?.id}`,
      isCurrent: true,
    },
  ];

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!ticketListing) {
      return (
        <ContentWrapperDark>
          <PageHeader2 breadcrumbItems={breadcrumbItems} />
          <Card>
            <div>No ticket listing found or an error occurred.</div>
          </Card>
        </ContentWrapperDark>
      );
    }

    return (
      <ContentWrapperDark>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        <Card>
          <Descriptions
            labelStyle={{ width: '30%' }}
            bordered
            column={1}
            size="middle"
            items={getDescriptionItems()}
            title={
              <div className="w-full flex justify-between">
                {!inEditMode ? (
                  <>
                    <div>Ticket Listing Details</div>
                    {canEdit && <Button icon={<RiEdit2Line className="text-lg" />} type="text" onClick={toggleEditMode} />}
                  </>
                ) : (
                  <>
                    <Button icon={<RiArrowLeftLine className="text-lg" />} type="text" onClick={toggleEditMode}>
                      Return
                    </Button>
                    <div className="text-secondary">Edit Ticket Listing</div>
                    <Button type="primary" onClick={handleSave}>
                      Save
                    </Button>
                  </>
                )}
              </div>
            }
          />
        </Card>
      </ContentWrapperDark>
    );
  };

  return (
    <>
      {renderContent()}
      <Modal
        title="Duplicate Active Listing"
        open={promptModalVisible}
        onOk={handleMakeInactiveAndUpdate}
        onCancel={handleCancelPrompt}
        okText="Make Inactive and Update"
        cancelText="Cancel"
      >
        <p>An active ticket listing with this category and nationality already exists.</p>
        <p>Would you like to make the existing listing inactive and update this one to active?</p>
      </Modal>
    </>
  );
};

export default TicketListingDetails;
