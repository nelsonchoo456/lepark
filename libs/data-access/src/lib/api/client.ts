import axios from 'axios';

// TODO: configure it with env
const BASE_URL = 'http://localhost:3333';

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  //   withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
  //   params: {
  //     format: 'json',
  //   },
});

const clientApi = {
  get: client.get,
  delete: client.delete,
  post: client.post,
  put: client.put,
};

Object.freeze(clientApi);

export default clientApi;
