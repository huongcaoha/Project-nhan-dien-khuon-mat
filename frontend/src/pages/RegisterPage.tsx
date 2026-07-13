import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';
import api from '../api';
import { dataURLtoFile } from '../utils/imageUtils';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCapture = async (imageSrc: string) => {
    if (!username) {
      setError('Please enter a username first.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const file = dataURLtoFile(imageSrc, 'face.jpg');
      const formData = new FormData();
      formData.append('username', username);
      if (fullName) formData.append('full_name', fullName);
      formData.append('file', file);

      const response = await api.post('/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-layout container">
      <div className="glass-panel max-w-lg">
        <h1 className="text-center mb-6">Create Account</h1>
        <p className="text-center mb-6">Register using your face for secure access.</p>
        
        {error && (
          <div className="alert alert-error">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div className="form-group mb-4">
          <label htmlFor="username">Username *</label>
          <input 
            type="text" 
            id="username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter unique username"
            required
          />
        </div>

        <div className="form-group mb-6">
          <label htmlFor="fullName">Full Name</label>
          <input 
            type="text" 
            id="fullName" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <WebcamCapture 
          onCapture={handleCapture} 
          buttonText="Register with Face" 
          isLoading={isLoading} 
        />

        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account? <Link to="/login" className="nav-link" style={{color: 'var(--primary)'}}>Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
