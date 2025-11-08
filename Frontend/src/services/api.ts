import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Patient endpoints
  async getPatients(params?: any) {
    const response = await this.client.get('/patients', { params });
    return response.data;
  }

  async getPatient(id: string) {
    const response = await this.client.get(`/patients/${id}`);
    return response.data;
  }

  async createPatient(data: any) {
    const response = await this.client.post('/patients', data);
    return response.data;
  }

  async updatePatient(id: string, data: any) {
    const response = await this.client.put(`/patients/${id}`, data);
    return response.data;
  }

  async deletePatient(id: string) {
    const response = await this.client.delete(`/patients/${id}`);
    return response.data;
  }

  // Doctor endpoints
  async getDoctors(params?: any) {
    const response = await this.client.get('/doctors', { params });
    return response.data;
  }

  // Queue endpoints
  async getQueue(params?: any) {
    const response = await this.client.get('/queue', { params });
    return response.data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async verifyEmail(code: string) {
    const response = await this.client.post('/auth/verify-email', { code });
    return response.data;
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }
}

export default ApiService;
export const apiService = new ApiService();

