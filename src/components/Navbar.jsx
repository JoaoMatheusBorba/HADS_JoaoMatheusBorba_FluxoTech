import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Erro ao sair:', error.message);
    else navigate('/login');
  };

  // Os estilos foram movidos para o index.css
  return (
    <AppBar position="static">
      <Toolbar>
        
        <Typography variant="h6" component="div" sx={{ marginRight: 2 }}>
          SIGE
        </Typography>

        <Button component={Link} to="/" color="inherit">Dashboard</Button>
        <Button component={Link} to="/produtos" color="inherit">Produtos</Button>
        <Button component={Link} to="/fornecedores" color="inherit">Fornecedores</Button>
        <Button component={Link} to="/compras" color="inherit">Registrar Compra</Button>
        <Button component={Link} to="/vendas" color="inherit">Registrar Venda</Button>
        <Button component={Link} to="/movimentacoes" color="inherit">Histórico</Button>
        
        <Box sx={{ flexGrow: 1 }} />

        <Button color="secondary" variant="contained" onClick={handleLogout}>
          Sair
        </Button>

      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
