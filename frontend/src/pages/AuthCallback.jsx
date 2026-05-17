import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/ui/Loader';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('Synchronizing your account...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        const { user: sbUser } = session;

        // Sync with backend
        await api.post('/auth/oauth-sync', {
          supabase_id: sbUser.id,
          email: sbUser.email,
          full_name: sbUser.user_metadata.full_name,
          avatar_url: sbUser.user_metadata.avatar_url
        });

        setStatus('Account synchronized! Redirecting...');
        
        // Short delay to ensure context updates
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        
      } catch (error) {
        setStatus('Failed to synchronize account. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground p-4">
      <Loader size={48} text={status} className="mb-2" />
      <p className="text-sm text-gray-500 mt-4">Please do not close this window.</p>
    </div>
  );
};

export default AuthCallback;
