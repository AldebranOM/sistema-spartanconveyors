import React, { useState } from 'react';
import { createTicket } from '../services/ticket.service';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  FormHelperText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Send as SendIcon, 
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// ============================================
// SISTEMA DE CLASIFICACIÓN AUTOMÁTICA MEJORADO
// ============================================

const PRIORITY_RULES = {
  critica: {
    label: 'Crítica',
    icon: <ErrorIcon sx={{ color: '#b71c1c' }} />,
    color: '#b71c1c',
    bgcolor: '#ffebee',
    keywords: [
      'servidor', 'servidores', 'base de datos', 'bd', 'sql', 
      'sistema caído', 'sistema caida', 'caída total', 'sistema principal',
      'producción', 'facturación', 'clientes', 'ventas', 'reportes criticos',
      'emergencia', 'urgencia', 'detenido', 'detenida', 'paralizado',
      'falla critica', 'fallo critico', 'crítico', 'critica',
      'seguridad', 'hackeo', 'vulnerabilidad', 'ataque', 'brecha',
      'acceso denegado', 'no puedo acceder', 'sin acceso', 'autenticación',
      'erp', 'aspel', 'contpaq', 'sistema administrativo',
      'no puedo entrar al sistema', 'usuario bloqueado',
      'internet caído', 'sin internet total', 'red caída',
      'correo caído', 'exchange caído', 'outlook no abre'
    ],
    description: '⚠️ Afecta servidores, base de datos, ERP o sistemas críticos de producción. ¡ATENCIÓN INMEDIATA!'
  },
  
  alta: {
    label: 'Alta',
    icon: <WarningIcon sx={{ color: '#d32f2f' }} />,
    color: '#d32f2f',
    bgcolor: '#ffebee',
    keywords: [
      'software', 'aplicación', 'error', 'falla', 'fallo', 'bug',
      'no funciona', 'deja de funcionar', 'se cierra solo', 'no abre',
      'factura', 'cobro', 'pago', 'transacción', 'pedido', 'compra',
      'reporte', 'informe', 'dashboard', 'panel', 'módulo',
      'inventario', 'stock', 'precio', 'cliente', 'proveedor',
      'activar', 'activación', 'licencia', 'llave', 'key', 'serial',
      'producto no activado', 'error de licencia', 'caducó la licencia',
      'activar office', 'activar windows', 'licencia vencida',
      'sin internet', 'no hay internet', 'internet lento', 'no navega',
      'no carga', 'wifi desconectado', 'red desconectada', 'sin señal',
      'vpn', 'no conecta vpn', 'error vpn', 'túnel', 'acceso remoto',
      'no tengo internet', 'falla internet', 'internet intermitente',
      'no envía correos', 'no recibe correos', 'no llegan correos',
      'correo no enviado', 'error envío', 'correo atascado',
      'no recibo correos', 'no llegan los correos',
      'no prende', 'no enciende', 'no arranca', 'pantalla negra',
      'no da imagen', 'equipo muerto', 'no responde'
    ],
    description: '⚠️ Afecta funcionalidades clave, software empresarial o conectividad crítica.'
  },
  
  media: {
    label: 'Media',
    icon: <InfoIcon sx={{ color: '#ed6c02' }} />,
    color: '#ed6c02',
    bgcolor: '#fff3e0',
    keywords: [
      'impresora', 'imprimir', 'no imprime', 'no sale', 'atascado',
      'papel atascado', 'error impresión', 'impresora offline',
      'fuera de línea', 'no conecta', 'no reconoce impresora',
      'cola de impresión', 'tinta', 'toner', 'cartucho',
      'escaner', 'scanner', 'no escanea', 'no digitaliza',
      'red', 'wifi', 'wireless', 'no conecta wifi', 'no encuentra red',
      'se desconecta wifi', 'contraseña wifi', 'señal wifi', 'poco wifi',
      'red lenta', 'tarda en cargar', 'velocidad', 'poco ancho de banda',
      'se cae la conexión', 'intermitente',
      'acceso', 'permiso', 'usuario', 'cuenta', 'contraseña',
      'olvidé contraseña', 'resetear contraseña', 'cambiar contraseña',
      'cuenta bloqueada', 'error autenticación', 'login',
      'no puedo iniciar sesión', 'permisos', 'no tengo acceso',
      'acceso denegado', 'restringido', 'carpeta protegida', 'sin permisos',
      'correo', 'email', 'mail', 'outlook', 'gmail', 'hotmail',
      'configurar correo', 'configuración outlook', 'perfil correo',
      'configurar outlook', 'cuenta correo', 'exchange',
      'onedrive', 'one drive', 'no sincroniza', 'no sube', 'no baja',
      'archivos en la nube', 'carpeta onedrive', 'error onedrive',
      'espacio onedrive', 'sincronización onedrive',
      'google drive', 'drive', 'cloud', 'nube', 'dropbox', 'box',
      'sincronización nube', 'no sube archivos',
      'espacio en disco', 'disco lleno', 'sin espacio',
      'almacenamiento lleno', 'capacidad', 'memoria llena', 'no puedo guardar',
      'whatsapp', 'telefonía', 'no funciona whatsapp', 'no envía whatsapp',
      'teléfono', 'llamada', 'audio', 'conferencia',
      'teams', 'zoom', 'meet', 'videoconferencia', 'reunión virtual',
      'cámara', 'microfono', 'no entra a reunión', 'no puedo entrar a teams',
      'lento', 'tarda', 'congelado', 'se traba', 'pantalla azul', 'bsod',
      'se reinicia solo', 'se apaga solo', 'ruido',
      'mouse', 'teclado', 'monitor', 'pantalla', 'parpadea',
      'no reconoce', 'usb', 'bluetooth', 'inalámbrico'
    ],
    description: '🟡 Afecta recursos compartidos, impresoras, red, accesos o almacenamiento.'
  },
  
  baja: {
    label: 'Baja',
    icon: <CheckCircleIcon sx={{ color: '#2e7d32' }} />,
    color: '#2e7d32',
    bgcolor: '#e8f5e9',
    keywords: [
      'mejora', 'actualización', 'sugerencia', 'propuesta',
      'nueva funcionalidad', 'mejorar', 'optimizar',
      'duda', 'pregunta', 'consulta', 'información',
      'cómo', 'como', 'ayuda', 'soporte', 'asistencia',
      'configuración', 'ajuste', 'cambio', 'configurar',
      'personalizar', 'preferencias', 'opciones',
      'documentación', 'manual', 'guía', 'tutorial',
      'capacitación', 'entrenamiento', 'aprender',
      'mancha', 'raya', 'borroso', 'con manchas', 'rayas',
      'calidad', 'impresión fea', 'se corre', 'poco contraste',
      'spam', 'correo no deseado', 'phishing', 'correo basura',
      'filtro spam', 'correos promocionales'
    ],
    description: '🟢 Consultas, sugerencias, configuraciones o solicitudes de información.'
  }
};

