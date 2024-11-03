import axios from 'axios';
import { HubStatusEnum, FacilityStatusEnum, FacilityTypeEnum, SensorTypeEnum } from '@prisma/client';
import crypto from 'crypto';

jest.setTimeout(15000);
describe('Hub Router Endpoints', () => {
  let authCookie: string;
  let hubId: string;
  let facilityId: string;
  let serialNumber: string;
  let identifierNumber: string;
  const zoneId = 1;

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
        name: 'Test Facility for Hubs',
        description: 'A test facility for hub e2e tests',
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
    } catch (error) {
      console.error('Setup error:', error.response?.data || error);
      throw error;
    }
  });

  describe('POST endpoints', () => {
    const validHubData = {
      name: 'Test Hub',
      serialNumber: 'HUB-TEST-001',
      description: 'Test hub for e2e testing',
      hubStatus: HubStatusEnum.INACTIVE,
      acquisitionDate: new Date(),
      supplier: 'Test Supplier',
      supplierContactNumber: '99999999',
      facilityId: '', // Will be set in beforeAll
    };

    beforeAll(() => {
      validHubData.facilityId = facilityId;
    });

    it('should successfully create a new hub', async () => {
      try {
        const response = await axios.post('http://localhost:3333/api/hubs/createHub', validHubData, {
          headers: { Cookie: authCookie },
        });
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        hubId = response.data.id;
        serialNumber = validHubData.serialNumber;
        identifierNumber = response.data.identifierNumber;
      } catch (error) {
        console.error('Create hub error:', error.response?.data);
        throw error;
      }
    });

    it('should fail to create hub with duplicate serial number', async () => {
      try {
        await axios.post('http://localhost:3333/api/hubs/createHub', validHubData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('already exists');
      }
    });
  });

  describe('GET endpoints', () => {
    it('should get all hubs', async () => {
      const response = await axios.get('http://localhost:3333/api/hubs/getAllHubs', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get filtered hubs', async () => {
      const response = await axios.get('http://localhost:3333/api/hubs/getAllHubs?hubStatus=INACTIVE&parkId=1', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      // Find our created hub in the filtered results
      const createdHub = response.data.find((hub) => hub.id === hubId);
      expect(createdHub).toBeDefined();
      expect(createdHub).toMatchObject({
        id: hubId,
        name: 'Test Hub',
        serialNumber: 'HUB-TEST-001',
        hubStatus: 'INACTIVE',
        facilityId: facilityId,
        facility: expect.objectContaining({
          id: facilityId,
          parkId: 1,
        }),
      });
    });

    it('should get hub by ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/hubs/getHubById/${hubId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', hubId);
    });

    it('should fail to get hub by invalid ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/hubs/getHubById/invalid-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get hubs by zone ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/hubs/getHubsByZoneId/${zoneId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get hubs by invalid zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/hubs/getHubsByZoneId/invalid-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get hub by identifier number', async () => {
      const response = await axios.get(`http://localhost:3333/api/hubs/getHubByIdentifierNumber/${identifierNumber}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('identifierNumber', identifierNumber);
    });

    it('should fail to get hub by invalid identifier number', async () => {
      try {
        await axios.get(`http://localhost:3333/api/hubs/getHubByIdentifierNumber/invalid-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get hub data transmission rate', async () => {
      const response = await axios.get(`http://localhost:3333/api/hubs/getHubDataTransmissionRate/${identifierNumber}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
    });

    it('should fail to get hub data transmission rate for invalid identifier', async () => {
      try {
        await axios.get(`http://localhost:3333/api/hubs/getHubDataTransmissionRate/invalid-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get all sensors by hub ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/hubs/getAllSensorsByHubId/${hubId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get all sensors by invalid hub ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/hubs/getAllSensorsByHubId/invalid-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
    it('should update hub sensors (for Raspberry Pi to know all sensors)', async () => {
      const response = await axios.get(`http://localhost:3333/api/hubs/updateHubSensors/${identifierNumber}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
    });

    it('should fail to update hub sensors for invalid identifier number', async () => {
      try {
        await axios.get(`http://localhost:3333/api/hubs/updateHubSensors/invalid-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should check duplicate serial number', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/hubs/checkDuplicateSerialNumber?serialNumber=${serialNumber}&hubId=${hubId}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('isDuplicate', false);
    });
  });

  describe('PUT endpoints', () => {
    it('should update hub details', async () => {
      const updateData = { description: 'Updated description' };
      const response = await axios.put(`http://localhost:3333/api/hubs/updateHubDetails/${hubId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.description).toBe('Updated description');
    });

    it('should fail to update hub with invalid data', async () => {
      try {
        await axios.put(
          `http://localhost:3333/api/hubs/updateHubDetails/${hubId}`,
          { hubStatus: 'INVALID_STATUS' },
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should fail to add hub to invalid zone', async () => {
      try {
        await axios.put(
          `http://localhost:3333/api/hubs/addHubToZone/${hubId}`,
          { zoneId: 999 },
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should add hub to zone', async () => {
      const zoneData = {
        zoneId: 1,
        lat: 1.3521,
        long: 103.8198,
        macAddress: '00:11:22:33:44:55',
        dataTransmissionInterval: 5,
      };
      const response = await axios.put(`http://localhost:3333/api/hubs/addHubToZone/${hubId}`, zoneData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.zoneId).toBe(1);
      expect(response.data.hubStatus).toBe('ACTIVE');
    });

    it('should remove hub from zone', async () => {
      const response = await axios.put(
        `http://localhost:3333/api/hubs/removeHubFromZone/${hubId}`,
        {},
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.zoneId).toBeNull();
      expect(response.data.hubStatus).toBe('INACTIVE');
    });

    it('should fail to remove hub from zone when not in zone', async () => {
      try {
        await axios.put(
          `http://localhost:3333/api/hubs/removeHubFromZone/${hubId}`,
          {},
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('not assigned to any zone');
      }
    });
  });

  describe('Hub initialization and sensor readings', () => {
    it('should verify hub initialization', async () => {
      // First add hub to zone
      await axios.put(
        `http://localhost:3333/api/hubs/addHubToZone/${hubId}`,
        {
          zoneId: 1,
          lat: 1.3521,
          long: 103.8198,
          macAddress: '00:11:22:33:44:55',
          dataTransmissionInterval: 5,
        },
        {
          headers: { Cookie: authCookie },
        },
      );

      // Mock the IP address that would come from a real request
      const mockIpAddress = '127.0.0.1';
      const axiosInstance = axios.create({
        headers: { 
          Cookie: authCookie,
          'X-Forwarded-For': mockIpAddress 
        }
      });

      const response = await axiosInstance.put(
        'http://localhost:3333/api/hubs/verifyHubInitialization',
        {
          identifierNumber: identifierNumber,
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(typeof response.data.token).toBe('string');
      expect(response.data.token.length).toBeGreaterThan(0);

      // Verify hub was updated correctly
      const hubResponse = await axios.get(`http://localhost:3333/api/hubs/getHubById/${hubId}`, {
        headers: { Cookie: authCookie },
      });

      expect(hubResponse.data.hubStatus).toBe('ACTIVE');
      expect(hubResponse.data.hubSecret).toBe(response.data.token);
      expect(hubResponse.data.radioGroup).toBeDefined();
      expect(hubResponse.data.ipAddress).toBe(mockIpAddress); // Verify IP address was saved
    });

    it('should fail to verify hub initialization for inactive hub', async () => {
      // First remove hub from zone to make it inactive
      await axios.put(
        `http://localhost:3333/api/hubs/removeHubFromZone/${hubId}`,
        {},
        {
          headers: { Cookie: authCookie },
        },
      );

      try {
        await axios.put(
          'http://localhost:3333/api/hubs/verifyHubInitialization',
          {
            identifierNumber: identifierNumber,
          },
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('Hub must be in a zone to be initialized');
      }
    });

    it('should successfully push sensor readings', async () => {
      const hubToZoneResponse = await axios.put(
        `http://localhost:3333/api/hubs/addHubToZone/${hubId}`,
        {
          zoneId: 1,
          lat: 1.3521,
          long: 103.8198,
          macAddress: '00:11:22:33:44:55',
          dataTransmissionInterval: 5,
        },
        {
          headers: { Cookie: authCookie },
        },
      );

      // Mock the IP address that would come from a real request
      const mockIpAddress = '127.0.0.1';
      const axiosInstance = axios.create({
        headers: { 
          Cookie: authCookie,
          'X-Forwarded-For': mockIpAddress 
        }
      });

      // Initialize the hub first to get a valid token
      const initResponse = await axiosInstance.put(
        'http://localhost:3333/api/hubs/verifyHubInitialization',
        {
          identifierNumber: identifierNumber,
        }
      );

      const hubSecret = initResponse.data.token;

      // Create test sensors and verify they exist
      const sensor = await axios.post(
        'http://localhost:3333/api/sensors/createSensor',
        {
          name: 'Test Temperature Sensor',
          serialNumber: 'TEST-SENSOR-001',
          sensorType: SensorTypeEnum.TEMPERATURE,
          description: 'Test sensor for e2e testing',
          acquisitionDate: new Date(),
          supplier: 'Test Supplier Co.',
          supplierContactNumber: '99999999',
          facilityId: facilityId
        },
        {
          headers: { Cookie: authCookie },
        }
      );

      const sensorIdentifierNumber = sensor.data.identifierNumber;

      // Verify sensors were created
      const sensorCheck = await axios.get(
        `http://localhost:3333/api/sensors/getSensorByIdentifierNumber/${sensorIdentifierNumber}`,
        {
          headers: { Cookie: authCookie },
        }
      );

      expect(sensorCheck.data).toBeDefined();
      expect(sensorCheck.data.identifierNumber).toBe(sensorIdentifierNumber); 

      const sensorToHubData = { hubId: hubId, lat: 1.308, long: 103.8186 };
      
      // Add sensor to hub (in order to push sensor readings)
      await axios.put(`http://localhost:3333/api/sensors/addSensorToHub/${sensor.data.id}`, sensorToHubData, {
        headers: { Cookie: authCookie },
      });

      // Format sensor readings (from Raspberry Pi perspective)
      const readings = {
        [sensorIdentifierNumber]: [{
          readingDate: new Date().toISOString(),
          reading: 25.5
        }]
      };

      // Create JSON string and hash
      const jsonPayloadString = JSON.stringify(readings);

      // Hash the JSON payload with the hub secret
      const sha256 = crypto
        .createHash('sha256')
        .update(jsonPayloadString + hubSecret)
        .digest('hex');

      // Push sensor readings
      const response = await axiosInstance.post(
        `http://localhost:3333/api/hubs/pushSensorReadings/${identifierNumber}`,
        {
          jsonPayloadString,
          sha256
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('sensors');
      expect(response.data).toHaveProperty('radioGroup');
      expect(Array.isArray(response.data.sensors)).toBe(true);
      expect(response.data.sensors).toContain(sensorIdentifierNumber);

      // Clean up
      await axios.delete(
        `http://localhost:3333/api/sensors/deleteSensor/${sensor.data.id}`,
        {
          headers: { Cookie: authCookie },
        }
      );
    });

    it('should fail to push sensor readings for invalid hub identifier', async () => {
      const sensorReadings = {
        readings: [
          {
            sensorIdentifierNumber: 'SE-12345',
            value: 25.5,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      try {
        await axios.post('http://localhost:3333/api/hubs/pushSensorReadings/invalid-id', sensorReadings, {
          headers: { Cookie: authCookie },
        });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('error');
        expect(error.response.data.error).toContain('not found');
      }
    });
  });

  describe('DELETE endpoint', () => {
    it('should delete a hub', async () => {
      const response = await axios.delete(`http://localhost:3333/api/hubs/deleteHub/${hubId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent hub', async () => {
      try {
        await axios.delete(`http://localhost:3333/api/hubs/deleteHub/${hubId}`, {
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
        await axios.get('http://localhost:3333/api/hubs/getAllHubs');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  describe('File upload endpoint', () => {
    it('should successfully upload files', async () => {
      const testFileContent = Buffer.from('test image content');
      const formData = new FormData();

      formData.append('files', new Blob([testFileContent]), 'test-image.jpg');

      const response = await axios.post('http://localhost:3333/api/hubs/upload', formData, {
        headers: {
          Cookie: authCookie,
          'Content-Type': 'multipart/form-data',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('uploadedUrls');
      expect(Array.isArray(response.data.uploadedUrls)).toBe(true);
    });

    it('should handle upload with no files', async () => {
      const formData = new FormData();
      try {
        const response = await axios.post('http://localhost:3333/api/hubs/upload', formData, {
          headers: {
            Cookie: authCookie,
            'Content-Type': 'multipart/form-data',
          },
        });
        expect(response.status).toBe(200);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    try {
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
