import API from './api';

export const getDiscussions = (params) => API.get('/discussions', { params });
export const getDiscussionById = (id) => API.get(`/discussions/${id}`);
export const createDiscussion = (data) => API.post('/discussions', data);
export const updateDiscussion = (id, data) => API.put(`/discussions/${id}`, data);
export const deleteDiscussion = (id) => API.delete(`/discussions/${id}`);
export const addReply = (id, data) => API.post(`/discussions/${id}/replies`, data);
export const deleteReply = (discussionId, replyId) => API.delete(`/discussions/${discussionId}/replies/${replyId}`);
export const toggleDiscussionLike = (id) => API.post(`/discussions/${id}/like`);
export const toggleReplyLike = (discussionId, replyId) => API.post(`/discussions/${discussionId}/replies/${replyId}/like`);
