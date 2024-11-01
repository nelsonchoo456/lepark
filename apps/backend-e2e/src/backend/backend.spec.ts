import axios from 'axios';

// Use nx e2e backend-e2e --skip-nx-cache to run tests
describe('GET /', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    // expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Welcome to backend!' });
  });
});
