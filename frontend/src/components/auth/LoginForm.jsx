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
  const { login, loginWithGoogle } = useAuth();
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
      if (result.user && result.user.kyc_status !== 'approved') {
        navigate('/dashboard/kyc');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Invalid credentials');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-2xl shadow-primary-500/10 dark:bg-slate-900 border border-secondary-100 dark:border-secondary-800">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-foreground">
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
            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Forgot password?
            </Link>
          </div>
        </div>

        <div>
           <Button type="submit" className="w-full" isLoading={isSubmitting}>
             Sign in
           </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary-200 dark:border-secondary-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-slate-900 px-2 text-secondary-500">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="secondary" 
          className="w-full flex items-center justify-center gap-3"
          onClick={loginWithGoogle}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
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
