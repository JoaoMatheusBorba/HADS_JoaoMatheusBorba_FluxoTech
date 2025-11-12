import React from 'react';
import StockMovementManager from '../components/StockMovementManager';
import { useOutletContext } from 'react-router-dom';

function MovimentacoesPage() {
  const { dataVersion, onDataChanged } = useOutletContext();
  
  return (
    <StockMovementManager 
      dataVersion={dataVersion} 
      onDataChanged={onDataChanged} 
    />
  );
}

export default MovimentacoesPage;