// Función para clasificar prioridad automáticamente
const classifyPriority = (title, description) => {
  const text = (title + ' ' + description).toLowerCase();
  
  for (const keyword of PRIORITY_RULES.critica.keywords) {
    if (text.includes(keyword)) {
      return 'critica';
    }
  }
  
  for (const keyword of PRIORITY_RULES.alta.keywords) {
    if (text.includes(keyword)) {
      return 'alta';
    }
  }
  
  for (const keyword of PRIORITY_RULES.media.keywords) {
    if (text.includes(keyword)) {
      return 'media';
    }
  }
  
  return 'baja';
};

// Obtener información de la prioridad
const getPriorityInfo = (priority) => {
  return PRIORITY_RULES[priority] || PRIORITY_RULES.baja;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const NewTicket = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    archivo: null
  });
  const [detectedPriority, setDetectedPriority] = useState('baja');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'titulo' || name === 'descripcion') {
      const priority = classifyPriority(
        name === 'titulo' ? value : formData.titulo,
        name === 'descripcion' ? value : formData.descripcion
      );
      setDetectedPriority(priority);
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      archivo: e.target.files[0]
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.titulo || !formData.descripcion) {
        setError('Por favor completa todos los campos obligatorios');
        return;
      }
      setError('');
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // ============================================
  // FUNCIÓN handleSubmit CORREGIDA
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.titulo || !formData.descripcion) {
        setError('Todos los campos son obligatorios');
        setLoading(false);
        return;
      }

      console.log('📤 Enviando ticket:', formData);

      const ticketData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        prioridad: detectedPriority,
        categoria: formData.categoria || 'General'
      };

      // LLAMAR A LA API REAL
      const response = await createTicket(ticketData);
      
      console.log('📥 Respuesta del servidor:', response);

      setSuccess(true);
      setTimeout(() => {
        navigate('/tickets');
      }, 1500);
    } catch (error) {
      console.error('❌ Error al crear ticket:', error);
      console.error('❌ Detalle:', error.response?.data || error.message);
      setError(error.response?.data?.mensaje || 'Error al crear el ticket. Intenta nuevamente.');
      setLoading(false);
    }
  };

  const priorityInfo = getPriorityInfo(detectedPriority);

  const steps = [
    {
      label: 'Describe tu solicitud',
      description: 'Cuéntanos qué necesitas'
    },
    {
      label: 'Revisa la clasificación',
      description: 'Verifica la prioridad asignada automáticamente'
    },
    {
      label: 'Confirmar y Enviar',
      description: 'Envía tu ticket'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Nuevo Ticket
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Describe tu problema o solicitud. El sistema clasificará automáticamente la prioridad.
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ ¡Ticket creado exitosamente! Redirigiendo...
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {/* PASO 1 */}
                {index === 0 && (
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Título del Ticket"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleChange}
                        placeholder="Ej: La impresora no imprime"
                        helperText="Describe el problema en pocas palabras"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        multiline
                        rows={5}
                        label="Descripción del Problema"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Ej: La impresora de la oficina no imprime, el papel se atasca y sale con rayas..."
                        helperText="El sistema analizará tu descripción para asignar la prioridad"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="Categoría"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        placeholder="Ej: Impresión, Red, Software, Hardware"
                        helperText="Agrupa tu ticket por categoría"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<span>📎</span>}
                      >
                        Adjuntar archivo (opcional)
                        <input
                          type="file"
                          hidden
                          onChange={handleFileChange}
                        />
                      </Button>
                      {formData.archivo && (
                        <Typography variant="caption" sx={{ ml: 2, color: '#5262DF' }}>
                          ✅ {formData.archivo.name}
                        </Typography>
                      )}
                    </Grid>
                    
                    {formData.titulo && formData.descripcion && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: priorityInfo.bgcolor, borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {priorityInfo.icon}
                            Prioridad detectada: {priorityInfo.label}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {priorityInfo.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                )}

                {/* PASO 2 */}
                {index === 1 && (
                  <Box sx={{ mt: 1 }}>
                    <Paper sx={{ p: 3, bgcolor: '#f8f4ff', border: '1px solid #e8e0f0', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#5262DF' }}>
                        Clasificación Automática
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        El sistema ha analizado tu ticket y asignado la siguiente prioridad:
                      </Typography>
                      
                      <Box sx={{ mt: 3, p: 2, bgcolor: priorityInfo.bgcolor, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {priorityInfo.icon}
                          <Typography variant="h5" sx={{ fontWeight: 700, color: priorityInfo.color }}>
                            {priorityInfo.label}
                          </Typography>
                          <Chip 
                            label="Asignación automática" 
                            size="small" 
                            sx={{ ml: 'auto', bgcolor: 'rgba(82, 98, 223, 0.1)', color: '#5262DF' }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1, color: priorityInfo.color }}>
                          {priorityInfo.description}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Resumen del ticket:
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <strong>Título:</strong> {formData.titulo}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Categoría:</strong> {formData.categoria || 'Sin categoría'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Descripción:</strong> {formData.descripcion}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* PASO 3 */}
                {index === 2 && (
                  <Paper sx={{ p: 3, mt: 2, bgcolor: '#f8f4ff', border: '1px solid #e8e0f0', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#5262DF' }}>
                      Confirmar envío
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Título:</strong> {formData.titulo || '(sin título)'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Categoría:</strong> {formData.categoria || '(sin definir)'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Descripción:</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ pl: 2, mt: 0.5 }}>
                          {formData.descripcion || '(sin descripción)'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ p: 2, bgcolor: priorityInfo.bgcolor, borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {priorityInfo.icon}
                            <strong>Prioridad asignada:</strong> {priorityInfo.label}
                          </Typography>
                        </Box>
                      </Grid>
                      {formData.archivo && (
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Archivo adjunto:</strong> {formData.archivo.name}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                )}

                {/* Botones de navegación */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                  >
                    Atrás
                  </Button>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4555C4 0%, #2E3F99 100%)',
                      }
                    }}
                  >
                    {index === steps.length - 1 ? 'Enviar Ticket' : 'Continuar'}
                    {index === steps.length - 1 && <SendIcon sx={{ ml: 1 }} />}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="text"
            onClick={() => navigate('/tickets')}
            color="error"
          >
            Cancelar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewTicket;