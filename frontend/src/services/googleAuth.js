const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getGoogleOAuthUrl = () => {
  // Redirect to backend which handles the full OAuth flow
  return `${API_URL}/auth/google/redirect`;
};
