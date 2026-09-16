import axios from "axios";

// 1. Create a custom Axios instance with backend URL
const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// 2. Add the Interceptor
api.interceptors.request.use(
  (config) => {
    // Grab the token from local storage
    const token = localStorage.getItem("token");

    // If a token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
