import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOutletContext, useNavigate } from 'react-router-dom';

import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

function ComprasPage() {
  const { onDataChanged } = useOutletContext();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    id_produto: '',
    quantidade: '',
    motivo: ''
  });
  
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []); 

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('produtos').select('id, nome');
    if (error) console.error('Erro ao buscar produtos:', error.message);
    else setProducts(data);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.id_produto || formData.quantidade <= 0) {
      alert('Por favor, selecione um produto e insira uma quantidade válida.');
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
      alert('Erro ao registrar a compra: ' + error.message);
    } else {
      alert('Compra registrada com sucesso!');
      onDataChanged(); 
      navigate('/movimentacoes');
    }
  };

  const steps = [
    {
      label: 'Selecionar o Produto Comprado',
      content: (
        <FormControl fullWidth variant="standard" sx={{ mt: 2 }}>
          <InputLabel id="produto-select-label">Produto Comprado</InputLabel>
          <Select
            labelId="produto-select-label"
            name="id_produto"
            value={formData.id_produto}
            onChange={handleFormChange}
            required
          >
            <MenuItem value=""><em>-- Selecione --</em></MenuItem>
            {products.map(product => (
              <MenuItem key={product.id} value={product.id}>{product.nome}</MenuItem>
            ))}
          </Select>
        </FormControl>
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