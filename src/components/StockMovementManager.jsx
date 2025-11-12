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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

function ProductManager() {
  const { dataVersion, onDataChanged } = useOutletContext();
  
  const [productsWithStock, setProductsWithStock] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allMovements, setAllMovements] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [formData, setFormData] = useState({ 
    nome: '', 
    preco_venda: '', 
    id_fornecedor: '', 
    estoque_minimo: 0,
    preco_custo: ''
  });
  
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const calculateStock = () => {
      const calculatedData = allProducts.map(product => {
        const movementsForProduct = allMovements.filter(mov => mov.id_produto === product.id);
        const totalEntrada = movementsForProduct.filter(mov => mov.tipo === 'ENTRADA').reduce((sum, mov) => sum + mov.quantidade, 0);
        const totalSaida = movementsForProduct.filter(mov => mov.tipo === 'SAIDA').reduce((sum, mov) => sum + mov.quantidade, 0);
        const estoqueAtual = totalEntrada - totalSaida;
        return { ...product, estoqueAtual: estoqueAtual };
      });
      setProductsWithStock(calculatedData);
    };
    calculateStock();
  }, [allProducts, allMovements]);

  
  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchMovements();
  }, [dataVersion]); 

  
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('produtos').select(`*, fornecedores (nome_fantasia)`);
    if (error) console.error('Erro ao buscar produtos:', error.message);
    else setAllProducts(data);
  };
  const fetchSuppliers = async () => {
    const { data, error } = await supabase.from('fornecedores').select('*');
    if (error) console.error('Erro ao buscar fornecedores:', error.message);
    else setSuppliers(data);
  };
  const fetchMovements = async () => {
    const { data, error } = await supabase.from('movimentacoes_estoque').select('id_produto, tipo, quantidade');
    if (error) console.error('Erro ao buscar movimentações:', error.message);
    else setAllMovements(data);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const productData = {
      nome: formData.nome,
      preco_venda: formData.preco_venda,
      id_fornecedor: formData.id_fornecedor || null,
      estoque_minimo: formData.estoque_minimo || 0,
      preco_custo: formData.preco_custo || 0
    };

    if (editingId) {
      const { error } = await supabase.from('produtos').update(productData).match({ id: editingId });
      if (error) alert('Erro ao atualizar produto: ' + error.message);
      else alert('Produto atualizado com sucesso!');
    } else {
      const { error } = await supabase.from('produtos').insert([productData]);
      if (error) alert('Erro ao adicionar produto: ' + error.message);
      else alert('Produto adicionado com sucesso!');
    }
    
    handleCloseModal();
    onDataChanged(); 
  };

  const handleDelete = async (productId) => {
    const { data: movements, error: moveError } = await supabase.from('movimentacoes_estoque').select('id').eq('id_produto', productId).limit(1);
    if (moveError) { alert('Erro ao verificar movimentações: ' + moveError.message); return; }
    if (movements && movements.length > 0) { alert('Não é possível excluir este produto, pois ele já possui movimentações de estoque.'); return; }

    if (window.confirm('Tem certeza que deseja excluir este produto? (Ação irreversível)')) {
      const { error } = await supabase.from('produtos').delete().match({ id: productId });
      if (error) alert('Erro ao excluir produto: ' + error.message);
      else {
        alert('Produto excluído com sucesso!');
        onDataChanged();
      }
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({ 
        nome: product.nome, 
        preco_venda: product.preco_venda,
        id_fornecedor: product.id_fornecedor || '',
        estoque_minimo: product.estoque_minimo || 0,
        preco_custo: product.preco_custo || ''
      });
    } else {
      setEditingId(null);
      setFormData({ 
        nome: '', 
        preco_venda: '', 
        id_fornecedor: '', 
        estoque_minimo: 0,
        preco_custo: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };
  
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Gestão de Produtos
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ py: 1.5, px: 3 }}
        >
          Novo Produto
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3} variant="outlined">
        <Table sx={{ minWidth: 650 }} aria-label="Tabela de Produtos">
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Saldo Atual</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Estoque Mínimo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Preço de Custo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Preço de Venda</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fornecedor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productsWithStock.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell component="th" scope="row">
                  {product.nome}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ 
                    fontWeight: 'bold', 
                    color: (product.estoque_minimo > 0 && product.estoqueAtual <= product.estoque_minimo) ? 'error.main' : 'text.primary'
                  }}>
                    {product.estoqueAtual}
                    {(product.estoque_minimo > 0 && product.estoqueAtual <= product.estoque_minimo) && ' (BAIXO!)'}
                  </Typography>
                </TableCell>
                <TableCell align="right">{product.estoque_minimo}</TableCell>
                <TableCell align="right">{formatCurrency(product.preco_custo)}</TableCell>
                <TableCell align="right">{formatCurrency(product.preco_venda)}</TableCell>
                <TableCell>{product.fornecedores ? product.fornecedores.nome_fantasia : '—'}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenModal(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDelete(product.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} id="product-form" sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Nome do Produto"
                  name="nome"
                  value={formData.nome}
                  onChange={handleFormChange}
                  required 
                  fullWidth 
                  variant="standard"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number" 
                  label="Preço de Custo (R$)"
                  name="preco_custo" 
                  value={formData.preco_custo} 
                  onChange={handleFormChange}
                  fullWidth 
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number" 
                  label="Preço de Venda (R$)"
                  name="preco_venda" 
                  value={formData.preco_venda} 
                  onChange={handleFormChange}
                  required 
                  fullWidth 
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number" 
                  label="Estoque Mínimo"
                  name="estoque_minimo" 
                  value={formData.estoque_minimo} 
                  onChange={handleFormChange}
                  fullWidth 
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="standard">
                  <InputLabel id="fornecedor-select-label">Fornecedor</InputLabel>
                  <Select
                    labelId="fornecedor-select-label"
                    name="id_fornecedor"
                    value={formData.id_fornecedor}
                    onChange={handleFormChange}
                    label="Fornecedor"
                  >
                    <MenuItem value=""><em>Nenhum</em></MenuItem>
                    {suppliers.map(supplier => (
                      <MenuItem key={supplier.id} value={supplier.id}>{supplier.nome_fantasia}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
          <Button 
            type="submit" 
            form="product-form" 
            variant="contained"
          >
            {editingId ? 'Salvar Alterações' : 'Salvar Produto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductManager;