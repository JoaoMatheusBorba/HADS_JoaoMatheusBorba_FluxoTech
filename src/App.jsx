// src/App.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom'; // Para pegar as props!
import ProductManager from './components/ProductManager.jsx';

function App() {
  // Pega as props (dataVersion, onDataChanged) do "Pai" (MainLayout)
  const { dataVersion, onDataChanged } = useOutletContext();

  return (
    <div>
      {/* O App.jsx agora é SÓ o Dashboard de Produtos.
        Todo o resto (login, logout, outros managers) foi movido.
      */}
      <ProductManager 
        dataVersion={dataVersion} 
        onDataChanged={onDataChanged} 
      />
    </div>
  );
}

export default App;