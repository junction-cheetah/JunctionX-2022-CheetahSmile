import axios from 'axios';

const BACKEND_URL =
  'https://b9otw2e9p0.execute-api.ap-northeast-2.amazonaws.com';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

function logout() {
  localStorage.removeItem('aws-google-oauth-token');
  location.href = 'https://cobuilding.vercel.app/';
}

axiosInstance.interceptors.request.use(async (request) => {
  const accessToken = localStorage.getItem('aws-google-oauth-token');
  request.headers.Authorization = `Bearer ${accessToken}`;
  return request;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response || error.response.status;
    if (status >= 400) {
      logout();
    }
    throw error;
  }
);

export default axiosInstance;
