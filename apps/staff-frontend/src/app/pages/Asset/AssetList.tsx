import React, { useRef, useState, useEffect, useMemo } from 'react';
import { SearchOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnsType, TableColumnType } from 'antd';
import { Button, Input, Space, Table, Layout, Row, Col, Dropdown, Modal, Flex, Tag, notification, Tabs, message } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import PageHeader from '../../components/main/PageHeader';
import { FiEye, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { deleteParkAsset, getAllParkAssets, ParkAssetResponse, StaffResponse, StaffType, ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { SCREEN_LG } from '../../config/breakpoints';
import NonIoTAssetsTab from './components/NonIoTAssetsTab';

const { TabPane } = Tabs;

const ParkAssetManagementPage: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const [parkAssets, setParkAssets] = useState<ParkAssetResponse[]>([]);
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (user?.role !== StaffType.MANAGER && user?.role !== StaffType.SUPERADMIN) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Park Asset Management page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    } else {
      fetchParkAssetData();
    }
  }, [user]);

  const fetchParkAssetData = async () => {
    try {
      const response = await getAllParkAssets();
      const data = await response.data;
      setParkAssets(data);
    } catch (error) {
      console.error('Error fetching park asset data:', error);
    }
  };

  const handleViewDetailsClick = (assetRecord: ParkAssetResponse) => {
    navigate(`${assetRecord.id}`);
  };

  const { Search } = Input;
  const [searchQuery, setSearchQuery] = useState('');
  const filteredParkAssets = useMemo(() => {
    return parkAssets.filter((asset) => {
      return Object.values(asset).some((value) =>
        value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [parkAssets, searchQuery]);

  const dataSource = filteredParkAssets.map((asset) => ({
    ...asset,
    key: asset.id,
  }));

  const handleSearchBar = (value: string) => {
    setSearchQuery(value);
  };

  const columns: TableColumnsType<ParkAssetResponse> = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'parkAssetName',
      width: '20%',
      sorter: (a, b) => a.parkAssetName.localeCompare(b.parkAssetName),
      sortDirections: ['ascend', 'descend'],
      fixed: 'left'
    },
    {
      title: 'Type',
      key: 'type',
      dataIndex: 'parkAssetType',
      width: '15%',
      filters: Object.values(ParkAssetTypeEnum).map((type) => ({ text: type.replace(/_/g, ' '), value: type })),
      onFilter: (value, record) => record.parkAssetType === value,
      render: (type) => type.replace(/_/g, ' '),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'parkAssetStatus',
      width: '15%',
      filters: Object.values(ParkAssetStatusEnum).map((status) => ({ text: status, value: status })),
      onFilter: (value, record) => record.parkAssetStatus === value,
      render: (status) => (
        <Tag color={status === 'AVAILABLE' ? 'green' : status === 'IN_USE' ? 'blue' : 'red'} bordered={false}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Condition',
      key: 'condition',
      dataIndex: 'parkAssetCondition',
      width: '15%',
      filters: Object.values(ParkAssetConditionEnum).map((condition) => ({ text: condition, value: condition })),
      onFilter: (value, record) => record.parkAssetCondition === value,
    },
    {
      title: 'Next Maintenance',
      key: 'nextMaintenance',
      dataIndex: 'nextMaintenanceDate',
      width: '15%',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.nextMaintenanceDate).getTime() - new Date(b.nextMaintenanceDate).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Flex key={record.id} justify="center">
          <Button type="link" icon={<FiEye />} onClick={() => handleViewDetailsClick(record)} />
        </Flex>
      ),
    },
  ];

  const breadcrumbItems = [
    {
      title: "Park Asset Management",
      pathKey: '/parkasset',
      isMain: true,
      isCurrent: true
    },
  ]

   const handleDelete = async (id: string) => {
    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: 'Confirm Deletion?',
          content: 'Deleting an Asset cannot be undone. Are you sure you want to proceed?',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
          okText: "Confirm Delete",
          okButtonProps: { danger: true }
        });
      });

      if (!confirmed) return;

      await deleteParkAsset(id);
      setParkAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id));
      message.success('Asset deleted successfully');
    } catch (error) {
      console.error('Error deleting asset:', error);
      message.error('Failed to delete asset. Please try again.');
    }
  };

  const handleEdit = (id: string) => {
    // Implement edit logic here
    console.log(`Edit asset with id: ${id}`);
  };

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Non-IoT Assets" key="1">
          <NonIoTAssetsTab
            columns={columns}
            dataSource={dataSource}
            handleSearchBar={handleSearchBar}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        </TabPane>
        <TabPane tab="IoT Assets" key="2">
          { /* <IoTAssetsTab /> */ }
        </TabPane>
        <TabPane tab="Asset Map" key="3">
         { /* <AssetMapTab /> */ }
        </TabPane>
      </Tabs>
    </ContentWrapperDark>
  );
};

export default ParkAssetManagementPage;
