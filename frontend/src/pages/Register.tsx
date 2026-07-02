import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import type { ApiError } from '../types';
import './Auth.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError('All fields are required.');
      return;
    }
    
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await client.post('/register', {
        username: trimmedUsername,
        password: password,
      });
      
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data) {
        const errorData = err.response.data as ApiError;
        if (typeof errorData.detail === 'string') {
          setError(errorData.detail);
        } else if (Array.isArray(errorData.detail)) {
          // Handle Pydantic validation error lists
          setError(errorData.detail[0]?.msg || 'Validation error occurred.');
        } else {
          setError('Registration failed. Please check credentials.');
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
        <h2>Join Us</h2>
        <p className="auth-subtitle">Create an account to manage your daily tasks</p>
        
        {error && (
          <div className="auth-alert error" id="register-error">
            {error}
          </div>
        )}
        {success && (
          <div className="auth-alert success" id="register-success">
            {success}
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
              placeholder="At least 3 characters"
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
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
            />
          </div>

          <button type="submit" className="auth-btn" id="register-submit">
            Create Account
          </button>
        </form>

        <p className="auth-redirect">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
