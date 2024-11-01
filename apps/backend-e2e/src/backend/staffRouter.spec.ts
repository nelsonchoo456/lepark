import axios from 'axios';

describe('Staff Router Endpoints', () => {
  let staffId: string;
  let authCookie: string;

  beforeAll(async () => {
    try {
      const response = await axios.post(
        'http://localhost:3333/api/staffs/login',
        {
          email: 'superadmin@lepark.com',
          password: 'password',
        },
        {
          withCredentials: true,
        },
      );

      staffId = response.data.id;

      const cookie = response.headers['set-cookie'];
      expect(cookie).toBeDefined();
      expect(cookie.some((cookie) => cookie.startsWith('jwtToken_Staff='))).toBe(true);
      authCookie = cookie.find((cookie) => cookie.startsWith('jwtToken_Staff='));
      console.log(authCookie);
      if (!authCookie) {
        throw new Error('Authentication cookie not set after login');
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  });

  describe('POST /api/staffs/register', () => {
    const validStaffData = {
      email: 'test2@lepark.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      contactNumber: '92290683',
      role: 'MANAGER',
      parkId: 1,
      isActive: true,
      isFirstLogin: true,
    };

    it('should successfully register a new staff member', async () => {
      const response = await axios.post('http://localhost:3333/api/staffs/register', validStaffData, {
        withCredentials: true,
        headers: {
          Cookie: authCookie,
        },
      });
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      staffId = response.data.id;
    });

    it('should fail with invalid data', async () => {
      const invalidData = { ...validStaffData, parkId: 999 };
      try {
        await axios.post('http://localhost:3333/api/staffs/register', invalidData, {
          withCredentials: true,
          headers: {
            Cookie: authCookie,
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should fail without authentication', async () => {
      try {
        await axios.post('http://localhost:3333/api/staffs/register', validStaffData, {
          withCredentials: true,
        });
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });
});
