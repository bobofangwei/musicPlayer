import axios from 'axios';
const axiosConfig = {
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded'
  },
  withCredentials: true,
  timeout: 1000000
};
const axiosService = axios.create(axiosConfig);
export default axiosService;
