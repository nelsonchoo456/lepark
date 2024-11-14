import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Button, Input, Table, Flex, Tag, message, Card, Statistic, Badge, Tooltip, Modal } from 'antd';
import { deleteParkAsset, ParkResponse, PromotionResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { FiEye, FiSearch } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { Logo, LogoText, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { SCREEN_LG } from '../../../config/breakpoints';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import moment from 'moment';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import dayjs from 'dayjs';
import PromotionValueTag from './PromotionValueTag';
import PromotionValidityTag from './PromotionValidityTag';

interface AssetsByTypeTableProps {
  promotions: PromotionResponse[];
  triggerFetch: () => void;
  tableShowParks?: boolean;
  nonArchived?: boolean;
}

const PromotionByTypeTab = ({ promotions, triggerFetch, tableShowParks = false, nonArchived = true }: AssetsByTypeTableProps) => {
  const { user } = useAuth<StaffResponse>();
  const now = dayjs();
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const filteredPromotions = useMemo(() => {
    if (promotions && promotions.length > 0) {
      return promotions.filter((asset) =>
        Object.values(asset).some((value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())),
      );
    } else {
      return [];
    }
  }, [promotions, searchQuery]);

  const editableRbac = (promotion: PromotionResponse) => {
    return user?.role === StaffType.SUPERADMIN || (user?.role === StaffType.MANAGER && !promotion.isNParksWide);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <div className="font-semibold">{name}</div>,
    },
    {
      title: 'Discount Value',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (val: any, record: any) => (
        <PromotionValueTag isPercentage={record.discountType === 'PERCENTAGE'}>{record.discountValue}</PromotionValueTag>
      ),
      sorter: (a: PromotionResponse, b: PromotionResponse) => a.discountValue - b.discountValue,
      filters: [
        { value: 'PERCENTAGE', text: 'Percentage' },
        { value: 'FIXED_AMOUNT', text: 'Fixed Amount' },
      ],
      onFilter: (value: any, record: PromotionResponse) => record.discountType === value,
    },
    {
      title: 'Promo Code',
      dataIndex: 'promoCode',
      key: 'promoCode',
      render: (promoCode: string) => (promoCode ? promoCode : '-'),
      sorter: (a: PromotionResponse, b: PromotionResponse) => (a.promoCode && b.promoCode ? a.promoCode.localeCompare(b.promoCode) : 1),
    },
    {
      title: 'Validity',
      dataIndex: 'validFrom',
      key: 'validFrom',
      render: (_: any, record: PromotionResponse) => <PromotionValidityTag validFrom={record.validFrom} validUntil={record.validUntil} />,
      sorter: (a: PromotionResponse, b: PromotionResponse) => a.validFrom - b.validFrom,
      showSorterTooltip: { title: 'Sort by Starting Date' },
      filters: [
        { value: 'ONGOING', text: 'Ongoing' },
        { value: 'UPCOMING', text: 'Upcoming' },
        { value: 'DONE', text: 'Done' },
      ],
      onFilter: (value: any, record: PromotionResponse) => {
        if (value === 'ONGOING') {
          return now.isAfter(record.validFrom) && now.isBefore(record.validUntil);
        } else if (value === 'UPCOMING') {
          return now.isBefore(record.validFrom);
        } else if (value === 'DONE') {
          return now.isAfter(record.validUntil);
        }
        return false;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: PromotionResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/promotion/${record.id}`)} />
          </Tooltip>
          {nonArchived && (
            <Tooltip title="Edit Promotion">
              <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/promotion/${record.id}?editMode=true`)} />
            </Tooltip>
          )}
        </Flex>
      ),
    },
  ];

  const columnsParks = [
    {
      title: 'Title',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <div className="font-semibold">{name}</div>,
    },
    {
      title: 'Park',
      dataIndex: 'isNParksWide',
      key: 'isNParksWide',
      render: (isNParksWide: any, record: any) =>
        record.isNParksWide ? (
          <div className="flex gap-2">
            <Logo size={1.2} />
            <LogoText>NParks-Wide</LogoText>
          </div>
        ) : (
          <div className="font-semibold">{record.park?.name}</div>
        ),
    },
    {
      title: 'Discount Value',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (val: any, record: any) => (
        <PromotionValueTag isPercentage={record.discountType === 'PERCENTAGE'}>{record.discountValue}</PromotionValueTag>
      ),
      sorter: (a: PromotionResponse, b: PromotionResponse) => a.discountValue - b.discountValue,
      filters: [
        { value: 'PERCENTAGE', text: 'Percentage' },
        { value: 'FIXED_AMOUNT', text: 'Fixed Amount' },
      ],
      onFilter: (value: any, record: PromotionResponse) => record.discountType === value,
    },
    {
      title: 'Promo Code',
      dataIndex: 'promoCode',
      key: 'promoCode',
      render: (promoCode: string) => (promoCode ? promoCode : '-'),
      sorter: (a: PromotionResponse, b: PromotionResponse) => (a.promoCode && b.promoCode ? a.promoCode.localeCompare(b.promoCode) : 1),
    },
    {
      title: 'Validity',
      dataIndex: 'validFrom',
      key: 'validFrom',
      render: (_: any, record: PromotionResponse) => <PromotionValidityTag validFrom={record.validFrom} validUntil={record.validUntil} />,
      sorter: (a: PromotionResponse, b: PromotionResponse) => a.validFrom - b.validFrom,
      showSorterTooltip: { title: 'Sort by Starting Date' },
      filters: [
        { value: 'ONGOING', text: 'Ongoing' },
        { value: 'UPCOMING', text: 'Upcoming' },
        { value: 'DONE', text: 'Done' },
      ],
      onFilter: (value: any, record: PromotionResponse) => {
        if (value === 'ONGOING') {
          return now.isAfter(record.validFrom) && now.isBefore(record.validUntil);
        } else if (value === 'UPCOMING') {
          return now.isBefore(record.validFrom);
        } else if (value === 'DONE') {
          return now.isAfter(record.validUntil);
        }
        return false;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: PromotionResponse) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/promotion/${record.id}`)} />
          </Tooltip>
          {nonArchived && editableRbac(record) && (
            <Tooltip title="Edit Promotion">
              <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/promotion/${record.id}?editMode=true`)} />
            </Tooltip>
          )}
        </Flex>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: 'Confirm Deletion?',
          content: 'Deleting an Asset cannot be undone. Are you sure you want to proceed?',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
          okText: 'Confirm Delete',
          okButtonProps: { danger: true },
        });
      });

      if (!confirmed) return;

      await deleteParkAsset(id);
      triggerFetch();
      message.success('Asset deleted successfully');
    } catch (error) {
      console.error('Error deleting asset:', error);
      message.error('Failed to delete asset. Please try again.');
    }
  };

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Card styles={{ body: { padding: 0 } }} className="p-4 border-t-0 rounded-tl-none">
      <Flex justify="end" gap={10}>
        <Input suffix={<FiSearch />} placeholder="Search for a Promotion..." onChange={handleSearchBar} className="mb-4" variant="filled" />
        {nonArchived ? (
          <>
            {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (
              <Button type="primary" onClick={() => navigate('/promotion/create')}>
                Create Promotion
              </Button>
            )}
            <Button type="default" onClick={() => navigate('/promotion/archived')}>
              View Archives
            </Button>
          </>
        ) : (
          <Button type="default" onClick={() => navigate('/promotion')}>
            Return to Non-Archived
          </Button>
        )}
      </Flex>
      <Table
        columns={tableShowParks ? columnsParks : columns}
        dataSource={filteredPromotions}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        scroll={{ x: SCREEN_LG }}
      />
    </Card>
  );
};

const TooltipIcon: React.FC<{ title: string }> = ({ title }) => {
  const iconRef = useRef(null);

  return (
    <Tooltip title={title}>
      <span ref={iconRef}>
        <AiOutlineQuestionCircle className="ml-1 opacity-90" />
      </span>
    </Tooltip>
  );
};

export default PromotionByTypeTab;
