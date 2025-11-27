import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom'; 
import { supabase } from '../supabaseClient';
import Navbar from './Navbar.jsx';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';

function MainLayout({ dataVersion, onDataChanged }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });
  const handleCloseToast = (event, reason) => { if (reason !== 'clickaway') setToast({ ...toast, open: false }); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session);
      else navigate('/login');
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      else setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <Navbar />
      <Box className="main-content" component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: '100%' }}>
        <Outlet context={{ dataVersion, onDataChanged, showToast }} />
      </Box>
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}
export default MainLayout;