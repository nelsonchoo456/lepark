import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, Typography, message } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import { FiEye, FiSearch } from 'react-icons/fi';
import { StaffResponse, StaffType, DecarbonizationAreaResponse } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import { useState, useMemo } from 'react';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { deleteDecarbonizationArea } from '@lepark/data-access';
import { SCREEN_LG } from '../../config/breakpoints';
import { useFetchDecarbonizationAreas } from '../../hooks/DecarbonizationArea/useFetchDecarbonizationAreas';

const DecarbonizationAreaList: React.FC = () => {
  const { decarbonizationAreas, loading, triggerFetch } = useFetchDecarbonizationAreas();
  const { user } = useAuth<StaffResponse>();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [areaToBeDeleted, setAreaToBeDeleted] = useState<DecarbonizationAreaResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredAreas = useMemo(() => {
    return decarbonizationAreas.filter((area) =>
      Object.values(area).some((value) => 
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, decarbonizationAreas]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (areaId: string) => {
    navigate(`/decarbonization-area/${areaId}`);
  };

  const columns: TableProps['columns'] = [
    {
      title: 'Area Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Flex justify="space-between" align="center" className="font-semibold">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      width: '50%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
          }}
        >
          {text}
        </Typography.Paragraph>
      ),
      sorter: (a, b) => {
        return a.description.localeCompare(b.description);
      },
      width: '50%',
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'id',
      render: (id, record) => (
        <Flex justify="center">
          <Tooltip title="View Area">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(id)} />
          </Tooltip>
          {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (
            <>
              <Tooltip title="Edit Area">
                <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/decarbonization-area/${id}/edit`)} />
              </Tooltip>
              <Tooltip title="Delete Area">
                <Button
                  danger
                  type="link"
                  icon={<MdDeleteOutline className="text-error" />}
                  onClick={() => showDeleteModal(record as DecarbonizationAreaResponse)}
                />
              </Tooltip>
            </>
          )}
        </Flex>
      ),
      width: '1%',
    },
  ];

  const showDeleteModal = (area: DecarbonizationAreaResponse) => {
    setDeleteModalOpen(true);
    setAreaToBeDeleted(area);
  };

  const cancelDelete = () => {
    setAreaToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  const deleteAreaToBeDeleted = async () => {
    try {
      if (!areaToBeDeleted) {
        throw new Error('Unable to delete Decarbonization Area at this time');
      }
      await deleteDecarbonizationArea(areaToBeDeleted.id);
      triggerFetch();
      setAreaToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'success',
        content: `Deleted Decarbonization Area: ${areaToBeDeleted.name}.`,
      });
    } catch (error) {
      console.log(error);
      setAreaToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'error',
        content: `Unable to delete Decarbonization Area at this time. Please try again later.`,
      });
    }
  };

  const breadcrumbItems = [
    {
      title: 'Decarbonization Areas Management',
      pathKey: '/decarbonization-area',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      <ConfirmDeleteModal onConfirm={deleteAreaToBeDeleted} open={deleteModalOpen} description='Deleting a Decarbonization Area will delete all of its data. This cannot be undone.' onCancel={cancelDelete}></ConfirmDeleteModal>
      <Flex justify="end" gap={10}>
        <Input 
          suffix={<FiSearch />} 
          placeholder="Search in Decarbonization Areas..." 
          className="mb-4 bg-white" 
          variant="filled" 
          onChange={handleSearch}
        />
        {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (
          <Button
            type="primary"
            onClick={() => {
              navigate('/decarbonization-area/create');
            }}
          >
            Create Decarbonization Area
          </Button>
        )}
      </Flex>

      <Card>
        <Table 
          dataSource={filteredAreas} 
          columns={columns} 
          rowKey="id" 
          loading={loading}  
          scroll={{ x: SCREEN_LG }}
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default DecarbonizationAreaList;