import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import { supabase } from './supabaseClient';
import { 
  Box, Grid, Paper, Typography, CircularProgress, Avatar, Divider, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';

function App() {
  const { dataVersion, onDataChanged, showToast } = useOutletContext();
  const [report, setReport] = useState({ totalReceita: 0, totalCusto: 0, totalLucro: 0, totalVendas: 0, saldoAtual: 0, saldoInicial: 0 });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; });
  const [endDate, setEndDate] = useState(new Date());

  // Estados do Modal de Saldo
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: config } = await supabase.from('configuracoes').select('valor').eq('chave', 'saldo_inicial').single();
      const saldoIni = config ? parseFloat(config.valor) : 0;
      const { data: allMoves } = await supabase.from('movimentacoes_estoque').select(`tipo, quantidade, produtos!inner(preco_venda, preco_custo)`);
      
      let caixa = saldoIni;
      if (allMoves) {
        allMoves.forEach(m => {
          const v = m.produtos.preco_venda || 0; const c = m.produtos.preco_custo || 0;
          if (m.tipo === 'ENTRADA') caixa -= (c * m.quantidade);
          else caixa += (v * m.quantidade);
        });
      }

      if (!startDate || !endDate) { setLoading(false); return; }
      const { data: sales } = await supabase.from('movimentacoes_estoque').select(`quantidade, produtos!inner(preco_venda, preco_custo)`).eq('tipo', 'SAIDA').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());

      let rec = 0, cust = 0;
      if (sales) {
        sales.forEach(s => {
          rec += (s.produtos.preco_venda || 0) * s.quantidade;
          cust += (s.produtos.preco_custo || 0) * s.quantidade;
        });
      }
      setReport({ 
        totalReceita: rec, totalCusto: cust, totalLucro: rec - cust, 
        totalVendas: sales?.length || 0, saldoAtual: caixa, saldoInicial: saldoIni 
      });
      setLoading(false);
    };
    fetchData();
  }, [dataVersion, startDate, endDate]);

  const handleOpenBalanceModal = () => {
    setNewBalance(report.saldoInicial); // Carrega o saldo inicial atual
    setIsBalanceModalOpen(true);
  };

  const handleSaveBalance = async () => {
    const { error } = await supabase.from('configuracoes').update({ valor: newBalance }).eq('chave', 'saldo_inicial');
    if (error) {
      if (showToast) showToast('Erro ao atualizar: ' + error.message, 'error');
      else alert('Erro: ' + error.message);
    } else {
      if (showToast) showToast('Saldo Inicial atualizado!', 'success');
      onDataChanged(); // Recarrega o dashboard
      setIsBalanceModalOpen(false);
    }
  };

  const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const StatCard = ({ title, value, icon, color, highlight, onDoubleClick, tooltip }) => (
    <Tooltip title={tooltip || ""} placement="top">
      <Paper 
        elevation={highlight ? 8 : 2} 
        onDoubleClick={onDoubleClick}
        sx={{ 
          p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 3, 
          bgcolor: highlight ? 'primary.main' : 'white', color: highlight ? 'white' : 'text.primary',
          cursor: onDoubleClick ? 'pointer' : 'default',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8 }}>{title}</Typography>
          <Typography variant="h4" fontWeight="bold">{loading ? <CircularProgress size={20} color="inherit"/> : fmt(value)}</Typography>
          {onDoubleClick && <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>(Duplo clique para ajustar)</Typography>}
        </Box>
        <Avatar variant="rounded" sx={{ bgcolor: highlight ? 'rgba(255,255,255,0.2)' : `${color}20`, color: highlight ? 'white' : color }}>{icon}</Avatar>
      </Paper>
    </Tooltip>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Visão Geral</Typography>
        <Paper sx={{ p: 1, display: 'flex', gap: 2 }}><CalendarTodayIcon color="action" sx={{ my: 'auto', ml: 1 }}/><DatePicker label="Início" value={startDate} onChange={setStartDate} slotProps={{ textField: { size: 'small' } }} /><DatePicker label="Fim" value={endDate} onChange={setEndDate} slotProps={{ textField: { size: 'small' } }} /></Paper>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <StatCard 
            title="Saldo em Caixa (Disponível)" 
            value={report.saldoAtual} 
            icon={<AccountBalanceWalletIcon />} 
            color="#fff" 
            highlight 
            onDoubleClick={handleOpenBalanceModal}
            tooltip="Dê um duplo clique para ajustar o Saldo Inicial"
          />
        </Grid>
      </Grid>
      
      <Typography variant="h6" gutterBottom>Performance do Período</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}><StatCard title="Receita" value={report.totalReceita} icon={<AttachMoneyIcon />} color="#27ae60" /></Grid>
        <Grid item xs={12} sm={4}><StatCard title="Custos" value={report.totalCusto} icon={<TrendingDownIcon />} color="#e74c3c" /></Grid>
        <Grid item xs={12} sm={4}><StatCard title="Lucro Líquido" value={report.totalLucro} icon={<TrendingUpIcon />} color="#2980b9" /></Grid>
      </Grid>

      {/* MODAL PARA EDITAR SALDO INICIAL */}
      <Dialog open={isBalanceModalOpen} onClose={() => setIsBalanceModalOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color="primary" /> Ajustar Capital Inicial
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Defina o valor inicial com que a empresa começou. O sistema somará as vendas e subtrairá as compras a partir deste valor.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Saldo Inicial (R$)"
            type="number"
            fullWidth
            variant="outlined"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsBalanceModalOpen(false)} color="secondary">Cancelar</Button>
          <Button onClick={handleSaveBalance} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default App;