import axios from 'axios';

const api = axios.create({
  baseURL: 'https://qxmaqyf9jt.us-east-1.awsapprunner.com',
});

// Gestion des tâches
export const getTasks = () => api.get('/tasks');
export const createTask = (task) => api.post('/tasks', task);

// Gestion des entreprises
export const getCompanies = () => api.get('/entreprises');
export const createCompany = (company) => api.post('/entreprises', company);

// Authentification
export const registerAdmin = (email, password) => 
  api.post('/api/auth/register-admin', { email, password });

export const login = (email, password) => 
  api.post('/api/auth/login', { email, password });

export default api;
