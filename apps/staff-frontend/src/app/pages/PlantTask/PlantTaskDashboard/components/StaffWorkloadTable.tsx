import React, { useMemo } from 'react';
import { Table, Select } from 'antd';
import { StaffResponse, PlantTaskResponse } from '@lepark/data-access';

interface StaffWorkloadTableProps {
  staffList: StaffResponse[];
  plantTasks: PlantTaskResponse[];
  isSuperAdmin: boolean;
  selectedParkId: string | null;
  onParkChange: (parkId: string | null) => void;
}

const StaffWorkloadTable: React.FC<StaffWorkloadTableProps> = ({
  staffList,
  plantTasks,
  isSuperAdmin,
  selectedParkId,
  onParkChange,
}) => {
  const parkOptions = useMemo(() => {
    const uniqueParks = Array.from(new Set(staffList.map((staff) => staff.park?.name)));
    return [
      { value: null, label: 'All Parks' },
      ...uniqueParks.map((parkName) => ({ value: parkName, label: parkName })),
    ];
  }, [staffList]);

  const filteredStaffList = useMemo(() => {
    return isSuperAdmin && selectedParkId
      ? staffList.filter((staff) => staff.park?.name === selectedParkId)
      : staffList;
  }, [staffList, isSuperAdmin, selectedParkId]);

  const staffWorkload = useMemo(() => {
    return filteredStaffList.map((staff) => {
      const staffTasks = plantTasks.filter((task) => task.assignedStaffId === staff.id);
      return {
        key: staff.id,
        name: `${staff.firstName} ${staff.lastName}`,
        role: staff.role,
        parkName: staff.park?.name || 'N/A',
        totalTasks: staffTasks.length,
        openTasks: staffTasks.filter((task) => task.taskStatus === 'OPEN').length,
        inProgressTasks: staffTasks.filter((task) => task.taskStatus === 'IN_PROGRESS').length,
        completedTasks: staffTasks.filter((task) => task.taskStatus === 'COMPLETED').length,
        cancelledTasks: staffTasks.filter((task) => task.taskStatus === 'CANCELLED').length,
      };
    });
  }, [filteredStaffList, plantTasks]);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Park', dataIndex: 'parkName', key: 'parkName' },
    { title: 'Total Tasks', dataIndex: 'totalTasks', key: 'totalTasks' },
    { title: 'Open', dataIndex: 'openTasks', key: 'openTasks' },
    { title: 'In Progress', dataIndex: 'inProgressTasks', key: 'inProgressTasks' },
    { title: 'Completed', dataIndex: 'completedTasks', key: 'completedTasks' },
    { title: 'Cancelled', dataIndex: 'cancelledTasks', key: 'cancelledTasks' },
  ];

  return (
    <>
      {isSuperAdmin && (
        <Select
          style={{ width: 200, marginBottom: 16 }}
          placeholder="Select a park"
          onChange={onParkChange}
          value={selectedParkId}
          options={parkOptions}
        />
      )}
      <Table columns={columns} dataSource={staffWorkload} scroll={{ x: true }} />
    </>
  );
};

export default StaffWorkloadTable;