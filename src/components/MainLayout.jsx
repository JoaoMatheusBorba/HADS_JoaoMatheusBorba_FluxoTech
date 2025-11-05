// src/components/MainLayout.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom'; 
import { supabase } from '../supabaseClient';
import Navbar from './Navbar.jsx'; // Importamos nossa Navbar

function MainLayout({ onDataChanged, dataVersion }) {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
      } else {
        navigate('/login');
      }
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

  if (!session) {
    return <p>Carregando...</p>;
  }

  
 return (
    <div>
      <Navbar />
      {}
      <div className="main-content"> 
        <Outlet context={{ dataVersion, onDataChanged }} />
      </div>
    </div>
  );
}

export default MainLayout;
