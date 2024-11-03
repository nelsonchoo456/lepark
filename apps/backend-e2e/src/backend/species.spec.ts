import axios from 'axios';
import { ConservationStatusEnum, LightTypeEnum, SoilTypeEnum } from '@prisma/client';

jest.setTimeout(15000);
describe('Species Router Endpoints', () => {
  let authCookie: string;
  let speciesId: string;

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
    } catch (error) {
      console.error('Setup error:', error.response?.data || error);
      throw error;
    }
  });

  describe('POST endpoints', () => {
    const validSpeciesData = {
      phylum: 'Test Phylum',
      class: 'Test Class',
      order: 'Test Order',
      family: 'Test Family',
      genus: 'Test Genus',
      speciesName: 'Test Species Name',
      commonName: 'Test Common Name',
      speciesDescription: 'Test Description',
      conservationStatus: ConservationStatusEnum.LEAST_CONCERN,
      originCountry: 'Arctic',
      lightType: LightTypeEnum.FULL_SUN,
      soilType: SoilTypeEnum.SANDY,
      fertiliserType: 'Test Fertiliser Type',
      soilMoisture: 50,
      fertiliserRequirement: 50,
      idealHumidity: 70,
      minTemp: 20,
      maxTemp: 30,
      idealTemp: 25,
      isDroughtTolerant: true,
      isFastGrowing: true,
      isSlowGrowing: false,
      isEdible: false,
      isDeciduous: false,
      isEvergreen: true,
      isToxic: false,
      isFragrant: true,
      images: [],
    };

    it('should create a new species', async () => {
      const response = await axios.post('http://localhost:3333/api/species/createSpecies', validSpeciesData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      speciesId = response.data.id;
    });

    it('should fail to create species with invalid data', async () => {
      const invalidData = { ...validSpeciesData, minTemp: 35, maxTemp: 30 };
      try {
        await axios.post('http://localhost:3333/api/species/createSpecies', invalidData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should fail to create species with duplicate name', async () => {
      try {
        await axios.post('http://localhost:3333/api/species/createSpecies', validSpeciesData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET endpoints', () => {
    it('should get all species', async () => {
      const response = await axios.get('http://localhost:3333/api/species/getAllSpecies');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get species by ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/species/viewSpeciesDetails/${speciesId}`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', speciesId);
    });

    it('should fail to get species by invalid ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/species/viewSpeciesDetails/invalid-id`);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get species name by ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/species/getSpeciesNameById/${speciesId}`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('speciesName');
    });

    it('should fail to get species name by invalid ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/species/getSpeciesNameById/invalid-id`);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get occurrences by species ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/species/getOccurrencesBySpeciesId/${speciesId}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get occurrences by invalid species ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/species/getOccurrencesBySpeciesId/invalid-id`);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get occurrences by species ID and park ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/species/getOccurrencesBySpeciesIdByParkId/${speciesId}/1`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get occurrences by invalid species ID and park ID', async () => {
      try {
        await axios.get(`http://localhost:3333/api/species/getOccurrencesBySpeciesIdByParkId/invalid-id/999`);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('PUT endpoints', () => {
    it('should update species details', async () => {
      const updateData = { commonName: 'Updated Common Name' };
      const response = await axios.put(`http://localhost:3333/api/species/updateSpeciesDetails/${speciesId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.commonName).toBe('Updated Common Name');
    });

    it('should fail to update species with invalid temperature range', async () => {
      const invalidData = { minTemp: 35, maxTemp: 30 };
      try {
        await axios.put(`http://localhost:3333/api/species/updateSpeciesDetails/${speciesId}`, invalidData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should fail to update species with duplicate name', async () => {
      const duplicateData = { speciesName: 'Test Species Name' };
      try {
        await axios.put(`http://localhost:3333/api/species/updateSpeciesDetails/${speciesId}`, duplicateData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /api/species/upload', () => {
    it('should successfully upload files', async () => {
      const testFileContent = Buffer.from('test image content');
      const formData = new FormData();

      formData.append('files', new Blob([testFileContent]), 'test-image.jpg');

      const response = await axios.post('http://localhost:3333/api/species/upload', formData, {
        headers: {
          Cookie: authCookie,
          'Content-Type': 'multipart/form-data',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('uploadedUrls');
      expect(Array.isArray(response.data.uploadedUrls)).toBe(true);
    });

    it('should fail when no file is provided', async () => {
      const formData = new FormData();
      try {
        await axios.post('http://localhost:3333/api/species/upload', formData, {
          headers: {
            Cookie: authCookie,
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should fail when uploading more than 5 files', async () => {
      const formData = new FormData();
      const testFileContent = Buffer.from('test image content');

      for (let i = 0; i < 6; i++) {
        formData.append('files', new Blob([testFileContent]), `test-image-${i}.jpg`);
      }

      try {
        await axios.post('http://localhost:3333/api/species/upload', formData, {
          headers: {
            Cookie: authCookie,
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(500);
      }
    });
  });

  describe('DELETE endpoints', () => {
    it('should delete a species', async () => {
      const response = await axios.delete(`http://localhost:3333/api/species/deleteSpecies/${speciesId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent species', async () => {
      try {
        await axios.delete(`http://localhost:3333/api/species/deleteSpecies/invalid-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Authentication tests', () => {
    it('should fail to access protected endpoints without authentication', async () => {
      try {
        await axios.post('http://localhost:3333/api/species/createSpecies', {});
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });
});