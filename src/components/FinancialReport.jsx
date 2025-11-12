import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOutletContext } from 'react-router-dom';

function FinancialReport() {
  const { dataVersion } = useOutletContext();
  
  const [report, setReport] = useState({
    totalReceita: 0,
    totalCusto: 0,
    totalLucro: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesAndCalculate = async () => {
      setLoading(true);

      const { data: sales, error } = await supabase
        .from('movimentacoes_estoque')
        .select(`
          quantidade,
          produtos!inner (
            preco_venda,
            preco_custo
          )
        `)
        .eq('tipo', 'SAIDA');

      if (error) {
        console.error('Erro ao buscar vendas:', error.message);
        setLoading(false);
        return;
      }

      let totalReceitaCalculada = 0;
      let totalCustoCalculado = 0;

      sales.forEach(sale => {
        const { quantidade, produtos } = sale;
        const precoVenda = produtos.preco_venda || 0;
        const precoCusto = produtos.preco_custo || 0;
        totalReceitaCalculada += precoVenda * quantidade;
        totalCustoCalculado += precoCusto * quantidade;
      });

      const totalLucroCalculado = totalReceitaCalculada - totalCustoCalculado;

      setReport({
        totalReceita: totalReceitaCalculada,
        totalCusto: totalCustoCalculado,
        totalLucro: totalLucroCalculado
      });
      setLoading(false);
    };

    fetchSalesAndCalculate();
  }, [dataVersion]);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return <h3>Carregando Relatório Financeiro...</h3>;
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      <h2>Dashboard Financeiro</h2>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-around' }}>
        
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: 'white', textAlign: 'center' }}>
          <h4>Receita Bruta Total (Vendas)</h4>
          <strong style={{ fontSize: '1.5em', color: '#27ae60' }}>
            {formatCurrency(report.totalReceita)}
          </strong>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: 'white', textAlign: 'center' }}>
          <h4>Custo Total das Vendas</h4>
          <strong style={{ fontSize: '1.5em', color: '#e74c3c' }}>
            {formatCurrency(report.totalCusto)}
          </strong>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: 'white', textAlign: 'center' }}>
          <h4>Lucro Bruto Total</h4>
          <strong style={{ fontSize: '1.5em', color: '#3498db' }}>
            {formatCurrency(report.totalLucro)}
          </strong>
        </div>

      </div>
    </div>
  );
}

export default FinancialReport;