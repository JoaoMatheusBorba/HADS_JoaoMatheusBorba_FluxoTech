import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';

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
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={6} 
        sx={{ 
          marginTop: { xs: 4, md: 8 }, // Margem menor em mobile (xs), maior em desktop (md)
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: { xs: 3, md: 4 } // Padding menor em mobile, maior em desktop
        }}
      >
        <Typography component="h1" variant="h5">
          Cadastro - SIGE
        </Typography>
        
        <Box component="form" onSubmit={handleSignUp} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha (mínimo 6 caracteres)"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Cadastrar
          </Button>

          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" variant="body2">
                Já tem uma conta? Faça login
              </Link>
            </Grid>
          </Grid>

        </Box>
      </Paper>
    </Container>
  );
}

export default SignUpPage;