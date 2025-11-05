// src/components/StockMovementManager.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function StockMovementManager({ onDataChanged }) {
  
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    id_produto: '',
    tipo: 'ENTRADA',
    quantidade: '',
    motivo: ''
  });

  // Roda quando o componente carrega
  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, []);

  // Busca os produtos para preencher o dropdown
  const fetchProducts = async () => {
    // Só precisamos do id e nome dos produtos
    const { data, error } = await supabase.from('produtos').select('id, nome');
    if (error) console.error('Erro ao buscar produtos:', error.message);
    else setProducts(data);
  };

  // Busca o histórico de movimentações (o log)
  const fetchMovements = async () => {
    
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select(`
        *,
        produtos (
          nome
        )
      `)
      .order('created_at', { ascending: false }); // Mais novos primeiro

    if (error) console.error('Erro ao buscar movimentações:', error.message);
    else setMovements(data);
  };

  // Lida com mudanças no formulário
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Salva a nova movimentação (CREATE)
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.id_produto || formData.quantidade <= 0) {
      alert('Por favor, selecione um produto e insira uma quantidade válida.');
      return;
    }

    const { error } = await supabase
      .from('movimentacoes_estoque')
      .insert([{
        id_produto: formData.id_produto,
        tipo: formData.tipo,
        quantidade: formData.quantidade,
        motivo: formData.motivo
      }]);

    if (error) {
      alert('Erro ao registrar movimentação: ' + error.message);
    } else {
      alert('Movimentação registrada com sucesso!');
      setFormData({ id_produto: '', tipo: 'ENTRADA', quantidade: '', motivo: '' }); // Limpa o form
      fetchMovements(); // Atualiza o log imediatamente
      onDataChanged(); // Notifica o componente pai para atualizar os dados
    }
  };

  // Função para formatar a data 
  const formatDateTime = (dateTimeString) => {
    const options = {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString('pt-BR', options);
  };


  return (
    <div>
      <hr style={{ marginTop: '30px' }} />
      <h3>Registrar Movimentação de Estoque</h3>
      <form onSubmit={handleSubmit}>
        
        <label>Produto:</label>
        <select
          name="id_produto"
          value={formData.id_produto}
          onChange={handleFormChange}
          required
        >
          <option value="">-- Selecione um produto --</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.nome}
            </option>
          ))}
        </select>

        <label>Tipo:</label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleFormChange}
          required
        >
          <option value="ENTRADA">Entrada (Compra)</option>
          <option value="SAIDA">Saída (Venda)</option>
        </select>

        <label>Quantidade:</label>
        <input
          type="number"
          name="quantidade"
          value={formData.quantidade}
          onChange={handleFormChange}
          required
          min="1"
        />

        <label>Motivo (Opcional):</label>
        <input
          type="text"
          name="motivo"
          value={formData.motivo}
          onChange={handleFormChange}
        />
        
        <button type="submit">Registrar Movimentação</button>
      </form>

      <hr />

      <h3>Histórico de Movimentações</h3>
      <ul>
        {movements.map(mov => (
          <li key={mov.id}>
            <strong>{formatDateTime(mov.created_at)}</strong> - 
            Produto: <strong>{mov.produtos ? mov.produtos.nome : 'Produto Deletado'}</strong> - 
            Tipo: <strong>{mov.tipo}</strong> - 
            Qtd: <strong>{mov.quantidade}</strong> -
            Motivo: {mov.motivo}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StockMovementManager;
