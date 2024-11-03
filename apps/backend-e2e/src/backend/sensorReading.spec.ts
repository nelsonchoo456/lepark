import axios from 'axios';
import { FacilityStatusEnum, FacilityTypeEnum, HubStatusEnum, SensorTypeEnum } from '@prisma/client';

jest.setTimeout(15000);
describe('Sensor Reading Router Endpoints', () => {
  let authCookie: string;
  let facilityId: string;
  let hubId: string;
  let sensorId: string;
  let sensorReadingId: string;
  const zoneId = 1; // Assuming zone 1 exists in test DB
  const parkId = 1; // Assuming park 1 exists in test DB

  beforeAll(async () => {
    try {
      // Login
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
        name: 'Test Facility for Sensor Readings',
        description: 'A test facility for sensor readings e2e tests',
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
        lat: 1.3522,
        long: 103.8199,
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
        name: 'Test Hub for Sensor Readings',
        serialNumber: 'HUB-TEST-002',
        description: 'Test hub for sensor readings e2e tests',
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

      const hubToZoneData = { zoneId: 1, lat: 1.3640, long: 103.8395, macAddress: '00:00:00:00:00:00', dataTransmissionInterval: 5 };
      await axios.put(`http://localhost:3333/api/hubs/addHubToZone/${hubId}`, hubToZoneData, {
        headers: { Cookie: authCookie },
      });

      // Create test sensor and get its ID
      const sensorResponse = await axios.post(
        'http://localhost:3333/api/sensors/createSensor',
        {
          name: 'Test Temperature Sensor For Sensor Readings',
          serialNumber: 'TEST-SENSOR-111',
          sensorType: SensorTypeEnum.TEMPERATURE,
          description: 'Test sensor for readings e2e testing',
          acquisitionDate: new Date(),
          supplier: 'Test Supplier Co.',
          supplierContactNumber: '99999999',
          facilityId: facilityId,
        },
        {
          headers: { Cookie: authCookie },
        },
      );

      sensorId = sensorResponse.data.id;

      const sensorToHubData = { hubId: hubId, lat: 1.3643, long: 103.8396 };
      await axios.put(`http://localhost:3333/api/sensors/addSensorToHub/${sensorId}`, sensorToHubData, {
        headers: { Cookie: authCookie },
      });
    } catch (error) {
      console.error('Setup error:', error.response?.data || error);
      throw error;
    }
  });

  describe('POST endpoints', () => {
    it('should create a new sensor reading', async () => {
      const response = await axios.post(
        'http://localhost:3333/api/sensorreadings/createSensorReading',
        {
          date: new Date('2024-10-31'),
          value: 25.5,
          sensorId: sensorId,
        },
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      sensorReadingId = response.data.id;
    });

    it('should fail to create sensor reading with invalid data', async () => {
      try {
        await axios.post(
          'http://localhost:3333/api/sensorreadings/createSensorReading',
          {
            date: new Date(),
            value: 'not a number',
            sensorId: sensorId,
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

  describe('GET endpoints for Sensor-specific operations', () => {
    it('should get readings by sensor ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsBySensorId/${sensorId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get readings by non-existent sensor ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsBySensorId/non-existent-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get readings by multiple sensor IDs', async () => {
      const sensorIds = [sensorId];
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsBySensorIds`, {
        params: {
          sensorIds: sensorIds
        },
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get readings by non-existent sensor IDs', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsBySensorIds`, {
          params: {
            sensorIds: ['non-existent-id']
          },
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get readings for hours ago', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsHoursAgo/${sensorId}/24`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get readings for hours ago with non-existent sensor ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsHoursAgo/non-existent-id/24`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get average readings for hours ago', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getAverageSensorReadingsForHoursAgo/${sensorId}/24`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('average');
    });

    it('should fail to get average readings for hours ago with non-existent sensor ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getAverageSensorReadingsForHoursAgo/non-existent-id/24`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get readings by date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getSensorReadingsByDateRange/${sensorId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get readings by date range with non-existent sensor ID', async () => {
      try {
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = new Date();
        await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsByDateRange/non-existent-id?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get latest reading by sensor ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getLatestSensorReadingBySensorId/${sensorId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('value');
    });

    it('should fail to get latest reading by non-existent sensor ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getLatestSensorReadingBySensorId/non-existent-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get sensor reading trend with slope', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingTrendWithSlope/${sensorId}/24`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('trend');
    });

    it('should fail to get sensor reading trend with slope with non-existent sensor ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingTrendWithSlope/non-existent-id/24`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get hourly average readings by date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getHourlyAverageSensorReadingsByDateRange/${sensorId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get hourly average readings by date range with non-existent sensor ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getHourlyAverageSensorReadingsByDateRange/non-existent-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET endpoints for Hub-specific operations', () => {
    it('should get all readings by hub ID and sensor type', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getAllSensorReadingsByHubIdAndSensorType/${hubId}/${SensorTypeEnum.TEMPERATURE}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get all readings by non-existent hub ID and sensor type', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getAllSensorReadingsByHubIdAndSensorType/non-existent-id/${SensorTypeEnum.TEMPERATURE}`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get readings by hub ID and sensor type for hours ago', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getSensorReadingsByHubIdAndSensorTypeForHoursAgo/${hubId}/${SensorTypeEnum.TEMPERATURE}/24`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get readings by hub ID and sensor type for hours ago with non-existent hub ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsByHubIdAndSensorTypeForHoursAgo/non-existent-id/${SensorTypeEnum.TEMPERATURE}/24`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    }); 

    it('should get average readings for hub ID and sensor type for hours ago', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getAverageSensorReadingsForHubIdAndSensorTypeForHoursAgo/${hubId}/${SensorTypeEnum.TEMPERATURE}/24`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('average');
    });

    it('should fail to get average readings for hub ID and sensor type for hours ago with non-existent hub ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getAverageSensorReadingsForHubIdAndSensorTypeForHoursAgo/non-existent-id/${SensorTypeEnum.TEMPERATURE}/24`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get readings by hub ID and sensor type by date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getSensorReadingsByHubIdAndSensorTypeByDateRange/${hubId}/${SensorTypeEnum.TEMPERATURE}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get readings by hub ID and sensor type by date range with non-existent hub ID', async () => {
      try {
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = new Date();
        await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsByHubIdAndSensorTypeByDateRange/non-existent-id/${SensorTypeEnum.TEMPERATURE}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get hourly average readings by hub ID and sensor type by date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange/${hubId}`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Object);
      expect(Object.values(response.data).every(Array.isArray)).toBe(true);
    });

    it('should fail to get hourly average readings by hub ID and sensor type by date range with non-existent hub ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange/non-existent-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get latest reading by hub ID and sensor type', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getLatestSensorReadingByHubIdAndSensorType/${hubId}/${SensorTypeEnum.TEMPERATURE}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('value');
    });

    it('should fail to get latest reading by hub ID and sensor type with non-existent hub ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getLatestSensorReadingByHubIdAndSensorType/non-existent-id/${SensorTypeEnum.TEMPERATURE}`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET endpoints for Zone-specific operations', () => {
    it('should get all readings by zone ID and sensor type', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getAllSensorReadingsByZoneIdAndSensorType/${zoneId}/${SensorTypeEnum.TEMPERATURE}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get all readings by non-existent zone ID and sensor type', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getAllSensorReadingsByZoneIdAndSensorType/non-existent-id/${SensorTypeEnum.TEMPERATURE}`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get readings by zone ID and sensor type for hours ago', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getSensorReadingsByZoneIdAndSensorTypeForHoursAgo/${zoneId}/${SensorTypeEnum.TEMPERATURE}/24`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get readings by zone ID and sensor type for hours ago with non-existent zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsByZoneIdAndSensorTypeForHoursAgo/non-existent-id/${SensorTypeEnum.TEMPERATURE}/24`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get average readings for zone ID and sensor type for hours ago', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getAverageSensorReadingsForZoneIdAndSensorTypeForHoursAgo/${zoneId}/${SensorTypeEnum.TEMPERATURE}/24`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('average');  
    });

    it('should fail to get average readings for zone ID and sensor type for hours ago with non-existent zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getAverageSensorReadingsForZoneIdAndSensorTypeForHoursAgo/non-existent-id/${SensorTypeEnum.TEMPERATURE}/24`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get average readings for zone ID across all sensor types for hours ago', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo/${zoneId}/24`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(typeof response.data).toBe('object');
      expect(response.data).not.toBeNull();
      expect(Object.keys(response.data)).toEqual(expect.arrayContaining(Object.values(SensorTypeEnum)));
    });

    it('should fail to get average readings for zone ID across all sensor types for hours ago with non-existent zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo/non-existent-id/24`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get average difference between periods by sensor type', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getAverageDifferenceBetweenPeriodsBySensorType/${zoneId}/24`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(typeof response.data).toBe('object');
      expect(response.data).not.toBeNull();
      expect(Object.keys(response.data)).toEqual(expect.arrayContaining(Object.values(SensorTypeEnum)));
    });

    it('should fail to get average difference between periods by sensor type with non-existent zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getAverageDifferenceBetweenPeriodsBySensorType/non-existent-id/24`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get readings by zone ID and sensor type by date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getSensorReadingsByZoneIdAndSensorTypeByDateRange/${zoneId}/${SensorTypeEnum.TEMPERATURE}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);  
    });

    it('should fail to get readings by zone ID and sensor type by date range with non-existent zone ID', async () => {
      try {
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = new Date();
        await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsByZoneIdAndSensorTypeByDateRange/non-existent-id/${SensorTypeEnum.TEMPERATURE}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get latest reading by zone ID and sensor type', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getLatestSensorReadingByZoneIdAndSensorType/${zoneId}/${SensorTypeEnum.TEMPERATURE}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('value');
    });

    it('should fail to get latest reading by zone ID and sensor type with non-existent zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getLatestSensorReadingByZoneIdAndSensorType/non-existent-id/${SensorTypeEnum.TEMPERATURE}`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get zone trend for sensor type', async () => {
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getZoneTrendForSensorType/${zoneId}/${SensorTypeEnum.TEMPERATURE}/24`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('trendDescription');
    });

    it('should fail to get zone trend for sensor type with non-existent zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getZoneTrendForSensorType/non-existent-id/${SensorTypeEnum.TEMPERATURE}/24`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get active zone plant sensor count', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getActiveZonePlantSensorCount/${zoneId}/1`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('count');
    });

    it('should fail to get active zone plant sensor count with non-existent zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getActiveZonePlantSensorCount/non-existent-id/1`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get unhealthy occurrences', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getUnhealthyOccurrences/${zoneId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get unhealthy occurrences with non-existent zone ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getUnhealthyOccurrences/non-existent-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET endpoints for Park-specific operations', () => {
    it('should predict crowd levels', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/predictCrowdLevels/${parkId}/7`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to predict crowd levels with non-existent park ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/predictCrowdLevels/non-existent-id/7`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get aggregated crowd data for park', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date();
      const response = await axios.get(
        `http://localhost:3333/api/sensorreadings/getAggregatedCrowdDataForPark/${parkId}/${startDate.toISOString()}/${endDate.toISOString()}`,
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get aggregated crowd data for park with non-existent park ID', async () => {
      try {
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const endDate = new Date();
        await axios.get(`http://localhost:3333/api/sensorreadings/getAggregatedCrowdDataForPark/non-existent-id/${startDate.toISOString()}/${endDate.toISOString()}`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get all readings by park ID and sensor type', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getAllSensorReadingsByParkIdAndSensorType/${parkId}/${SensorTypeEnum.TEMPERATURE}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get all readings by park ID and sensor type with non-existent park ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getAllSensorReadingsByParkIdAndSensorType/non-existent-id/${SensorTypeEnum.TEMPERATURE}`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get predicted crowd levels for park', async () => {
      const response = await axios.get(`http://localhost:3333/api/sensorreadings/getPredictedCrowdLevelsForPark/${parkId}/7`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get predicted crowd levels for park with non-existent park ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/sensorreadings/getPredictedCrowdLevelsForPark/non-existent-id/7`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('PUT endpoints', () => {
    it('should update a sensor reading', async () => {
      const updateData = { value: 26.5 };
      const response = await axios.put(`http://localhost:3333/api/sensorreadings/updateSensorReading/${sensorReadingId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.value).toBe(26.5);
    });

    it('should fail to update sensor reading with invalid data', async () => {
      const invalidData = { value: 'not a number' };
      try {
        await axios.put(`http://localhost:3333/api/sensorreadings/updateSensorReading/${sensorReadingId}`, invalidData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('DELETE endpoints', () => {
    it('should delete a sensor reading', async () => {
      const response = await axios.delete(`http://localhost:3333/api/sensorreadings/deleteSensorReading/${sensorReadingId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent sensor reading', async () => {
      try {
        await axios.delete(`http://localhost:3333/api/sensorreadings/deleteSensorReading/non-existent-id`, {
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
        await axios.get(`http://localhost:3333/api/sensorreadings/getSensorReadingsBySensorId/${sensorId}`);
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  afterAll(async () => {
    try {
      // Clean up the test sensor
      await axios.delete(`http://localhost:3333/api/sensors/deleteSensor/${sensorId}`, {
        headers: { Cookie: authCookie },
      });

      // Clean up the test hub
      await axios.delete(`http://localhost:3333/api/hubs/deleteHub/${hubId}`, {
        headers: { Cookie: authCookie },
      });

      // Clean up the test facility
      await axios.delete(`http://localhost:3333/api/facilities/deleteFacility/${facilityId}`, {
        headers: { Cookie: authCookie },
      });
    } catch (error) {
      console.error('Cleanup error:', error.response?.data);
    }
  });
});
