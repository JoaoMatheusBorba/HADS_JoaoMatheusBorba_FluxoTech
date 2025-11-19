import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider
} from '@mui/material';

// Ícones
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory'; // Produtos
import CategoryIcon from '@mui/icons-material/Category';    // Categorias
import PeopleIcon from '@mui/icons-material/People';        // Fornecedores
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Compras
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';   // Vendas
import HistoryIcon from '@mui/icons-material/History';           // Histórico
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // Estado para controlar se o Drawer está aberto

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Erro ao sair:', error.message);
    else navigate('/login');
  };

  // Lista de itens do menu
  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          Módulos SIGE
        </Typography>
        <Typography variant="caption">Sistema de Gestão</Typography>
      </Box>
      
      <List>
        {/* Módulo Principal */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1 }} />
        
        {/* Módulo Operacional (Dia a Dia) */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/compras">
            <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
            <ListItemText primary="Nova Compra" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/vendas">
            <ListItemIcon><PointOfSaleIcon /></ListItemIcon>
            <ListItemText primary="Nova Venda" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/movimentacoes">
            <ListItemIcon><HistoryIcon /></ListItemIcon>
            <ListItemText primary="Histórico" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1 }} />

        {/* Módulo de Cadastros (Gestão) */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/produtos">
            <ListItemIcon><InventoryIcon /></ListItemIcon>
            <ListItemText primary="Produtos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/categorias">
            <ListItemIcon><CategoryIcon /></ListItemIcon>
            <ListItemText primary="Categorias" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/fornecedores">
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Fornecedores" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* A BARRA SUPERIOR (APENAS TÍTULO E MENU) */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SIGE
          </Typography>

          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      {/* O MENU LATERAL (DRAWER) */}
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
}

export default Navbar;