import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-2xl shadow-primary-500/10 dark:bg-slate-900 border border-secondary-100 dark:border-secondary-800">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
          Sign in to access your properties
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600 dark:border-secondary-700 dark:bg-slate-800"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-900 dark:text-secondary-300">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Forgot password?
            </a>
          </div>
        </div>

        <div>
           <Button type="submit" className="w-full" isLoading={isSubmitting}>
             Sign in
           </Button>
        </div>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
