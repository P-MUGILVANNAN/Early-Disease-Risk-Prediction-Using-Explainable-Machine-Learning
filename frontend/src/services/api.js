import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
  // General
  getHealth: () => apiClient.get('/health'),
  getDiseases: () => apiClient.get('/diseases'),
  getDatasetsStatus: () => apiClient.get('/datasets/status'),

  // ML & Models
  getModels: () => apiClient.get('/models'),
  getModelMetrics: (disease) => apiClient.get(`/models/${disease}/metrics`),
  getGlobalFeatureImportance: (disease) => apiClient.get(`/models/${disease}/feature-importance`),
  predict: (disease, payload) => apiClient.post(`/predict/${disease}`, payload),
  explain: (disease, inputs) => apiClient.post(`/explain/${disease}`, { disease, inputs }),

  // Dashboard & History
  getDashboardSummary: () => apiClient.get('/dashboard/summary'),
  getPredictions: (disease, limit = 50) => {
    const params = { limit };
    if (disease) params.disease = disease;
    return apiClient.get('/predictions', { params });
  },
  getPredictionById: (id) => apiClient.get(`/predictions/${id}`),
  downloadReportUrl: (id) => `${API_BASE_URL}/predictions/${id}/report`,
  downloadUserGuideUrl: () => `${API_BASE_URL}/user-guide/download`,

  // Local LLM
  getLlmStatus: () => apiClient.get('/llm/status'),
  explainWithLlm: (payload) => apiClient.post('/llm/explain', payload, { timeout: 75000 }),
};

export default api;
