import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import { TextField, Button, Container, Typography, Box, Link, Grid, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        alert('Erro ao cadastrar: ' + error.message);
      } else {
        alert('Cadastro realizado com sucesso! Pode fazer o login.');
        navigate('/login');
      }
    } catch (error) {
      alert('Erro inesperado: ' + error.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, boxShadow: 3, p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h5" component="h1" align="center" gutterBottom>
        Cadastro - SIGE
      </Typography>
      
      <Box component="form" onSubmit={handleSignUp} noValidate sx={{ mt: 3 }}>
        <TextField
          label="Email"
          variant="filled"
          margin="normal"
          required
          fullWidth
          id="email"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Senha (mínimo 6 caracteres)"
          type="password"
          variant="filled"
          margin="normal"
          required
          fullWidth
          name="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          Cadastrar
        </Button>

        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link component={RouterLink} to="/login" variant="body2">
              Já tem uma conta? Faça login
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default SignUpPage;