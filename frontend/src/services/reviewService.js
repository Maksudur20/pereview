import API from './api';

export const getReviewsByPerfume = (perfumeId, params) => API.get(`/reviews/perfume/${perfumeId}`, { params });
export const getMyReview = (perfumeId) => API.get(`/reviews/my/${perfumeId}`);
export const createReview = (data) => API.post('/reviews', data);
export const updateReview = (id, data) => API.put(`/reviews/${id}`, data);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
export const getMyReviews = () => API.get('/reviews/my');
