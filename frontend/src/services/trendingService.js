import API from './api';

export const getTrending = (period) => API.get('/trending', { params: typeof period === 'string' ? { period } : period });
export const getTopRated = (params) => API.get('/trending/top-rated', { params });
export const getRecommendations = () => API.get('/recommendations');
export const getSimilarUsersLiked = (perfumeId) => API.get(`/recommendations/similar-users/${perfumeId}`);
export const voteForAward = (perfumeId) => API.post(`/trending/vote/${perfumeId}`);
