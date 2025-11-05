// src/main.jsx

import React, { useState } from 'react'; 
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";


import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import MainLayout from './components/MainLayout.jsx'; // "molde"
import FornecedoresPage from './pages/FornecedoresPage.jsx'; 
import MovimentacoesPage from './pages/MovimentacoesPage.jsx'; 

import './index.css';


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
        
        {
          index: true, 
          element: <App />,
        },
       
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
    <Root />
  </React.StrictMode>,
);
