import { ContentWrapper } from "@lepark/common-ui";
import { Button, Card, Input, Table, TableProps, Tag, Row, Col, Flex, Collapse } from "antd";
import { occurences } from "./occurences";
import moment from "moment";
import PageHeader from "../../components/main/PageHeader";
import { FiArchive, FiEye, FiSearch } from "react-icons/fi";

const OccurenceList = () => {
  const columns: TableProps['columns'] = [
    {
      title: 'Species Name',
      dataIndex: 'speciesName',
      key: 'speciesName',
      render: (text) => text,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => text,
    },
    {
      title: 'Status',
      dataIndex: 'occurenceStatus',
      key: 'occurenceStatus',
      render: (text) => {
        switch (text) {
          case 'ACTIVE':
            return (
              <Tag color="green" bordered={false}>
                Active
              </Tag>
            );
          case 'INACTIVE':
            return <Tag bordered={false}>Inactive</Tag>;
          default:
            return 'Status Unknown';
        }
      },
    },
    {
      title: 'Number',
      dataIndex: 'numberOfPlants',
      key: 'numberOfPlants',
      render: (text) => text,
    },
    {
      title: 'Last Observed',
      dataIndex: 'dateObserved',
      key: 'dateObserved',
      render: (text) => moment(text).format('D MMM YY'),
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (text) => moment(text).format('D MMM YY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Flex justify="center">
          <Button type="link" icon={<FiArchive />} />
          <Button type="link" icon={<FiEye />} />
        </Flex>
      ),
      width: '1%',
    },
  ];
  
  return (
    <ContentWrapper className="bg-gray-100">
      <PageHeader>Occurence Management</PageHeader>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Occurences..."
          className="mb-4 bg-white"
          variant="filled"
        />
        <Button type="primary">Create Occurence</Button>
      </Flex>
      
      <Card>
        <Table dataSource={occurences} columns={columns} />
      </Card>
    </ContentWrapper>
  );
}

export default OccurenceList;