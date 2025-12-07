import React, { useState } from 'react';
import { login, register } from '../../services/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!email) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        const user = await register(username, email, password);
        onLogin(user);
      } else {
        const user = await login(username, password);
        onLogin(user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>💬 Section Connection</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          {isRegistering ? 'Create your account' : 'Sign in to continue'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          {isRegistering && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && (
            <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', fontSize: '14px' }}>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              marginLeft: '5px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegistering ? 'Sign in' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;