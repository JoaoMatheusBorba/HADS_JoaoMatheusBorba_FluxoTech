import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOutletContext } from 'react-router-dom';

import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  TextField, 
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
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';

function StockMovementManager() {
  const { onDataChanged } = useOutletContext();
  
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    productId: '',
    type: '',
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    fetchProducts();
  }, []); 

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('produtos').select('id, nome');
    if (error) console.error('Erro ao buscar produtos:', error.message);
    else setProducts(data);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setMovements([]); 

    let query = supabase
      .from('movimentacoes_estoque')
      .select(`
        *, 
        produtos (
          nome, 
          preco_venda, 
          preco_custo
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.productId) {
      query = query.eq('id_produto', filters.productId);
    }
    if (filters.type) {
      query = query.eq('tipo', filters.type);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      alert('Erro ao buscar movimentações: ' + error.message);
    } else {
      setMovements(data);
    }
    setLoading(false);
  };

  const formatDateTime = (dateTimeString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleString('pt-BR', options);
  };
  
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calculateProfit = (sale) => {
    if (!sale.produtos) return 0;
    const precoVenda = sale.produtos.preco_venda || 0;
    const precoCusto = sale.produtos.preco_custo || 0;
    return (precoVenda - precoCusto) * sale.quantidade;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Histórico de Movimentações
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Consultar Histórico
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }} alignItems="center">
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-produto-label">Filtrar por Produto</InputLabel>
              <Select
                labelId="filter-produto-label"
                name="productId"
                value={filters.productId}
                onChange={handleFilterChange}
                label="Filtrar por Produto"
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>{product.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-tipo-label">Filtrar por Tipo</InputLabel>
              <Select
                labelId="filter-tipo-label"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                label="Filtrar por Tipo"
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                <MenuItem value="ENTRADA">Compras</MenuItem>
                <MenuItem value="SAIDA">Vendas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="De"
              value={filters.startDate}
              onChange={(newValue) => setFilters(prev => ({ ...prev, startDate: newValue }))}
              renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="Até"
              value={filters.endDate}
              onChange={(newValue) => setFilters(prev => ({ ...prev, endDate: newValue }))}
              renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSearch} 
              sx={{ height: '56px', width: '100%' }} 
              disabled={loading} 
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} elevation={3} variant="outlined">
        <Table sx={{ minWidth: 650 }} aria-label="Resultados da Busca">
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Data/Hora</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Qtd.</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Motivo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Lucro (R$)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum resultado. Use os filtros acima para buscar.
                </TableCell>
              </TableRow>
            ) : (
              movements.map((mov) => (
                <TableRow key={mov.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{formatDateTime(mov.created_at)}</TableCell>
                  <TableCell>{mov.produtos ? mov.produtos.nome : 'Produto Deletado'}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: mov.tipo === 'SAIDA' ? 'error.main' : 'success.main'
                      }}
                    >
                      {mov.tipo === 'SAIDA' ? 'Venda' : 'Compra'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{mov.quantidade}</TableCell>
                  <TableCell>{mov.motivo}</TableCell>
                  <TableCell align="right">
                    {mov.tipo === 'SAIDA' ? (
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {formatCurrency(calculateProfit(mov))}
                      </Typography>
                    ) : (
                      '—'
                    )}
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