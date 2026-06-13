import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext.jsx';

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
}
