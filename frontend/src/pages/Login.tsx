import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import Spinner from '../components/Spinner';
import type { ApiError } from '../types';
import './Auth.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError('Username and password are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await client.post('/login', {
        username: trimmedUsername,
        password: password,
      });
      
      const { access_token } = response.data;
      login(access_token, trimmedUsername);
      navigate('/protected');
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid credentials.');
        } else {
          const errorData = err.response.data as ApiError;
          if (typeof errorData.detail === 'string') {
            setError(errorData.detail);
          } else if (Array.isArray(errorData.detail)) {
            setError(errorData.detail[0]?.msg || 'Validation error.');
          } else {
            setError('Login failed. Please check credentials.');
          }
        }
      } else {
        setError('Network error or server is offline. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {loading && <Spinner />}
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to manage your tasks</p>
        
        {error && (
          <div className="auth-alert error" id="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-btn" id="login-submit">
            Sign In
          </button>
        </form>

        <p className="auth-redirect">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
