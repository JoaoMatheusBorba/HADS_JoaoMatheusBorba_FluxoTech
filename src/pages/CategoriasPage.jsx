import React from 'react';
import CategoryManager from '../components/CategoryManager';
import { useOutletContext } from 'react-router-dom';

function CategoriasPage() {
  const { dataVersion, onDataChanged } = useOutletContext();
  
  return (
    <CategoryManager 
      dataVersion={dataVersion} 
      onDataChanged={onDataChanged} 
    />
  );
}

export default CategoriasPage;