import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOutletContext } from 'react-router-dom';

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
      setEditingId(null);
    } else {
      const { error } = await supabase.from('produtos').insert([productData]);
      if (error) alert('Erro ao adicionar produto: ' + error.message);
      else alert('Produto adicionado com sucesso!');
    }
    
    setFormData({ nome: '', preco_venda: '', id_fornecedor: '', estoque_minimo: 0, preco_custo: '' });
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

  const startEditing = (product) => {
    setEditingId(product.id);
    setFormData({ 
      nome: product.nome, 
      preco_venda: product.preco_venda,
      id_fornecedor: product.id_fornecedor || '',
      estoque_minimo: product.estoque_minimo || 0,
      preco_custo: product.preco_custo || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ 
      nome: '', 
      preco_venda: '', 
      id_fornecedor: '', 
      estoque_minimo: 0,
      preco_custo: ''
    });
  };

  return (
    <div>
      <hr />
      <h3>{editingId ? 'Editar Produto' : 'Cadastro de Produtos'}</h3>
      <form onSubmit={handleSubmit}>
        <label>Nome do Produto:</label>
        <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} required />
        
        <label>Preço de Venda (Ex: 15.00):</label>
        <input type="number" step="0.01" name="preco_venda" value={formData.preco_venda} onChange={handleFormChange} required />
        
        <label>Preço de Custo (Ex: 10.00):</label>
        <input 
          type="number" 
          step="0.01" 
          name="preco_custo" 
          value={formData.preco_custo} 
          onChange={handleFormChange}
        />
        
        <label>Estoque Mínimo:</label>
        <input type="number" name="estoque_minimo" value={formData.estoque_minimo} onChange={handleFormChange} min="0" />
        
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
      
      <ul>
        {productsWithStock.map(product => (
          <li key={product.id}>
            {product.nome} - Venda: R$ {product.preco_venda}
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