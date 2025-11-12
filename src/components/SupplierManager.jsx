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

function SupplierManager() {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ 
    nome_fantasia: '', 
    cnpj_cpf: '', 
    telefone: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { dataVersion } = useOutletContext();

  useEffect(() => {
    fetchSuppliers();
  }, [dataVersion]); 

  const fetchSuppliers = async () => {
    const { data, error } = await supabase.from('fornecedores').select('*');
    if (error) console.error('Erro ao buscar fornecedores:', error.message);
    else setSuppliers(data);
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

    if (editingId) {
      const { error } = await supabase
        .from('fornecedores')
        .update(formData)
        .match({ id: editingId });

      if (error) {
        alert('Erro ao atualizar fornecedor: ' + error.message);
      } else {
        alert('Fornecedor atualizado com sucesso!');
      }
    } else {
      const { data, error } = await supabase
        .from('fornecedores')
        .insert([formData]);

      if (error) {
        alert('Erro ao adicionar fornecedor: ' + error.message);
      } else {
        alert('Fornecedor adicionado com sucesso!');
      }
    }
    
    handleCloseModal();
    fetchSuppliers();
  };

  const handleDelete = async (supplierId) => {
    const { data, error } = await supabase
      .from('produtos')
      .select('id')
      .eq('id_fornecedor', supplierId)
      .limit(1);

    if (data && data.length > 0) {
      alert('Não é possível excluir este fornecedor, pois ele está associado a um ou mais produtos.');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      const { error: deleteError } = await supabase
        .from('fornecedores')
        .delete()
        .match({ id: supplierId });

      if (deleteError) {
        alert('Erro ao excluir fornecedor: ' + deleteError.message);
      } else {
        alert('Fornecedor excluído com sucesso!');
        fetchSuppliers();
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
      setFormData({ 
        nome_fantasia: '', 
        cnpj_cpf: '', 
        telefone: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Gestão de Fornecedores
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ py: 1.5, px: 3 }}
        >
          Novo Fornecedor
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3} variant="outlined">
        <Table sx={{ minWidth: 650 }} aria-label="Tabela de Fornecedores">
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nome Fantasia</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CNPJ/CPF</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Telefone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} hover>
                <TableCell component="th" scope="row">
                  {supplier.nome_fantasia}
                </TableCell>
                <TableCell>{supplier.cnpj_cpf}</TableCell>
                <TableCell>{supplier.telefone}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenModal(supplier)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDelete(supplier.id)}>
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
          {editingId ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} id="supplier-form" sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Nome Fantasia"
                  name="nome_fantasia"
                  value={formData.nome_fantasia}
                  onChange={handleFormChange}
                  required 
                  fullWidth 
                  variant="standard"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CNPJ/CPF"
                  name="cnpj_cpf" 
                  value={formData.cnpj_cpf} 
                  onChange={handleFormChange}
                  fullWidth 
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone"
                  name="telefone" 
                  value={formData.telefone} 
                  onChange={handleFormChange}
                  fullWidth 
                  variant="standard"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
          <Button 
            type="submit" 
            form="supplier-form" 
            variant="contained"
          >
            {editingId ? 'Salvar Alterações' : 'Salvar Fornecedor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SupplierManager;