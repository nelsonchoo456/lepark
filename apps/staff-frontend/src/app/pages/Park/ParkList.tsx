import { ContentWrapperDark } from "@lepark/common-ui";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, Table, TableProps, Tag, Row, Col, Flex, Collapse, Tooltip } from "antd";
import { occurences } from "./occurences";
import moment from "moment";
import PageHeader from "../../components/main/PageHeader";
import { FiArchive, FiExternalLink, FiEye, FiSearch } from "react-icons/fi";
import { getAllParks, ParkResponse } from "@lepark/data-access";
import { useEffect, useState } from "react";
import { RiEdit2Line } from "react-icons/ri";
import { useFetchParks } from "../../hooks/Parks/useFetchParks";

const ParkList = () => {
  const navigate = useNavigate();
  const { parks, restrictedParkId, loading } = useFetchParks();
  // const [parks, setParks] = useState<ParkResponse[]>([]);

  const columns: TableProps['columns'] = [
    {
      title: 'Park Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Flex justify="space-between" align="center">
          {text}
        </Flex>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text) => text,
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
      render: (text) => text,
    },
    {
      title: 'Status',
      dataIndex: 'parkStatus',
      key: 'parkStatus',
      render: (text) => {
        switch (text) {
          case 'OPEN':
            return (
              <Tag color="green" bordered={false}>
                Open
              </Tag>
            );
          case 'UNDER_CONSTRUCTION':
            return <Tag color="red" bordered={false}>Under Construction</Tag>;
          default:
            return <Tag color="red" bordered={false}>Limited Access</Tag>;
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'id',
      render: (id) => (
        <Flex justify="center">
          <Tooltip title="View details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateTo(id)} />
          </Tooltip>
          <Tooltip title="Edit details">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigateTo(`${id}/edit`)}/>
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  const navigateTo = (occurenceId: string) =>{
    navigate(`/park/${occurenceId}`)
  }
  
  return (
    <ContentWrapperDark>
      <PageHeader>Parks Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Parks..."
          className="mb-4 bg-white"
          variant="filled"
        />
        <Button type="primary" onClick={() => { navigate('/park/create')}}>Create Park</Button>
      </Flex>
      
      <Card>
        <Table dataSource={parks} columns={columns} />
      </Card>
    </ContentWrapperDark>
  );
}

export default ParkList;