import API from './api';

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const googleLogin = (credential) => API.post('/auth/google', { credential });
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/me', data);
export const toggleFavorite = (perfumeId) => API.post(`/auth/favorites/${perfumeId}`);

// Perfumes
export const getPerfumes = (params) => API.get('/perfumes', { params });
export const getAllPerfumes = (params) => API.get('/perfumes', { params });
export const searchPerfumes = (params) => API.get('/perfumes', { params });
export const getPerfumeById = (id) => API.get(`/perfumes/${id}`);
export const createPerfume = (data) => API.post('/perfumes', data);
export const updatePerfume = (id, data) => API.put(`/perfumes/${id}`, data);
export const deletePerfume = (id) => API.delete(`/perfumes/${id}`);
export const getSimilarPerfumes = (id) => API.get(`/perfumes/${id}/similar`);
export const comparePerfumes = (id1, id2) => API.get('/perfumes/compare', { params: { ids: `${id1},${id2}` } });
export const trackBuyClick = (id) => API.post(`/perfumes/${id}/buy-click`);
export const getBrands = () => API.get('/perfumes/meta/brands');
export const getAllNotes = () => API.get('/perfumes/meta/notes');

// Reviews
export const getReviewsByPerfume = (perfumeId, params) => API.get(`/reviews/perfume/${perfumeId}`, { params });
export const getMyReview = (perfumeId) => API.get(`/reviews/my/${perfumeId}`);
export const createReview = (data) => API.post('/reviews', data);
export const updateReview = (id, data) => API.put(`/reviews/${id}`, data);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
export const getMyReviews = () => API.get('/reviews/my');

// Discussions
export const getDiscussions = (params) => API.get('/discussions', { params });
export const getDiscussion = (id) => API.get(`/discussions/${id}`);
export const getDiscussionById = (id) => API.get(`/discussions/${id}`);
export const createDiscussion = (data) => API.post('/discussions', data);
export const updateDiscussion = (id, data) => API.put(`/discussions/${id}`, data);
export const deleteDiscussion = (id) => API.delete(`/discussions/${id}`);
export const addReply = (id, data) => API.post(`/discussions/${id}/replies`, data);
export const deleteReply = (discussionId, replyId) => API.delete(`/discussions/${discussionId}/replies/${replyId}`);
export const toggleDiscussionLike = (id) => API.post(`/discussions/${id}/like`);
export const toggleReplyLike = (discussionId, replyId) => API.post(`/discussions/${discussionId}/replies/${replyId}/like`);

// Recommendations & Trending
export const getTrending = (period) => API.get('/trending', { params: typeof period === 'string' ? { period } : period });
export const getTopRated = (params) => API.get('/trending/top-rated', { params });
export const getRecommendations = () => API.get('/recommendations');
export const getSimilarUsersLiked = (perfumeId) => API.get(`/recommendations/similar-users/${perfumeId}`);
export const voteForAward = (perfumeId) => API.post(`/trending/vote/${perfumeId}`);
