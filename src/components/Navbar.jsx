import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, Box, Divider, Tooltip, Popover
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory'; 
import CategoryIcon from '@mui/icons-material/Category';    
import PeopleIcon from '@mui/icons-material/People';        
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; 
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';   
import HistoryIcon from '@mui/icons-material/History';           
import LogoutIcon from '@mui/icons-material/Logout';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const toggleDrawer = (newOpen) => () => setOpen(newOpen);
  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  
  const handleHelpClick = (e) => setAnchorEl(e.currentTarget);
  const handleHelpClose = () => setAnchorEl(null);
  const openHelp = Boolean(anchorEl);
  
  const getHelpText = () => {
     switch (location.pathname) {
      case '/': return "Dê um duplo clique no cartão 'Saldo em Caixa' para ajustar o capital inicial.";
      case '/produtos': return "Gerencie seu catálogo de produtos.";
      default: return "Sistema de Gestão.";
    }
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">SIGE</Typography>
        <Typography variant="caption">Gestão Empresarial</Typography>
      </Box>
      <List>
        <ListItem disablePadding><ListItemButton component={Link} to="/"><ListItemIcon><DashboardIcon color="primary" /></ListItemIcon><ListItemText primary="Visão Geral" /></ListItemButton></ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding><ListItemButton component={Link} to="/compras"><ListItemIcon><ShoppingCartIcon /></ListItemIcon><ListItemText primary="Registrar Entrada" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton component={Link} to="/vendas"><ListItemIcon><PointOfSaleIcon /></ListItemIcon><ListItemText primary="Registrar Saída" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton component={Link} to="/movimentacoes"><ListItemIcon><HistoryIcon /></ListItemIcon><ListItemText primary="Histórico" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton component={Link} to="/inventario"><ListItemIcon><AssessmentIcon /></ListItemIcon><ListItemText primary="Relatório de Estoque" /></ListItemButton></ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding><ListItemButton component={Link} to="/produtos"><ListItemIcon><InventoryIcon /></ListItemIcon><ListItemText primary="Produtos" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton component={Link} to="/categorias"><ListItemIcon><CategoryIcon /></ListItemIcon><ListItemText primary="Categorias" /></ListItemButton></ListItem>
        <ListItem disablePadding><ListItemButton component={Link} to="/fornecedores"><ListItemIcon><PeopleIcon /></ListItemIcon><ListItemText primary="Fornecedores" /></ListItemButton></ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }} onClick={toggleDrawer(true)}><MenuIcon /></IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>SIGE</Typography>
          <Tooltip title="Ajuda"><IconButton color="inherit" onClick={handleHelpClick} sx={{ mr: 1 }}><HelpOutlineIcon /></IconButton></Tooltip>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>Sair</Button>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={toggleDrawer(false)}>{DrawerList}</Drawer>
      <Popover open={openHelp} anchorEl={anchorEl} onClose={handleHelpClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}><Box sx={{ p: 2, maxWidth: 300, bgcolor: '#e3f2fd' }}><Typography variant="body2">{getHelpText()}</Typography></Box></Popover>
    </>
  );
}
export default Navbar;