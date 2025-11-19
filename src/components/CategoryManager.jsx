import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOutletContext } from 'react-router-dom';

import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
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
import CategoryIcon from '@mui/icons-material/Category';

function CategoryManager() {
  const { dataVersion, onDataChanged } = useOutletContext();
  
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ nome: '' });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [dataVersion]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    if (error) console.error('Erro ao buscar categorias:', error.message);
    else setCategories(data);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await supabase.from('categorias').update(formData).match({ id: editingId });
    } else {
      await supabase.from('categorias').insert([formData]);
    }
    handleCloseModal();
    fetchCategories();
    
  };

  const handleDelete = async (id) => {
    // Verifica se existem produtos usando esta categoria
    const { data } = await supabase.from('produtos').select('id').eq('id_categoria', id).limit(1);
    
    if (data && data.length > 0) {
      alert('Não é possível excluir: Existem produtos vinculados a esta categoria.');
      return;
    }

    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await supabase.from('categorias').delete().match({ id });
      fetchCategories();
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Gestão de Categorias
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenModal()}
          sx={{ py: 1.5, px: 3 }}
        >
          Nova Categoria
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3} variant="outlined">
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nome da Categoria</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id} hover>
                <TableCell component="th" scope="row" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon color="action" fontSize="small" />
                  {cat.nome}
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenModal(cat)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(cat.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} id="cat-form" sx={{ pt: 2 }}>
            <TextField 
              label="Nome da Categoria" 
              fullWidth 
              variant="outlined" 
              value={formData.nome}
              onChange={(e) => setFormData({ nome: e.target.value })}
              required
              autoFocus
            />
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