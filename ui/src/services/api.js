import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  googleAuth: async (googleData) => {
    const response = await api.post('/auth/google', googleData);
    return response.data;
  },
};


export const userAPI = {
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};


export const mealAPI = {
  getAll: async () => {
    const response = await api.get('/meals');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/meals/${id}`);
    return response.data;
  },
  
  create: async (mealData) => {
    const response = await api.post('/meals', mealData);
    return response.data;
  },
  
  update: async (id, mealData) => {
    const response = await api.put(`/meals/${id}`, mealData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/meals/${id}`);
    return response.data;
  },
  
  getByDay: async (day) => {
    const response = await api.get(`/meals/week/${day}`);
    return response.data;
  },
};

export default api;

