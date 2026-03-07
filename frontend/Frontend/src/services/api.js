import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
});

const getNormalizedToken = () => {
  const raw = localStorage.getItem("token");
  if (!raw || raw === "null" || raw === "undefined") return null;
  return raw.toLowerCase().startsWith("token ") ? raw : `Token ${raw}`;
};

API.interceptors.request.use(
  (config) => {
    const token = getNormalizedToken();
    if (token) {
      config.headers.Authorization = token;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
