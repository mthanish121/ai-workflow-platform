import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Workflows
export const workflowsAPI = {
  list: () => api.get('/workflows'),
  get: (id) => api.get(`/workflows/${id}`),
  create: (data) => api.post('/workflows', data),
  fromTemplate: (data) => api.post('/workflows/from-template', data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  updateStep: (workflowId, stepId, data) => api.patch(`/workflows/${workflowId}/steps/${stepId}`, data),
  getWorkflowConnections: (id) => api.get(`/workflows/${id}/connections`),
  delete: (id) => api.delete(`/workflows/${id}`),
  execute: (id, triggerData) => api.post(`/workflows/${id}/execute`, triggerData || {}),
  toggleStatus: (id, is_active) => api.patch(`/workflows/${id}/status`, { is_active }),
  getConnections: () => api.get('/connections'),
  connectApp: (data) => api.post('/connections', data),
  disconnectApp: (id) => api.delete(`/connections/${id}`),
};

// Connections (Direct integration access)
export const connectionsAPI = {
  list: () => api.get('/connections'),
  connect: (data) => api.post('/connections', data),
  disconnect: (id) => api.delete(`/connections/${id}`),
};

// Execution Logs
export const logsAPI = {
  list: (params) => api.get('/logs', { params }),
  get: (id) => api.get(`/logs/${id}`),
};

// AI
export const aiAPI = {
  generate: (data) => api.post('/ai/generate', typeof data === 'string' ? { prompt: data } : data),
  generateWorkflow: (data) => api.post('/ai/generate-workflow', typeof data === 'string' ? { prompt: data } : data),
};

// Billing (Stripe API SDK)
export const billingAPI = {
  plans: () => api.get('/billing/plans'),
  status: () => api.get('/billing/status'),
  upgrade: (data) => api.post('/billing/upgrade', data),
  createCheckoutSession: (data) => api.post('/billing/create-checkout-session', data),
  verifySession: (sessionId) => api.get('/billing/verify-session', { params: { session_id: sessionId } }),
  transactions: () => api.get('/billing/transactions'),
};

// MCP (Model Context Protocol & AI Agents)
export const mcpAPI = {
  list: () => api.get('/mcp/servers'),
  connect: (data) => api.post('/mcp/connect', data),
  disconnect: (id) => api.delete(`/mcp/servers/${id}`),
};

export default api;
