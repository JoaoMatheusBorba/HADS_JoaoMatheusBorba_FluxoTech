// src/App.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom'; 
import ProductManager from './components/ProductManager.jsx';

function App() {
  
  const { dataVersion, onDataChanged } = useOutletContext();

  return (
    <div>
      {/* O App.jsx fica como dashboard apenas
      */}
      <ProductManager 
        dataVersion={dataVersion} 
        onDataChanged={onDataChanged} 
      />
    </div>
  );
}

export default App;
