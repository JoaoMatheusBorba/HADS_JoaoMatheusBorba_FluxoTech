import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import { supabase } from './supabaseClient';

import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  TextField,
  Divider,
  Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

function App() {
  const { dataVersion } = useOutletContext();
  
  const [report, setReport] = useState({ totalReceita: 0, totalCusto: 0, totalLucro: 0, totalVendas: 0 });
  const [averages, setAverages] = useState({ avgReceitaDia: 0, avgLucroDia: 0 });
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchSalesAndCalculate = async () => {
      if (!startDate || !endDate || startDate > endDate) return;
      setLoading(true);

      const { data: sales, error } = await supabase
        .from('movimentacoes_estoque')
        .select(`
          quantidade,
          created_at,
          produtos!inner (preco_venda, preco_custo)
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
        const precoVenda = sale.produtos.preco_venda || 0;
        const precoCusto = sale.produtos.preco_custo || 0;
        totalReceita += precoVenda * sale.quantidade;
        totalCusto += precoCusto * sale.quantidade;
      });

      const totalLucro = totalReceita - totalCusto;
      
      
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      setReport({ totalReceita, totalCusto, totalLucro, totalVendas: sales.length });
      setAverages({
        avgReceitaDia: totalReceita / diffDays,
        avgLucroDia: totalLucro / diffDays,
      });

      setLoading(false);
    };

    fetchSalesAndCalculate();
  }, [dataVersion, startDate, endDate]);

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

 
  const StatCard = ({ title, value, icon, color, isCurrency = true, subTitle }) => (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: '100%',
        borderRadius: 3,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
      }}
    >
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, color: 'text.primary' }}>
          {loading ? <CircularProgress size={28} /> : (isCurrency ? formatCurrency(value) : value)}
        </Typography>
        {subTitle && (
          <Typography variant="caption" color="text.secondary">
            {subTitle}
          </Typography>
        )}
      </Box>
      <Avatar 
        variant="rounded"
        sx={{ 
          bgcolor: `${color}20`, 
          color: color,
          width: 56, 
          height: 56 
        }}
      >
        {icon}
      </Avatar>
    </Paper>
  );

  return (
    <Box>
     
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' },
        mb: 4, 
        gap: 2 
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            Visão Geral
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Acompanhe o desempenho financeiro do seu negócio.
          </Typography>
        </Box>

       
        <Paper elevation={1} sx={{ p: 1, display: 'flex', gap: 2, borderRadius: 2, bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
            <CalendarTodayIcon color="action" />
          </Box>
          <DatePicker
            label="Início"
            slotProps={{ textField: { size: 'small', variant: 'standard' } }}
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
          />
          <DatePicker
            label="Fim"
            slotProps={{ textField: { size: 'small', variant: 'standard' } }}
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
          />
        </Paper>
      </Box>

      
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary', mt: 2 }}>
        Performance Financeira
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Receita Total" 
            value={report.totalReceita} 
            icon={<AttachMoneyIcon fontSize="large" />} 
            color="#27ae60" // Verde
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Lucro Líquido" 
            value={report.totalLucro} 
            icon={<TrendingUpIcon fontSize="large" />} 
            color="#2980b9" // Azul
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Custos Totais" 
            value={report.totalCusto} 
            icon={<TrendingDownIcon fontSize="large" />} 
            color="#e74c3c" // Vermelho
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary' }}>
        Indicadores Operacionais
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Volume de Vendas" 
            value={report.totalVendas} 
            icon={<ShoppingCartIcon fontSize="large" />} 
            color="#f39c12" // Laranja
            isCurrency={false}
            subTitle="Transações realizadas no período"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Média Receita / Dia" 
            value={averages.avgReceitaDia} 
            icon={<BarChartIcon fontSize="large" />} 
            color="#8e44ad" // Roxo
            subTitle="Faturamento médio diário"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Média Lucro / Dia" 
            value={averages.avgLucroDia} 
            icon={<ShowChartIcon fontSize="large" />} 
            color="#16a085" // Verde água
            subTitle="Lucratividade média diária"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;