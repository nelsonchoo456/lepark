import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Select, message, Tooltip, Tag, Flex, Checkbox, TableProps } from 'antd';
import { FiPlus, FiSearch, FiEye, FiTrash2 } from 'react-icons/fi';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  EventResponse,
  EventTicketListingResponse,
  EventTicketNationalityEnum,
  EventTicketCategoryEnum,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';
import {
  getEventTicketListingsByEventId,
  createEventTicketListing,
  updateEventTicketListingDetails,
  deleteEventTicketListing,
  getEventTicketsByListingId,
} from '@lepark/data-access'; // Adjust these imports based on your actual API functions

interface TicketsTabProps {
  event: EventResponse;
  onTicketListingCreated: () => void;
}

interface ExtendedEventTicketListingResponse extends EventTicketListingResponse {
  ticketsSold?: number;
}

const { TextArea } = Input;

const TicketsTab: React.FC<TicketsTabProps> = ({ event, onTicketListingCreated }) => {
  const navigate = useNavigate();
  const [ticketListings, setTicketListings] = useState<ExtendedEventTicketListingResponse[]>([]);
  const [filteredListings, setFilteredListings] = useState<ExtendedEventTicketListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [ticketListingToDelete, setTicketListingToDelete] = useState<string | null>(null);
  const { user } = useAuth<StaffResponse>();
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [existingListing, setExistingListing] = useState<EventTicketListingResponse | null>(null);
  const [newListingValues, setNewListingValues] = useState<any>(null);
  const [isFree, setIsFree] = useState(false);
  const [inactivateModalVisible, setInactivateModalVisible] = useState(false);
  const [listingToInactivate, setListingToInactivate] = useState<ExtendedEventTicketListingResponse | null>(null);

  const canAddOrDelete = user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER;

  useEffect(() => {
    fetchTicketListings();
  }, [event]);

  const fetchTicketListings = async () => {
    if (event?.id) {
      try {
        const response = await getEventTicketListingsByEventId(event.id);
        const listingsWithSales: ExtendedEventTicketListingResponse[] = await Promise.all(
          response.data.map(async (listing) => {
            const salesResponse = await getEventTicketsByListingId(listing.id);
            return { ...listing, ticketsSold: salesResponse.data.length };
          }),
        );
        setTicketListings(listingsWithSales);
        setFilteredListings(listingsWithSales);
      } catch (error) {
        console.error('Error fetching ticket listings:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const searchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((term) => term.length > 0);
    const filtered = ticketListings.filter((listing) => {
      const listingString = `
        ${listing.category.toLowerCase()}
        ${listing.nationality.toLowerCase()}
        ${listing.price.toString()}
        ${listing.isActive ? 'active' : 'inactive'}
      `;
      return searchTerms.every((term) => listingString.includes(term));
    });
    setFilteredListings(filtered);
  }, [searchTerm, ticketListings]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    const newListingData = {
      category: values.category,
      nationality: values.nationality,
      description: values.description,
      price: parseFloat(values.price),
      eventId: event.id,
      isActive: true,
    };

    try {
      const existingListing = ticketListings.find(
        (listing) => listing.category === values.category && listing.nationality === values.nationality && listing.isActive,
      );

      if (existingListing) {
        setExistingListing(existingListing);
        setNewListingValues(newListingData);
        setPromptModalVisible(true);
      } else {
        await createNewListing(newListingData);
      }
    } catch (error) {
      console.error('Error creating ticket listing:', error);
      message.error('Failed to create ticket listing');
    }
  };

  const createNewListing = async (newListingData: any) => {
    await createEventTicketListing(newListingData);
    message.success('Ticket listing created successfully');
    setIsModalVisible(false);
    form.resetFields();
    fetchTicketListings();
    onTicketListingCreated();
  };

  const handleMakeInactiveAndCreate = async () => {
    if (existingListing && newListingValues && event?.id) {
      try {
        await updateEventTicketListingDetails(existingListing.id, {
          category: existingListing.category,
          nationality: existingListing.nationality,
          description: existingListing.description,
          price: existingListing.price,
          eventId: existingListing.eventId,
          isActive: false,
        });

        await createEventTicketListing({
          category: newListingValues.category,
          nationality: newListingValues.nationality,
          description: newListingValues.description,
          price: parseFloat(newListingValues.price),
          eventId: event.id,
          isActive: true,
        });

        message.success('Existing listing deactivated and new listing created successfully');
        setPromptModalVisible(false);
        setIsModalVisible(false);
        setExistingListing(null);
        setNewListingValues(null);
        form.resetFields();
        fetchTicketListings();
      } catch (error) {
        console.error('Error updating and creating ticket listings:', error);
        message.error('Failed to update and create ticket listings');
      }
    }
  };

  const handleCancelPrompt = () => {
    setPromptModalVisible(false);
    setExistingListing(null);
    setNewListingValues(null);
  };

  const showDeleteConfirm = (listing: ExtendedEventTicketListingResponse) => {
    if (listing.ticketsSold && listing.ticketsSold > 0) {
      setListingToInactivate(listing);
      setInactivateModalVisible(true);
    } else {
      setTicketListingToDelete(listing.id);
      setDeleteModalVisible(true);
    }
  };

  const handleInactivateConfirm = async () => {
    if (listingToInactivate) {
      try {
        await updateEventTicketListingDetails(listingToInactivate.id, {
          ...listingToInactivate,
          isActive: false,
        });
        message.success('Ticket listing set to inactive successfully');
        fetchTicketListings();
      } catch (error) {
        console.error('Error inactivating ticket listing:', error);
        message.error('Failed to inactivate ticket listing');
      } finally {
        setInactivateModalVisible(false);
        setListingToInactivate(null);
      }
    }
  };

  const handleInactivateCancel = () => {
    setInactivateModalVisible(false);
    setListingToInactivate(null);
  };

  const handleDeleteConfirm = async () => {
    if (ticketListingToDelete) {
      try {
        await deleteEventTicketListing(ticketListingToDelete);
        message.success('Ticket listing deleted successfully');
        fetchTicketListings();
      } catch (error) {
        console.error('Error deleting ticket listing:', error);
        message.error('Failed to delete ticket listing');
      } finally {
        setDeleteModalVisible(false);
        setTicketListingToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setTicketListingToDelete(null);
  };

  const columns: TableProps<ExtendedEventTicketListingResponse>['columns'] = [
    {
      title: 'Nationality',
      dataIndex: 'nationality',
      key: 'nationality',
      filters: Object.values(EventTicketNationalityEnum).map((nationality) => ({
        text: nationality,
        value: nationality,
      })),
      onFilter: (value, record) => record.nationality === value,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: Object.values(EventTicketCategoryEnum).map((category) => ({
        text: category,
        value: category,
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a: EventTicketListingResponse, b: EventTicketListingResponse) => a.price - b.price,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Tickets Sold',
      key: 'ticketsSold',
      dataIndex: 'ticketsSold',
      render: (ticketsSold: number) => ticketsSold || 0,
      sorter: (a: ExtendedEventTicketListingResponse, b: ExtendedEventTicketListingResponse) => {
        const aSold = typeof a.ticketsSold === 'number' ? a.ticketsSold : 0;
        const bSold = typeof b.ticketsSold === 'number' ? b.ticketsSold : 0;
        return aSold - bSold;
      },
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ExtendedEventTicketListingResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`ticketlisting/${record.id}`)} />
          </Tooltip>
          {canAddOrDelete && (
            <Tooltip title={record.ticketsSold && record.ticketsSold > 0 ? 'Set Inactive' : 'Delete'}>
              <Button danger type="link" icon={<FiTrash2 className="text-error" />} onClick={() => showDeleteConfirm(record)} />
            </Tooltip>
          )}
        </Flex>
      ),
      width: '1%',
    },
  ];

  return (
    <>
      <Flex justify="space-between" align="center" className="mb-4">
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Ticket Listings..."
          className="bg-white"
          variant="filled"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '300px' }}
        />
        {canAddOrDelete && (
          <Button type="primary" icon={<FiPlus />} onClick={showModal}>
            Add Ticket Listing
          </Button>
        )}
      </Flex>

      <Table<ExtendedEventTicketListingResponse>
        dataSource={filteredListings}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      <Modal title="Add Ticket Listing" open={isModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: 'Please select a nationality' }]}>
            <Select placeholder="Select ticket listing nationality">
              {Object.values(EventTicketNationalityEnum).map((nationality) => (
                <Select.Option key={nationality} value={nationality}>
                  {nationality}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select placeholder="Select ticket listing category">
              {Object.values(EventTicketCategoryEnum).map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter a description' }]}>
            <TextArea placeholder="Describe the ticket listing" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>

          <Form.Item name="isFree" valuePropName="checked">
            <Checkbox
              onChange={(e) => {
                setIsFree(e.target.checked);
                if (e.target.checked) {
                  form.setFieldsValue({ price: '0' });
                }
              }}
            >
              Free ticket
            </Checkbox>
          </Form.Item>

          <Form.Item name="price" label="Price" rules={[{ required: !isFree, message: 'Please enter a price' }]} hidden={isFree}>
            <Input
              placeholder="Enter ticket listing price"
              type="number"
              step="0.01"
              min="0"
              onChange={(e) => {
                const value = e.target.value;
                const regex = /^\d+(\.\d{0,2})?$/;
                if (regex.test(value) || value === '') {
                  form.setFieldsValue({ price: value });
                } else {
                  e.target.value = value.slice(0, -1);
                  form.setFieldsValue({ price: e.target.value });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label={
              <>
                Status
                <Tooltip title="New listings are always set to active">
                  <InfoCircleOutlined style={{ marginLeft: '4px', color: '#8c8c8c' }} />
                </Tooltip>
              </>
            }
            initialValue={true}
            valuePropName="checked"
          >
            <Input value="Active" readOnly />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Confirm Deletion"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this ticket listing? This action cannot be undone.</p>
      </Modal>

      <Modal
        title="Set Listing to Inactive"
        open={inactivateModalVisible}
        onOk={handleInactivateConfirm}
        onCancel={handleInactivateCancel}
        okText="Set Inactive"
        cancelText="Cancel"
      >
        <p>This ticket listing has sold tickets and cannot be deleted.</p>
        <p>Would you like to set it to inactive instead?</p>
      </Modal>

      <Modal
        title="Existing Active Listing"
        open={promptModalVisible}
        onOk={handleMakeInactiveAndCreate}
        onCancel={handleCancelPrompt}
        okText="Deactivate and Create New"
        cancelText="Cancel"
      >
        <p>An active listing with the same category and nationality already exists.</p>
        <p>Do you want to deactivate the existing listing and create a new one?</p>
      </Modal>
    </>
  );
};

export default TicketsTab;
