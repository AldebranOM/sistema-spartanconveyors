import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMyTickets } from '../services/ticket.service';

const Tickets = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  
  // Filtros
  const [filters, setFilters] = useState({
    estado: 'todos',
    prioridad: 'todos',
    busqueda: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  // ============================================
  // CONECTAR A LA API REAL
  // ============================================
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Llamar a la API real
      const data = await getMyTickets();
      console.log('📥 Tickets recibidos:', data);
      
      setTickets(data);
      setFilteredTickets(data);
    } catch (err) {
      console.error('❌ Error al cargar tickets:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar tus tickets. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let result = tickets;
    
    // Filtro por estado
    if (filters.estado !== 'todos') {
      result = result.filter(t => t.estado === filters.estado);
    }
    
    // Filtro por prioridad
    if (filters.prioridad !== 'todos') {
      result = result.filter(t => t.prioridad === filters.prioridad);
    }
    
    // Filtro por búsqueda
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

  // Paginación
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#5262DF' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Mis Tickets
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {tickets.length > 0 ? `${tickets.length} tickets encontrados` : 'No tienes tickets aún'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchTickets}
          >
            Actualizar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/tickets/nuevo')}
            sx={{
              background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4555C4 0%, #2E3F99 100%)',
              }
            }}
          >
            Nuevo Ticket
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
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
            <Typography variant="caption" color="textSecondary">
              {filteredTickets.length} tickets
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Categoría</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Prioridad</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {tickets.length === 0 
                      ? 'No has creado ningún ticket aún. ¡Crea tu primer ticket!'
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

export default Tickets;