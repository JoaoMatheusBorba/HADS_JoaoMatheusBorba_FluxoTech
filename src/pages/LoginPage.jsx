// src/pages/LoginPage.jsx


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

// 2. cliente supabase
import { supabase } from '../supabaseClient';

function LoginPage() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 4. hook de navegação
  const navigate = useNavigate();

  // 5. Login
  const handleLogin = async (event) => {
    event.preventDefault(); // previne que a página recarregue

    try {
      // 6. Usamos a função de 'signInWithPassword' do Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Erro no login:', error.message);
        alert('Erro ao fazer login: ' + error.message);
      } else {
        
        alert('Login realizado com sucesso!');
        
        
        navigate('/'); 
      }
    } catch (error) {
      console.error('Erro inesperado:', error.message);
      alert('Erro inesperado: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {/* 9. Ligando a função handleLogin ao 'onSubmit' */}
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <label>Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default LoginPage;
