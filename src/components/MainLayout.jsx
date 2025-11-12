import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom'; 
import { supabase } from '../supabaseClient';
import Navbar from './Navbar.jsx';

import { Box, CircularProgress } from '@mui/material';

function MainLayout({ dataVersion, onDataChanged }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate('/login');
        } else {
          setSession(session);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Navbar />
      <Box className="main-content" component="main" sx={{ p: 3 }}>
        <Outlet context={{ dataVersion, onDataChanged }} />
      </Box>
    </div>
  );
}

export default MainLayout;