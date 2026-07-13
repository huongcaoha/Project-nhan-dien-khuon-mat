import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../api';

interface User {
  id: number;
  username: string;
  full_name: string | null;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      setAuthToken(token);
      
      try {
        const response = await api.get('/me', { params: { token } });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        setAuthToken(null);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="center-layout">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mt-6">
      <nav className="glass-panel mb-6" style={{ padding: '1rem 2rem', animation: 'none' }}>
        <h2 className="m-0" style={{ marginBottom: 0, fontSize: '1.5rem' }}>SecureApp</h2>
        <div className="nav-links">
          <button onClick={handleLogout} className="btn btn-outline">Logout</button>
        </div>
      </nav>

      <div className="glass-panel">
        <h1 className="mb-4">Welcome, {user?.full_name || user?.username}!</h1>
        <div className="flex gap-4 mt-6">
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 className="text-muted text-sm mb-2 uppercase tracking-wider">Username</h3>
            <p className="text-xl m-0 text-main">{user?.username}</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 className="text-muted text-sm mb-2 uppercase tracking-wider">User ID</h3>
            <p className="text-xl m-0 text-main">#{user?.id}</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 border rounded" style={{ borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div className="flex items-center gap-2">
            <svg width="24" height="24" fill="none" stroke="var(--success)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="m-0 text-success">Authentication Verified</h3>
          </div>
          <p className="mt-2 mb-0 text-sm">You have successfully logged in using facial recognition.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
