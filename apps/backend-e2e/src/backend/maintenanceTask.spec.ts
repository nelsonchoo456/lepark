import axios from 'axios';
import FormData from 'form-data';
import {
  MaintenanceTaskStatusEnum,
  MaintenanceTaskTypeEnum,
  MaintenanceTaskUrgencyEnum,
  FacilityTypeEnum,
  FacilityStatusEnum,
  HubStatusEnum,
} from '@prisma/client';

jest.setTimeout(15000);

describe('Maintenance Task Router Endpoints', () => {
  let authCookie: string;
  let maintenanceTaskId: string;
  let facilityId: string;
  let hubId: string;
  let staffId: string;

  beforeAll(async () => {
    try {
      // Login first
      const loginResponse = await axios.post(
        'http://localhost:3333/api/staffs/login',
        {
          email: 'superadmin@lepark.com',
          password: 'password',
        },
        {
          withCredentials: true,
        },
      );

      const cookie = loginResponse.headers['set-cookie'];
      authCookie = cookie.find((c) => c.startsWith('jwtToken_Staff='));

      // Extract the staff ID from the login response
      staffId = loginResponse.data.id;
      console.log('Logged in as staff with ID:', staffId);

      // Create a test facility
      const facilityData = {
        name: 'Test Facility for Maintenance Tasks',
        description: 'A test facility for maintenance task e2e tests',
        isBookable: true,
        isPublic: true,
        isSheltered: true,
        facilityType: FacilityTypeEnum.STOREROOM,
        reservationPolicy: 'Test reservation policy',
        rulesAndRegulations: 'Test rules and regulations',
        images: [],
        openingHours: [new Date()],
        closingHours: [new Date()],
        facilityStatus: FacilityStatusEnum.OPEN,
        lat: 1.3521,
        long: 103.8198,
        size: 100,
        capacity: 50,
        fee: 10,
        parkId: 1,
      };

      const facilityResponse = await axios.post('http://localhost:3333/api/facilities/createFacility', facilityData, {
        headers: { Cookie: authCookie },
      });

      facilityId = facilityResponse.data.id;
      console.log('Created test facility with ID:', facilityId);

      // Create a test hub
      const hubData = {
        name: 'Test Hub for Maintenance Tasks',
        serialNumber: 'HUB-TEST-002',
        description: 'Test hub for maintenance task e2e tests',
        hubStatus: HubStatusEnum.INACTIVE,
        acquisitionDate: new Date(),
        supplier: 'Test Supplier',
        supplierContactNumber: '99999999',
        facilityId: facilityId,
      };

      const hubResponse = await axios.post('http://localhost:3333/api/hubs/createHub', hubData, {
        headers: { Cookie: authCookie },
      });

      hubId = hubResponse.data.id;
      console.log('Created test hub with ID:', hubId);
    } catch (error) {
      console.error('Setup error:', error.response?.data || error);
      throw error;
    }
  });

  let newMaintenanceTaskId: string;

  beforeEach(async () => {
    const validMaintenanceTaskData = {
      title: 'Test Maintenance Task',
      description: 'Test maintenance task for e2e testing',
      taskStatus: MaintenanceTaskStatusEnum.OPEN,
      taskType: MaintenanceTaskTypeEnum.INSPECTION,
      taskUrgency: MaintenanceTaskUrgencyEnum.NORMAL,
      dueDate: new Date(),
      facilityId: facilityId, // Include the facility ID
    };

    try {
      const response = await axios.post(
        'http://localhost:3333/api/maintenancetasks/createMaintenanceTask',
        {
          ...validMaintenanceTaskData,
          submittingStaffId: staffId, // Include the logged-in staff ID
        },
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      newMaintenanceTaskId = response.data.id;
    } catch (error) {
      console.error('Create maintenance task error:', error.response?.data);
      throw error;
    }
  });

  describe('POST endpoints', () => {
    it('should successfully create a new maintenance task', async () => {
      const validMaintenanceTaskData = {
        title: 'Test Maintenance Task',
        description: 'Test maintenance task for e2e testing',
        taskStatus: MaintenanceTaskStatusEnum.OPEN,
        taskType: MaintenanceTaskTypeEnum.INSPECTION,
        taskUrgency: MaintenanceTaskUrgencyEnum.NORMAL,
        dueDate: new Date(),
        facilityId: facilityId, // Include the facility ID
      };

      try {
        const response = await axios.post(
          'http://localhost:3333/api/maintenancetasks/createMaintenanceTask',
          {
            ...validMaintenanceTaskData,
            submittingStaffId: staffId, // Include the logged-in staff ID
          },
          {
            headers: { Cookie: authCookie },
          },
        );
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        maintenanceTaskId = response.data.id;
      } catch (error) {
        console.error('Create maintenance task error:', error.response?.data);
        throw error;
      }
    });

    it('should fail to create maintenance task with invalid data', async () => {
      const invalidData = {
        title: 'Test Maintenance Task',
        description: 'Test maintenance task for e2e testing',
        taskStatus: 'INVALID_STATUS',
        taskType: MaintenanceTaskTypeEnum.INSPECTION,
        taskUrgency: MaintenanceTaskUrgencyEnum.NORMAL,
        dueDate: new Date(),
        facilityId: facilityId, // Include the facility ID
      };
      try {
        await axios.post(
          'http://localhost:3333/api/maintenancetasks/createMaintenanceTask',
          {
            ...invalidData,
            submittingStaffId: staffId, // Include the logged-in staff ID
          },
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET endpoints', () => {
    it('should get all maintenance tasks', async () => {
      const response = await axios.get('http://localhost:3333/api/maintenancetasks/getAllMaintenanceTasks', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get maintenance task by ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/maintenancetasks/viewMaintenanceTaskDetails/${maintenanceTaskId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', maintenanceTaskId);
    });

    it('should fail to get maintenance task by ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/maintenancetasks/viewMaintenanceTaskDetails/invalid-id', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get maintenance tasks by park ID', async () => {
      const response = await axios.get('http://localhost:3333/api/maintenancetasks/getMaintenanceTasksByParkId/1', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get maintenance tasks by park ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/maintenancetasks/getMaintenanceTasksByParkId/invalid-id', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get all assigned maintenance tasks by staff ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/maintenancetasks/getAllAssignedMaintenanceTasks/${staffId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get all assigned maintenance tasks by staff ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/maintenancetasks/getAllAssignedMaintenanceTasks/invalid-id', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get maintenance tasks by submitting staff ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/maintenancetasks/getMaintenanceTasksBySubmittingStaff/${staffId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get maintenance tasks by submitting staff ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/maintenancetasks/getMaintenanceTasksBySubmittingStaff/invalid-id', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get park maintenance task average completion time for period', async () => {
      const response = await axios.get('http://localhost:3333/api/maintenancetasks/getParkMaintenanceTaskAverageCompletionTimeForPeriod', {
        headers: { Cookie: authCookie },
        params: {
          parkId: 1,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      response.data.forEach((item) => {
        expect(item).toHaveProperty('averageCompletionTime');
      });
    });

    it('should fail to get park maintenance task average completion time for period', async () => {
      try {
        await axios.get('http://localhost:3333/api/maintenancetasks/getParkMaintenanceTaskAverageCompletionTimeForPeriod', {
          headers: { Cookie: authCookie },
          params: {
            parkId: 'invalid-id',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get park maintenance task overdue rate for period', async () => {
      const response = await axios.get('http://localhost:3333/api/maintenancetasks/getParkMaintenanceTaskOverdueRateForPeriod', {
        headers: { Cookie: authCookie },
        params: {
          parkId: 1,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      response.data.forEach((item) => {
        expect(item).toHaveProperty('overdueRate');
      });
    });

    it('should fail to get park maintenance task overdue rate for period', async () => {
      try {
        await axios.get('http://localhost:3333/api/maintenancetasks/getParkMaintenanceTaskOverdueRateForPeriod', {
          headers: { Cookie: authCookie },
          params: {
            parkId: 'invalid-id',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get park maintenance task delayed task types for period', async () => {
      const response = await axios.get('http://localhost:3333/api/maintenancetasks/getParkMaintenanceTaskDelayedTaskTypesForPeriod', {
        headers: { Cookie: authCookie },
        params: {
          parkId: 1,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get park maintenance task delayed task types for period', async () => {
      try {
        await axios.get('http://localhost:3333/api/maintenancetasks/getParkMaintenanceTaskDelayedTaskTypesForPeriod', {
          headers: { Cookie: authCookie },
          params: {
            parkId: 'invalid-id',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get park task type average completion times for past months', async () => {
      const response = await axios.get('http://localhost:3333/api/maintenancetasks/getParkTaskTypeAverageCompletionTimesForPastMonths', {
        headers: { Cookie: authCookie },
        params: {
          parkId: 1,
          months: 6,
        },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get park task type average completion times for past months', async () => {
      try {
        await axios.get('http://localhost:3333/api/maintenancetasks/getParkTaskTypeAverageCompletionTimesForPastMonths', {
          headers: { Cookie: authCookie },
          params: {
            parkId: 'invalid-id',
            months: 6,
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get park task type average overdue rates for past months', async () => {
      const response = await axios.get('http://localhost:3333/api/maintenancetasks/getParkTaskTypeAverageOverdueRatesForPastMonths', {
        headers: { Cookie: authCookie },
        params: {
          parkId: 1,
          months: 6,
        },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get park task type average overdue rates for past months', async () => {
      try {
        await axios.get('http://localhost:3333/api/maintenancetasks/getParkTaskTypeAverageOverdueRatesForPastMonths', {
          headers: { Cookie: authCookie },
          params: {
            parkId: 'invalid-id',
            months: 6,
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('PUT endpoints', () => {
    it('should update maintenance task details', async () => {
      const updateData = { taskStatus: MaintenanceTaskStatusEnum.IN_PROGRESS };
      const response = await axios.put(
        `http://localhost:3333/api/maintenancetasks/updateMaintenanceTaskDetails/${maintenanceTaskId}`,
        updateData,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.taskStatus).toBe(MaintenanceTaskStatusEnum.IN_PROGRESS);
    });

    it('should fail to update maintenance task details', async () => {
      const updateData = { taskStatus: 'INVALID_STATUS' };
      try {
        await axios.put(`http://localhost:3333/api/maintenancetasks/updateMaintenanceTaskDetails/${maintenanceTaskId}`, updateData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should assign maintenance task', async () => {
      // Ensure the task is in OPEN status before assigning
      const updateData = { taskStatus: MaintenanceTaskStatusEnum.OPEN };
      await axios.put(`http://localhost:3333/api/maintenancetasks/updateMaintenanceTaskDetails/${maintenanceTaskId}`, updateData, {
        headers: { Cookie: authCookie },
      });

      const assignData = { staffId: staffId };
      try {
        const response = await axios.put(
          `http://localhost:3333/api/maintenancetasks/assignMaintenanceTask/${maintenanceTaskId}`,
          assignData,
          {
            headers: { Cookie: authCookie },
          },
        );
        expect(response.status).toBe(200);
        expect(response.data.assignedStaffId).toBe(staffId);
      } catch (error) {
        console.error('Error assigning maintenance task:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should fail to assign maintenance task', async () => {
      const assignData = { staffId: 'invalid-id' };
      try {
        await axios.put(`http://localhost:3333/api/maintenancetasks/assignMaintenanceTask/${maintenanceTaskId}`, assignData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should unassign maintenance task', async () => {
      const unassignData = { unassignerStaffId: staffId };
      const response = await axios.put(
        `http://localhost:3333/api/maintenancetasks/unassignMaintenanceTask/${maintenanceTaskId}`,
        unassignData,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.assignedStaffId).toBeNull();
    });

    it('should fail to unassign maintenance task', async () => {
      const unassignData = { unassignerStaffId: 'invalid-id' };
      try {
        await axios.put(`http://localhost:3333/api/maintenancetasks/unassignMaintenanceTask/${maintenanceTaskId}`, unassignData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should update maintenance task status', async () => {
      // Assign the task first
      const assignData = { staffId: staffId };
      await axios.put(`http://localhost:3333/api/maintenancetasks/assignMaintenanceTask/${newMaintenanceTaskId}`, assignData, {
        headers: { Cookie: authCookie },
      });

      // Update the task status
      const updateStatusData = { newStatus: MaintenanceTaskStatusEnum.COMPLETED };
      const response = await axios.put(
        `http://localhost:3333/api/maintenancetasks/updateMaintenanceTaskStatus/${newMaintenanceTaskId}`,
        updateStatusData,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.taskStatus).toBe(MaintenanceTaskStatusEnum.COMPLETED);
    });

    it('should fail to update maintenance task status', async () => {
      const updateStatusData = { newStatus: 'INVALID_STATUS' };
      try {
        await axios.put(`http://localhost:3333/api/maintenancetasks/updateMaintenanceTaskStatus/${maintenanceTaskId}`, updateStatusData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should update maintenance task position', async () => {
      // Assign the task first
      const assignData = { staffId: staffId };
      await axios.put(`http://localhost:3333/api/maintenancetasks/assignMaintenanceTask/${newMaintenanceTaskId}`, assignData, {
        headers: { Cookie: authCookie },
      });

      // Get the current position of the task
      const taskDetailsResponse = await axios.get(
        `http://localhost:3333/api/maintenancetasks/viewMaintenanceTaskDetails/${newMaintenanceTaskId}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      const originalPosition = taskDetailsResponse.data.position;

      // Update the task position
      const updatePositionData = { newPosition: originalPosition + 1 };
      const response = await axios.put(
        `http://localhost:3333/api/maintenancetasks/updateMaintenanceTaskPosition/${newMaintenanceTaskId}`,
        updatePositionData,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.position).not.toBe(originalPosition);
    });

    it('should fail to update maintenance task position', async () => {
      const updatePositionData = { newPosition: 'INVALID_POSITION' };
      try {
        await axios.put(
          `http://localhost:3333/api/maintenancetasks/updateMaintenanceTaskPosition/${maintenanceTaskId}`,
          updatePositionData,
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('DELETE endpoints for task actions', () => {
    it('should delete a maintenance task', async () => {
      const response = await axios.delete(`http://localhost:3333/api/maintenancetasks/deleteMaintenanceTask/${maintenanceTaskId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent maintenance task', async () => {
      try {
        await axios.delete(`http://localhost:3333/api/maintenancetasks/deleteMaintenanceTask/invalid-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should delete maintenance tasks by status', async () => {
      const response = await axios.delete(
        `http://localhost:3333/api/maintenancetasks/deleteMaintenanceTasksByStatus/${MaintenanceTaskStatusEnum.COMPLETED}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(204);
    });

    it('should fail to delete maintenance tasks by invalid status', async () => {
      try {
        await axios.delete(`http://localhost:3333/api/maintenancetasks/deleteMaintenanceTasksByStatus/INVALID_STATUS`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Authentication tests', () => {
    it('should fail to access endpoints without authentication', async () => {
      try {
        await axios.get('http://localhost:3333/api/maintenancetasks/getAllMaintenanceTasks');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  describe('POST /api/maintenancetasks/upload', () => {
    it('should successfully upload files', async () => {
      // Create a test file buffer
      const testFileContent = Buffer.from('test image content');
      const formData = new FormData();

      // Add the test file to form data
      formData.append('files', testFileContent, 'test-image.jpg');

      try {
        const response = await axios.post('http://localhost:3333/api/maintenancetasks/upload', formData, {
          headers: {
            Cookie: authCookie,
            ...formData.getHeaders(),
          },
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('uploadedUrls');
        expect(Array.isArray(response.data.uploadedUrls)).toBe(true);
      } catch (error) {
        console.error('Upload error:', error.response?.data);
        throw error;
      }
    });

    it('should fail when uploading more than 5 files', async () => {
      const formData = new FormData();
      const testFileContent = Buffer.from('test image content');

      // Add 6 files to form data
      for (let i = 0; i < 6; i++) {
        formData.append('files', testFileContent, `test-image-${i}.jpg`);
      }

      try {
        await axios.post('http://localhost:3333/api/maintenancetasks/upload', formData, {
          headers: {
            Cookie: authCookie,
            ...formData.getHeaders(),
          },
        });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(500);
      }
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    try {
      // if (maintenanceTaskId) {
      //   await axios.delete(`http://localhost:3333/api/maintenancetasks/deleteMaintenanceTask/${maintenanceTaskId}`, {
      //     headers: { Cookie: authCookie },
      //   });
      // }
      if (hubId) {
        await axios.delete(`http://localhost:3333/api/hubs/deleteHub/${hubId}`, {
          headers: { Cookie: authCookie },
        });
      }
      if (facilityId) {
        await axios.delete(`http://localhost:3333/api/facilities/deleteFacility/${facilityId}`, {
          headers: { Cookie: authCookie },
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error.response?.data || error);
    }
  });
});
