import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Box, Paper, Typography, TextField, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, CircularProgress, Chip, InputAdornment,
  Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

function InventoryReport() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Estado para categorias
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // KPI
  const [totalStockValue, setTotalStockValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Busca Categorias (para o filtro)
      const { data: cats } = await supabase.from('categorias').select('*').order('nome');
      if (cats) setCategories(cats);

      // 2. Busca Produtos ATIVOS e Movimentações
      const { data: prods } = await supabase
        .from('produtos')
        .select(`*, categorias (nome)`)
        .eq('ativo', true) 
        .order('nome');

      const { data: movs } = await supabase
        .from('movimentacoes_estoque')
        .select('id_produto, tipo, quantidade');

      if (prods && movs) {
        let totalValue = 0;

        const inventory = prods.map(product => {
          const pMoves = movs.filter(m => m.id_produto === product.id);
          
          const totalIn = pMoves.filter(m => m.tipo === 'ENTRADA').reduce((acc, cur) => acc + cur.quantidade, 0);
          const totalOut = pMoves.filter(m => m.tipo === 'SAIDA').reduce((acc, cur) => acc + cur.quantidade, 0);
          
          const saldo = Math.max(0, totalIn - totalOut); 
          const valorEstoque = saldo * (product.preco_custo || 0);
          
          totalValue += valorEstoque;

          return { ...product, saldo, valorEstoque };
        });
        
        setProducts(inventory);
        setTotalStockValue(totalValue);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Lógica de Filtragem (Nome E Categoria)
  const filtered = products.filter(p => {
    const matchesName = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? p.id_categoria === categoryFilter : true;
    return matchesName && matchesCategory;
  });
  
  const formatCurrency = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight="bold">Relatório de Estoque</Typography>
        </Box>
        
        {/* Card de KPI */}
        <Paper elevation={3} sx={{ p: 2, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">VALOR EM ESTOQUE</Typography>
          <Typography variant="h5" color="primary.main" fontWeight="bold">
            {formatCurrency(totalStockValue)}
          </Typography>
        </Paper>
      </Box>

      {/* ÁREA DE FILTROS (Novo Layout) */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterAltIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="500">Filtros</Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Campo de Busca por Nome */}
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Pesquisar Produto"
              variant="outlined"
              placeholder="Digite o nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
          </Grid>

          {/* Dropdown de Categoria */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="cat-filter-label">Filtrar por Categoria</InputLabel>
              <Select
                labelId="cat-filter-label"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Filtrar por Categoria"
              >
                <MenuItem value=""><em>Todas</em></MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* TABELA */}
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Categoria</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Saldo (Qtd)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor em Estoque (Custo)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>Nenhum produto encontrado.</TableCell></TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{row.nome}</TableCell>
                  <TableCell>{row.categorias?.nome || '-'}</TableCell>
                  
                  <TableCell align="center">
                    <Typography fontWeight="bold" fontSize="1.2rem">{row.saldo}</Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    {row.estoque_minimo > 0 && row.saldo <= row.estoque_minimo && row.saldo > 0 ? (
                      <Chip label="BAIXO" color="warning" size="small" sx={{ fontWeight: 'bold' }} />
                    ) : row.saldo > 0 ? (
                      <Chip label="OK" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                    ) : (
                      <Chip label="ZERADO" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                    )}
                  </TableCell>
                  
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {formatCurrency(row.valorEstoque)}
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

export default InventoryReport;