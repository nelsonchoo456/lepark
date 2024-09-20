import { ContentWrapperDark, useAuth } from "@lepark/common-ui";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, Table, TableProps, Tag, Row, Col, Flex, Collapse, Tooltip, notification, message } from "antd";
import moment from "moment";
import PageHeader from "../../components/main/PageHeader";
import { FiEye, FiSearch } from "react-icons/fi";
import { deletePark, ParkResponse, StaffResponse, StaffType } from "@lepark/data-access";
import { useEffect, useRef, useState, useMemo } from "react";
import { RiEdit2Line } from "react-icons/ri";
import { useFetchParks } from "../../hooks/Parks/useFetchParks";
import { MdDeleteOutline, MdOutlineDeleteOutline } from "react-icons/md";
import ConfirmDeleteModal from "../../components/modal/ConfirmDeleteModal";
import PageHeader2 from "../../components/main/PageHeader2";
import { SCREEN_LG } from "../../config/breakpoints";

const ParkList = () => {
  const { user, updateUser } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const { parks, restrictedParkId, loading, triggerFetch } = useFetchParks();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [parkToBeDeleted, setParkToBeDeleted] = useState<ParkResponse | null>(null);
  const notificationShown = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role !== StaffType.SUPERADMIN) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Park Management page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    }
  }, []);

  const filteredParks = useMemo(() => {
    return parks.filter((park) =>
      Object.values(park).some((value) => 
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, parks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const columns: TableProps['columns'] = [
    {
      title: 'Park Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Flex justify="space-between" align="center" className='font-semibold'>
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      // width: '33%',
      fixed: 'left'
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text) => text,
      sorter: (a, b) => {
        return a.address.localeCompare(b.address);
      },
      // width: '33%',
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
      render: (text) => text,
      sorter: (a, b) => {
        return a.contactNumber.localeCompare(b.contactNumber);
      },
      // width: '33%',
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
      filters: [
        { text: 'Open', value: 'OPEN' },
        { text: 'Under Construction', value: 'UNDER_CONSTRUCTION' },
        { text: 'Limited Access', value: 'LIMITED_ACCESS' },
        { text: 'Closed', value: 'CLOSED' },
      ],
      onFilter: (value, record) => record.parkStatus === value,
      // width: '1%',
      // width: '110px',
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'id',
      render: (id, record) => (
        <Flex justify="center">
          <Tooltip title="View details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateTo(id)} />
          </Tooltip>
          <Tooltip title="Edit details">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigateTo(`${id}/edit`)}/>
          </Tooltip>
          <Tooltip title="Delete">
            <Button danger type="link" icon={<MdDeleteOutline className='text-error'/>} onClick={() => showDeleteModal(record as ParkResponse)}  />
          </Tooltip>
        </Flex>
      ),
      width: '110px',
    },
  ];

  const navigateTo = (parkId: string) =>{
    navigate(`/park/${parkId}`)
  }

  // Confirm Delete Modal utility
  const cancelDelete = () => {
    setParkToBeDeleted(null);
    setDeleteModalOpen(false);
  }

  const showDeleteModal = (park: ParkResponse) => {
    setDeleteModalOpen(true);
    setParkToBeDeleted(park);
  }
  
  const deleteParkToBeDeleted = async () => {
    try {
      if (!parkToBeDeleted) {
        throw new Error("Unable to delete Park at this time");
      }
      await deletePark(parkToBeDeleted.id);
      triggerFetch();
      setParkToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'success',
        content: `Deleted Park: ${parkToBeDeleted.name}.`,
      });
    } catch (error) {
      console.log(error)
      setParkToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.open({
        type: 'error',
        content: `Unable to delete Park at this time. Please try again later.`,
      });
    }
  } 

  const breadcrumbItems = [
    {
      title: 'Parks Management',
      pathKey: '/park',
      isMain: true,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems}/>
      {contextHolder}
      <ConfirmDeleteModal onConfirm={deleteParkToBeDeleted} open={deleteModalOpen} description='Deleting a Park will delete all of its Zones and Occurrences. This cannot be undone.' onCancel={cancelDelete}></ConfirmDeleteModal>
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Parks..."
          className="mb-4 bg-white"
          variant="filled"
          onChange={handleSearch}
        />
        <Tooltip title={user?.role !== StaffType.SUPERADMIN ? "Not allowed to create park!" : ""}>
          <Button
            type="primary"
            onClick={() => { navigate('/park/create'); }}
            disabled={user?.role !== StaffType.SUPERADMIN}
          >
            Create Park
          </Button>
        </Tooltip>
      </Flex>
      
      <Card>
        <Table 
          dataSource={filteredParks} 
          columns={columns} 
          rowKey={(record) => record.id}
          scroll={{ x: SCREEN_LG }}
        />
      </Card>
    </ContentWrapperDark>
  );
}

export default ParkList;