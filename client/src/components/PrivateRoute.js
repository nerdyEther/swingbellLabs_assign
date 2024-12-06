import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Check for token in local storage
  const token = localStorage.getItem('token');

 
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;