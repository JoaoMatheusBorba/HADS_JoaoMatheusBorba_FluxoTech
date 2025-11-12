// src/pages/ProdutosPage.jsx
import React from 'react';
import ProductManager from '../components/ProductManager';
import { useOutletContext } from 'react-router-dom'; 

function ProdutosPage() {
  const { dataVersion, onDataChanged } = useOutletContext();
  
  return (
    <ProductManager 
      dataVersion={dataVersion} 
      onDataChanged={onDataChanged} 
    />
  );
}
export default ProdutosPage;