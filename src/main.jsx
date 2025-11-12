// src/main.jsx

import React, { useState } from 'react'; // Importamos o useState
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Nossas páginas e layouts
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import MainLayout from './components/MainLayout.jsx'; // Nosso "molde"
import FornecedoresPage from './pages/FornecedoresPage.jsx'; // Nova página
import MovimentacoesPage from './pages/MovimentacoesPage.jsx'; // Nova página

import './index.css';

// Hook personalizado para gerenciar o estado global
function Root() {
  // A LÓGICA DE ATUALIZAÇÃO (o 'sinal') sobe para o topo!
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = () => {
    setDataVersion(version => version + 1);
  };

  // Esta é a nova estrutura de rotas (MUITO IMPORTANTE)
  const router = createBrowserRouter([
    {
      // Rotas de Login/Cadastro (fora do layout principal)
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/cadastro",
      element: <SignUpPage />,
    },
    {
      path: "/", 
      element: (
        <MainLayout 
          dataVersion={dataVersion} 
          onDataChanged={refreshData} 
        />
      ),
      children: [
        // O "filho" da rota "/" será o App.jsx (Dashboard)
        {
          index: true, // Isso marca como a página padrão
          element: <App />,
        },
        // As outras páginas "filhas"
        {
          path: "/fornecedores",
          element: <FornecedoresPage />,
        },
        {
          path: "/movimentacoes",
          element: <MovimentacoesPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Root />
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
