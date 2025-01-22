import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showToast} from '../utils/toast';

class AuthManager {
  private static instance: AuthManager;
  private logoutCallback?: () => Promise<void>;

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

  public async logout() {
    if (this.logoutCallback) {
      await this.logoutCallback();
    }
    // No need for navigation callback since auth state change will trigger re-render
  }
}

export const api = axios.create({
  baseURL: 'https://chprbn-dev.zijela.com/v1',
});

api.interceptors.request.use(async config => {
  const headers = config.headers;
  const accessToken = await AsyncStorage.getItem('@auth_token');
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const handleApiError = async (error: AxiosError, showError: boolean) => {
  let errorMessage: {message: string; status: any; statusCode: any} = {
    message: 'An error occurred. Please try again later.',
    status: false,
    statusCode: null,
  };

  if (error.response) {
    const {data, status}: any = error.response;
    errorMessage = {
      message:
        status >= 500
          ? 'Oops! Something went wrong on our end. Please try again later.'
          : data.message || 'Request failed, Try again later.',
      status: status,
      statusCode: status,
    };
  } else if (error.request) {
    errorMessage = {
      message: 'Network Error. Please check your internet connection.',
      status: false,
      statusCode: null,
    };
  }

  if (
    errorMessage.status === 401 &&
    (errorMessage.message?.toString().toLowerCase().includes('token') || false)
  ) {
    await AuthManager.getInstance().logout();
  } else if (errorMessage.status >= 500) {
    showToast(errorMessage.message, 'error');
  } else if (showError) {
    showToast(errorMessage.message, 'error');
  }

  throw errorMessage;
};

let CancelToken = axios.CancelToken;
let source = CancelToken.source();

const request = async <T>(
  method: AxiosRequestConfig['method'],
  url: string,
  data: any = null,
  showSuccessMessage: boolean = false,
  showErrorMessage: boolean = true,
  customMessage: string = '',
): Promise<T> => {
  try {
    const response = await api.request({
      method,
      url,
      data,
      headers: {},
      cancelToken: source.token,
    });

    if (showSuccessMessage) {
      const message = customMessage || response.data.message;
      showToast(message, 'success');
    }
    return response.data;
  } catch (error: any) {
    return handleApiError(error, showErrorMessage);
  }
};

export const cancelRequest = () => {
  source.cancel('Request cancelled or undone');
};

export const initializeAuth = (logoutCallback: () => Promise<void>) => {
  const authManager = AuthManager.getInstance();
  authManager.setLogoutCallback(logoutCallback);
};
export default request;
