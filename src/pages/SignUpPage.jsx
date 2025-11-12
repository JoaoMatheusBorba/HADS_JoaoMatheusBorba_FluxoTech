// src/pages/SignUpPage.jsx

// 1. Importamos o 'useState' para guardar os dados do formulário
import React, { useState } from 'react';

// 2. Importamos o cliente supabase que criamos
import { supabase } from '../supabaseClient'; 
// (Usamos '../' para "voltar" uma pasta, já que estamos em src/pages)

function SignUpPage() {
  // 3. Criamos os "estados" para email e senha
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 4. Criamos a função que será chamada no submit do formulário
  const handleSignUp = async (event) => {
    // previne que a página recarregue ao enviar o formulário
    event.preventDefault(); 

    try {
      // 5. Usamos a função de 'signUp' do Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        // 6. Se der erro, mostramos no console e em um alerta
        console.error('Erro no cadastro:', error.message);
        alert('Erro ao cadastrar: ' + error.message);
      } else {
        // 7. Se der certo, avisamos o usuário!
        alert('Cadastro realizado com sucesso! Você pode fazer o login.');
        // Aqui poderíamos redirecionar o usuário, mas vamos fazer isso depois
      }
    } catch (error) {
      alert('Erro inesperado: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Cadastro</h2>
      {/* 8. Ligamos a função handleSignUp ao 'onSubmit' do formulário */}
      <form onSubmit={handleSignUp}>
        <label>Email:</label>
        {/* 9. Ligamos os inputs aos seus respectivos 'estados' */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Atualiza o estado 'email'
          required
        />
        <br />
        <label>Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Atualiza o estado 'password'
          required
        />
        <br />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

export default SignUpPage;
