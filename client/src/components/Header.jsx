import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext.jsx';

export default function Header() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogoClick = (e) => {
    if (user) {
      navigate('/setup');
    } else {
      navigate('/');
    }
  };

  return (
    <header
      className="text-white py-3 shadow-sm"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <button
            onClick={handleLogoClick}
            className="text-white text-decoration-none bg-transparent border-0"
            style={{ cursor: 'pointer' }}
          >
            <h1 className="h3 mb-0">🚇 Last Race</h1>
          </button>
          {user && (
            <div className="d-flex gap-2 align-items-center">
              <span>Welcome, {user.username}</span>
              <Link to="/rankings" className="btn btn-sm btn-light">Rankings</Link>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
