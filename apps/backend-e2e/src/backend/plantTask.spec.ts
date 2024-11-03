import axios from 'axios';
import FormData from 'form-data';
import {
  PlantTaskStatusEnum,
  PlantTaskTypeEnum,
  PlantTaskUrgencyEnum,
  OccurrenceStatusEnum,
  DecarbonizationTypeEnum,
} from '@prisma/client';

jest.setTimeout(15000);

describe('Plant Task Router Endpoints', () => {
  let authCookie: string;
  let plantTaskId: string;
  let occurrenceId: string;
  let staffId: string;
  let staffId2: string;

  beforeAll(async () => {
    try {
      // Login first
      const loginResponse = await axios.post(
        'http://localhost:3333/api/staffs/login',
        {
          email: 'botanist1@lepark.com',
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
      //console.log('Logged in as staff with ID:', staffId);

      const loginResponse2 = await axios.post(
        'http://localhost:3333/api/staffs/login',
        {
          email: 'superadmin@lepark.com',
          password: 'password',
        },
        {
          withCredentials: true,
        },
      );

      // Extract the staff ID from the login response
      staffId2 = loginResponse2.data.id;
      //console.log('Logged in as staff with ID:', staffId2);

      // Get all species and take the first one
      const speciesResponse = await axios.get('http://localhost:3333/api/species/getAllSpecies', {
        headers: { Cookie: authCookie },
      });
      const speciesId = speciesResponse.data[0].id;

      // Create a test occurrence
      const occurrenceData = {
        title: 'Test Occurrence for Plant Tasks',
        dateObserved: new Date(),
        numberOfPlants: 10,
        biomass: 100,
        occurrenceStatus: OccurrenceStatusEnum.HEALTHY,
        decarbonizationType: DecarbonizationTypeEnum.TREE_TROPICAL,
        speciesId: speciesId, // Use the first species ID
        zoneId: 1, // Replace with a valid zone ID
      };

      const occurrenceResponse = await axios.post('http://localhost:3333/api/occurrences/createOccurrence', occurrenceData, {
        headers: { Cookie: authCookie },
      });

      occurrenceId = occurrenceResponse.data.id;
      // console.log('Created test occurrence with ID:', occurrenceId);
    } catch (error) {
      console.error('Setup error:', error.response?.data || error);
      throw error;
    }
  });

  let newPlantTaskId: string;

  beforeEach(async () => {
    if (newPlantTaskId) {
      // Check if the task is completed
      const taskDetailsResponse = await axios.get(`http://localhost:3333/api/planttasks/viewPlantTaskDetails/${newPlantTaskId}`, {
        headers: { Cookie: authCookie },
      });
      if (taskDetailsResponse.data.taskStatus === PlantTaskStatusEnum.COMPLETED) {
        newPlantTaskId = null; // Reset to create a new task
      }
    }

    if (!newPlantTaskId) {
      const validPlantTaskData = {
        title: 'Test Plant Task',
        description: 'Test plant task for e2e testing',
        taskStatus: PlantTaskStatusEnum.OPEN,
        taskType: PlantTaskTypeEnum.INSPECTION,
        taskUrgency: PlantTaskUrgencyEnum.NORMAL,
        dueDate: new Date(),
        occurrenceId: occurrenceId, // Include the occurrence ID
      };

      try {
        const response = await axios.post(
          'http://localhost:3333/api/planttasks/createPlantTask',
          {
            ...validPlantTaskData,
            submittingStaffId: staffId, // Include the logged-in staff ID
          },
          {
            headers: { Cookie: authCookie },
          },
        );
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        newPlantTaskId = response.data.id;
      } catch (error) {
        console.error('Create plant task error:', error.response?.data);
        throw error;
      }
    }
  });

  describe('POST endpoints', () => {
    it('should successfully create a new plant task', async () => {
      const validPlantTaskData = {
        title: 'Test Plant Task',
        description: 'Test plant task for e2e testing',
        taskStatus: PlantTaskStatusEnum.OPEN,
        taskType: PlantTaskTypeEnum.INSPECTION,
        taskUrgency: PlantTaskUrgencyEnum.NORMAL,
        dueDate: new Date(),
        occurrenceId: occurrenceId, // Include the occurrence ID
      };

      try {
        const response = await axios.post(
          'http://localhost:3333/api/planttasks/createPlantTask',
          {
            ...validPlantTaskData,
            submittingStaffId: staffId,
          },
          {
            headers: { Cookie: authCookie },
          },
        );
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        plantTaskId = response.data.id;
      } catch (error) {
        console.error('Create plant task error:', error.response?.data);
        throw error;
      }
    });

    it('should fail to create plant task with invalid data', async () => {
      const invalidData = {
        title: 'Test Plant Task',
        description: 'Test plant task for e2e testing',
        taskStatus: 'INVALID_STATUS',
        taskType: PlantTaskTypeEnum.INSPECTION,
        taskUrgency: PlantTaskUrgencyEnum.NORMAL,
        dueDate: new Date(),
        occurrenceId: occurrenceId, // Include the occurrence ID
      };
      try {
        await axios.post(
          'http://localhost:3333/api/planttasks/createPlantTask',
          {
            ...invalidData,
            submittingStaffId: staffId,
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
    it('should get all plant tasks', async () => {
      const response = await axios.get('http://localhost:3333/api/planttasks/getAllPlantTasks', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get plant task by ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/planttasks/viewPlantTaskDetails/${plantTaskId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', plantTaskId);
    });

    it('should fail to get plant task by ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/viewPlantTaskDetails/invalid-id', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get plant tasks by park ID', async () => {
      const response = await axios.get('http://localhost:3333/api/planttasks/getAllPlantTasksByParkId/1', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get plant tasks by park ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getAllPlantTasksByParkId/invalid-id', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get all assigned plant tasks by staff ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/planttasks/getAllAssignedPlantTasks/${staffId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get all assigned plant tasks by staff ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getAllAssignedPlantTasks/invalid-id', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get plant tasks by submitting staff ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/planttasks/getPlantTasksBySubmittingStaff/${staffId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get plant tasks by submitting staff ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getPlantTasksBySubmittingStaff/invalid-id', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get park plant task average completion time for period', async () => {
      const response = await axios.get('http://localhost:3333/api/planttasks/getParkAverageTaskCompletionTime', {
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

    it('should fail to get park plant task average completion time for period', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getParkAverageTaskCompletionTime', {
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

    it('should get park plant task overdue rate for period', async () => {
      const response = await axios.get('http://localhost:3333/api/planttasks/getParkPlantTaskOverdueRates', {
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

    it('should fail to get park plant task overdue rate for period', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getParkPlantTaskOverdueRates', {
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
      const response = await axios.get('http://localhost:3333/api/planttasks/getParkStaffAverageCompletionTimeForPastMonths', {
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
        await axios.get('http://localhost:3333/api/planttasks/getParkStaffAverageCompletionTimeForPastMonths', {
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
      const response = await axios.get('http://localhost:3333/api/planttasks/getParkStaffOverdueRatesForPastMonths', {
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
        await axios.get('http://localhost:3333/api/planttasks/getParkStaffOverdueRatesForPastMonths', {
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

    it('should get plant tasks by status', async () => {
      const response = await axios.get(`http://localhost:3333/api/planttasks/getPlantTasksByStatus/${PlantTaskStatusEnum.OPEN}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get plant tasks by invalid status', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getPlantTasksByStatus/INVALID_STATUS', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get park plant task completion rates', async () => {
      const response = await axios.get('http://localhost:3333/api/planttasks/getParkPlantTaskCompletionRates', {
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

    it('should fail to get park plant task completion rates', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getParkPlantTaskCompletionRates', {
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

    it('should get park task load percentage', async () => {
      const response = await axios.get('http://localhost:3333/api/planttasks/getParkTaskLoadPercentage', {
        headers: { Cookie: authCookie },
        params: {
          parkId: 1,
        },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get park task load percentage', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getParkTaskLoadPercentage', {
          headers: { Cookie: authCookie },
          params: {
            parkId: 'invalid-id',
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get staff performance ranking', async () => {
      const response = await axios.get('http://localhost:3333/api/planttasks/getStaffPerformanceRanking', {
        headers: { Cookie: authCookie },
        params: {
          parkId: 1,
          startDate: '2020-01-01',
          endDate: '2024-12-31',
        },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('bestPerformer');
    });

    it('should fail to get staff performance ranking', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getStaffPerformanceRanking', {
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

    it('should get park task completed', async () => {
      const response = await axios.get('http://localhost:3333/api/planttasks/getParkTaskCompleted', {
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

    it('should fail to get park task completed', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getParkTaskCompleted', {
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

    it('should get park staff completion rates for past months', async () => {
      const response = await axios.get('http://localhost:3333/api/planttasks/getParkStaffCompletionRatesForPastMonths', {
        headers: { Cookie: authCookie },
        params: {
          parkId: 1,
          months: 6,
        },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get park staff completion rates for past months', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getParkStaffCompletionRatesForPastMonths', {
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

    it('should get park staff tasks completed for past months', async () => {
      const response = await axios.get('http://localhost:3333/api/planttasks/getParkStaffTasksCompletedForPastMonths', {
        headers: { Cookie: authCookie },
        params: {
          parkId: 1,
          months: 6,
        },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get park staff tasks completed for past months', async () => {
      try {
        await axios.get('http://localhost:3333/api/planttasks/getParkStaffTasksCompletedForPastMonths', {
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
    it('should update plant task details', async () => {
      const updateData = { taskStatus: PlantTaskStatusEnum.IN_PROGRESS };
      const response = await axios.put(`http://localhost:3333/api/planttasks/updatePlantTaskDetails/${plantTaskId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.taskStatus).toBe(PlantTaskStatusEnum.IN_PROGRESS);
    });

    it('should fail to update plant task details', async () => {
      const updateData = { taskStatus: 'INVALID_STATUS' };
      try {
        await axios.put(`http://localhost:3333/api/planttasks/updatePlantTaskDetails/${plantTaskId}`, updateData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should assign plant task', async () => {
      // Ensure the task is in OPEN status before assigning
      const updateData = { taskStatus: PlantTaskStatusEnum.OPEN };
      await axios.put(`http://localhost:3333/api/planttasks/updatePlantTaskDetails/${plantTaskId}`, updateData, {
        headers: { Cookie: authCookie },
      });

      const assignData = { assignerStaffId: staffId2, staffId: staffId };
      //console.log('Assigning plant task with staffId:', staffId);
      try {
        const response = await axios.put(`http://localhost:3333/api/planttasks/assignPlantTask/${plantTaskId}`, assignData, {
          headers: { Cookie: authCookie },
        });
        expect(response.status).toBe(200);
        expect(response.data.assignedStaffId).toBe(staffId);
      } catch (error) {
        console.error('Error assigning plant task:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should fail to assign plant task', async () => {
      const assignData = { staffId: 'invalid-id' };
      try {
        await axios.put(`http://localhost:3333/api/planttasks/assignPlantTask/${plantTaskId}`, assignData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should unassign plant task', async () => {
      const unassignData = { unassignerStaffId: staffId2 };
      const response = await axios.put(`http://localhost:3333/api/planttasks/unassignPlantTask/${plantTaskId}`, unassignData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.assignedStaffId).toBeNull();
      //console.log('Unassigned plant task:', response.data);
    });

    it('should fail to unassign plant task', async () => {
      const unassignData = { unassignerStaffId: 'invalid-id' };
      try {
        await axios.put(`http://localhost:3333/api/planttasks/unassignPlantTask/${plantTaskId}`, unassignData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should update plant task status', async () => {
      // Update the task status
      const updateStatusData = { newStatus: PlantTaskStatusEnum.IN_PROGRESS };
      //console.log('Updating plant task status with data:', updateStatusData);
      try {
        const response = await axios.put(`http://localhost:3333/api/planttasks/updatePlantTaskStatus/${plantTaskId}`, updateStatusData, {
          headers: { Cookie: authCookie },
        });
        //console.log('Update plant task status response:', response.data);
        expect(response.status).toBe(200);
        expect(response.data.taskStatus).toBe(PlantTaskStatusEnum.IN_PROGRESS);
      } catch (error) {
        console.error('Error updating plant task status:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should fail to update plant task status', async () => {
      const updateStatusData = { newStatus: 'INVALID_STATUS' };
      //console.log('Updating plant task status with invalid data:', updateStatusData);
      try {
        await axios.put(`http://localhost:3333/api/planttasks/updatePlantTaskStatus/${plantTaskId}`, updateStatusData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        //console.log('Expected error response:', error.response?.data || error.message);
        expect(error.response.status).toBe(400);
      }
    });

    it('should update plant task position', async () => {
      // Get the current position of the task
      const taskDetailsResponse = await axios.get(`http://localhost:3333/api/planttasks/viewPlantTaskDetails/${plantTaskId}`, {
        headers: { Cookie: authCookie },
      });
      const originalPosition = taskDetailsResponse.data.position;
      //console.log('Current task position:', originalPosition);

      // Update the task position
      const updatePositionData = { newPosition: originalPosition + 1 };
      //console.log('Updating plant task position with data:', updatePositionData);
      try {
        const response = await axios.put(
          `http://localhost:3333/api/planttasks/updatePlantTaskPosition/${plantTaskId}`,
          updatePositionData,
          {
            headers: { Cookie: authCookie },
          },
        );
        //console.log('Update plant task position response:', response.data);
        expect(response.status).toBe(200);
        expect(response.data.position).not.toBe(originalPosition);
      } catch (error) {
        console.error('Error updating plant task position:', error.response?.data || error.message);
        throw error;
      }
    });

    it('should fail to update plant task position', async () => {
      const updatePositionData = { newPosition: 'INVALID_POSITION' };
      //console.log('Updating plant task position with invalid data:', updatePositionData);
      try {
        await axios.put(`http://localhost:3333/api/planttasks/updatePlantTaskPosition/${plantTaskId}`, updatePositionData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        //console.log('Expected error response:', error.response?.data || error.message);
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('DELETE endpoints for task actions', () => {
    it('should delete a plant task', async () => {
      const response = await axios.delete(`http://localhost:3333/api/planttasks/deletePlantTask/${plantTaskId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent plant task', async () => {
      try {
        await axios.delete(`http://localhost:3333/api/planttasks/deletePlantTask/invalid-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should delete plant tasks by status', async () => {
      const response = await axios.delete(`http://localhost:3333/api/planttasks/deleteMany?taskStatus=${PlantTaskStatusEnum.COMPLETED}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(204);
    });

    it('should fail to delete plant tasks by invalid status', async () => {
      try {
        await axios.delete(`http://localhost:3333/api/planttasks/deleteMany?taskStatus=INVALID_STATUS`, {
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
        await axios.get('http://localhost:3333/api/planttasks/getAllPlantTasks');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  describe('POST /api/planttasks/upload', () => {
    it('should successfully upload files', async () => {
      // Create a test file buffer
      const testFileContent = Buffer.from('test image content');
      const formData = new FormData();

      // Add the test file to form data
      formData.append('files', testFileContent, 'test-image.jpg');

      try {
        const response = await axios.post('http://localhost:3333/api/planttasks/upload', formData, {
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
        await axios.post('http://localhost:3333/api/planttasks/upload', formData, {
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
      if (occurrenceId) {
        await axios.delete(`http://localhost:3333/api/occurrences/deleteOccurrence/${occurrenceId}`, {
          headers: { Cookie: authCookie },
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error.response?.data || error);
    }
  });
});
