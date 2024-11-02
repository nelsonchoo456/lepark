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
      visitorId = response.data.id;
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

  describe('POST /login', () => {
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
      console.log('authCookie', authCookie);
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

  describe('POST /forgot-password', () => {
    it('should request password reset', async () => {
      const response = await axios.post('http://localhost:3333/api/visitors/forgot-password', {
        email: testVisitor.email,
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Password reset email sent successfully');
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

  describe('POST /verify-user', () => {
    it('should verify user with valid token', async () => {
      // Now we can use the captured verificationToken
      const response = await axios.post('http://localhost:3333/api/visitors/verify-user', {
        token: verificationToken,
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Account verified successfully');
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
      expect(response.data.favoriteSpecies.some(species => species.id === speciesId)).toBe(true);
    });

    it('should get favorite species', async () => {
      const response = await axios.get(`http://localhost:3333/api/visitors/viewFavoriteSpecies/${visitorId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should check if species is in favorites', async () => {
      const response = await axios.get(`http://localhost:3333/api/visitors/isSpeciesInFavorites/${visitorId}/${speciesId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('isFavorite');
    });

    it('should delete species from favorites', async () => {
      const response = await axios.delete(`http://localhost:3333/api/visitors/deleteSpeciesFromFavorites/${visitorId}/${speciesId}`, {
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.favoriteSpecies).not.toContain(speciesId);
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
          password: testVisitor.password,
        },
        headers: { Cookie: authCookie },
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Visitor deleted successfully');
    });
  });


});
