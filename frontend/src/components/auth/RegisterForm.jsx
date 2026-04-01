import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'investor'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      email: formData.email,
      password: formData.password,
      role: formData.role,
      user_metadata: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone
      }
    });
    
    if (result.success) {
      // Auto-login after successful registration
      const loginResult = await login(formData.email, formData.password);
      
      if (loginResult.success) {
        navigate('/dashboard/kyc');
      } else {
        // Fallback to login page if auto-login fails
        navigate('/login', { state: { message: "Registration successful. Please login." } });
      }
    } else {
      setError(result.error || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-8 rounded-3xl bg-white p-8 shadow-2xl shadow-primary-500/10 dark:bg-slate-900 border border-secondary-100 dark:border-secondary-800">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
          Join EstateX to start trading properties
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        
        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4">
          <label className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
             formData.role === 'investor' 
               ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
               : 'border-secondary-200 text-secondary-600 hover:border-primary-200 dark:border-secondary-800 dark:text-secondary-400'
          }`}>
             <input type="radio" name="role" value="investor" className="hidden" checked={formData.role === 'investor'} onChange={handleChange} />
             <span className="font-semibold block">Investor</span>
             <span className="text-xs opacity-80 mt-1 block">Buy property shares</span>
          </label>
          <label className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
             formData.role === 'builder' 
               ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
               : 'border-secondary-200 text-secondary-600 hover:border-primary-200 dark:border-secondary-800 dark:text-secondary-400'
          }`}>
             <input type="radio" name="role" value="builder" className="hidden" checked={formData.role === 'builder'} onChange={handleChange} />
             <span className="font-semibold block">Builder</span>
             <span className="text-xs opacity-80 mt-1 block">List your projects</span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            name="firstName"
            required
            icon={User}
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
          />
          <Input
            label="Last Name"
            name="lastName"
            required
            icon={User}
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email address"
            name="email"
            type="email"
            required
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            name="password"
            type="password"
            required
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            required
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <div className="text-sm text-secondary-500 dark:text-secondary-400">
           By signing up, you agree to our <a href="#" className="font-medium text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="font-medium text-primary-600 hover:underline">Privacy Policy</a>.
        </div>

        <div>
           <Button type="submit" className="w-full" isLoading={isSubmitting}>
             Create Account
           </Button>
        </div>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
