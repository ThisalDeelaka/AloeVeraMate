import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

// API Configuration
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const RETRY_DELAY = 1000; // 1 second

// Typed API responses
export interface DiseasePrediction {
  disease_id: string;
  disease_name: string;
  prob: number;
}

export interface PredictResponse {
  request_id: string;
  num_images_received: number;
  predictions: DiseasePrediction[];
  confidence_status: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_next_step: 'RETAKE' | 'SHOW_TREATMENT';
  symptoms_summary: string;
  retake_message?: string;
}

export interface Disease {
  disease_id: string;
  disease_name: string;
  description: string;
  severity: string;
  common_symptoms: string[];
}

export interface DiseasesResponse {
  diseases: Disease[];
  count: number;
}

export interface TreatmentStep {
  title: string;
  details: string;
  duration?: string;
  frequency?: string;
}

export interface Citation {
  title: string;
  source: string;
  snippet: string;
}

export interface TreatmentResponse {
  disease_id: string;
  mode: string;
  steps: TreatmentStep[];
  dosage_frequency: string;
  safety_warnings: string[];
  when_to_consult_expert: string[];
  citations: Citation[];
}

export interface HealthResponse {
  status: string;
  version: string;
  message: string;
}

// Error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Sleep utility for retry delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic API call with retries
async function apiCall<T>(
  config: AxiosRequestConfig,
  retries: number = 1
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        ...config,
        timeout: config.timeout || DEFAULT_TIMEOUT,
        baseURL: API_BASE_URL,
      });
      return response.data;
    } catch (error) {
      lastError = error as Error;
      
      const axiosError = error as AxiosError;
      
      // Don't retry client errors (4xx)
      if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
        const errorData = axiosError.response.data as any;
        throw new ApiError(
          errorData?.detail || 'Invalid request',
          axiosError.response.status,
          error
        );
      }
      
      // Retry on network errors or 5xx errors
      if (attempt < retries) {
        await sleep(RETRY_DELAY);
        continue;
      }
    }
  }

  // All retries failed
  throw new ApiError(
    'Network error. Please check your connection and try again.',
    undefined,
    lastError
  );
}

// API Client
export const apiClient = {
  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<HealthResponse> {
    return apiCall<HealthResponse>({
      method: 'GET',
      url: '/health',
    });
  },

  /**
   * Predict disease from images
   */
  async predictDisease(imageUris: string[]): Promise<PredictResponse> {
    const formData = new FormData();
    
    const imageFields = ['image1', 'image2', 'image3'];
    for (let i = 0; i < imageUris.length && i < 3; i++) {
      const uri = imageUris[i];
      const fileName = uri.split('/').pop() || `photo_${i + 1}.jpg`;
      const fileType = `image/${fileName.split('.').pop() || 'jpg'}`;

      // Expo FormData format
      formData.append(imageFields[i], {
        uri,
        type: fileType,
        name: fileName,
      } as any);
    }

    return apiCall<PredictResponse>({
      method: 'POST',
      url: '/api/v1/predict',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for image upload
    });
  },

  /**
   * Get all supported diseases
   */
  async getDiseases(): Promise<DiseasesResponse> {
    return apiCall<DiseasesResponse>({
      method: 'GET',
      url: '/api/v1/diseases',
    });
  },

  /**
   * Get treatment for a disease
   */
  async getTreatment(
    diseaseId: string,
    mode: 'SCIENTIFIC' | 'AYURVEDIC'
  ): Promise<TreatmentResponse> {
    return apiCall<TreatmentResponse>({
      method: 'POST',
      url: '/api/v1/treatment',
      data: {
        disease_id: diseaseId,
        mode: mode,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

// User-friendly error messages
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot connect to server. Please check your internet connection.';
    }
    
    if (error.response) {
      const detail = (error.response.data as any)?.detail;
      if (typeof detail === 'string') {
        return detail;
      }
      return `Server error: ${error.response.status}`;
    }
    
    return 'Network error. Please try again.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
