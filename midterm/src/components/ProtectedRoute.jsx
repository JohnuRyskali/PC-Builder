import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  // If the user is not authenticated, redirect to the login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}