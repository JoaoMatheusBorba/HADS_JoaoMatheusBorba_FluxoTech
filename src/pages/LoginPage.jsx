import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import { Box, Container, TextField, Typography, Button, Checkbox, FormControlLabel, Link, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Lock from '@mui/icons-material/Lock';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        alert('Erro ao fazer login: ' + error.message);
      } else {
        navigate('/');
      }
    } catch (error) {
      alert('Erro inesperado: ' + error.message);
    }
  };

  return (
    <Box display="flex" minHeight="100vh">
      
      <Container 
        component={Paper}
        elevation={6}
        square
        maxWidth="sm"
        sx={{ 
          py: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2
        }}
      >
        <Box maxWidth="xs">
          <Typography variant="h5" fontWeight={600} color="primary" gutterBottom>
            Bem-vindo de volta!
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Insira suas credenciais para aceder ao SIGE.
          </Typography>
          
          <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 3 }}>
            <TextField
              label="Email"
              variant="filled"
              margin="normal"
              required
              fullWidth
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                endAdornment: <AccountCircle color="action" />
              }}
            />
            <TextField
              label="Senha"
              type="password"
              variant="filled"
              margin="normal"
              required
              fullWidth
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: <Lock color="action" />
              }}
            />
            <FormControlLabel 
              control={<Checkbox value="remember" color="primary" />} 
              label="Lembrar senha" 
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ mt: 2, py: 1.5 }}
            >
              LOGIN
            </Button>
            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              Ainda não tenho conta?{' '}
              <Link component={RouterLink} to="/cadastro" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
                Cadastrar.
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>

      <Box 
        flex={1} 
        bgcolor="primary.main"
        display={{ xs: 'none', md: 'flex' }}
        justifyContent="center" 
        alignItems="center"
        flexDirection="column"
        sx={{ color: 'white', px: 4 }}
      >
        <BarChartIcon sx={{ fontSize: 150, color: 'rgba(255, 255, 255, 0.8)' }} />
        <Typography variant="h3" fontWeight={700} sx={{ mt: 2 }}>
          SIGE
        </Typography>
        <Typography variant="h6" align="center" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Sistema Integrado de Gestão de Estoque
        </Typography>
      </Box>
      
    </Box>
  );
}