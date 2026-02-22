import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { googleLogin } from '../../services/perfumeService';
import { toast } from 'react-toastify';
import './Auth.css';

const GoogleCallback = () => {
  const [processing, setProcessing] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      // Extract access_token from URL hash fragment
      const hash = location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');

      if (!accessToken) {
        toast.error('Google login failed - no token received');
        navigate('/login');
        return;
      }

      try {
        const { data } = await googleLogin(accessToken);
        login(data.token, data.user);
        toast.success('Login successful!');
        navigate('/');
      } catch (error) {
        console.error('Google auth error:', error);
        toast.error(error.response?.data?.message || 'Google login failed');
        navigate('/login');
      } finally {
        setProcessing(false);
      }
    };

    handleCallback();
  }, [location, login, navigate]);

  if (processing) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div className="google-loading-spinner"></div>
          <h2 style={{ marginTop: '20px', color: '#333' }}>Signing you in...</h2>
          <p style={{ color: '#666' }}>Please wait while we complete your Google sign-in</p>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;
