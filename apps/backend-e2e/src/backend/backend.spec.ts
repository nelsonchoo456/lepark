import axios from 'axios';

// Use nx e2e backend-e2e --skip-nx-cache --runInBand --verbose
// Individual test: nx e2e backend-e2e --testFile=sensorRouter.spec.ts --skip-nx-cache --runInBand --verbose
describe('GET /', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    // expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Welcome to backend!' });
  });
});
