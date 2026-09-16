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

api.interceptors.response.use(
  (response) => {
    // If the backend replies with a success code (200, 201),
    // let the data pass through directly to React component.
    return response;
  },
  (error) => {
    // If the backend replies with an error, check the status code
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // 1. Delete the expired token from the browser's memory
      localStorage.removeItem("token");

      // 2. Force the browser to redirect to the login page
      window.location.href = "/login";
    }

    // Pass any other errors (like 404 Not Found or 500 Server Error)
    // down to your component's .catch() block
    return Promise.reject(error);
  },
);

export default api;
