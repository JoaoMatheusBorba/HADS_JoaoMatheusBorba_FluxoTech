// src/pages/MovimentacoesPage.jsx
import React from 'react';
import StockMovementManager from '../components/StockMovementManager';
import { useOutletContext } from 'react-router-dom'; // Para pegar as props!

function MovimentacoesPage() {
  // Pega as props (onDataChanged) do "Pai" (MainLayout)
  const { onDataChanged } = useOutletContext();

  return <StockMovementManager onDataChanged={onDataChanged} />;
}
export default MovimentacoesPage;