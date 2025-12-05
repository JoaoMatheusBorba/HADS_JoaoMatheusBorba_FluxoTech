import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOutletContext } from 'react-router-dom';

import { 
  Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, TablePagination, InputAdornment, Grid, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';

function CategoryManager() {
  const { dataVersion, onDataChanged, showToast } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ nome: '' });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para Pesquisa e Paginação
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
      .from('categorias')
      .select('*')
      .order('nome');
    
    // Filtra no Banco
    if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error(error);
    } else {
        setCategories(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await supabase.from('categorias').update(formData).match({ id: editingId });
    } else {
      await supabase.from('categorias').insert([formData]);
    }
    handleCloseModal();
    onDataChanged(); // Recarrega a lista se já estiver buscada
  };

  const handleDelete = async (id) => {
    const { data } = await supabase.from('produtos').select('id').eq('id_categoria', id).limit(1);
    if (data && data.length > 0) {
      alert('Não é possível excluir: Existem produtos nesta categoria.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('categorias').delete().match({ id });
      onDataChanged();
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ nome: category.nome });
    } else {
      setEditingId(null);
      setFormData({ nome: '' });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
          Gestão de Categorias
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Nova Categoria
        </Button>
      </Box>

      {/* Área de Pesquisa */}
      <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Pesquisar categoria..."
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
          <Table stickyHeader aria-label="sticky table">
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nome da Categoria</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!hasSearched ? (
                 <TableRow>
                   <TableCell colSpan={2} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                     Faça uma pesquisa para ver as categorias.
                   </TableCell>
                 </TableRow>
              ) : loading ? (
                <TableRow><TableCell colSpan={2} align="center"><CircularProgress /></TableCell></TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 3 }}>Nenhuma categoria encontrada.</TableCell>
                </TableRow>
              ) : (
                categories
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((cat) => (
                  <TableRow key={cat.id} hover>
                    <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon color="action" fontSize="small" />
                            {cat.nome}
                        </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpenModal(cat)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(cat.id)}><DeleteIcon /></IconButton>
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
          count={categories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
        />
      </Paper>

      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} id="cat-form" sx={{ pt: 2 }}>
            <TextField label="Nome" fullWidth variant="outlined" value={formData.nome} onChange={(e) => setFormData({ nome: e.target.value })} required autoFocus />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
          <Button type="submit" form="cat-form" variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default CategoryManager;