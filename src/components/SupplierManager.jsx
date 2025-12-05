import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Grid, TablePagination, InputAdornment, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

function SupplierManager() {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ nome_fantasia: '', cnpj_cpf: '', telefone: '' });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { dataVersion, showToast, onDataChanged } = useOutletContext();

  // Estados de Busca e Paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

 
  useEffect(() => {
    if (hasSearched) {
      handleSearch();
    }
  }, [dataVersion]); 

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);

    let query = supabase
      .from('fornecedores')
      .select('*')
      .order('nome_fantasia');

    // Filtra no Banco (Nome OU CNPJ)
    if (searchTerm) {
      query = query.or(`nome_fantasia.ilike.%${searchTerm}%,cnpj_cpf.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Erro:', error);
      showToast('Erro ao buscar: ' + error.message, 'error');
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let error = null;
    if (editingId) {
      const res = await supabase.from('fornecedores').update(formData).match({ id: editingId });
      error = res.error;
    } else {
      const res = await supabase.from('fornecedores').insert([formData]);
      error = res.error;
    }

    if (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    } else {
      showToast('Sucesso!', 'success');
      handleCloseModal();
      onDataChanged(); 
    }
  };

  const handleDelete = async (supplierId) => {
    const { data } = await supabase.from('produtos').select('id').eq('id_fornecedor', supplierId).limit(1);
    if (data && data.length > 0) {
      showToast('Não é possível excluir: Fornecedor em uso.', 'warning');
      return;
    }
    if (window.confirm('Tem certeza?')) {
      const { error } = await supabase.from('fornecedores').delete().match({ id: supplierId });
      if (error) showToast('Erro ao excluir: ' + error.message, 'error');
      else {
        showToast('Excluído!', 'success');
        onDataChanged();
      }
    }
  };

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditingId(supplier.id);
      setFormData({
        nome_fantasia: supplier.nome_fantasia,
        cnpj_cpf: supplier.cnpj_cpf || '',
        telefone: supplier.telefone || ''
      });
    } else {
      setEditingId(null);
      setFormData({ nome_fantasia: '', cnpj_cpf: '', telefone: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Gestão de Fornecedores
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Novo Fornecedor
        </Button>
      </Box>

      {/* Área de Pesquisa */}
      <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Pesquisar por Nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={handleSearch}
              sx={{ height: '56px' }}
            >
              Pesquisar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>CNPJ/CPF</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Telefone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!hasSearched ? (
                 <TableRow>
                   <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                     Utilize a busca acima para encontrar fornecedores.
                   </TableCell>
                 </TableRow>
              ) : loading ? (
                <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>Nenhum fornecedor encontrado.</TableCell></TableRow>
              ) : (
                suppliers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((supplier) => (
                  <TableRow key={supplier.id} hover>
                    <TableCell component="th" scope="row">{supplier.nome_fantasia}</TableCell>
                    <TableCell>{supplier.cnpj_cpf}</TableCell>
                    <TableCell>{supplier.telefone}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpenModal(supplier)}><EditIcon /></IconButton>
                      <IconButton color="secondary" onClick={() => handleDelete(supplier.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={suppliers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas:"
        />
      </Paper>

      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingId ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}
          <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} id="supplier-form" sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField label="Nome" name="nome_fantasia" value={formData.nome_fantasia} onChange={handleFormChange} required fullWidth variant="outlined" autoFocus />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="CNPJ/CPF" name="cnpj_cpf" value={formData.cnpj_cpf} onChange={handleFormChange} fullWidth variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Telefone" name="telefone" value={formData.telefone} onChange={handleFormChange} fullWidth variant="outlined" />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
          <Button type="submit" form="supplier-form" variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default SupplierManager;