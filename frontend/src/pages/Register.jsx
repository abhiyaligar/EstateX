import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
};

export default Register;
