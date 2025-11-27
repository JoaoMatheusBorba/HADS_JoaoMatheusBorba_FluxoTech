import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOutletContext, useNavigate } from 'react-router-dom';

import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent,
  Autocomplete // <--- IMPORT NOVO
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

function ComprasPage() {
  const { onDataChanged, showToast } = useOutletContext();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    id_produto: '',
    quantidade: '',
    motivo: ''
  });
  
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      // Buscamos apenas produtos ATIVOS
      const { data, error } = await supabase.from('produtos').select('id, nome').eq('ativo', true);
      if (error) console.error('Erro ao buscar produtos:', error.message);
      else setProducts(data);
    };
    fetchProducts();
  }, []); 

  // Função genérica para campos de texto
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.id_produto || formData.quantidade <= 0) {
      showToast('Preencha os campos corretamente!', 'warning');
      return;
    }

    const { error } = await supabase
      .from('movimentacoes_estoque')
      .insert([ {
        id_produto: formData.id_produto,
        tipo: 'ENTRADA',
        quantidade: formData.quantidade,
        motivo: formData.motivo || 'Registo de Compra'
      } ]);

    if (error) {
      showToast('Erro ao registrar a compra: ' + error.message, 'error');
    } else {
      showToast('Compra registrada com sucesso!', 'success');
      onDataChanged(); 
      navigate('/movimentacoes');
    }
  };

  const steps = [
    {
      label: 'Selecionar o Produto Comprado',
      content: (
        <Box sx={{ mt: 2 }}>
          {/* AQUI ESTÁ A MUDANÇA: Autocomplete em vez de Select */}
          <Autocomplete
            options={products}
            getOptionLabel={(option) => option.nome}
            value={products.find(p => p.id === formData.id_produto) || null}
            onChange={(event, newValue) => {
              setFormData(prev => ({ ...prev, id_produto: newValue ? newValue.id : '' }));
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Pesquisar Produto..." 
                variant="standard" 
                required 
              />
            )}
          />
        </Box>
      )
    },
    {
      label: 'Definir a Quantidade',
      content: (
        <TextField
          type="number" 
          name="quantidade" 
          label="Quantidade Comprada"
          value={formData.quantidade} 
          onChange={handleFormChange}
          required 
          fullWidth 
          variant="standard"
          InputProps={{ inputProps: { min: 1 } }}
          sx={{ mt: 2 }}
        />
      )
    },
    {
      label: 'Motivo (Opcional)',
      content: (
        <TextField
          type="text" 
          name="motivo" 
          label="Motivo (Ex: Nota Fiscal 123)"
          value={formData.motivo} 
          onChange={handleFormChange}
          fullWidth 
          variant="standard"
          sx={{ mt: 2 }}
        />
      )
    },
  ];

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, margin: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AddShoppingCartIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Registrar Compra (Passo-a-Passo)
        </Typography>
      </Box>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="h6">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Box>{step.content}</Box>
              <Box sx={{ mt: 3, mb: 1 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={(index === 0 && !formData.id_produto) || (index === 1 && !formData.quantidade)}
                  >
                    {index === steps.length - 1 ? 'Finalizar Compra' : 'Próximo'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Voltar
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
}

export default ComprasPage;