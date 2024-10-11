import React, { useMemo } from 'react';
import { Table, Select } from 'antd';
import { StaffResponse, PlantTaskResponse } from '@lepark/data-access';

interface StaffWorkloadTableProps {
  staffList: StaffResponse[];
  plantTasks: PlantTaskResponse[];
  isSuperAdmin: boolean;
  selectedParkId: string | null;
  onParkChange: (parkId: string) => void;
}

const StaffWorkloadTable: React.FC<StaffWorkloadTableProps> = ({
  staffList,
  plantTasks,
  isSuperAdmin,
  selectedParkId,
  onParkChange,
}) => {
  const parkOptions = useMemo(() => {
    const uniqueParks = Array.from(new Set(staffList.map((staff) => staff.parkId)));
    return uniqueParks.map((park) => ({ value: park, label: `Park ${park}` }));
  }, [staffList]);

  const filteredStaffList = useMemo(() => {
    return isSuperAdmin && selectedParkId
      ? staffList.filter((staff) => staff.parkId === Number(selectedParkId))
      : staffList;
  }, [staffList, isSuperAdmin, selectedParkId]);

  const staffWorkload = useMemo(() => {
    return filteredStaffList.map((staff) => {
      const staffTasks = plantTasks.filter((task) => task.assignedStaffId === staff.id);
      return {
        key: staff.id,
        name: `${staff.firstName} ${staff.lastName}`,
        role: staff.role,
        parkId: staff.parkId,
        totalTasks: staffTasks.length,
        openTasks: staffTasks.filter((task) => task.taskStatus === 'OPEN').length,
        inProgressTasks: staffTasks.filter((task) => task.taskStatus === 'IN_PROGRESS').length,
        completedTasks: staffTasks.filter((task) => task.taskStatus === 'COMPLETED').length,
        cancelledTasks: staffTasks.filter((task) => task.taskStatus === 'CANCELLED').length,
        lowUrgency: staffTasks.filter((task) => task.taskUrgency === 'LOW').length,
        mediumUrgency: staffTasks.filter((task) => task.taskUrgency === 'NORMAL').length,
        highUrgency: staffTasks.filter((task) => task.taskUrgency === 'HIGH').length,
        immediateUrgency: staffTasks.filter((task) => task.taskUrgency === 'IMMEDIATE').length,
      };
    });
  }, [filteredStaffList, plantTasks]);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Park ID', dataIndex: 'parkId', key: 'parkId' },
    { title: 'Total Tasks', dataIndex: 'totalTasks', key: 'totalTasks' },
    { title: 'Open', dataIndex: 'openTasks', key: 'openTasks' },
    { title: 'In Progress', dataIndex: 'inProgressTasks', key: 'inProgressTasks' },
    { title: 'Completed', dataIndex: 'completedTasks', key: 'completedTasks' },
    { title: 'Cancelled', dataIndex: 'cancelledTasks', key: 'cancelledTasks' },
    { title: 'Low Urgency', dataIndex: 'lowUrgency', key: 'lowUrgency' },
    { title: 'Medium Urgency', dataIndex: 'mediumUrgency', key: 'mediumUrgency' },
    { title: 'High Urgency', dataIndex: 'highUrgency', key: 'highUrgency' },
    { title: 'Immediate Urgency', dataIndex: 'immediateUrgency', key: 'immediateUrgency' },
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