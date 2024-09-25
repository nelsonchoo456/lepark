import React, { useState, useEffect } from 'react';
import { Table, Button, Tooltip, TableProps, Tag, Flex, Input, Modal, Form, Select, message } from 'antd';
import { FiEdit, FiEye, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  AttractionResponse,
  AttractionTicketListingResponse,
  getAttractionTicketListingsByAttractionId,
  createAttractionTicketListing,
  deleteAttractionTicketListing,
  AttractionTicketCategoryEnum,
  AttractionTicketNationalityEnum,
} from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';
import { StaffType, StaffResponse } from '@lepark/data-access';
import TicketPurchaseChart from './TicketPurchaseChart';

interface TicketsTabProps {
  attraction: AttractionResponse | null;
  onTicketListingCreated: () => void;
}

const TicketsTab: React.FC<TicketsTabProps> = ({ attraction, onTicketListingCreated }) => {
  const navigate = useNavigate();
  const [ticketListings, setTicketListings] = useState<AttractionTicketListingResponse[]>([]);
  const [filteredListings, setFilteredListings] = useState<AttractionTicketListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [ticketListingToDelete, setTicketListingToDelete] = useState<string | null>(null);
  const { user } = useAuth<StaffResponse>();

  const canAddOrDelete = user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER;

  useEffect(() => {
    const fetchTicketListings = async () => {
      if (attraction?.id) {
        try {
          const response = await getAttractionTicketListingsByAttractionId(attraction.id);
          setTicketListings(response.data);
        } catch (error) {
          console.error('Error fetching ticket listings:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTicketListings();
  }, [attraction]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = ticketListings.filter(
      (listing) =>
        listing.category.toLowerCase().includes(lowercasedFilter) ||
        listing.nationality.toLowerCase().includes(lowercasedFilter) ||
        listing.price.toString().includes(lowercasedFilter),
    );
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
    if (attraction?.id) {
      try {
        await createAttractionTicketListing({
          ...values,
          attractionId: attraction.id,
          price: parseFloat(values.price), // Convert price to a number
        });
        message.success('Ticket listing created successfully');
        setIsModalVisible(false);
        form.resetFields();
        // Refresh ticket listings
        const response = await getAttractionTicketListingsByAttractionId(attraction.id);
        setTicketListings(response.data);
        onTicketListingCreated();
      } catch (error) {
        console.error('Error creating ticket listing:', error);
        message.error('Failed to create ticket listing');
      }
    }
  };

  const showDeleteConfirm = (id: string) => {
    setTicketListingToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (ticketListingToDelete) {
      try {
        await deleteAttractionTicketListing(ticketListingToDelete);
        message.success('Ticket listing deleted successfully');
        // Refresh ticket listings
        if (attraction?.id) {
          const response = await getAttractionTicketListingsByAttractionId(attraction.id);
          setTicketListings(response.data);
        }
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

  const columns: TableProps<AttractionTicketListingResponse>['columns'] = [
    {
      title: 'Nationality',
      dataIndex: 'nationality',
      key: 'nationality',
      filters: Object.values(AttractionTicketNationalityEnum).map((nationality) => ({
        text: nationality,
        value: nationality,
      })),
      onFilter: (value, record) => record.nationality === value,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: Object.values(AttractionTicketCategoryEnum).map((category) => ({
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
      sorter: (a, b) => a.price - b.price,
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`ticketlisting/${record.id}/details`)} />
          </Tooltip>
          {canAddOrDelete && (
            <Tooltip title="Delete">
              <Button danger type="link" icon={<FiTrash2 className="text-error" />} onClick={() => showDeleteConfirm(record.id)} />
            </Tooltip>
          )}
        </Flex>
      ),
      width: '1%',
    },
  ];

  return (
    <>
      <TicketPurchaseChart ticketListings={ticketListings} />   
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

      <Table<AttractionTicketListingResponse>
        dataSource={filteredListings}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      <Modal title="Add Ticket Listing" open={isModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select>
              {Object.values(AttractionTicketCategoryEnum).map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: 'Please select a nationality' }]}>
            <Select>
              {Object.values(AttractionTicketNationalityEnum).map((nationality) => (
                <Select.Option key={nationality} value={nationality}>
                  {nationality}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please enter a price' }]}>
            <Input
              type="number"
              step="0.01"
              min="0"
              onChange={(e) => {
                const value = e.target.value;
                const regex = /^\d+(\.\d{0,2})?$/;
                if (regex.test(value) || value === '') {
                  e.target.value = value;
                } else {
                  e.target.value = value.slice(0, -1);
                }
              }}
            />
          </Form.Item>
          <Form.Item name="isActive" label="Status" rules={[{ required: true, message: 'Please select a status' }]}>
            <Select>
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
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
    </>
  );
};

export default TicketsTab;
