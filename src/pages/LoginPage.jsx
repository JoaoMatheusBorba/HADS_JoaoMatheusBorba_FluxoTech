// src/pages/LoginPage.jsx

// 1. Importamos o 'useState' e o 'useNavigate'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirecionar o usuário

// 2. Importamos o cliente supabase
import { supabase } from '../supabaseClient';

function LoginPage() {
  // 3. Criamos os estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 4. Inicializamos o hook de navegação
  const navigate = useNavigate();

  // 5. Criamos a função de Login
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
        // 7. SUCESSO!
        alert('Login realizado com sucesso!');
        
        // 8. Redirecionamos o usuário para a página principal
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
      {/* 9. Ligamos a função handleLogin ao 'onSubmit' */}
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