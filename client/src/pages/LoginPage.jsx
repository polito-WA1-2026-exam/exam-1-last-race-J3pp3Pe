import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserContext from '../contexts/UserContext.jsx';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(username, password);
      navigate('/setup');
    } catch (err) {
      setError(err?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body p-5">
            <h2 className="card-title text-center mb-4">Last Race</h2>
            <p className="text-center text-muted mb-4">
              Navigate the metro network and reach your destination!
            </p>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alice, bob, or charlie"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password1, password2, or password3"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 btn-lg"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <hr className="my-4" />

            <div className="text-center">
              <p className="mb-2">Test Credentials:</p>
              <small className="text-muted d-block">
                alice / password1<br />
                bob / password2<br />
                charlie / password3
              </small>
            </div>

            <div className="mt-4 text-center">
              <Link to="/instructions" className="btn btn-outline-secondary">
                View Instructions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
