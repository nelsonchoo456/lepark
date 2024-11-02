import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum, FacilityTypeEnum, FacilityStatusEnum, HubStatusEnum } from '@prisma/client';
import FormData from 'form-data';

describe('Sensor Router Endpoints', () => {
  let authCookie: string;
  let sensorId: string;
  let facilityId: string;
  let hubId: string;
  let serialNumber: string;
  let identifierNumber: string;

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

      // Create a test facility
      const facilityData = {
        name: 'Test Facility for Sensors 2',
        description: 'A test facility for sensor e2e tests',
        isBookable: true,
        isPublic: true,
        isSheltered: true,
        facilityType: FacilityTypeEnum.STOREROOM,
        reservationPolicy: 'Test reservation policy',
        rulesAndRegulations: 'Test rules and regulations',
        images: [],
        lastMaintenanceDate: new Date(),
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
        name: 'Test Hub for Sensors',
        serialNumber: 'HUB-TEST-001',
        description: 'Test hub for sensor e2e tests',
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

  describe('POST endpoints', () => {
    const validSensorData = {
      name: 'Test Temperature Sensor',
      serialNumber: 'TEST-SENSOR-001',
      sensorType: SensorTypeEnum.TEMPERATURE,
      description: 'Test sensor for e2e testing',
      acquisitionDate: new Date(),
      supplier: 'Test Supplier Co.',
      supplierContactNumber: '99999999',
      facilityId: '', // Will be set in beforeAll
    };

    beforeAll(() => {
      validSensorData.facilityId = facilityId;
    });

    it('should successfully create a new sensor', async () => {
      try {
        const response = await axios.post('http://localhost:3333/api/sensors/createSensor', validSensorData, {
          headers: { Cookie: authCookie },
        });
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        sensorId = response.data.id;
        serialNumber = validSensorData.serialNumber;
        identifierNumber = response.data.identifierNumber;
      } catch (error) {
        console.error('Create sensor error:', error.response?.data);
        throw error;
      }
    });

    it('should fail create sensor with invalid data', async () => {
      const invalidData = { ...validSensorData, zoneId: 999 };
      try {
        await axios.post('http://localhost:3333/api/sensors/createSensor', invalidData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET endpoints', () => {
    it('should get all sensors', async () => {
      const response = await axios.get('http://localhost:3333/api/sensors/getAllSensors', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get sensor by ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensors/getSensorById/${sensorId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', sensorId);
    });

    it('should fail to get sensor by ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensors/getSensorById/999999`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get sensor by identifier number', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensors/getSensorByIdentifierNumber/${identifierNumber}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', sensorId);
    });

    it('should fail to get sensor by identifier number', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensors/getSensorByIdentifierNumber/999999`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get sensors by hub ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensors/getSensorsByHubId/${hubId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get sensors by hub ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensors/getSensorsByHubId/999999`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get sensors by zone ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensors/getSensorsByZoneId/1`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get sensors by zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensors/getSensorsByZoneId/999999`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get plant sensors by zone ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensors/getPlantSensorsByZoneId/1`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get plant sensors by zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensors/getPlantSensorsByZoneId/999999`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get sensors by facility ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensors/getSensorsByFacilityId/${facilityId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get sensors by facility ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensors/getSensorsByFacilityId/999999`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get sensors needing maintenance', async () => {
      const response = await axios.get('http://localhost:3333/api/sensors/getSensorsNeedingMaintenance', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get sensors by park ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensors/getSensorsByParkId/1`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get sensors by park ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensors/getSensorsByParkId/999999`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should check duplicate serial number', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/sensors/checkDuplicateSerialNumber?serialNumber=${serialNumber}&sensorId=${sensorId}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.isDuplicate).toBe(false);
    });
  });

  describe('PUT endpoints', () => {
    it('should update sensor details', async () => {
      const updateData = { sensorType: SensorTypeEnum.CAMERA };
      const response = await axios.put(`http://localhost:3333/api/sensors/updateSensorDetails/${sensorId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.sensorType).toBe(SensorTypeEnum.CAMERA);
    });

    it('should fail to update sensor details', async () => {
      const updateData = { sensorType: 'INVALID_TYPE' };
      try {
        await axios.put(`http://localhost:3333/api/sensors/updateSensorDetails/${sensorId}`, updateData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should add sensor to hub', async () => {
      const hubToZoneData = { zoneId: 1, lat: 1.3077, long: 103.8188, macAddress: '00:00:00:00:00:00', dataTransmissionInterval: 5 };
      await axios.put(`http://localhost:3333/api/hubs/addHubToZone/${hubId}`, hubToZoneData, {
        headers: { Cookie: authCookie },
      });
      const sensorToHubData = { hubId: hubId, lat: 1.308, long: 103.8186 };
      const response = await axios.put(`http://localhost:3333/api/sensors/addSensorToHub/${sensorId}`, sensorToHubData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.hubId).toBe(hubId);
    });

    it('should fail to add sensor to hub', async () => {
      const sensorToHubData = { hubId: 'INVALID_HUB_ID', lat: 1.308, long: 103.8186 };
      try {
        await axios.put(`http://localhost:3333/api/sensors/addSensorToHub/${sensorId}`, sensorToHubData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should remove sensor from hub', async () => {
      const response = await axios.put(
        `http://localhost:3333/api/sensors/removeSensorFromHub/${sensorId}`,
        {}, // Empty object as body
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.hubId).toBeNull();
    });

    it('should fail to remove sensor from hub', async () => {
      try {
        await axios.put(
          `http://localhost:3333/api/sensors/removeSensorFromHub/999999`,
          {},
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET endpoints for camera streams (to be done after PUT endpoints)', () => {
    it('should get camera stream by sensor ID', async () => {
      const sensorToHubData = { hubId: hubId, lat: 1.308, long: 103.8186 };
      await axios.put(`http://localhost:3333/api/sensors/addSensorToHub/${sensorId}`, sensorToHubData, {
        headers: { Cookie: authCookie },
      });
      await axios.put(
        `http://localhost:3333/api/sensors/updateSensorDetails/${sensorId}`,
        { sensorType: SensorTypeEnum.CAMERA },
        {
          headers: { Cookie: authCookie },
        },
      );

      const response = await axios.get(`http://localhost:3333/api/sensors/getCameraStreamBySensorId/${sensorId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('cameraStreamURL');
    });

    it('should fail to get camera stream by sensor ID', async () => {
      try {
        await axios.put(
          `http://localhost:3333/api/sensors/updateSensorDetails/${sensorId}`,
          { sensorType: SensorTypeEnum.TEMPERATURE },
          {
            headers: { Cookie: authCookie },
          },
        );
        await axios.get(`http://localhost:3333/api/sensors/getCameraStreamBySensorId/999999`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get camera streams by zone ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensors/getCameraStreamsByZoneId/1`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get camera streams by zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensors/getCameraStreamsByZoneId/999999`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('DELETE endpoint', () => {
    it('should delete a sensor', async () => {
      const response = await axios.delete(`http://localhost:3333/api/sensors/deleteSensor/${sensorId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent sensor', async () => {
      try {
        await axios.delete('http://localhost:3333/api/sensors/deleteSensor/999999', {
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
        await axios.get('http://localhost:3333/api/sensors/getAllSensors');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  describe('POST /api/sensors/upload', () => {
    it('should successfully upload files', async () => {
      // Create a test file buffer
      const testFileContent = Buffer.from('test image content');
      const formData = new FormData();

      // Add the test file to form data
      formData.append('files', testFileContent, {
        filename: 'test-image.jpg',
        contentType: 'image/jpeg',
      });

      try {
        const response = await axios.post('http://localhost:3333/api/sensors/upload', formData, {
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
        formData.append('files', testFileContent, {
          filename: `test-image-${i}.jpg`,
          contentType: 'image/jpeg',
        });
      }

      try {
        await axios.post('http://localhost:3333/api/sensors/upload', formData, {
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
      console.error('Cleanup error:', error.response?.data);
    }
  });
});
