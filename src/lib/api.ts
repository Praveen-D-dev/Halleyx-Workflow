import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workflowApi = {
    list: () => api.get('/workflows').then(r => r.data),
    get: (id: string) => api.get(`/workflows/${id}`).then(r => r.data),
    create: (data: any) => api.post('/workflows', data).then(r => r.data),
    update: (id: string, data: any) => api.put(`/workflows/${id}`, data).then(r => r.data),
    delete: (id: string) => api.delete(`/workflows/${id}`).then(r => r.data),
};

export const stepApi = {
    create: (workflowId: string, data: any) => api.post(`/workflows/${workflowId}/steps`, data).then(r => r.data),
    update: (id: string, data: any) => api.put(`/steps/${id}`, data).then(r => r.data),
    delete: (id: string) => api.delete(`/steps/${id}`).then(r => r.data),
};

export const ruleApi = {
    create: (stepId: string, data: any) => api.post(`/steps/${stepId}/rules`, data).then(r => r.data),
    update: (id: string, data: any) => api.put(`/rules/${id}`, data).then(r => r.data),
    delete: (id: string) => api.delete(`/rules/${id}`).then(r => r.data),
};

export const executionApi = {
    list: () => api.get('/executions').then(r => r.data),
    get: (id: string) => api.get(`/executions/${id}`).then(r => r.data),
    start: (workflowId: string, data: any) => api.post(`/executions/${workflowId}/execute`, data).then(r => r.data),
    approve: (id: string, data: any) => api.post(`/executions/${id}/approve`, data).then(r => r.data),
    retry: (id: string) => api.post(`/executions/${id}/retry`).then(r => r.data),
    cancel: (id: string) => api.post(`/executions/${id}/cancel`).then(r => r.data),
    delete: (id: string) => api.delete(`/executions/${id}`).then(r => r.data),
};
