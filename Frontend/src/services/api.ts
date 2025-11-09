import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Normalize API base URL to ensure it doesn't include /v1
// Laravel routes are: /api/v1/... so base URL should be /api
const getApiBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  // Remove trailing slashes
  url = url.replace(/\/+$/, '');
  // If URL ends with /v1, remove it (to avoid double /v1/v1)
  if (url.endsWith('/v1')) {
    url = url.slice(0, -3);
  }
  // If URL ends with /api/v1, remove /v1
  url = url.replace(/\/api\/v1$/, '/api');
  return url;
};

const API_BASE_URL = getApiBaseUrl();

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
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }
        
        // Extract error message from response
        if (error.response?.data?.message) {
          error.message = error.response.data.message;
        } else if (error.response?.data?.errors) {
          // Handle validation errors
          const errors = error.response.data.errors;
          const firstError = Object.values(errors)[0];
          error.message = Array.isArray(firstError) ? firstError[0] : firstError;
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Patient endpoints
  async getPatients(params?: any) {
    const response = await this.client.get('/v1/patients', { params });
    return response.data;
  }

  async getPatient(id: string) {
    const response = await this.client.get(`/v1/patients/${id}`);
    return response.data;
  }

  async createPatient(data: any) {
    const response = await this.client.post('/v1/patients', data);
    return response.data;
  }

  async updatePatient(id: string, data: any) {
    const response = await this.client.put(`/v1/patients/${id}`, data);
    return response.data;
  }

  async deletePatient(id: string) {
    const response = await this.client.delete(`/v1/patients/${id}`);
    return response.data;
  }

  // Doctor (now users with role=doctor) endpoints
  async getDoctors(params: any = {}) {
    const response = await this.client.get('/v1/users', { params });
    return response.data;
  }

  async getDoctor(id: string) {
    const response = await this.client.get(`/v1/users/${id}`);
    return response.data;
  }

  async createDoctor(data: any) {
    const response = await this.client.post('/v1/users', data);
    return response.data;
  }

  async updateDoctor(id: string, data: any) {
    const response = await this.client.put(`/v1/users/${id}`, data);
    return response.data;
  }

  async deleteDoctor(id: string) {
    const response = await this.client.delete(`/v1/users/${id}`);
    return response.data;
  }

  // Search endpoints
  async search(query: string) {
    const response = await this.client.get('/v1/search', { params: { q: query } });
    return response.data;
  }

  // Consultation endpoints
  async createConsultation(data: any) {
    const response = await this.client.post('/v1/consultations', data);
    return response.data;
  }

  async getPatientConsultations(patientId: string | number) {
    const response = await this.client.get(`/v1/patients/${patientId}/consultations`);
    return response.data;
  }

  async getConsultation(id: string | number) {
    const response = await this.client.get(`/v1/consultations/${id}`);
    return response.data;
  }

  // Queue endpoints
  async getQueue(params?: any) {
    const response = await this.client.get('/v1/queue', { params });
    return response.data;
  }

  async createQueueItem(data: any) {
    const response = await this.client.post('/v1/queue', data);
    return response.data;
  }

  async updateQueueItem(id: string, data: any) {
    const response = await this.client.put(`/v1/queue/${id}`, data);
    return response.data;
  }

  async deleteQueueItem(id: string) {
    const response = await this.client.delete(`/v1/queue/${id}`);
    return response.data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/v1/auth/login', { email, password });
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/v1/auth/logout');
    return response.data;
  }

  async verifyEmail(email: string, code: string) {
    const response = await this.client.post('/v1/auth/verify-email', { email, code });
    return response.data;
  }

  async resendVerificationCode(email: string) {
    const response = await this.client.post('/v1/auth/resend-verification', { email });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/v1/auth/me');
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

