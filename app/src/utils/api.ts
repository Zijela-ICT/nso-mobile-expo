import axios, { AxiosError, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "../utils/toast";

class AuthManager {
  private static instance: AuthManager;
  private logoutCallback?: () => Promise<void>;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public setLogoutCallback(callback: () => Promise<void>) {
    this.logoutCallback = callback;
  }

  private processQueue(error: any = null, token: string | null = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshAuthToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem("@refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        "https://chprbn-dev.zijela.com/v1/auth/refresh-token",
        { refreshToken }
      );

      const { data: newAccessToken } = response.data;

      await AsyncStorage.setItem("@auth_token", newAccessToken);
      // await AsyncStorage.setItem("@refresh_token", newRefreshToken);

      return newAccessToken;
    } catch (error) {
      return null;
    }
  }

  public async handleTokenRefresh(error: any): Promise<string | null> {
    const originalRequest = error.config;

    // Prevent infinite refresh loops
    if (originalRequest._retry) {
      return null;
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    originalRequest._retry = true;
    this.isRefreshing = true;

    try {
      const newToken = await this.refreshAuthToken();

      if (newToken) {
        this.processQueue(null, newToken);
        return newToken;
      } else {
        this.processQueue(new Error("Failed to refresh token"));
        await this.logout();
        return null;
      }
    } catch (refreshError) {
      this.processQueue(refreshError);
      await this.logout();
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  public async logout() {
    try {
      await AsyncStorage.removeItem("@auth_token");
      await AsyncStorage.removeItem("@refresh_token");
      if (this.logoutCallback) {
        await this.logoutCallback();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
}

export const api = axios.create({
  baseURL: "https://chprbn-dev.zijela.com/v1"
});

api.interceptors.request.use(async (config) => {
  const headers = config.headers;
  const accessToken = await AsyncStorage.getItem("@auth_token");
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const newToken = await AuthManager.getInstance().handleTokenRefresh(
        error
      );

      if (newToken) {
        originalRequest.headers.authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

const handleApiError = async (error: AxiosError, showError: boolean) => {
  let errorMessage: { message: string; status: any; statusCode: any } = {
    message: "An error occurred. Please try again later.",
    status: false,
    statusCode: null
  };

  if (error.response) {
    const { data, status }: any = error.response;
    errorMessage = {
      message:
        status >= 500
          ? "Oops! Something went wrong on our end. Please try again later."
          : data.message || "Request failed, Try again later.",
      status: status,
      statusCode: status
    };
  } else if (error.request) {
    errorMessage = {
      message: "Network Error. Please check your internet connection.",
      status: false,
      statusCode: null
    };
  }

  if (errorMessage.status >= 500) {
    showToast(errorMessage.message, "error");
  } else if (showError) {
    showToast(errorMessage.message, "error");
  }

  throw errorMessage;
};

let CancelToken = axios.CancelToken;
let source = CancelToken.source();

const request = async <T>(
  method: AxiosRequestConfig["method"],
  url: string,
  data: any = null,
  showSuccessMessage: boolean = false,
  showErrorMessage: boolean = true,
  customMessage: string = ""
): Promise<T> => {
  try {
    const response = await api.request({
      method,
      url,
      data,
      headers: {},
      cancelToken: source.token
    });

    if (showSuccessMessage) {
      const message = customMessage || response.data.message;
      showToast(message, "success");
    }
    return response.data;
  } catch (error: any) {
    return handleApiError(error, showErrorMessage);
  }
};

export const cancelRequest = () => {
  source.cancel("Request cancelled or undone");
};

export const initializeAuth = (logoutCallback: () => Promise<void>) => {
  const authManager = AuthManager.getInstance();
  authManager.setLogoutCallback(logoutCallback);
};

export default request;
