import axios from 'axios';
import { StaffRoleEnum } from '@prisma/client';

jest.setTimeout(15000);
describe('Staff Router Endpoints', () => {
  let authCookie: string;
  let staffId: string;
  let resetToken: string;
  let superadminId: string;

  const testStaff = {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@lepark.com',
    password: 'password123',
    contactNumber: '81234567',
    role: StaffRoleEnum.BOTANIST,
    parkId: 1,
    isActive: true,
    isFirstLogin: false,
  };

  beforeAll(async () => {
    try {
      // Login as superadmin
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
      superadminId = loginResponse.data.id;
    } catch (error) {
      console.error('Setup error:', error.response?.data || error);
      throw error;
    }
  });

  describe('POST /register', () => {
    it('should successfully register a new staff', async () => {
      const response = await axios.post('http://localhost:3333/api/staffs/register', testStaff, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      staffId = response.data.id;
    });

    it('should fail to register with invalid data', async () => {
      const invalidStaff = { ...testStaff, email: 'invalid-email' };
      try {
        await axios.post('http://localhost:3333/api/staffs/register', invalidStaff, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /login and logout', () => {
    it('should successfully login', async () => {
      const response = await axios.post(
        'http://localhost:3333/api/staffs/login',
        {
          email: testStaff.email,
          password: testStaff.password,
        },
        {
          withCredentials: true,
        },
      );
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      const cookie = response.headers['set-cookie'];
      authCookie = cookie.find((c) => c.startsWith('jwtToken_Staff='));
    });

    it('should fail to login with incorrect credentials', async () => {
      try {
        await axios.post('http://localhost:3333/api/staffs/login', {
          email: testStaff.email,
          password: 'wrongpassword',
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('Invalid credentials');
      }
    });

    it('should successfully logout', async () => {
      const response = await axios.post(
        'http://localhost:3333/api/staffs/logout',
        {},
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Logout successful');
    });
  });

  describe('GET endpoints', () => {
    beforeAll(async () => {
      // Login again to get fresh auth cookie
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
    });

    it('should get all staffs', async () => {
      const response = await axios.get('http://localhost:3333/api/staffs/getAllStaffs', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get all staffs without authentication', async () => {
      try {
        await axios.get('http://localhost:3333/api/staffs/getAllStaffs');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });

    it('should get staffs by park ID', async () => {
      const response = await axios.get('http://localhost:3333/api/staffs/getAllStaffsByParkId/1', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get staffs with invalid park ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/staffs/getAllStaffsByParkId/invalid', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get staff details by ID', async () => {
      const response = await axios.get(`http://localhost:3333/api/staffs/viewStaffDetails/${staffId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', staffId);
    });

    it('should fail to get staff details with invalid ID', async () => {
      try {
        await axios.get('http://localhost:3333/api/staffs/viewStaffDetails/invalid-id', {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('PUT endpoints', () => {
    it('should update staff details', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        contactNumber: '88888888',
      };
      const response = await axios.put(`http://localhost:3333/api/staffs/updateStaffDetails/${staffId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.firstName).toBe('Updated');
    });

    it('should fail to update staff with invalid data', async () => {
      try {
        await axios.put(
          `http://localhost:3333/api/staffs/updateStaffDetails/${staffId}`,
          { contactNumber: 'invalid' },
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should update staff role', async () => {
      const updateData = {
        role: StaffRoleEnum.MANAGER,
        requesterId: superadminId,
      };
      const response = await axios.put(`http://localhost:3333/api/staffs/updateStaffRole/${staffId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.role).toBe(StaffRoleEnum.MANAGER);
    });

    it('should fail to update staff role with invalid role', async () => {
      try {
        await axios.put(
          `http://localhost:3333/api/staffs/updateStaffRole/${staffId}`,
          { role: 'INVALID_ROLE', requesterId: staffId },
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should update staff active status', async () => {
      const updateData = {
        isActive: false,
        requesterId: superadminId,
      };
      const response = await axios.put(`http://localhost:3333/api/staffs/updateStaffIsActive/${staffId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.isActive).toBe(false);
    });

    it('should fail to update staff active status without proper authorization', async () => {
      try {
        await axios.put(`http://localhost:3333/api/staffs/updateStaffIsActive/${staffId}`, {
          isActive: true,
          requesterId: 'invalid-id',
        });
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  describe('Password management', () => {
    it('should request password reset', async () => {
      const response = await axios.post('http://localhost:3333/api/staffs/forgot-password', {
        email: testStaff.email,
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Password reset email sent successfully');
    });

    it('should fail to request password reset with invalid email', async () => {
      try {
        await axios.post('http://localhost:3333/api/staffs/forgot-password', {
          email: 'nonexistent@lepark.com',
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should get reset token for first login', async () => {
      const response = await axios.post(
        'http://localhost:3333/api/staffs/token-for-reset-password-for-first-login',
        { staffId },
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      resetToken = response.data.token;
    });

    it('should reset password', async () => {
      const response = await axios.post('http://localhost:3333/api/staffs/reset-password', {
        token: resetToken,
        newPassword: 'newpassword123',
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Password reset successfully');
    });

    it('should fail to reset password with invalid token', async () => {
      try {
        await axios.post('http://localhost:3333/api/staffs/reset-password', {
          token: 'invalid-token',
          newPassword: 'newpassword123',
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should change password', async () => {
      const response = await axios.put(
        'http://localhost:3333/api/staffs/change-password',
        {
          staffId,
          currentPassword: 'newpassword123',
          newPassword: 'finalpassword123',
        },
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Password changed successfully');
    });

    it('should fail to change password with incorrect current password', async () => {
      try {
        await axios.put(
          'http://localhost:3333/api/staffs/change-password',
          {
            staffId,
            currentPassword: 'wrongpassword',
            newPassword: 'newpassword123',
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

  describe('Authentication check', () => {
    it('should check authentication status', async () => {
      const response = await axios.get('http://localhost:3333/api/staffs/check-auth', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
    });

    it('should fail authentication check without token', async () => {
      try {
        await axios.get('http://localhost:3333/api/staffs/check-auth');
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toBe('No token provided');
      }
    });
  });
});
