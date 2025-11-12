import React from 'react';
import SupplierManager from '../components/SupplierManager';
import { useOutletContext } from 'react-router-dom';

function FornecedoresPage() {
  const { dataVersion, onDataChanged } = useOutletContext();
  
  return (
    <SupplierManager 
      dataVersion={dataVersion} 
      onDataChanged={onDataChanged} 
    />
  );
}

export default FornecedoresPage;