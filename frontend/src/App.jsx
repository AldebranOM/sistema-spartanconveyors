import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import theme from './theme';

// Importar todas las páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import NewTicket from './pages/NewTicket';
import AdminTickets from './pages/AdminTickets';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import EmailBroadcast from './pages/EmailBroadcast';
import TicketDetail from './pages/TicketDetail';
import Reports from './pages/Reports';


console.log('🟣 App.jsx se está cargando...');

function App() {
  console.log('🟣 App renderizado');
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/tickets/nuevo" element={<NewTicket />} />
                <Route path="/admin/tickets" element={<AdminTickets />} />
                <Route path="/admin/usuarios" element={<Users />} />
                <Route path="/admin/inventario" element={<Inventory />} />
                <Route path="/admin/email" element={<EmailBroadcast />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/admin/reportes" element={<Reports />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;