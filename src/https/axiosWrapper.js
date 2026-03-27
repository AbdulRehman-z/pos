import axios from "axios";

const defaultHeader = {
  Accept: "application/json",
};

export const BACKEND_URL = "http://localhost:3000";

export const axiosWrapper = axios.create({
  // baseURL: import.meta.env.VITE_BACKEND_URL,
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: { ...defaultHeader },
});

axiosWrapper.interceptors.request.use(request => {
  console.log('🚀 Axios Request:', request.method.toUpperCase(), request.url);
  return request;
});

axiosWrapper.interceptors.response.use(
  response => {
    console.log('✅ Axios Response:', response.config.url, response.status);
    return response;
  },
  error => {
    console.error('❌ Axios Error:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);
