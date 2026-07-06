import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Badge,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings,
  Notifications,
  Home,
  Assessment as AssessmentIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import NotificationBell from '../components/NotificationBell'; // <--- AGREGAR ESTO

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.rol === 'admin';
  const currentWidth = drawerOpen ? drawerWidth : collapsedDrawerWidth;

  // ============================================
  // MENÚ SIMPLIFICADO (SIN SUBMENÚS)
  // ============================================
  const mainMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  ];

  const adminMenuItems = [
    { text: 'Inventario', icon: <InventoryIcon />, path: '/admin/inventario' },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/admin/usuarios' },
    { text: 'Correos Masivos', icon: <EmailIcon />, path: '/admin/email' },
    { text: 'Reportes', icon: <AssessmentIcon />, path: '/admin/reportes' },
  ];

  const allMenuItems = [...mainMenuItems, ...(isAdmin ? adminMenuItems : [])];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del drawer con toggle */}
      <Toolbar 
        sx={{ 
          background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
          color: 'white',
          minHeight: 64,
          display: 'flex',
          justifyContent: drawerOpen ? 'space-between' : 'center',
          alignItems: 'center',
          px: drawerOpen ? 2 : 1,
          boxShadow: '0 4px 20px rgba(82, 98, 223, 0.3)',
        }}
      >
        {drawerOpen ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 36, 
                  height: 36,
                  mr: 1.5,
                  fontSize: 14,
                  fontWeight: 'bold'
                }}
              >
                SC
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 1, lineHeight: 1.2 }}>
                  Spartan
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', fontSize: '0.6rem' }}>
                  Conveyors System
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={toggleDrawer} 
              size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </>
        ) : (
          <Tooltip title="Expandir menú" placement="right">
            <IconButton 
              onClick={toggleDrawer}
              sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>

      {/* Menú de navegación - SIMPLIFICADO */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1, px: 1 }}>
        <List sx={{ px: 0 }}>
          {allMenuItems.map((item) => (
            <Tooltip key={item.text} title={drawerOpen ? '' : item.text} placement="right">
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderRadius: 2,
                  mb: 0.3,
                  justifyContent: drawerOpen ? 'flex-start' : 'center',
                  px: drawerOpen ? 2 : 1,
                  py: 1,
                  minHeight: 44,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    backgroundColor: alpha('#5262DF', 0.15),
                    '&:hover': { backgroundColor: alpha('#5262DF', 0.25) },
                    '& .MuiListItemIcon-root': { color: '#5262DF' }
                  },
                  '&:hover': {
                    backgroundColor: alpha('#5262DF', 0.08),
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive(item.path) ? '#5262DF' : 'rgba(255,255,255,0.5)',
                    minWidth: drawerOpen ? 40 : 'auto',
                    mr: drawerOpen ? 1 : 0,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText 
                    primary={item.text}
                    sx={{ 
                      color: isActive(item.path) ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                      '& .MuiListItemText-primary': { fontWeight: isActive(item.path) ? 600 : 400, fontSize: '0.9rem' }
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>

      {/* Footer del drawer */}
      {drawerOpen && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', display: 'block', textAlign: 'center' }}>
            © 2024 Spartan Conveyors
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.15)', display: 'block', textAlign: 'center', fontSize: '0.55rem' }}>
            Desarrollado por Néstor
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentWidth}px)` },
          ml: { sm: `${currentWidth}px` },
          transition: 'width 0.3s ease, margin-left 0.3s ease',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            color="inherit"
            onClick={toggleDrawer}
            sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1.1rem', letterSpacing: 0.5 }}>
            {location.pathname === '/dashboard' && 'Dashboard'}
            {location.pathname === '/tickets/nuevo' && 'Nuevo Ticket'}
            {location.pathname === '/admin/tickets' && 'Todos los Tickets'}
            {location.pathname === '/admin/inventario' && 'Inventario'}
            {location.pathname === '/admin/usuarios' && 'Usuarios'}
            {location.pathname === '/admin/email' && 'Correos Masivos'}
            {location.pathname === '/admin/reportes' && 'Reportes'}
          </Typography>

          {/* NOTIFICACIONES - COMPONENTE INTEGRADO */}
          <NotificationBell />

          {/* Usuario */}
          <Button color="inherit" onClick={handleMenuOpen} sx={{ ml: 1, textTransform: 'none' }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#5262DF', fontSize: '0.8rem' }}>
              {user?.nombre?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.nombre}
            </Typography>
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                bgcolor: '#1A1A1A',
                color: 'white',
                border: '1px solid rgba(82, 98, 223, 0.2)',
                borderRadius: 2,
                minWidth: 200,
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/perfil'); }} sx={{ '&:hover': { bgcolor: 'rgba(82,98,223,0.05)' } }}>
              <ListItemIcon><PersonIcon sx={{ color: '#5262DF' }} /></ListItemIcon>
              <ListItemText>Mi Perfil</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }} sx={{ '&:hover': { bgcolor: 'rgba(82,98,223,0.05)' } }}>
              <ListItemIcon><Home sx={{ color: '#5262DF' }} /></ListItemIcon>
              <ListItemText>Inicio</ListItemText>
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
            <MenuItem onClick={handleLogout} sx={{ color: '#ff6b6b', '&:hover': { bgcolor: 'rgba(255,50,50,0.05)' } }}>
              <ListItemIcon><LogoutIcon sx={{ color: '#ff6b6b' }} /></ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: currentWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#0D0D0D',
              borderRight: '2px solid rgba(82, 98, 223, 0.3)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentWidth,
              transition: 'width 0.3s ease',
              bgcolor: '#0D0D0D',
              borderRight: '2px solid rgba(82, 98, 223, 0.2)',
              overflowX: 'hidden',
              boxShadow: '4px 0 30px rgba(0,0,0,0.3)',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${currentWidth}px)` },
          mt: 8,
          bgcolor: '#F5F0F8',
          minHeight: '100vh',
          transition: 'width 0.3s ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;