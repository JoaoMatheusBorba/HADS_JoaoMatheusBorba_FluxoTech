import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import { supabase } from '../supabaseClient';

import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  TextField 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AssessmentIcon from '@mui/icons-material/Assessment';

function FinancialReport() {
  const { dataVersion } = useOutletContext();
  
  const [report, setReport] = useState(null);
  const [averages, setAverages] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchSalesAndCalculate = async () => {
      if (!startDate || !endDate || startDate > endDate) {
        return;
      }
      setLoading(true);

      const { data: sales, error } = await supabase
        .from('movimentacoes_estoque')
        .select(`
          quantidade,
          created_at,
          produtos!inner (
            preco_venda,
            preco_custo
          )
        `)
        .eq('tipo', 'SAIDA')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        console.error('Erro ao buscar vendas:', error.message);
        setLoading(false);
        return;
      }

      let totalReceita = 0;
      let totalCusto = 0;

      sales.forEach(sale => {
        const { quantidade, produtos } = sale;
        const precoVenda = produtos.preco_venda || 0;
        const precoCusto = produtos.preco_custo || 0;
        totalReceita += precoVenda * quantidade;
        totalCusto += precoCusto * quantidade;
      });

      const totalLucro = totalReceita - totalCusto;
      setReport({ totalReceita, totalCusto, totalLucro, totalVendas: sales.length });

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const numDays = diffDays === 0 ? 1 : diffDays;

      setAverages({
        avgReceitaDia: totalReceita / numDays,
        avgLucroDia: totalLucro / numDays,
      });

      setLoading(false);
    };

    fetchSalesAndCalculate();
  }, [dataVersion, startDate, endDate]);

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const RenderCard = ({ title, value, icon, color = 'text.secondary', isCurrency = true }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          minHeight: 160
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" sx={{ color, fontWeight: 500, mb: 2 }}>{title}</Typography>
          <Box sx={{ color, fontSize: 40, opacity: 0.7, ml: 1 }}>{icon}</Box>
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {loading ? <CircularProgress size={30} /> : (isCurrency ? formatCurrency(value) : (value || 0))}
          </Typography>
        </Box>
      </Paper>
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Dashboard Financeiro
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Data de Início"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Data de Fim"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <RenderCard 
          title="Receita Bruta (Vendas)" 
          value={report?.totalReceita} 
          icon={<AttachMoneyIcon fontSize="inherit" />}
          color="success.main"
        />
        <RenderCard 
          title="Custo das Vendas" 
          value={report?.totalCusto} 
          icon={<TrendingDownIcon fontSize="inherit" />}
          color="error.main"
        />
        <RenderCard 
          title="Lucro Bruto" 
          value={report?.totalLucro} 
          icon={<TrendingUpIcon fontSize="inherit" />}
          color="primary.main"
        />
        <RenderCard 
          title="Total de Vendas (Nº)" 
          value={report?.totalVendas} 
          icon={<PointOfSaleIcon fontSize="inherit" />}
          isCurrency={false} 
        />
        <RenderCard 
          title="Média de Receita/Dia" 
          value={averages?.avgReceitaDia} 
          icon={<AssessmentIcon fontSize="inherit" />}
        />
        <RenderCard 
          title="Média de Lucro/Dia" 
          value={averages?.avgLucroDia} 
          icon={<AssessmentIcon fontSize="inherit" />}
        />
      </Grid>
    </Box>
  );
}

export default FinancialReport;