// src/components/SupplierManager.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function SupplierManager() {
  // Estados para a lista de fornecedores e o formulário
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ 
    nome: '', 
    cnpj_cpf: '', 
    telefone: '' 
  });
  const [editingId, setEditingId] = useState(null); // Para controlar a edição

  // Busca os fornecedores ao carregar o componente
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // READ: Função para buscar os fornecedores
  const fetchSuppliers = async () => {
    // A única mudança é aqui: .from('fornecedores')
    const { data, error } = await supabase.from('fornecedores').select('*');
    if (error) console.error('Erro ao buscar fornecedores:', error.message);
    else setSuppliers(data);
  };

  // Função para lidar com mudanças no formulário
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Função 'Submit' unificada (Cria ou Atualiza)
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editingId) {
      // UPDATE: Lógica de Atualizar
      const { error } = await supabase
        .from('fornecedores')
        .update(formData) // formData já tem os nomes corretos das colunas
        .match({ id: editingId });

      if (error) {
        alert('Erro ao atualizar fornecedor: ' + error.message);
      } else {
        alert('Fornecedor atualizado com sucesso!');
        setSuppliers(suppliers.map(s => 
          s.id === editingId ? { ...s, ...formData } : s
        ));
      }
      setEditingId(null);

    } else {
      // CREATE: Lógica de Criar
      const { data, error } = await supabase
        .from('fornecedores')
        .insert([formData])
        .select();

      if (error) {
        alert('Erro ao adicionar fornecedor: ' + error.message);
      } else {
        alert('Fornecedor adicionado com sucesso!');
        setSuppliers(prevSuppliers => [...prevSuppliers, ...data]);
      }
    }
    // Limpa o formulário
    setFormData({ nome: '', cnpj_cpf: '', telefone: '' });
  };

  // DELETE: Lógica de Excluir
  const handleDelete = async (supplierId) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      const { error } = await supabase
        .from('fornecedores')
        .delete()
        .match({ id: supplierId });

      if (error) {
        alert('Erro ao excluir fornecedor: ' + error.message);
      } else {
        alert('Fornecedor excluído com sucesso!');
        setSuppliers(suppliers.filter(s => s.id !== supplierId));
      }
    }
  };

  // Função para entrar no "modo de edição"
  const startEditing = (supplier) => {
    setEditingId(supplier.id);
    setFormData({
      nome: supplier.nome,
      cnpj_cpf: supplier.cnpj_cpf || '', // Usa '' se for null
      telefone: supplier.telefone || ''  // Usa '' se for null
    });
  };

  // Função para cancelar a edição
  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ nome: '', cnpj_cpf: '', telefone: '' });
  };

  return (
    <div>
      <hr style={{ marginTop: '30px' }} />
      <h3>{editingId ? 'Editar Fornecedor' : 'Cadastro de Fornecedores'}</h3>
      <form onSubmit={handleSubmit}>
        <label>Nome Fantasia:</label>
        <input
          type="text"
          name="nome" // Deve ser igual ao nome da coluna
          value={formData.nome}
          onChange={handleFormChange}
          required
        />
        <label>CNPJ/CPF:</label>
        <input
          type="text"
          name="cnpj_cpf" // Deve ser igual ao nome da coluna
          value={formData.cnpj_cpf}
          onChange={handleFormChange}
        />
        <label>Telefone:</label>
        <input
          type="text"
          name="telefone" // Deve ser igual ao nome da coluna
          value={formData.telefone}
          onChange={handleFormChange}
        />
        
        <button type="submit">
          {editingId ? 'Atualizar Fornecedor' : 'Adicionar Fornecedor'}
        </button>
        {editingId && (
          <button type="button" onClick={cancelEditing}>
            Cancelar Edição
          </button>
        )}
      </form>

      <hr />
      
      <h3>Fornecedores Cadastrados</h3>
      <ul>
        {suppliers.map(supplier => (
          <li key={supplier.id}>
            <strong>{supplier.nome}</strong>
            {' - CNPJ/CPF: '}{supplier.cnpj_cpf}
            {' - Tel: '}{supplier.telefone}
            
            <button onClick={() => startEditing(supplier)}>Editar</button>
            <button onClick={() => handleDelete(supplier.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SupplierManager;
