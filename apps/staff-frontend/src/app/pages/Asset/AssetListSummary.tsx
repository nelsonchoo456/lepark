import React, { useMemo, useState } from 'react';
import { Button, Input, Table, Flex, Tag, message, Tooltip, Card, Statistic, Badge, Collapse } from 'antd';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import {
  ParkAssetResponse,
  StaffResponse,
  StaffType,
  ParkAssetStatusEnum,
  ParkAssetTypeEnum,
  ParkAssetConditionEnum,
} from '@lepark/data-access';
import { useFetchAssets } from '../../hooks/Asset/useFetchAssets';
import PageHeader from '../../components/main/PageHeader';
import { SCREEN_LG } from '../../config/breakpoints';
import { FiEye, FiSearch } from 'react-icons/fi';
import { ColumnsType } from 'antd/es/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import PageHeader2 from '../../components/main/PageHeader2';
import { MdArrowOutward } from 'react-icons/md';

const formatEnumLabel = (enumValue: string, enumType: 'type' | 'status' | 'condition'): string => {
  if (enumType === 'status' && enumValue === 'UNDER_MAINTENANCE') {
    return 'MAINTENANCE';
  }
  const words = enumValue.split('_');
  if (enumType === 'type' || enumType === 'condition') {
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  } else {
    return words.map((word) => word.toUpperCase()).join(' ');
  }
};

interface GroupedAssetData {
  status: ParkAssetStatusEnum;
  count: number;
}

