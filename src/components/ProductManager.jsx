import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Grid, Paper, Typography, TextField, Button, Select, MenuItem, 
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, 
  IconButton, TablePagination, InputAdornment, Chip, Tooltip, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

function ProductManager() {
  const { dataVersion, onDataChanged, showToast } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({ 
    nome: '', preco_venda: '', id_fornecedor: '', id_categoria: '', estoque_minimo: 0, preco_custo: ''
  });
  
  // Estados para controle de Modais
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de Cadastro
  const [isInactivateModalOpen, setIsInactivateModalOpen] = useState(false); // Modal de Inativação

  // Estados para a lógica de Inativação
  const [productToInactivate, setProductToInactivate] = useState(null);
  const [inactivationAction, setInactivationAction] = useState('MANTER'); // MANTER, PERDA, VENDA
  const [clearancePrice, setClearancePrice] = useState(''); // Preço da venda final

  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      const { data: prods } = await supabase.from('produtos').select(`*, fornecedores(nome_fantasia), categorias(nome)`).order('nome');
      const { data: movs } = await supabase.from('movimentacoes_estoque').select('id_produto, tipo, quantidade');
      const { data: sups } = await supabase.from('fornecedores').select('*');
      const { data: cats } = await supabase.from('categorias').select('*');

      if (prods && movs) {
        const calculated = prods.map(p => {
          const pMoves = movs.filter(m => m.id_produto === p.id);
          const inQ = pMoves.filter(m => m.tipo === 'ENTRADA').reduce((a, b) => a + b.quantidade, 0);
          const outQ = pMoves.filter(m => m.tipo === 'SAIDA').reduce((a, b) => a + b.quantidade, 0);
          const saldoFinal = Math.max(0, inQ - outQ);
          return { ...p, saldo: saldoFinal };
        });
        setProducts(calculated);
      }
      if (sups) setSuppliers(sups);
      if (cats) setCategories(cats);
    };
    fetchData();
  }, [dataVersion]);

  const handleFormChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  // Salvar Produto (Novo ou Edição)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, id_fornecedor: formData.id_fornecedor || null, id_categoria: formData.id_categoria || null, preco_custo: formData.preco_custo || 0, ativo: true };
    
    let error = null;
    if (editingId) {
      const res = await supabase.from('produtos').update(data).match({ id: editingId });
      error = res.error;
    } else {
      const res = await supabase.from('produtos').insert([data]);
      error = res.error;
    }

    if (error) showToast('Erro: ' + error.message, 'error');
    else {
      showToast('Salvo com sucesso!', 'success');
      handleCloseModal();
      onDataChanged();
    }
  };

  // --- LÓGICA DE INATIVAÇÃO ---
  
  // 1. Botão Clicado: Decide se abre o Modal Especial ou só troca o status
  const handleArchiveClick = async (product) => {
    // Se estiver inativo e quiser ativar, é direto
    if (!product.ativo) {
      await supabase.from('produtos').update({ ativo: true }).eq('id', product.id);
      showToast('Produto reativado!', 'success');
      onDataChanged();
      return;
    }

    // Se for inativar, verifica o estoque e histórico
    const { data: moves } = await supabase.from('movimentacoes_estoque').select('id').eq('id_produto', product.id).limit(1);
    const temHistorico = moves && moves.length > 0;

    if (!temHistorico) {
      // Sem histórico = Excluir direto
      if (confirm('Este produto nunca foi usado. Deseja excluir permanentemente?')) {
        await supabase.from('produtos').delete().eq('id', product.id);
        showToast('Excluído!', 'success');
        onDataChanged();
      }
      return;
    }

    // Tem histórico. Verifica se tem saldo positivo.
    if (product.saldo > 0) {
      // TEM SALDO: Abre o Modal Especial para decidir o destino
      setProductToInactivate(product);
      setInactivationAction('MANTER'); // Padrão
      setClearancePrice(product.preco_venda); // Sugere preço atual
      setIsInactivateModalOpen(true);
    } else {
      // Saldo zero: Só inativa
      if (confirm('Produto com saldo zerado. Deseja arquivar (inativar)?')) {
        await supabase.from('produtos').update({ ativo: false }).eq('id', product.id);
        showToast('Produto arquivado!', 'success');
        onDataChanged();
      }
    }
  };

  // 2. Confirmação do Modal Especial
  const confirmInactivation = async () => {
    const prod = productToInactivate;
    
    if (inactivationAction === 'PERDA') {
      // Gera saída por perda/consumo
      await supabase.from('movimentacoes_estoque').insert([{
        id_produto: prod.id, tipo: 'SAIDA', quantidade: prod.saldo, motivo: 'Baixa por Inativação (Consumo/Perda)'
      }]);
    } else if (inactivationAction === 'VENDA') {
     
      if (parseFloat(clearancePrice) !== prod.preco_venda) {
          await supabase.from('produtos').update({ preco_venda: clearancePrice }).eq('id', prod.id);
      }

      await supabase.from('movimentacoes_estoque').insert([{
        id_produto: prod.id, tipo: 'SAIDA', quantidade: prod.saldo, motivo: 'Baixa por Inativação (Venda Final)'
      }]);
    }

    // Finalmente, inativa o produto
    await supabase.from('produtos').update({ ativo: false }).eq('id', prod.id);
    
    showToast('Produto zerado e arquivado com sucesso!', 'success');
    setIsInactivateModalOpen(false);
    onDataChanged();
  };

  // ---------------------------

  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingId(prod.id);
      setFormData({ 
        nome: prod.nome, preco_venda: prod.preco_venda, id_fornecedor: prod.id_fornecedor || '', 
        id_categoria: prod.id_categoria || '', estoque_minimo: prod.estoque_minimo || 0, preco_custo: prod.preco_custo || '' 
      });
    } else {
      setEditingId(null);
      setFormData({ nome: '', preco_venda: '', id_fornecedor: '', id_categoria: '', estoque_minimo: 0, preco_custo: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const filtered = products.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Produtos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Novo</Button>
      </Box>
      <Paper elevation={3} sx={{ mb: 2, p: 2 }}><TextField fullWidth variant="outlined" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} /></Paper>
      
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell><b>Produto</b></TableCell>
              <TableCell align="center"><b>Status</b></TableCell>
              <TableCell><b>Categoria</b></TableCell>
              <TableCell align="center"><b>Saldo</b></TableCell>
              <TableCell align="right"><b>Custo</b></TableCell>
              <TableCell align="right"><b>Venda</b></TableCell>
              <TableCell align="center"><b>Ações</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
            <TableRow key={row.id} hover sx={{ opacity: row.ativo ? 1 : 0.6, bgcolor: row.ativo ? 'inherit' : '#fafafa' }}>
              <TableCell>{row.nome}</TableCell>
              <TableCell align="center">{row.ativo ? <Chip label="Ativo" color="success" size="small" /> : <Chip label="Inativo" size="small" />}</TableCell>
              <TableCell>{row.categorias?.nome || '-'}</TableCell>
              <TableCell align="center"><Typography fontWeight="bold" color={row.saldo <= row.estoque_minimo ? 'error' : 'textPrimary'}>{row.saldo}</Typography></TableCell>
              <TableCell align="right">{fmt(row.preco_custo)}</TableCell><TableCell align="right">{fmt(row.preco_venda)}</TableCell>
              <TableCell align="center">
                <Tooltip title="Editar"><IconButton color="primary" onClick={() => handleOpenModal(row)}><EditIcon /></IconButton></Tooltip>
                <Tooltip title={row.ativo ? "Inativar" : "Reativar"}>
                  <IconButton color={row.ativo ? "error" : "success"} onClick={() => handleArchiveClick(row)}>
                    {row.ativo ? <DeleteIcon /> : <UnarchiveIcon />}
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
        <TablePagination rowsPerPageOptions={[10, 25]} component="div" count={filtered.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, n) => setPage(n)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))} />
      </TableContainer>

      {/* MODAL DE CADASTRO (Normal) */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Editar' : 'Cadastrar'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} id="form" sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField label="Nome" name="nome" value={formData.nome} onChange={handleFormChange} fullWidth required variant="outlined" /></Grid>
              <Grid item xs={6}><TextField type="number" label="Custo (R$)" name="preco_custo" value={formData.preco_custo} onChange={handleFormChange} fullWidth variant="outlined" /></Grid>
              <Grid item xs={6}><TextField type="number" label="Venda (R$)" name="preco_venda" value={formData.preco_venda} onChange={handleFormChange} required fullWidth variant="outlined" /></Grid>
              <Grid item xs={6}><TextField type="number" label="Estoque Mínimo" name="estoque_minimo" value={formData.estoque_minimo} onChange={handleFormChange} fullWidth variant="outlined" /></Grid>
              <Grid item xs={6}><FormControl fullWidth variant="outlined"><InputLabel>Categoria</InputLabel><Select label="Categoria" name="id_categoria" value={formData.id_categoria} onChange={handleFormChange}><MenuItem value=""><em>Nenhuma</em></MenuItem>{categories.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12}><FormControl fullWidth variant="outlined"><InputLabel>Fornecedor</InputLabel><Select label="Fornecedor" name="id_fornecedor" value={formData.id_fornecedor} onChange={handleFormChange}><MenuItem value=""><em>Nenhum</em></MenuItem>{suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.nome_fantasia}</MenuItem>)}</Select></FormControl></Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={handleCloseModal}>Cancelar</Button><Button type="submit" form="form" variant="contained">Salvar</Button></DialogActions>
      </Dialog>

      {/*  ESPECIAL DE INATIVAÇÃO (Destino do Estoque) */}
      <Dialog open={isInactivateModalOpen} onClose={() => setIsInactivateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            Atenção: Produto com Estoque!
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom>
                O produto <strong>{productToInactivate?.nome}</strong> ainda possui <strong>{productToInactivate?.saldo} unidades</strong> em estoque.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
                O que você deseja fazer com esses itens antes de inativar?
            </Typography>

            <FormControl component="fieldset">
                <RadioGroup
                    value={inactivationAction}
                    onChange={(e) => setInactivationAction(e.target.value)}
                >
                    <FormControlLabel 
                        value="MANTER" 
                        control={<Radio />} 
                        label="Manter saldo (apenas inativar para novas vendas)" 
                    />
                    <FormControlLabel 
                        value="PERDA" 
                        control={<Radio />} 
                        label="Baixar como Consumo Próprio / Perda (Custo R$ 0)" 
                    />
                    <FormControlLabel 
                        value="VENDA" 
                        control={<Radio />} 
                        label="Realizar Venda Final (Queima de Estoque)" 
                    />
                </RadioGroup>
            </FormControl>

            {inactivationAction === 'VENDA' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption">Defina o preço unitário para esta venda final:</Typography>
                    <TextField 
                        label="Preço Unitário (R$)" 
                        type="number" 
                        fullWidth 
                        variant="outlined" 
                        value={clearancePrice}
                        onChange={(e) => setClearancePrice(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </Box>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setIsInactivateModalOpen(false)}>Cancelar</Button>
            <Button variant="contained" color="warning" onClick={confirmInactivation}>
                Confirmar Inativação
            </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
export default ProductManager;