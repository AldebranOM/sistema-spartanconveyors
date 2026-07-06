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
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, updateTicketStatus, assignTicket } from '../services/ticket.service';
import { getUsers } from '../services/user.service';

const AdminTickets = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  
  // Diálogos
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Filtros
  const [filters, setFilters] = useState({
    estado: 'todos',
    prioridad: 'todos',
    busqueda: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [ticketsData, usersData] = await Promise.all([
        getAllTickets(),
        getUsers()
      ]);
      
      setTickets(ticketsData);
      setFilteredTickets(ticketsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
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
        t.usuario_nombre?.toLowerCase().includes(search) ||
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

  const handleOpenAssign = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedUser(ticket.asignado_a || '');
    setOpenAssignDialog(true);
  };

  const handleOpenStatus = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.estado);
    setOpenStatusDialog(true);
  };

  const handleAssign = async () => {
    try {
      await assignTicket(selectedTicket.id, { asignado_a: selectedUser || null });
      setSuccess('Ticket asignado exitosamente');
      setOpenAssignDialog(false);
      fetchData();
    } catch (err) {
      console.error('Error al asignar:', err);
      setError('Error al asignar el ticket');
    }
  };

  const handleStatusChange = async () => {
    try {
      await updateTicketStatus(selectedTicket.id, { estado: newStatus });
      setSuccess('Estado actualizado exitosamente');
      setOpenStatusDialog(false);
      fetchData();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('Error al cambiar el estado');
    }
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
            Todos los Tickets
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {tickets.length} tickets en el sistema
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Actualizar
        </Button>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por título, categoría o usuario..."
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

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Asignado a</TableCell>
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
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay tickets en el sistema
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
                  <TableCell>{ticket.usuario_nombre || 'N/A'}</TableCell>
                  <TableCell>
                    {ticket.asignado_nombre ? (
                      <Chip label={ticket.asignado_nombre} size="small" variant="outlined" />
                    ) : (
                      <Typography variant="caption" color="textSecondary">Sin asignar</Typography>
                    )}
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
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          sx={{ color: '#5262DF' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Asignar">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenAssign(ticket)}
                          sx={{ color: '#ed6c02' }}
                        >
                          <AssignmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cambiar estado">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenStatus(ticket)}
                          sx={{ color: '#9c27b0' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
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

      {/* Dialog para asignar */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f8f4ff', color: '#5262DF' }}>
          Asignar Ticket #{selectedTicket?.id}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Usuario</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="Usuario"
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.nombre} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAssignDialog(false)} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handleAssign} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4555C4 0%, #2E3F99 100%)',
              }
            }}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cambiar estado */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f8f4ff', color: '#5262DF' }}>
          Cambiar Estado - Ticket #{selectedTicket?.id}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Estado"
            >
              <MenuItem value="abierto">Abierto</MenuItem>
              <MenuItem value="en_proceso">En Proceso</MenuItem>
              <MenuItem value="cerrado">Cerrado</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenStatusDialog(false)} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handleStatusChange} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4555C4 0%, #2E3F99 100%)',
              }
            }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTickets;