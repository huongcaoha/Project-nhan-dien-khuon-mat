import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';
import api, { setAuthToken } from '../api';
import { dataURLtoFile } from '../utils/imageUtils';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Clear token on login page
    localStorage.removeItem('token');
    setAuthToken(null);
  }, []);

  const handleCapture = async (imageSrc: string) => {
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const file = dataURLtoFile(imageSrc, 'login_face.jpg');
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        setAuthToken(response.data.access_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Face not recognized.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-layout container">
      <div className="glass-panel max-w-lg">
        <h1 className="text-center mb-6">Welcome Back</h1>
        <p className="text-center mb-6">Scan your face to securely log in to your account.</p>
        
        {successMsg && (
          <div className="alert alert-success">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {successMsg}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <WebcamCapture 
          onCapture={handleCapture} 
          buttonText="Scan Face to Login" 
          isLoading={isLoading} 
        />

        <div className="text-center mt-6">
          <p className="text-sm">
            Don't have an account? <Link to="/register" className="nav-link" style={{color: 'var(--primary)'}}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
