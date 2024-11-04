import axios from 'axios';
import { FacilityStatusEnum, FacilityTypeEnum } from '@prisma/client';

jest.setTimeout(15000);
describe('Facility Router Endpoints', () => {
  let authCookie: string;
  let facilityId: string;

  beforeAll(async () => {
    try {
      // Login first as superadmin
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
    } catch (error) {
      console.error('Setup error:', error.response?.data || error);
      throw error;
    }
  });

  describe('POST endpoints', () => {
    const validFacilityData = {
      name: 'Test Facility',
      description: 'A test facility',
      isBookable: true,
      isPublic: true,
      isSheltered: true,
      facilityType: FacilityTypeEnum.TOILET,
      reservationPolicy: 'Test reservation policy',
      rulesAndRegulations: 'Test rules',
      images: [],
      lastMaintenanceDate: '2023-03-15T10:00:00Z',
      openingHours: [
        '2024-09-08T06:00:00Z',
        '2024-09-08T06:00:00Z',
        '2024-09-08T06:00:00Z',
        '2024-09-08T06:00:00Z',
        '2024-09-08T06:00:00Z',
        '2024-09-08T06:00:00Z',
        '2024-09-08T06:00:00Z',
      ],
      closingHours: [
        '2024-09-08T20:00:00Z',
        '2024-09-08T20:00:00Z',
        '2024-09-08T20:00:00Z',
        '2024-09-08T20:00:00Z',
        '2024-09-08T20:00:00Z',
        '2024-09-08T20:00:00Z',
        '2024-09-08T20:00:00Z',
      ],
      facilityStatus: FacilityStatusEnum.OPEN,
      lat: 1.3521,
      long: 103.8198,
      size: 50,
      capacity: 50,
      fee: 10.0,
      parkId: 1,
    };

    it('should successfully create a new facility', async () => {
      try {
        const response = await axios.post('http://localhost:3333/api/facilities/createFacility', validFacilityData, {
          headers: { Cookie: authCookie },
        });
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        facilityId = response.data.id;
      } catch (error) {
        console.error('Create facility error:', error.response?.data);
        throw error;
      }
    });

    it('should fail to create facility with invalid data', async () => {
      const invalidData = { ...validFacilityData, parkId: 'invalid' };
      try {
        await axios.post('http://localhost:3333/api/facilities/createFacility', invalidData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET endpoints', () => {
    it('should get all facilities', async () => {
      const response = await axios.get('http://localhost:3333/api/facilities/getAllFacilities');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get facilities by park ID', async () => {
      const response = await axios.get('http://localhost:3333/api/facilities/getAllFacilities', {
        params: { parkId: 1 },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get facilities with invalid park ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/facilities/getAllFacilities', {
          params: { parkId: 'invalid' },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get facility by ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/facilities/getFacilityById/${facilityId}`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', facilityId);
    });

    it('should fail to get facility with invalid ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/facilities/getFacilityById/invalid-id');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should check if facility name exists', async () => {
      const response = await axios.get('http://localhost:3333/api/facilities/check-existing', {
        params: { name: 'Test Facility', parkId: 1 },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('exists');
    });

    it('should fail to check facility with invalid params', async () => {
      try {
        await axios.get('http://localhost:3333/api/facilities/check-existing', {
          params: { name: '', parkId: 'invalid' },
        });
      } catch (error) {
        expect(error.response.status).toBe(500);
      }
    });
  });

  describe('PUT endpoints', () => {
    it('should update facility details', async () => {
      const updateData = { description: 'Updated description' };
      const response = await axios.put(`http://localhost:3333/api/facilities/updateFacilityDetails/${facilityId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.description).toBe('Updated description');
    });

    it('should fail to update facility with invalid data', async () => {
      try {
        await axios.put(
          `http://localhost:3333/api/facilities/updateFacilityDetails/${facilityId}`,
          { facilityStatus: 'INVALID_STATUS' },
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('DELETE endpoints', () => {
    it('should delete a facility', async () => {
      const response = await axios.delete(`http://localhost:3333/api/facilities/deleteFacility/${facilityId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent facility', async () => {
      try {
        await axios.delete('http://localhost:3333/api/facilities/deleteFacility/invalid-id', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('File upload endpoint', () => {
    it('should successfully upload files', async () => {
      const testFileContent = Buffer.from('test image content');
      const formData = new FormData();

      formData.append('files', new Blob([testFileContent]), 'test-image.jpg');

      const response = await axios.post('http://localhost:3333/api/facilities/upload', formData, {
        headers: {
          Cookie: authCookie,
          'Content-Type': 'multipart/form-data',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('uploadedUrls');
      expect(Array.isArray(response.data.uploadedUrls)).toBe(true);
    });

    it('should fail to upload with no files', async () => {
      const formData = new FormData();
      try {
        await axios.post('http://localhost:3333/api/facilities/upload', formData, {
          headers: {
            Cookie: authCookie,
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