const AssetListSummary: React.FC = () => {
  const { user } = useAuth<StaffResponse>();
  const { assets: parkAssets, loading } = useFetchAssets();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const groupedAssetData = useMemo(() => {
    const groupedData: GroupedAssetData[] = Object.values(ParkAssetStatusEnum).map((status) => ({
      status,
      count: parkAssets.filter((asset) => asset.parkAssetStatus === status).length,
    }));
    return groupedData;
  }, [parkAssets]);

  const filteredGroupedAssetData = useMemo(() => {
    return groupedAssetData.filter((group) => formatEnumLabel(group.status, 'status').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [groupedAssetData, searchQuery]);

  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const statusColors = {
    [ParkAssetStatusEnum.AVAILABLE]: 'green',
    [ParkAssetStatusEnum.IN_USE]: 'blue',
    [ParkAssetStatusEnum.UNDER_MAINTENANCE]: 'orange',
    [ParkAssetStatusEnum.DECOMMISSIONED]: 'red',
  };

  const statusCounts = useMemo(() => {
    return Object.values(ParkAssetStatusEnum).map((status) => ({
      name: formatEnumLabel(status, 'status').toLowerCase(),
      count: parkAssets.filter((asset) => asset.parkAssetStatus === status).length,
      color: statusColors[status],
    }));
  }, [parkAssets, statusColors]);

  const typeCounts = useMemo(() => {
    return Object.values(ParkAssetTypeEnum).map((type) => ({
      name: formatEnumLabel(type, 'type').toLowerCase(),
      count: parkAssets.filter((asset) => asset.parkAssetType === type).length,
    }));
  }, [parkAssets]);

  const getRouteForStatus = (status: ParkAssetStatusEnum): string => {
    switch (status) {
      case ParkAssetStatusEnum.AVAILABLE:
        return '/parkasset/available';
      case ParkAssetStatusEnum.IN_USE:
        return '/parkasset/inuse';
      case ParkAssetStatusEnum.UNDER_MAINTENANCE:
        return '/parkasset/undermaintenance';
      case ParkAssetStatusEnum.DECOMMISSIONED:
        return '/parkasset/decommissioned';
      default:
        return '/parkasset/viewall';
    }
  };

  const columns: ColumnsType<GroupedAssetData> = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ParkAssetStatusEnum) => (
        <Tag color={statusColors[status]} bordered={false}>
          {formatEnumLabel(status, 'status')}
        </Tag>
      ),
      width: '15%',
      align: 'left',
    },
    {
      title: <div style={{ textAlign: 'center' }}>Count</div>,
      dataIndex: 'count',
      key: 'count',
      render: (count: number) => <div style={{ textAlign: 'center' }}>{count}</div>,
      width: '15%',
    },
    {
      title: <div style={{ textAlign: 'center' }}>Actions</div>,
      key: 'actions',
      render: (_: React.ReactNode, record: GroupedAssetData) => (
        <Flex justify="center" align="center" style={{ height: '100%' }}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(getRouteForStatus(record.status))} />
          </Tooltip>
        </Flex>
      ),
      width: '20%',
    },
  ];

  const chartStyle = {
    fontSize: '11px',
    textTransform: 'lowercase',
  };

  const chartTitleStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
  };

  const breadcrumbItems = [
    { title: 'Park Asset Management', pathKey: '/parkasset', isMain: true, isCurrent: true },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <LogoText className="text-lg mb-2">Plant Tools</LogoText>
      <Card className="mb-4 p-4" styles={{ body: { padding: 0 } }} bordered={false}>
        <div className="flex mb-2">
          <div className="flex-[1]">
            <Statistic title={<div className="text-black font-semibold">Total</div>} value={0} valueStyle={{ fontSize: '1.25rem' }} />
          </div>
          <div className="flex-[1]">
            <Statistic title={<Badge status="error" text="In Use" />} value={0} valueStyle={{ fontSize: '1.25rem' }} />
          </div>
          <div className="flex-[1]">
            <Statistic title={<Badge status="success" text="Available" />} value={0} valueStyle={{ fontSize: '1.25rem' }} />
          </div>
          <div className="flex-[1]">
            <Statistic title={<Badge status="default" text="Unavailable" />} value={0} valueStyle={{ fontSize: '1.25rem' }} />
          </div>
          <div className="flex-[0] flex items-center">
            <Button icon={<MdArrowOutward />} />
            {/* <Statistic title="keke"/> */}
          </div>
        </div>
        {/* <Collapse
          size="small"
          bordered={false}
          collapsible={"icon"}
          expandIconPosition='end'
          items={[
            {
              key: '1',
              // label: "See More",
              children: (
                <Table
                  size="small"
                  columns={columns}
                  dataSource={filteredGroupedAssetData}
                  rowKey="status"
                  loading={loading}
                  pagination={false}
                  scroll={{ x: SCREEN_LG }}
                />
              ),
            },
          ]}
        /> */}
      </Card>

      <LogoText className="text-lg mb-2">Plant Related</LogoText>
      <Card className="mb-4 p-4" styles={{ body: { padding: 0 } }} bordered={false}>
        <div className="flex">
          <div className="flex-[1]">
            <Statistic title={<div className="text-black font-semibold">Total</div>} />
          </div>
          <div className="flex-[1]">
            <Statistic title={<Badge status="error" text="In Use" />} />
          </div>
          <div className="flex-[1]">
            <Statistic title={<Badge status="success" text="Available" />} />
          </div>
          <div className="flex-[1]">
            <Statistic title={<Badge status="default" text="Unavailable" />} />
          </div>
          <div className="flex-[0] flex items-center">
            <Button icon={<MdArrowOutward />} />
            {/* <Statistic title="keke"/> */}
          </div>
        </div>
      </Card>

      <LogoText className="text-lg mb-2">Equipments</LogoText>
      <Card className="mb-4 p-4" styles={{ body: { padding: 0 } }} bordered={false}>
        <div className="flex">
          <div className="flex-[1]">
            <Statistic title="Total" />
          </div>
          <div className="flex-[1]">
            <Statistic title="In Use" />
          </div>
          <div className="flex-[1]">
            <Statistic title="Available" />
          </div>
          <div className="flex-[1]">
            <Statistic title="Unavailable" />
          </div>
          <div className="flex-[0] flex items-center">
            <Button icon={<MdArrowOutward />} />
            {/* <Statistic title="keke"/> */}
          </div>
        </div>
      </Card>

      {/* <Card>
        <Table
          columns={columns}
          dataSource={filteredGroupedAssetData}
          rowKey="status"
          loading={loading}
          pagination={false}
          scroll={{ x: SCREEN_LG }}
        />
      </Card>

      <Flex justify="space-between" style={{ marginTop: '10px' }}>
        <Card style={{ width: '48%' }} className="m-1 p-1">
          <h3 style={chartTitleStyle as React.CSSProperties}>Asset Status Distribution</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={statusCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={chartStyle} />
              <YAxis tick={chartStyle} />
              <RechartsTooltip contentStyle={chartStyle as React.CSSProperties} />
              <Legend wrapperStyle={chartStyle as React.CSSProperties} />
              <Bar dataKey="count">
                {statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ width: '48%' }} className="m-1 p-1">
          <h3 style={chartTitleStyle as React.CSSProperties}>Asset Type Distribution</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={typeCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={chartStyle} />
              <YAxis tick={chartStyle} />
              <RechartsTooltip contentStyle={chartStyle as React.CSSProperties} />
              <Legend wrapperStyle={chartStyle as React.CSSProperties} />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Flex> */}
    </ContentWrapperDark>
  );
};

export default AssetListSummary;
