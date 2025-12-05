import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';

function StockMovementManager() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [summary, setSummary] = useState({ 
    count: 0, totalQtyIn: 0, totalQtyOut: 0, totalInvestido: 0, totalLucro: 0
  });

  const [filters, setFilters] = useState({
    productId: '',
    categoryId: '', 
    type: '',
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories(); 
  }, []); 

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('produtos').select('id, nome');
    if (!error) setProducts(data);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    if (!error) setCategories(data);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calculateLineValue = (mov) => {
    if (!mov.produtos) return 0;
    if (mov.tipo === 'ENTRADA') {
      return mov.quantidade * (mov.produtos.preco_custo || 0);
    } else {
      const lucroUnitario = (mov.produtos.preco_venda || 0) - (mov.produtos.preco_custo || 0);
      return mov.quantidade * lucroUnitario;
    }
  };

  const calculateSummary = (data) => {
    let qtyIn = 0;
    let qtyOut = 0;
    let investido = 0;
    let lucro = 0;

    data.forEach(mov => {
      const valorLinha = calculateLineValue(mov);
      if (mov.tipo === 'ENTRADA') {
        qtyIn += mov.quantidade;
        investido += valorLinha;
      } else if (mov.tipo === 'SAIDA') {
        qtyOut += mov.quantidade;
        lucro += valorLinha;
      }
    });

    setSummary({
      count: data.length,
      totalQtyIn: qtyIn,
      totalQtyOut: qtyOut,
      totalInvestido: investido,
      totalLucro: lucro
    });
  };

  const handleSearch = async () => {
    setLoading(true);
    setMovements([]); 

    let query = supabase
      .from('movimentacoes_estoque')
      .select(`
        *, 
        produtos!inner (
          nome, 
          preco_venda, 
          preco_custo,
          id_categoria,
          categorias (
            nome
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.productId) query = query.eq('id_produto', filters.productId);
    
    if (filters.categoryId) query = query.eq('produtos.id_categoria', filters.categoryId);
    
    if (filters.type) query = query.eq('tipo', filters.type);
    if (filters.startDate) query = query.gte('created_at', filters.startDate.toISOString());
    if (filters.endDate) query = query.lte('created_at', filters.endDate.toISOString());

    const { data, error } = await query;

    if (error) {
      alert('Erro: ' + error.message);
    } else {
      setMovements(data);
      calculateSummary(data);
    }
    setLoading(false);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AssessmentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Relatório de Movimentações
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4, borderLeft: '6px solid #3498db' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterAltIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="500">Filtros do Relatório</Typography>
        </Box>
        
        <Grid container spacing={3} alignItems="center">
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Produto</InputLabel>
              <Select
                name="productId"
                value={filters.productId}
                label="Produto"
                onChange={handleFilterChange}
              >
                <MenuItem value=""><em>Todos os Produtos</em></MenuItem>
                {products.map(p => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select
                name="categoryId"
                value={filters.categoryId}
                label="Categoria"
                onChange={handleFilterChange}
              >
                <MenuItem value=""><em>Todas as Categorias</em></MenuItem>
                {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.nome}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                name="type"
                value={filters.type}
                label="Tipo"
                onChange={handleFilterChange}
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                <MenuItem value="ENTRADA">Compras</MenuItem>
                <MenuItem value="SAIDA">Vendas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro de Data DE */}
          <Grid item xs={12} sm={6} md={4}>
            <DatePicker
              label="De"
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
              value={filters.startDate}
              onChange={(newValue) => setFilters(prev => ({ ...prev, startDate: newValue }))}
            />
          </Grid>

          {/* Filtro de Data ATÉ */}
          <Grid item xs={12} sm={6} md={4}>
            <DatePicker
              label="Até"
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
              value={filters.endDate}
              onChange={(newValue) => setFilters(prev => ({ ...prev, endDate: newValue }))}
            />
          </Grid>

          {/* Botão Gerar */}
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleSearch} 
              disabled={loading}
              startIcon={<SearchIcon />}
              sx={{ height: '40px' }}
            >
              Gerar Relatório
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {movements.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: '#e3f2fd', textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Registros</Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">{summary.count}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: '#e8f5e9', textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Investimento Total</Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {formatCurrency(summary.totalInvestido)}
              </Typography>
              <Typography variant="caption">({summary.totalQtyIn} itens)</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: '#ffebee', textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Lucro Total</Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">
                {formatCurrency(summary.totalLucro)}
              </Typography>
              <Typography variant="caption">({summary.totalQtyOut} itens)</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Data/Hora</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Operação</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Categoria</TableCell> 
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Qtd.</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Financeiro</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Motivo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
            ) : movements.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>Nenhum registro encontrado. Use os filtros.</TableCell></TableRow>
            ) : (
              movements.map((mov) => (
                <TableRow key={mov.id} hover>
                  <TableCell>{formatDateTime(mov.created_at)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={mov.tipo === 'ENTRADA' ? 'COMPRA' : 'VENDA'} 
                      color={mov.tipo === 'ENTRADA' ? 'success' : 'error'} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'bold', minWidth: 80 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {mov.produtos ? mov.produtos.nome : 'Excluído'}
                  </TableCell>
                  <TableCell>
                    {mov.produtos?.categorias ? mov.produtos.categorias.nome : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '1.1rem' }}>
                    {mov.quantidade}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold" 
                        color={mov.tipo === 'ENTRADA' ? 'text.secondary' : 'primary.main'}
                      >
                        {mov.tipo === 'ENTRADA' 
                          ? `-${formatCurrency(calculateLineValue(mov))}`
                          : `+${formatCurrency(calculateLineValue(mov))}`
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {mov.tipo === 'ENTRADA' ? 'Investimento' : 'Lucro'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    {mov.motivo || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default StockMovementManager;