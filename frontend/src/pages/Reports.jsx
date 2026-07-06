import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import {
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  ConfirmationNumber as TicketIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { getGeneralStats, getTicketsByUser, getInventoryReport, exportReport } from '../services/report.service';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [ticketsByUser, setTicketsByUser] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [statsData, userData, inventoryData] = await Promise.all([
        getGeneralStats(),
        getTicketsByUser(),
        getInventoryReport()
      ]);

      setStats(statsData);
      setTicketsByUser(userData);
      setInventoryReport(inventoryData);
    } catch (err) {
      console.error('❌ Error al cargar reportes:', err);
      setError('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (tipo) => {
    try {
      setExportLoading(true);
      const data = await exportReport(tipo);
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
      
      const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
      ws['!cols'] = colWidths;
      
      XLSX.writeFile(wb, `Reporte_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('❌ Error al exportar:', err);
      setError('Error al exportar el reporte');
    } finally {
      setExportLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      abierto: 'error',
      en_proceso: 'warning',
      cerrado: 'success'
    };
    return colors[estado] || 'default';
  };

  const getPrioridadColor = (prioridad) => {
    const colors = {
      baja: 'info',
      media: 'warning',
      alta: 'error',
      critica: 'error'
    };
    return colors[prioridad] || 'default';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Reportes y Estadísticas
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadAllData}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Total Tickets</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#5262DF' }}>
                    {stats?.totalTickets || 0}
                  </Typography>
                </Box>
                <TicketIcon sx={{ fontSize: 40, color: '#5262DF' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Usuarios Activos</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    {stats?.totalUsers || 0}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Tiempo Promedio</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                    {Math.round(stats?.avgResolution || 0)}h
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#ed6c02' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Equipos en Inventario</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {inventoryReport?.totalItems || 0}
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="📊 Resumen General" />
          <Tab label="👥 Tickets por Usuario" />
          <Tab label="📦 Reporte de Inventario" />
        </Tabs>

        {/* Tab 1: Resumen General */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Tickets por Estado
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Cantidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.ticketsByStatus?.map((item) => (
                        <TableRow key={item.estado}>
                          <TableCell>
                            <Chip 
                              label={item.estado} 
                              color={getEstadoColor(item.estado)} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{item.cantidad}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Tickets por Prioridad
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Prioridad</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Cantidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.ticketsByPriority?.map((item) => (
                        <TableRow key={item.prioridad}>
                          <TableCell>
                            <Chip 
                              label={item.prioridad} 
                              color={getPrioridadColor(item.prioridad)} 
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">{item.cantidad}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Tickets por Mes (últimos 6 meses)
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Mes</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Cantidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.ticketsByMonth?.map((item) => (
                        <TableRow key={item.mes}>
                          <TableCell>{item.mes}</TableCell>
                          <TableCell align="right">{item.cantidad}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={() => handleExport('tickets')}
                    disabled={exportLoading}
                  >
                    Exportar Reporte de Tickets
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Tickets por Usuario */}
          {tabValue === 1 && (
            <Box>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Total</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Abiertos</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">En Proceso</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Cerrados</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ticketsByUser.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="textSecondary">
                            No hay tickets registrados
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      ticketsByUser.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {user.nombre}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.email}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{user.total_tickets}</TableCell>
                          <TableCell align="center">
                            <Chip label={user.abiertos} color="error" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={user.en_proceso} color="warning" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={user.cerrados} color="success" size="small" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={() => handleExport('usuarios')}
                  disabled={exportLoading}
                >
                  Exportar Reporte de Usuarios
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 3: Reporte de Inventario */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Equipos por Categoría
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Categoría</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Cantidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventoryReport?.itemsByCategory?.map((item) => (
                        <TableRow key={item.categoria}>
                          <TableCell>{item.categoria}</TableCell>
                          <TableCell align="right">{item.cantidad}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Equipos por Estado
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Cantidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventoryReport?.itemsByStatus?.map((item) => (
                        <TableRow key={item.estado}>
                          <TableCell>{item.estado}</TableCell>
                          <TableCell align="right">{item.cantidad}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: '#f8f4ff' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#5262DF' }}>
                    📊 Resumen de Inventario
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary">Total de Equipos</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {inventoryReport?.totalItems || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary">Valor Total</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                        ${(inventoryReport?.totalValue || 0).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary">Últimos equipos agregados</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {inventoryReport?.recentItems?.length || 0} equipos nuevos
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Reports;