import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import MainLayout from './components/MainLayout.jsx'; 

import ProdutosPage from './pages/ProdutosPage.jsx';
import FornecedoresPage from './pages/FornecedoresPage.jsx';
import MovimentacoesPage from './pages/MovimentacoesPage.jsx';
import ComprasPage from './pages/ComprasPage.jsx';
import VendasPage from './pages/VendasPage.jsx';
import CategoriasPage from './pages/CategoriasPage.jsx'; 
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
    },
    secondary: {
      main: '#e74c3c',
    },
  },
});

function Root() {
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = () => {
    setDataVersion(version => version + 1);
  };

  const router = createBrowserRouter([
    {
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
        { index: true, element: <App /> },
        { path: "/produtos", element: <ProdutosPage /> },
        { path: "/fornecedores", element: <FornecedoresPage /> },
        { path: "/categorias", element: <CategoriasPage /> }, 
        { path: "/movimentacoes", element: <MovimentacoesPage /> },
        { path: "/compras", element: <ComprasPage /> },
        { path: "/vendas", element: <VendasPage /> },
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