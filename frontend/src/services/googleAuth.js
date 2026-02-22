const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '490991354262-k5hp4kgr576nldk65bpkoqh8u6i68j1k.apps.googleusercontent.com';
const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

export const getGoogleOAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token',
    scope: 'openid email profile',
    include_granted_scopes: 'true',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};
