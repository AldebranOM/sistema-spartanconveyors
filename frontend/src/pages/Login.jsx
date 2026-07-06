import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  Grid,
  alpha
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Credenciales inválidas');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 30% 50%, rgba(123, 47, 190, 0.1) 0%, transparent 50%)',
          animation: 'pulse 4s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={24} 
          sx={{ 
            p: 4, 
            borderRadius: 4,
            background: 'rgba(45, 45, 45, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(123, 47, 190, 0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar 
              sx={{ 
                m: 1, 
                bgcolor: '#7B2FBE',
                width: 64,
                height: 64,
                boxShadow: '0 8px 30px rgba(123, 47, 190, 0.4)',
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography component="h1" variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700, mt: 1 }}>
              Spartan Conveyors
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
              Sistema de Tickets
            </Typography>
            <Box sx={{ 
              width: 60, 
              height: 3, 
              bgcolor: '#7B2FBE', 
              borderRadius: 2,
              mt: 2,
              boxShadow: '0 0 20px rgba(123, 47, 190, 0.5)',
            }} />
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                bgcolor: 'rgba(211, 47, 47, 0.1)',
                color: '#ff6b6b',
                border: '1px solid rgba(211, 47, 47, 0.3)',
                '& .MuiAlert-icon': { color: '#ff6b6b' }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(123, 47, 190, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#7B2FBE' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#7B2FBE' },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(123, 47, 190, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#7B2FBE' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#7B2FBE' },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                background: 'linear-gradient(135deg, #7B2FBE 0%, #5A1E8A 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6A26A8 0%, #4A1878 100%)',
                },
                boxShadow: '0 8px 30px rgba(123, 47, 190, 0.3)',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </Button>
            
            <Grid container>
              <Grid item xs>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                  Credenciales de prueba:
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                  Email: admin@sistema.com
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                  Contraseña: admin123
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)' }}>
                © 2024 Spartan Conveyors
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.15)', display: 'block', fontSize: '0.6rem' }}>
                Desarrollado por Néstor
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;