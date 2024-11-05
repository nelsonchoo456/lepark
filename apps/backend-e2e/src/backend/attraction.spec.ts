import axios from 'axios';
import { AttractionStatusEnum, AttractionTicketCategoryEnum, AttractionTicketNationalityEnum } from '@prisma/client';

jest.setTimeout(15000);
describe('Attraction Router Endpoints', () => {
  let authCookie: string;
  let attractionId: string;
  let ticketListingId: string;

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
    } catch (error) {
      console.error('Setup error:', error.response?.data || error);
      throw error;
    }
  });

  describe('POST endpoints', () => {
    const validAttractionData = {
      title: 'Test Attraction',
      description: 'A test attraction',
      openingHours: [new Date()],
      closingHours: [new Date()],
      images: [],
      status: AttractionStatusEnum.OPEN,
      ticketingPolicy: 'Test policy',
      lat: 1.3521,
      lng: 103.8198,
      maxCapacity: 100,
      parkId: 1,
    };

    it('should successfully create a new attraction', async () => {
      try {
        const response = await axios.post('http://localhost:3333/api/attractions/createAttraction', validAttractionData, {
          headers: { Cookie: authCookie },
        });
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        attractionId = response.data.id;
      } catch (error) {
        console.error('Create attraction error:', error.response?.data);
        throw error;
      }
    });

    it('should fail to create attraction with invalid data', async () => {
      const invalidData = { ...validAttractionData, parkId: 'invalid' };
      try {
        await axios.post('http://localhost:3333/api/attractions/createAttraction', invalidData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    const validTicketListingData = {
      category: AttractionTicketCategoryEnum.ADULT,
      nationality: AttractionTicketNationalityEnum.LOCAL,
      description: 'Test ticket',
      price: 10.0,
      isActive: true,
      attractionId: '', // Will be set after attraction creation
    };

    it('should successfully create a ticket listing', async () => {
      try {
        const data = { ...validTicketListingData, attractionId };
        const response = await axios.post('http://localhost:3333/api/attractions/createAttractionTicketListing', data, {
          headers: { Cookie: authCookie },
        });
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        ticketListingId = response.data.id;
      } catch (error) {
        console.error('Create ticket listing error:', error.response?.data);
        throw error;
      }
    });

    it('should fail to create ticket listing with invalid data', async () => {
      const invalidData = { ...validTicketListingData, price: 'invalid' };
      try {
        await axios.post('http://localhost:3333/api/attractions/createAttractionTicketListing', invalidData, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET endpoints', () => {
    it('should check if attraction name exists', async () => {
      const response = await axios.get('http://localhost:3333/api/attractions/checkAttractionNameExists', {
        params: { parkId: 1, title: 'Test Attraction' },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('exists');
    });

    it('should fail to check attraction name with invalid params', async () => {
      try {
        await axios.get('http://localhost:3333/api/attractions/checkAttractionNameExists', {
          params: { parkId: 'invalid', title: '' },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get all attractions', async () => {
      const response = await axios.get('http://localhost:3333/api/attractions/getAllAttractions');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get attractions by park ID', async () => {
      const response = await axios.get('http://localhost:3333/api/attractions/getAttractionsByParkId/1');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get attractions with invalid park ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/attractions/getAttractionsByParkId/invalid');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get attraction details by ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/attractions/viewAttractionDetails/${attractionId}`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', attractionId);
    });

    it('should fail to get attraction details with invalid ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/attractions/viewAttractionDetails/invalid-id');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get all ticket listings', async () => {
      const response = await axios.get('http://localhost:3333/api/attractions/getAllAttractionTicketListings');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get ticket listings by attraction ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/attractions/getAttractionTicketListingsByAttractionId/${attractionId}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      // Verify the created ticket listing is in the response
      const foundTicketListing = response.data.find((ticket) => ticket.id === ticketListingId);
      expect(foundTicketListing).toBeDefined();
      expect(foundTicketListing.category).toBe(AttractionTicketCategoryEnum.ADULT);
      expect(foundTicketListing.price).toBe(10.0);
      expect(foundTicketListing.nationality).toBe(AttractionTicketNationalityEnum.LOCAL);
    });

    it('should fail to get ticket listings with invalid attraction ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/attractions/getAttractionTicketListingsByAttractionId/invalid-id');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get ticket listing by ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/attractions/getAttractionTicketListingById/${ticketListingId}`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', ticketListingId);
    });

    it('should fail to get ticket listing with invalid ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/attractions/getAttractionTicketListingById/invalid-id');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('PUT endpoints', () => {
    it('should update attraction details', async () => {
      const updateData = { description: 'Updated description' };
      const response = await axios.put(`http://localhost:3333/api/attractions/updateAttractionDetails/${attractionId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.description).toBe('Updated description');
    });

    it('should fail to update attraction with invalid data', async () => {
      try {
        await axios.put(
          `http://localhost:3333/api/attractions/updateAttractionDetails/${attractionId}`,
          { status: 'INVALID_STATUS' },
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should update ticket listing details', async () => {
      const updateData = { price: 15.0 };
      const response = await axios.put(
        `http://localhost:3333/api/attractions/updateAttractionTicketListingDetails/${ticketListingId}`,
        updateData,
      );
      expect(response.status).toBe(200);
      expect(response.data.price).toBe(15.0);
    });

    it('should fail to update ticket listing with invalid data', async () => {
      try {
        await axios.put(`http://localhost:3333/api/attractions/updateAttractionTicketListingDetails/${ticketListingId}`, {
          price: 'invalid',
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('DELETE endpoints', () => {
    it('should delete a ticket listing', async () => {
      const response = await axios.delete(`http://localhost:3333/api/attractions/deleteAttractionTicketListing/${ticketListingId}`);
      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent ticket listing', async () => {
      try {
        await axios.delete('http://localhost:3333/api/attractions/deleteAttractionTicketListing/invalid-id');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should delete an attraction', async () => {
      const response = await axios.delete(`http://localhost:3333/api/attractions/deleteAttraction/${attractionId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent attraction', async () => {
      try {
        await axios.delete('http://localhost:3333/api/attractions/deleteAttraction/invalid-id', {
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

      const response = await axios.post('http://localhost:3333/api/attractions/upload', formData, {
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
        const response = await axios.post('http://localhost:3333/api/attractions/upload', formData, {
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

  describe('Authentication tests', () => {
    it('should fail to access protected endpoints without authentication', async () => {
      try {
        await axios.post('http://localhost:3333/api/attractions/getAllAttractions');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });
});
