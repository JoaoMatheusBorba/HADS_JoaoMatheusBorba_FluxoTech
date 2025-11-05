// src/pages/SignUpPage.jsx


import React, { useState } from 'react';


import { supabase } from '../supabaseClient'; 


function SignUpPage() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  
  const handleSignUp = async (event) => {
    
    event.preventDefault(); 

    try {
     
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        
        console.error('Erro no cadastro:', error.message);
        alert('Erro ao cadastrar: ' + error.message);
      } else {
        
        alert('Cadastro realizado com sucesso! Você pode fazer o login.');
      
      }
    } catch (error) {
      console.error('Erro inesperado:', error.message);
      alert('Erro inesperado: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Cadastro</h2>
      {/*  função handleSignUp ao 'onSubmit' do formulário */}
      <form onSubmit={handleSignUp}>
        <label>Email:</label>
        {/*  inputs aos seus respectivos 'estados' */}
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
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

export default SignUpPage;
