import axios from 'axios';
import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum, FacilityTypeEnum, FacilityStatusEnum, HubStatusEnum } from '@prisma/client';

describe('Sensor Router Endpoints', () => {
  let authCookie: string;
  let sensorId: string;
  let facilityId: string;
  let hubId: string;

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
        name: 'Test Facility for Sensors',
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
        parkId: 1, // Make sure this park ID exists in your test database
      };

      const facilityResponse = await axios.post(
        'http://localhost:3333/api/facilities/createFacility',
        facilityData,
        {
          headers: { Cookie: authCookie },
        },
      );

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

      const hubResponse = await axios.post(
        'http://localhost:3333/api/hubs/createHub',
        hubData,
        {
          headers: { Cookie: authCookie },
        },
      );

      hubId = hubResponse.data.id;
      console.log('Created test hub with ID:', hubId);

    } catch (error) {
      console.error('Setup error:', error.response?.data || error);
      throw error;
    }
  });

  describe('POST /api/sensors/createSensor', () => {
    const validSensorData = {
      name: 'Test Temperature Sensor',
      serialNumber: 'TEST-SENSOR-001',
      sensorType: SensorTypeEnum.TEMPERATURE,
      description: 'Test sensor for e2e testing',
      sensorStatus: SensorStatusEnum.ACTIVE,
      acquisitionDate: new Date(),
      nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sensorUnit: SensorUnitEnum.DEGREES_CELSIUS,
      supplier: 'Test Supplier Co.',
      supplierContactNumber: '12345678',
      facilityId: '', // Will be set in beforeAll
    };

    beforeAll(() => {
      validSensorData.facilityId = facilityId;
    });

    it('should successfully create a new sensor', async () => {
      try {
        const response = await axios.post(
          'http://localhost:3333/api/sensors/createSensor',
          validSensorData,
          {
            headers: { Cookie: authCookie },
          },
        );
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        sensorId = response.data.id;
      } catch (error) {
        console.error('Create sensor error:', error.response?.data);
        throw error;
      }
    });

    it('should fail with invalid data', async () => {
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

    it('should get sensors by hub ID', async () => {
      const response = await axios.get('http://localhost:3333/api/sensors/getSensorsByHubId/1', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get sensors needing maintenance', async () => {
      const response = await axios.get('http://localhost:3333/api/sensors/getSensorsNeedingMaintenance', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('PUT endpoints', () => {
    it('should update sensor details', async () => {
      const updateData = { status: 'INACTIVE' };
      const response = await axios.put(
        `http://localhost:3333/api/sensors/updateSensorDetails/${sensorId}`,
        updateData,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('INACTIVE');
    });

    it('should add sensor to hub', async () => {
      const hubData = { lat: 1.3521, long: 103.8198, remarks: 'Test remarks', hubId: hubId };
      const response = await axios.put(
        `http://localhost:3333/api/sensors/addSensorToHub/${sensorId}`,
        hubData,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.hubId).toBe(2);
    });

    it('should remove sensor from hub', async () => {
      const response = await axios.put(
        `http://localhost:3333/api/sensors/removeSensorFromHub/${sensorId}`,
        {},
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.hubId).toBeNull();
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

  // Clean up after all tests
  afterAll(async () => {
    try {
      if (hubId) {
        await axios.delete(
          `http://localhost:3333/api/hubs/deleteHub/${hubId}`,
          {
            headers: { Cookie: authCookie },
          },
        );
      }
      if (facilityId) {
        await axios.delete(
          `http://localhost:3333/api/facilities/deleteFacility/${facilityId}`,
          {
            headers: { Cookie: authCookie },
          },
        );
      }
    } catch (error) {
      console.error('Cleanup error:', error.response?.data);
    }
  });
});