import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Pagination,
  TextField,
  MenuItem,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { getMyTickets, getAllTickets } from '../services/ticket.service';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [stats, setStats] = useState({
    total: 0,
    abiertos: 0,
    en_proceso: 0,
    cerrados: 0,
    criticos: 0
  });

  // Filtros
  const [filters, setFilters] = useState({
    estado: 'todos',
    prioridad: 'todos',
    busqueda: ''
  });

  const isAdmin = user?.rol === 'admin';

  // ============================================
  // CARGAR TICKETS (SEGÚN ROL)
  // ============================================
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data;
      if (isAdmin) {
        // Admin ve TODOS los tickets
        data = await getAllTickets();
        console.log('📥 Todos los tickets (admin):', data);
      } else {
        // Usuario ve SOLO sus tickets
        data = await getMyTickets();
        console.log('📥 Mis tickets (usuario):', data);
      }
      
      setTickets(data);
      setFilteredTickets(data);
      calcularEstadisticas(data);
    } catch (err) {
      console.error('❌ Error al cargar tickets:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar tus tickets.');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (data) => {
    const total = data.length;
    const abiertos = data.filter(t => t.estado === 'abierto').length;
    const en_proceso = data.filter(t => t.estado === 'en_proceso').length;
    const cerrados = data.filter(t => t.estado === 'cerrado').length;
    const criticos = data.filter(t => t.prioridad === 'critica').length;

    setStats({ total, abiertos, en_proceso, cerrados, criticos });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ============================================
  // FILTROS
  // ============================================
  useEffect(() => {
    let result = tickets;
    
    if (filters.estado !== 'todos') {
      result = result.filter(t => t.estado === filters.estado);
    }
    
    if (filters.prioridad !== 'todos') {
      result = result.filter(t => t.prioridad === filters.prioridad);
    }
    
    if (filters.busqueda.trim() !== '') {
      const search = filters.busqueda.toLowerCase();
      result = result.filter(t => 
        t.titulo.toLowerCase().includes(search) ||
        t.categoria?.toLowerCase().includes(search) ||
        t.descripcion?.toLowerCase().includes(search)
      );
    }
    
    setFilteredTickets(result);
    setPage(1);
  }, [filters, tickets]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    setFilters({
      ...filters,
      busqueda: e.target.value
    });
  };

  // ============================================
  // CHIPS
  // ============================================
  const getEstadoChip = (estado) => {
    const config = {
      abierto: { label: 'Abierto', color: 'error' },
      en_proceso: { label: 'En Proceso', color: 'warning' },
      cerrado: { label: 'Cerrado', color: 'success' }
    };
    const { label, color } = config[estado] || config.abierto;
    return <Chip label={label} color={color} size="small" />;
  };

  const getPrioridadChip = (prioridad) => {
    const config = {
      baja: { label: 'Baja', color: 'info' },
      media: { label: 'Media', color: 'warning' },
      alta: { label: 'Alta', color: 'error' },
      critica: { label: 'Crítica', color: 'error' }
    };
    const { label, color } = config[prioridad] || config.media;
    return <Chip label={label} color={color} size="small" variant="outlined" />;
  };

  // ============================================
  // TARJETAS DE ESTADÍSTICAS (FILTROS RÁPIDOS)
  // ============================================
  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: <TicketIcon sx={{ fontSize: 28, color: '#5262DF' }} />,
      color: '#5262DF',
      bgLight: 'rgba(82, 98, 223, 0.08)',
      filter: 'todos'
    },
    {
      title: 'Abiertos',
      value: stats.abiertos,
      icon: <PendingIcon sx={{ fontSize: 28, color: '#ed6c02' }} />,
      color: '#ed6c02',
      bgLight: 'rgba(237, 108, 2, 0.08)',
      filter: 'abierto'
    },
    {
      title: 'En Proceso',
      value: stats.en_proceso,
      icon: <AssignmentIcon sx={{ fontSize: 28, color: '#9c27b0' }} />,
      color: '#9c27b0',
      bgLight: 'rgba(156, 39, 176, 0.08)',
      filter: 'en_proceso'
    },
    {
      title: 'Cerrados',
      value: stats.cerrados,
      icon: <CheckCircleIcon sx={{ fontSize: 28, color: '#2e7d32' }} />,
      color: '#2e7d32',
      bgLight: 'rgba(46, 125, 50, 0.08)',
      filter: 'cerrado'
    },
    {
      title: 'Críticos',
      value: stats.criticos,
      icon: <WarningIcon sx={{ fontSize: 28, color: '#b71c1c' }} />,
      color: '#b71c1c',
      bgLight: 'rgba(183, 28, 28, 0.08)',
      filter: 'critica'
    }
  ];

  // ============================================
  // PAGINACIÓN
  // ============================================
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#5262DF' }} />
      </Box>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <Box>
      {/* Header con bienvenida */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
          color: 'white',
          boxShadow: '0 8px 40px rgba(82, 98, 223, 0.25)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              ¡Bienvenido, {user?.nombre}! 👋
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85 }}>
              {isAdmin 
                ? 'Aquí tienes el resumen de TODOS los tickets del sistema.'
                : 'Aquí tienes el resumen de tus tickets.'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tickets/nuevo')}
            sx={{
              bgcolor: 'white',
              color: '#5262DF',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              },
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              transition: 'all 0.3s ease',
            }}
          >
            Crear Nuevo Ticket
          </Button>
        </Box>
      </Paper>

      {/* Tarjetas de estadísticas (filtros rápidos) */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid item xs={6} sm={4} md={2.4} key={stat.title}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(82, 98, 223, 0.1)',
                  transform: 'translateY(-4px)',
                },
                ...(filters.estado === stat.filter && {
                  borderColor: stat.color,
                  boxShadow: `0 0 0 2px ${stat.color}`,
                })
              }}
              onClick={() => {
                setFilters({
                  ...filters,
                  estado: stat.filter
                });
              }}
            >
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 1,
                    borderRadius: 2,
                    bgcolor: stat.bgLight,
                    color: stat.color,
                    mb: 1,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.8rem' }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filtros avanzados */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por título o categoría..."
              value={filters.busqueda}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Estado"
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="abierto">Abierto</MenuItem>
              <MenuItem value="en_proceso">En Proceso</MenuItem>
              <MenuItem value="cerrado">Cerrado</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Prioridad"
              name="prioridad"
              value={filters.prioridad}
              onChange={handleFilterChange}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="baja">Baja</MenuItem>
              <MenuItem value="media">Media</MenuItem>
              <MenuItem value="alta">Alta</MenuItem>
              <MenuItem value="critica">Crítica</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                {filteredTickets.length} tickets
              </Typography>
              <Button 
                variant="text" 
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchTickets}
                sx={{ minWidth: 'auto' }}
              >
                Actualizar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabla de tickets */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f6fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prioridad</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</TableCell>
              {isAdmin && (
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Creado por</TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {tickets.length === 0 
                      ? isAdmin 
                        ? 'No hay tickets en el sistema aún.'
                        : 'No has creado ningún ticket aún. ¡Crea tu primer ticket!'
                      : 'No se encontraron tickets con los filtros aplicados.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id} hover>
                  <TableCell>#{ticket.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ticket.titulo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={ticket.categoria || 'General'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{getPrioridadChip(ticket.prioridad)}</TableCell>
                  <TableCell>{getEstadoChip(ticket.estado)}</TableCell>
                  <TableCell>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>{ticket.usuario_nombre || 'N/A'}</TableCell>
                  )}
                  <TableCell>
                    <Tooltip title="Ver detalles">
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        sx={{ color: '#5262DF' }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {filteredTickets.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredTickets.length / rowsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root.Mui-selected': {
                bgcolor: '#5262DF',
                color: 'white',
                '&:hover': { bgcolor: '#3A4FB0' }
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;