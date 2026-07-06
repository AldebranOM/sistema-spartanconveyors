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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  Alert,
  CircularProgress,
  Tooltip,
  Stack,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus, changeUserPassword } from '../services/user.service';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'usuario'
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  // ============================================
  // CARGAR USUARIOS
  // ============================================
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ============================================
  // MANEJO DE CRUD
  // ============================================
  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditMode(true);
      setSelectedUser(user);
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        password: '',
        rol: user.rol || 'usuario'
      });
    } else {
      setEditMode(false);
      setSelectedUser(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'usuario'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'usuario'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      if (editMode && selectedUser) {
        await updateUser(selectedUser.id, {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol
        });
        setSuccess('Usuario actualizado exitosamente');
      } else {
        await createUser(formData);
        setSuccess('Usuario creado exitosamente');
      }
      handleCloseDialog();
      loadUsers();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.response?.data?.mensaje || 'Error al guardar el usuario');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUser(id);
        setSuccess('Usuario eliminado exitosamente');
        loadUsers();
      } catch (err) {
        console.error('Error al eliminar:', err);
        setError(err.response?.data?.mensaje || 'Error al eliminar el usuario');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatus(id);
      setSuccess('Estado del usuario actualizado');
      loadUsers();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('Error al cambiar el estado del usuario');
    }
  };

  const handleOpenPasswordDialog = (user) => {
    setSelectedUser(user);
    setPasswordData({ password: '', confirmPassword: '' });
    setOpenPasswordDialog(true);
  };

  const handlePasswordChange = async () => {
    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    try {
      await changeUserPassword(selectedUser.id, { password: passwordData.password });
      setSuccess('Contraseña actualizada exitosamente');
      setOpenPasswordDialog(false);
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setError('Error al cambiar la contraseña');
    }
  };

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
            Gestión de Usuarios
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {users.length} usuarios registrados
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={loadUsers}
          >
            Actualizar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4555C4 0%, #2E3F99 100%)',
              }
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>
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

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fecha Registro</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay usuarios registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.rol === 'admin' ? 'Administrador' : 'Usuario'} 
                      color={user.rol === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.activo === 1 ? 'Activo' : 'Inactivo'} 
                      color={user.activo === 1 ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Cambiar estado">
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleStatus(user.id)}
                          sx={{ color: user.activo === 1 ? '#2e7d32' : '#d32f2f' }}
                        >
                          {user.activo === 1 ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cambiar contraseña">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenPasswordDialog(user)}
                          sx={{ color: '#ed6c02' }}
                        >
                          <LockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(user)}
                          sx={{ color: '#5262DF' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(user.id)}
                          sx={{ color: '#d32f2f' }}
                          disabled={user.email === 'admin@sistema.com'}
                        >
                          <DeleteIcon fontSize="small" />
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

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f8f4ff', color: '#5262DF' }}>
          {editMode ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre completo"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            {!editMode && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  helperText="Mínimo 4 caracteres"
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
              >
                <MenuItem value="usuario">Usuario</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4555C4 0%, #2E3F99 100%)',
              }
            }}
          >
            {editMode ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cambiar contraseña */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f8f4ff', color: '#5262DF' }}>
          Cambiar Contraseña
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nueva contraseña"
                type="password"
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                helperText="Mínimo 4 caracteres"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmar contraseña"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenPasswordDialog(false)} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4555C4 0%, #2E3F99 100%)',
              }
            }}
          >
            Cambiar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;