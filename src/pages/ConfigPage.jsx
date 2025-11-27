import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Paper, Typography, TextField, Button, InputAdornment, Divider 
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

function ConfigPage() {
  const { showToast, onDataChanged } = useOutletContext();
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('configuracoes').select('valor').eq('chave', 'saldo_inicial').single();
      if (data) setInitialBalance(data.valor);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('configuracoes').update({ valor: initialBalance }).eq('chave', 'saldo_inicial');

    if (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    } else {
      showToast('Saldo Inicial atualizado!', 'success');
      onDataChanged();
    }
    setLoading(false);
  };

  return (
    <Box maxWidth="sm" sx={{ margin: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h4" fontWeight="bold">Configurações Financeiras</Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>Capital Inicial</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Defina o valor inicial em caixa. O sistema somará as vendas e subtrairá as compras a partir deste valor.
        </Typography>

        <TextField
          label="Saldo Inicial (R$)"
          type="number"
          fullWidth
          variant="outlined"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><AttachMoneyIcon color="action" /></InputAdornment>),
          }}
          sx={{ mb: 3 }}
        />

        <Button 
          variant="contained" 
          fullWidth 
          size="large" 
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
        >
          Salvar Configurações
        </Button>
      </Paper>
    </Box>
  );
}

export default ConfigPage;