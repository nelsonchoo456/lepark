import axios from 'axios';

describe('Visitor Router Endpoints', () => {
  let authCookie: string;
  let visitorId: string;
  let visitorToken: string;
  let resetToken: string;
  let verificationToken: string;

  const testVisitor = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@test.com',
    password: 'password123',
    contactNumber: '99999999',
    isVerified: false,
  };

  describe('POST /register', () => {
    it('should successfully register a new visitor', async () => {
      const response = await axios.post('http://localhost:3333/api/visitors/register', testVisitor);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('verificationToken');
      visitorId = response.data.id;
      verificationToken = response.data.verificationToken;
    });

    it('should fail to register with invalid data', async () => {
      const invalidVisitor = { ...testVisitor, email: 'invalid-email' };
      try {
        await axios.post('http://localhost:3333/api/visitors/register', invalidVisitor);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should fail to register with duplicate email', async () => {
      try {
        await axios.post('http://localhost:3333/api/visitors/register', testVisitor);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('Email already exists.');
      }
    });
  });

  describe('POST /login and logout', () => {
    it('should successfully login', async () => {
      const response = await axios.post(
        'http://localhost:3333/api/visitors/login',
        {
          email: testVisitor.email,
          password: testVisitor.password,
        },
        {
          withCredentials: true,
        },
      );
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      const cookie = response.headers['set-cookie'];
      authCookie = cookie.find((c) => c.startsWith('jwtToken_Visitor='));
    });

    it('should fail to login with incorrect credentials', async () => {
      try {
        await axios.post('http://localhost:3333/api/visitors/login', {
          email: testVisitor.email,
          password: 'wrongpassword',
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('Invalid credentials');
      }
    });

    it('should successfully logout', async () => {
      const response = await axios.post(
        'http://localhost:3333/api/visitors/logout',
        {},
        {
          withCredentials: true,
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Logout successful');
    });

    it('should fail to logout without authentication', async () => {
      try {
        await axios.post('http://localhost:3333/api/visitors/logout');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  describe('POST /verify-user', () => {
    it('should verify user with valid token', async () => {
      // Now we can use the captured verificationToken from registration
      const response = await axios.post('http://localhost:3333/api/visitors/verify-user', {
        token: verificationToken,
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('User verified successfully');
    });

    it('should fail with invalid token', async () => {
      try {
        await axios.post('http://localhost:3333/api/visitors/verify-user', {
          token: 'invalid-token',
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /send-verification-email-with-email', () => {
    it('should send verification email with email', async () => {
      // First, ensure we have a valid auth cookie by logging in
      const loginResponse = await axios.post(
        'http://localhost:3333/api/visitors/login',
        {
          email: testVisitor.email,
          password: testVisitor.password,
        },
        {
          withCredentials: true,
        }
      );
      const cookie = loginResponse.headers['set-cookie'];
      const authCookie = cookie.find((c) => c.startsWith('jwtToken_Visitor='));

      const response = await axios.post(
        'http://localhost:3333/api/visitors/send-verification-email-with-email',
        {
          email: testVisitor.email,
          id: visitorId,
        },
        {
          headers: { Cookie: authCookie }, // Add the auth cookie to the request
        }
      );
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Verification email sent successfully');
    });

    it('should fail to send verification email with invalid email', async () => {
      try {
        await axios.post('http://localhost:3333/api/visitors/send-verification-email-with-email', {
          email: 'invalid-email',
          id: visitorId,
        });
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  describe('POST /resend-verification-email', () => {
    beforeAll(async () => {
      const response = await axios.post('http://localhost:3333/api/visitors/login', {
        email: testVisitor.email,
          password: testVisitor.password,
        },
        {
          withCredentials: true,
        },
      );
      const cookie = response.headers['set-cookie'];
      authCookie = cookie.find((c) => c.startsWith('jwtToken_Visitor='));
    });
    it('should resend verification email', async () => {
      const response = await axios.post('http://localhost:3333/api/visitors/resend-verification-email', {
        token: verificationToken,
      }, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Verification email sent successfully');
    });

    it('should fail to resend verification email with invalid token', async () => {
      try {
        await axios.post('http://localhost:3333/api/visitors/resend-verification-email', {
          token: 'invalid-token',
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /forgot-password', () => {
    it('should request password reset', async () => {
      const response = await axios.post('http://localhost:3333/api/visitors/forgot-password', {
        email: testVisitor.email,
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Password reset email sent successfully');
      console.log('Reset Token:', response.data.resetToken);
      resetToken = response.data.resetToken;
    });

    it('should handle non-existent email gracefully', async () => {
      try {
        await axios.post('http://localhost:3333/api/visitors/forgot-password', {
          email: 'nonexistent@test.com',
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /reset-password', () => {
    it('should reset password', async () => {
      // First request a password reset to get a valid token
      const forgotResponse = await axios.post('http://localhost:3333/api/visitors/forgot-password', {
        email: testVisitor.email,
      });
      const resetToken = forgotResponse.data.resetToken;

      const response = await axios.post('http://localhost:3333/api/visitors/reset-password', {
        token: resetToken,
        newPassword: 'newpassword',
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Password reset successful');
    });

    it('should fail to reset password with invalid token', async () => {
      try {
        await axios.post('http://localhost:3333/api/visitors/reset-password', {
          token: 'invalid-token',
          password: 'newpassword',
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /check-auth', () => {
    it('should check authentication', async () => {
      const response = await axios.get('http://localhost:3333/api/visitors/check-auth', {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', visitorId);
    });

    it('should fail to check authentication without cookie', async () => {
      try {
        await axios.get('http://localhost:3333/api/visitors/check-auth');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('GET /getAllVisitors', () => {
    let staffAuthCookie: string;

    beforeAll(async () => {
      // Login as staff to get staff auth cookie
      const staffLogin = await axios.post(
        'http://localhost:3333/api/staffs/login',
        {
          email: 'superadmin@lepark.com',
          password: 'password',
        },
        {
          withCredentials: true,
        },
      );
      const cookie = staffLogin.headers['set-cookie'];
      staffAuthCookie = cookie.find((c) => c.startsWith('jwtToken_Staff='));
    });

    it('should get all visitors when authenticated as staff', async () => {
      const response = await axios.get('http://localhost:3333/api/visitors/getAllVisitors', {
        headers: { Cookie: staffAuthCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get all visitors without staff authentication', async () => {
      try {
        await axios.get('http://localhost:3333/api/visitors/getAllVisitors');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  describe('GET /viewVisitorDetails/:id', () => {
    it('should get visitor details', async () => {
      const response = await axios.get(`http://localhost:3333/api/visitors/viewVisitorDetails/${visitorId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', visitorId);
    });

    it('should fail to get non-existent visitor details', async () => {
      try {
        await axios.get(`http://localhost:3333/api/visitors/viewVisitorDetails/nonexistent-id`, {
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('PUT /updateVisitorDetails/:id', () => {
    it('should update visitor details', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        contactNumber: '87654321',
      };
      const response = await axios.put(`http://localhost:3333/api/visitors/updateVisitorDetails/${visitorId}`, updateData, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.firstName).toBe(updateData.firstName);
    });

    it('should fail to update with invalid data', async () => {
      try {
        await axios.put(
          `http://localhost:3333/api/visitors/updateVisitorDetails/${visitorId}`,
          { email: 'invalid-email' },
          {
            headers: { Cookie: authCookie },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Favorite Species Operations', () => {
    let speciesId: string;
    let staffAuthCookie: string;

    beforeAll(async () => {
      // Login as staff to get auth cookie
      const staffLogin = await axios.post(
        'http://localhost:3333/api/staffs/login',
        {
          email: 'superadmin@lepark.com',
          password: 'password',
        },
        {
          withCredentials: true,
        },
      );
      const cookie = staffLogin.headers['set-cookie'];
      staffAuthCookie = cookie.find((c) => c.startsWith('jwtToken_Staff='));

      // Create a test species
      const testSpecies = {
        phylum: 'Test Phylum',
        class: 'Test Class',
        order: 'Test Order',
        family: 'Test Family',
        genus: 'Test Genus',
        speciesName: 'Test Species Name',
        commonName: 'Test Common Name',
        speciesDescription: 'Test Description',
        conservationStatus: 'LEAST_CONCERN',
        originCountry: 'Arctic',
        lightType: 'FULL_SUN',
        soilType: 'SANDY',
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

      const response = await axios.post('http://localhost:3333/api/species/createSpecies', testSpecies, {
        headers: { Cookie: staffAuthCookie },
      });
      speciesId = response.data.id;
    });

    it('should add species to favorites', async () => {
      const response = await axios.post(
        'http://localhost:3333/api/visitors/addFavoriteSpecies',
        {
          visitorId,
          speciesId,
        },
        {
          headers: { Cookie: authCookie },
        },
      );
      expect(response.status).toBe(200);
      expect(response.data.favoriteSpecies.some((species) => species.id === speciesId)).toBe(true);
    });

    it('should fail to add species to favorites without authentication', async () => {
      try {
        await axios.post('http://localhost:3333/api/visitors/addFavoriteSpecies', {
          visitorId,
          speciesId,
        });
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });

    it('should get favorite species', async () => {
      const response = await axios.get(`http://localhost:3333/api/visitors/viewFavoriteSpecies/${visitorId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to get favorite species without authentication', async () => {
      try {
        await axios.get(`http://localhost:3333/api/visitors/viewFavoriteSpecies/${visitorId}`);
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });

    it('should check if species is in favorites', async () => {
      const response = await axios.get(`http://localhost:3333/api/visitors/isSpeciesInFavorites/${visitorId}/${speciesId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('isFavorite');
    });

    it('should fail to check if species is in favorites without authentication', async () => {
      try {
        await axios.get(`http://localhost:3333/api/visitors/isSpeciesInFavorites/${visitorId}/${speciesId}`);
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });

    it('should delete species from favorites', async () => {
      const response = await axios.delete(`http://localhost:3333/api/visitors/deleteSpeciesFromFavorites/${visitorId}/${speciesId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.favoriteSpecies).not.toContain(speciesId);
    });

    it('should fail to delete species from favorites without authentication', async () => {
      try {
        await axios.delete(`http://localhost:3333/api/visitors/deleteSpeciesFromFavorites/${visitorId}/${speciesId}`);
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });

    afterAll(async () => {
      // Clean up the test species
      try {
        await axios.delete(`http://localhost:3333/api/species/deleteSpecies/${speciesId}`, {
          headers: { Cookie: staffAuthCookie },
        });
      } catch (error) {
        console.error('Species cleanup error:', error.response?.data);
      }
    });
  });

  describe('DELETE /delete', () => {
    it('should fail to delete with incorrect password', async () => {
      try {
        await axios.delete('http://localhost:3333/api/visitors/delete', {
          data: {
            id: visitorId,
            password: 'wrongpassword',
          },
          headers: { Cookie: authCookie },
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe('Password is incorrect');
      }
    });

    it('should delete visitor account', async () => {
      const response = await axios.delete('http://localhost:3333/api/visitors/delete', {
        data: {
          id: visitorId,
          password: 'newpassword',
        },
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Visitor deleted successfully');
    });
  });
});
