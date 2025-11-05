// src/components/ProductManager.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';


function ProductManager({ dataVersion, onDataChanged }) {
  
  
  const [productsWithStock, setProductsWithStock] = useState([]);
  
  
  const [allProducts, setAllProducts] = useState([]);
  const [allMovements, setAllMovements] = useState([]);
  
  
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ nome: '', preco_venda: '', id_fornecedor: '', estoque_minimo: 0 });
  const [editingId, setEditingId] = useState(null);

  
  // EFEITO 1: O CALCULADOR
  // Roda *sempre* que os dados brutos (allProducts ou allMovements) mudarem
  useEffect(() => {
    const calculateStock = () => {
      const calculatedData = allProducts.map(product => {
        // Filtra movimentações para este produto
        const movementsForProduct = allMovements.filter(
          mov => mov.id_produto === product.id
        );

        // Calcula entradas e saídas
        const totalEntrada = movementsForProduct
          .filter(mov => mov.tipo === 'ENTRADA')
          .reduce((sum, mov) => sum + mov.quantidade, 0);

        const totalSaida = movementsForProduct
          .filter(mov => mov.tipo === 'SAIDA')
          .reduce((sum, mov) => sum + mov.quantidade, 0);

        const estoqueAtual = totalEntrada - totalSaida;

        // Retorna o objeto do produto com o novo campo 'estoqueAtual'
        return {
          ...product,
          estoqueAtual: estoqueAtual
        };
      });

      setProductsWithStock(calculatedData); // Atualiza o estado que vai para a tela
    };

    calculateStock();
  }, [allProducts, allMovements]); // Depende dos dados brutos

  
  
  useEffect(() => {
    // Busca todos os dados necessários do zero
    fetchProducts();
    fetchSuppliers();
    fetchMovements();
  }, [dataVersion]); 

  
  // --- Funções de Busca (Fetch) ---

  // Busca os produtos (tabela 'produtos')
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('produtos')
      .select(`*, fornecedores (nome_fantasia)`);
      
    if (error) console.error('Erro ao buscar produtos:', error.message);
    else setAllProducts(data); // Salva em 'allProducts'
  };

  // Busca os fornecedores (para o dropdown)
  const fetchSuppliers = async () => {
    const { data, error } = await supabase.from('fornecedores').select('*');
    if (error) console.error('Erro ao buscar fornecedores:', error.message);
    else setSuppliers(data);
  };

  // Busca as movimentações (tabela 'movimentacoes_estoque')
  const fetchMovements = async () => {
    const { data, error } = await supabase.from('movimentacoes_estoque').select('id_produto, tipo, quantidade');
    if (error) console.error('Erro ao buscar movimentações:', error.message);
    else setAllMovements(data); 
  };

  // --- Funções do Formulário (CRUD) ---

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
      estoque_minimo: formData.estoque_minimo || 0
    };

    if (editingId) {
      // --- UPDATE ---
      const { error } = await supabase
        .from('produtos')
        .update(productData)
        .match({ id: editingId });

      if (error) alert('Erro ao atualizar produto: ' + error.message);
      else alert('Produto atualizado com sucesso!');
      
      setEditingId(null);
      
    } else {
      // --- CREATE ---
      const { error } = await supabase
        .from('produtos')
        .insert([productData]);

      if (error) alert('Erro ao adicionar produto: ' + error.message);
      else alert('Produto adicionado com sucesso!');
    }
    
    setFormData({ nome: '', preco_venda: '', id_fornecedor: '', estoque_minimo: 0 });
    
    // 2. AVISA O "PAI" (App.jsx) QUE OS DADOS MUDARAM
    onDataChanged();
  };

  const handleDelete = async (productId) => {
    // Regra de negócio: Não deixa excluir se já houver histórico
    const { data: movements, error: moveError } = await supabase
      .from('movimentacoes_estoque')
      .select('id')
      .eq('id_produto', productId)
      .limit(1);

    if (moveError) {
      alert('Erro ao verificar movimentações: ' + moveError.message);
      return;
    }
    
    if (movements && movements.length > 0) {
      alert('Não é possível excluir este produto, pois ele já possui movimentações de estoque.');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este produto? (Ação irreversível)')) {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .match({ id: productId });

      if (error) alert('Erro ao excluir produto: ' + error.message);
      else {
        alert('Produto excluído com sucesso!');
        // 3. AVISA O "PAI" (App.jsx) QUE OS DADOS MUDARAM
        onDataChanged();
      }
    }
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setFormData({ 
      nome: product.nome, 
      preco_venda: product.preco_venda,
      id_fornecedor: product.id_fornecedor || '',
      estoque_minimo: product.estoque_minimo || 0
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ nome: '', preco_venda: '', id_fornecedor: '', estoque_minimo: 0 });
  };


  return (
    <div>
      <hr />
      <h3>{editingId ? 'Editar Produto' : 'Cadastro de Produtos'}</h3>
      <form onSubmit={handleSubmit}>
        <label>Nome do Produto:</label>
        <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} required />
        
        <label>Preço (Ex: 10.50):</label>
        <input type="number" step="0.01" name="preco_venda" value={formData.preco_venda} onChange={handleFormChange} required />
        
        <label>Estoque Mínimo:</label>
        <input 
          type="number" 
          name="estoque_minimo" 
          value={formData.estoque_minimo} 
          onChange={handleFormChange} 
          min="0"
        />
        
        <label>Fornecedor:</label>
        <select name="id_fornecedor" value={formData.id_fornecedor} onChange={handleFormChange}>
          <option value="">-- Selecione um fornecedor --</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.nome_fantasia}
            </option>
          ))}
        </select>
        
        <button type="submit">{editingId ? 'Atualizar Produto' : 'Adicionar Produto'}</button>
        {editingId && (<button type="button" onClick={cancelEditing}>Cancelar Edição</button>)}
      </form>

      <hr />
      
      <h3>Produtos em Estoque (com Saldo)</h3>
      
      {}

      <ul>
        {}
        {productsWithStock.map(product => (
          <li key={product.id}>
            {product.nome} - R$ {product.preco_venda}
            {product.fornecedores ? ` (Fornecedor: ${product.fornecedores.nome_fantasia})` : ' (Sem fornecedor)'}
            
            <strong style={{ fontSize: '1.1em' }}>
              {' - Saldo: '}{product.estoqueAtual}
            </strong>
            
            {product.estoque_minimo > 0 && product.estoqueAtual <= product.estoque_minimo && (
              <span style={{ color: 'red', fontWeight: 'bold' }}>
                {' '}(ESTOQUE BAIXO!)
              </span>
            )}
            
            <button onClick={() => startEditing(product)}>Editar</button>
            <button onClick={() => handleDelete(product.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductManager;
