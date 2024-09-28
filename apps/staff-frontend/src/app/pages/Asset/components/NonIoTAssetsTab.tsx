import React from 'react';
import { Button, Input, Table, Row, Col, Flex, Popconfirm } from 'antd';
import { TableColumnsType } from 'antd';
import { ParkAssetResponse } from '@lepark/data-access';
import { useNavigate } from 'react-router-dom';
import { SCREEN_LG } from '../../../config/breakpoints';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

const { Search } = Input;

interface NonIoTAssetsTabProps {
  columns: TableColumnsType<ParkAssetResponse>;
  dataSource: ParkAssetResponse[];
  handleSearchBar: (value: string) => void;
  handleDelete: (id: string) => void;
  handleEdit: (id: string) => void;
}

const NonIoTAssetsTab: React.FC<NonIoTAssetsTabProps> = ({ columns, dataSource, handleSearchBar, handleDelete, handleEdit }) => {
  const navigate = useNavigate();

  const enhancedColumns: TableColumnsType<ParkAssetResponse> = [
    ...columns.filter(col => col.key !== 'actions'),
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Flex key={record.id} justify="center" gap={8}>
          <Button
            type="link"
            icon={<FiEye className="text-blue-500" />}
            onClick={() => navigate(`${record.id}`)}
          />
          <Button
            type="link"
            icon={<FiEdit className="text-green-500" />}
            onClick={() => handleEdit(record.id)}
          />
          <Popconfirm
            title="Are you sure you want to delete this asset?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              icon={<FiTrash2 className="text-red-500" />}
            />
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <Flex justify="end" gap={10}>
        <Search
          placeholder="Search for Park Assets..."
          allowClear
          enterButton="Search"
          onChange={(e) => handleSearchBar(e.target.value)}
          style={{ marginBottom: 20 }}
        />
        <Button
          type="primary"
          onClick={() => navigate('create-park-asset')}
          className="bg-green-500 hover:bg-green-600"
        >
          Create Park Asset
        </Button>
      </Flex>
      <Row>
        <Col span={24}>
          <div className="p-5 bg-white rounded-lg shadow-md">
            <Table
              columns={enhancedColumns}
              dataSource={dataSource}
              rowKey="key"
              pagination={{ pageSize: 10 }}
              scroll={{ x: SCREEN_LG }}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default NonIoTAssetsTab;
