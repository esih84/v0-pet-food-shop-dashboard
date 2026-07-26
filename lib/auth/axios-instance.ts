import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * An axios instance with cookie-based authentication (httpOnly).
 * No token is stored on the client; the browser sends the cookies automatically.
 * On a 401, a refresh is attempted once and then the request is retried.
 */

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  //  || "http://localhost:3000/api/v1",
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// For file uploads (FormData), Content-Type must not be set manually; otherwise
// the browser does not add the boundary and the server (multer) cannot parse the files.
axiosInstance.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

let isRefreshing = false;
let queue: Array<() => void> = [];

const flushQueue = () => {
  queue.forEach((resume) => resume());
  queue = [];
  isRefreshing = false;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthCall = original?.url?.includes("/auth/");

    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(axiosInstance(original)));
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/auth/refresh");
        flushQueue();
        return axiosInstance(original);
      } catch (err) {
        flushQueue();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
