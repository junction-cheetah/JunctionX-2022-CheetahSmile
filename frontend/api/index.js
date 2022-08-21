import axios from 'axios';

const BACKEND_URL1 =
  'https://b9otw2e9p0.execute-api.ap-northeast-2.amazonaws.com';
export const axiosInstance1 = axios.create({
  baseURL: BACKEND_URL1,
  headers: {},
});

const BACKEND_URL2 =
  'https://2lckxcs1d6.execute-api.ap-northeast-2.amazonaws.com';
export const axiosInstance2 = axios.create({
  baseURL: BACKEND_URL2,
  headers: {},
});

const BACKEND_URL3 =
  'https://wfy7agd20i.execute-api.ap-northeast-2.amazonaws.com';
export const axiosInstance3 = axios.create({
  baseURL: BACKEND_URL3,
  headers: {},
});

function logout() {
  localStorage.removeItem('aws-google-oauth-token');
  location.href = 'https://cobuilding.vercel.app/';
}

[axiosInstance1, axiosInstance2, axiosInstance3].forEach((instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response || error.response.status;
      if (status >= 400) {
        logout();
      }
      throw error;
    }
  );
});
