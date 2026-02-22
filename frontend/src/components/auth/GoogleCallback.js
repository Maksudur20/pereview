import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const GoogleCallback = () => {
  const [processing, setProcessing] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          toast.error('Google login failed. Please try again.');
          navigate('/login');
          return;
        }

        if (!token || !userParam) {
          toast.error('Google login failed - no token received');
          navigate('/login');
          return;
        }

        const user = JSON.parse(decodeURIComponent(userParam));
        login(token, user);
        toast.success('Login successful!');
        navigate('/');
      } catch (error) {
        console.error('Google auth error:', error);
        toast.error('Google login failed');
        navigate('/login');
      } finally {
        setProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

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
