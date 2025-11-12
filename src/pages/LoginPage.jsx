import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import {
  Box,
  Container,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Lock from '@mui/icons-material/Lock';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

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
      {/* Lado da ilustração */}
      <Box
        flex={1}
        bgcolor="#2864f0"
        display={{ xs: 'none', md: 'flex' }}
        justifyContent="center"
        alignItems="center"
      >
        <QueryStatsIcon sx={{ fontSize: 500, color: 'rgba(255, 255, 255, 0.5)' }} />
      </Box>
      {/* Lado do formulário */}
      <Container
        maxWidth="xs"
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={600} color="#2864f0" gutterBottom>
          Login
        </Typography>
        <Box component="form" noValidate onSubmit={handleLogin}>
          <TextField
            label="Email"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle color="action" />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 4, mb: 2 }}
          >
            LOGIN
          </Button>
          <FormControlLabel control={<Checkbox />} label="Lembrar senha." />
          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Ainda não tenho conta?{' '}
            <Link
              component={RouterLink}
              to="/cadastro"
              sx={{ color: "#2864f0", cursor: "pointer", textDecoration: 'none' }}
            >
              Cadastrar.
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
