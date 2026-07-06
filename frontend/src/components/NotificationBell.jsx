import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/notification.service';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const open = Boolean(anchorEl);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (open && !hasFetched.current) {
      fetchNotifications();
      hasFetched.current = true;
    }
  }, [open]);

  useEffect(() => {
    // Cargar conteo de no leídas al montar y cada 30 segundos
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.total);
    } catch (error) {
      console.error('Error al obtener conteo:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    hasFetched.current = false;
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, leido: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, leido: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.leido) {
      handleMarkAsRead(notification.id);
    }
    if (notification.enlace) {
      navigate(notification.enlace);
      handleClose();
    }
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      asignado: 'Asignado',
      estado: 'Estado',
      comentario: 'Comentario',
      nuevo: 'Nuevo Ticket'
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo) => {
    const colors = {
      asignado: '#5262DF',
      estado: '#ed6c02',
      comentario: '#2e7d32',
      nuevo: '#9c27b0'
    };
    return colors[tipo] || '#5262DF';
  };

  return (
    <>
      <Tooltip title={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} nuevas)` : ''}`}>
        <IconButton color="inherit" onClick={handleOpen}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 480,
            bgcolor: '#1A1A1A',
            color: 'white',
            borderRadius: 2,
            border: '1px solid rgba(82, 98, 223, 0.15)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Notificaciones
            {unreadCount > 0 && (
              <Chip 
                label={`${unreadCount} nuevas`} 
                size="small" 
                sx={{ ml: 1, bgcolor: '#5262DF', color: 'white', fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Typography>
          {notifications.some(n => !n.leido) && (
            <Button 
              size="small" 
              startIcon={markingAll ? <CircularProgress size={16} /> : <DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              sx={{ 
                color: '#5262DF', 
                fontSize: '0.7rem',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(82,98,223,0.05)' }
              }}
            >
              Marcar todas
            </Button>
          )}
        </Box>

        <Box sx={{ overflow: 'auto', maxHeight: 360 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={30} sx={{ color: '#5262DF' }} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.15)', mb: 1 }} />
              <Typography variant="body2" color="textSecondary">
                No tienes notificaciones
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notif, index) => (
                <React.Fragment key={notif.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: notif.leido ? 'transparent' : 'rgba(82, 98, 223, 0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(82,98,223,0.08)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: notif.leido ? 400 : 600 }}>
                            {notif.mensaje}
                          </Typography>
                          {!notif.leido && (
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#5262DF', flexShrink: 0 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Chip 
                            label={getTipoLabel(notif.tipo)} 
                            size="small" 
                            sx={{ 
                              fontSize: '0.55rem', 
                              height: 18, 
                              bgcolor: `${getTipoColor(notif.tipo)}20`,
                              color: getTipoColor(notif.tipo),
                              border: `1px solid ${getTipoColor(notif.tipo)}30`,
                            }} 
                          />
                          <Typography variant="caption" color="textSecondary">
                            {new Date(notif.created_at).toLocaleString('es', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)' }} />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;