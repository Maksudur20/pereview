import API from './api';

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const googleLogin = (accessToken) => API.post('/auth/google', { accessToken });
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/me', data);
export const toggleFavorite = (perfumeId) => API.post(`/auth/favorites/${perfumeId}`);
