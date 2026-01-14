import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

// Chat API
export const chatAPI = {
    sendMessage: (data) => api.post('/chat/message', data),
    getHistory: () => api.get('/chat/history'),
    getConversation: (id) => api.get(`/chat/conversation/${id}`),
    deleteConversation: (id) => api.delete(`/chat/conversation/${id}`)
};

// Study Plan API
export const studyPlanAPI = {
    generate: (data) => api.post('/studyplan/generate', data)
};

export default api;
