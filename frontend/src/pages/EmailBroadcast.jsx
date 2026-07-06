import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Divider
} from '@mui/material';
import { Send as SendIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { sendMassiveEmail, getEmailRecipients } from '../services/email.service';

const EmailBroadcast = () => {
  const [formData, setFormData] = useState({
    asunto: '',
    mensaje: '',
    tipo: 'todos',
    destinatarios: []
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);

  // Cargar lista de usuarios disponibles
  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      setLoadingRecipients(true);
      const data = await getEmailRecipients();
      setRecipients(data);
      console.log('📧 Usuarios cargados:', data);
    } catch (err) {
      console.error('❌ Error al cargar destinatarios:', err);
      setError('Error al cargar la lista de usuarios');
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTipoChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      tipo: value,
      destinatarios: [] // Limpiar selección al cambiar de tipo
    });
  };

  const handleRecipientsChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      destinatarios: typeof value === 'string' ? value.split(',') : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validar que haya destinatarios
      if (formData.tipo === 'seleccionados' && formData.destinatarios.length === 0) {
        setError('Por favor selecciona al menos un usuario');
        setLoading(false);
        return;
      }

      // Preparar datos para enviar
      const data = {
        asunto: formData.asunto,
        mensaje: formData.mensaje,
        tipo: formData.tipo,
        destinatarios: formData.tipo === 'seleccionados' ? formData.destinatarios : []
      };

      console.log('📤 Enviando correo:', data);

      const response = await sendMassiveEmail(data);
      console.log('📥 Respuesta:', response);

      setSuccess(true);
      setFormData({
        asunto: '',
        mensaje: '',
        tipo: 'todos',
        destinatarios: []
      });

      // Recargar lista de usuarios después de enviar
      loadRecipients();

    } catch (err) {
      console.error('❌ Error al enviar:', err);
      setError(err.response?.data?.mensaje || 'Error al enviar los correos');
    } finally {
      setLoading(false);
    }
  };

  // Obtener nombres de usuarios seleccionados para mostrar
  const getSelectedUsersNames = (emails) => {
    return emails.map(email => {
      const user = recipients.find(u => u.email === email);
      return user ? `${user.nombre} (${email})` : email;
    }).join(', ');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Correos Masivos
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadRecipients}
          size="small"
        >
          Actualizar usuarios
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ ¡Correo enviado exitosamente!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Selector de destinatarios */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Destinatarios</InputLabel>
                <Select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleTipoChange}
                  label="Destinatarios"
                >
                  <MenuItem value="todos">📧 Todos los usuarios activos</MenuItem>
                  <MenuItem value="admin">👑 Solo administradores</MenuItem>
                  <MenuItem value="usuarios">👤 Solo usuarios</MenuItem>
                  <MenuItem value="seleccionados">✏️ Seleccionar usuarios manualmente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Lista de usuarios seleccionables */}
            {formData.tipo === 'seleccionados' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Seleccionar usuarios</InputLabel>
                  <Select
                    multiple
                    value={formData.destinatarios}
                    onChange={handleRecipientsChange}
                    input={<OutlinedInput label="Seleccionar usuarios" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((email) => (
                          <Chip 
                            key={email} 
                            label={email} 
                            size="small"
                            sx={{ bgcolor: '#f0ecff' }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {recipients.length === 0 ? (
                      <MenuItem disabled>
                        <Typography variant="body2" color="textSecondary">
                          {loadingRecipients ? 'Cargando usuarios...' : 'No hay usuarios disponibles'}
                        </Typography>
                      </MenuItem>
                    ) : (
                      recipients.map((user) => (
                        <MenuItem key={user.id} value={user.email}>
                          <Checkbox checked={formData.destinatarios.indexOf(user.email) > -1} />
                          <ListItemText primary={user.nombre} secondary={user.email} />
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                {formData.destinatarios.length > 0 && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Usuarios seleccionados: {formData.destinatarios.length}
                  </Typography>
                )}
              </Grid>
            )}

            {/* Asunto */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Asunto"
                name="asunto"
                value={formData.asunto}
                onChange={handleChange}
                placeholder="Asunto del correo"
                disabled={loading}
              />
            </Grid>

            {/* Mensaje */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={8}
                label="Mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                placeholder="Escribe el mensaje del correo... Puedes usar HTML para dar formato"
                disabled={loading}
                helperText="Puedes usar etiquetas HTML: &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, etc."
              />
            </Grid>

            {/* Resumen de destinatarios */}
            {formData.tipo !== 'seleccionados' && (
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  {formData.tipo === 'todos' && '📧 Enviando a TODOS los usuarios activos'}
                  {formData.tipo === 'admin' && '👑 Enviando SOLO a administradores'}
                  {formData.tipo === 'usuarios' && '👤 Enviando SOLO a usuarios normales'}
                </Typography>
              </Grid>
            )}

            {formData.tipo === 'seleccionados' && formData.destinatarios.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: '#f8f6ff', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    📋 Resumen de destinatarios:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {getSelectedUsersNames(formData.destinatarios)}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Botón enviar */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  disabled={loading || !formData.asunto || !formData.mensaje}
                  sx={{
                    background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4555C4 0%, #2E3F99 100%)',
                    },
                    px: 4,
                    py: 1.5,
                    '&.Mui-disabled': {
                      background: '#e0e0e0'
                    }
                  }}
                >
                  {loading ? 'Enviando...' : 'Enviar Correo'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EmailBroadcast;