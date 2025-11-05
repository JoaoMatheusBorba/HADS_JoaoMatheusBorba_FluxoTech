// src/components/Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Erro ao sair:', error.message);
    else navigate('/login');
  };

  
  return (
    <nav>
      <Link to="/">Dashboard (Produtos)</Link>
      <Link to="/fornecedores">Fornecedores</Link>
      <Link to="/movimentacoes">Movimentações</Link>
      
      <button onClick={handleLogout}>
        Sair (Logout)
      </button>
    </nav>
  );
}

export default Navbar;
