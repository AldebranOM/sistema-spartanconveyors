import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5262DF', // Color principal actualizado
      light: '#7B8AE8',
      dark: '#3A4FB0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2D2D2D',
      light: '#4A4A4A',
      dark: '#1A1A1A',
    },
    background: {
      default: '#F5F3FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#5A5A5A',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    warning: {
      main: '#ED6C02',
      light: '#FF9800',
      dark: '#E65100',
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#B71C1C',
    },
    info: {
      main: '#5262DF',
      light: '#7B8AE8',
      dark: '#3A4FB0',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { 
      fontWeight: 700, 
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: { 
      fontWeight: 700, 
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: { 
      fontWeight: 600, 
      fontSize: '1.75rem',
    },
    h4: { 
      fontWeight: 600, 
      fontSize: '1.5rem',
    },
    h5: { 
      fontWeight: 600, 
      fontSize: '1.25rem',
    },
    h6: { 
      fontWeight: 600, 
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  components: {
    // ============================================
    // APP BAR
    // ============================================
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
        },
      },
    },

    // ============================================
    // DRAWER
    // ============================================
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #0D0D0D 0%, #1A1A1A 100%)',
          borderRight: '1px solid rgba(82, 98, 223, 0.15)',
          boxShadow: '4px 0 30px rgba(0,0,0,0.3)',
        },
      },
    },

    // ============================================
    // BUTTONS
    // ============================================
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #5262DF 0%, #3A4FB0 100%)',
          boxShadow: '0 4px 15px rgba(82, 98, 223, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4555C4 0%, #2E3F99 100%)',
            boxShadow: '0 6px 20px rgba(82, 98, 223, 0.4)',
          },
        },
        outlined: {
          borderColor: '#5262DF',
          color: '#5262DF',
          '&:hover': {
            borderColor: '#3A4FB0',
            color: '#3A4FB0',
            backgroundColor: 'rgba(82, 98, 223, 0.04)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(82, 98, 223, 0.04)',
          },
        },
      },
    },

    // ============================================
    // CARDS
    // ============================================
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(82, 98, 223, 0.10)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },

    // ============================================
    // CHIPS
    // ============================================
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: 'rgba(82, 98, 223, 0.10)',
          color: '#5262DF',
        },
        colorSuccess: {
          backgroundColor: 'rgba(46, 125, 50, 0.10)',
          color: '#2E7D32',
        },
        colorWarning: {
          backgroundColor: 'rgba(237, 108, 2, 0.10)',
          color: '#ED6C02',
        },
        colorError: {
          backgroundColor: 'rgba(211, 47, 47, 0.10)',
          color: '#D32F2F',
        },
      },
    },

    // ============================================
    // TABLES
    // ============================================
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8F6FA',
          '& .MuiTableCell-root': {
            fontWeight: 600,
            color: '#1A1A1A',
            fontSize: '0.8rem',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            borderBottom: '2px solid #E8E4F0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(82, 98, 223, 0.04)',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          borderBottom: '1px solid #F0EDF5',
          fontSize: '0.875rem',
        },
      },
    },

    // ============================================
    // INPUTS
    // ============================================
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5262DF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5262DF',
              borderWidth: 2,
            },
          },
        },
      },
    },

    // ============================================
    // SELECT / MENU
    // ============================================
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 4px',
          '&:hover': {
            backgroundColor: 'rgba(82, 98, 223, 0.06)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(82, 98, 223, 0.10)',
            '&:hover': {
              backgroundColor: 'rgba(82, 98, 223, 0.15)',
            },
          },
        },
      },
    },

    // ============================================
    // DIALOG
    // ============================================
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '20px 24px 12px 24px',
          fontSize: '1.1rem',
          fontWeight: 600,
        },
      },
    },

    // ============================================
    // TOOLTIP
    // ============================================
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1A1A1A',
          color: '#FFFFFF',
          fontSize: '0.75rem',
          padding: '6px 12px',
          borderRadius: 6,
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        },
        arrow: {
          color: '#1A1A1A',
        },
      },
    },

    // ============================================
    // TABS
    // ============================================
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 48,
          '&.Mui-selected': {
            color: '#5262DF',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#5262DF',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },

    // ============================================
    // BADGE
    // ============================================
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
        },
      },
    },

    // ============================================
    // PAPER
    // ============================================
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        },
      },
    },

    // ============================================
    // LIST ITEMS
    // ============================================
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(82, 98, 223, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(82, 98, 223, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(82, 98, 223, 0.12)',
            },
          },
        },
      },
    },

    // ============================================
    // SNACKBAR / ALERT
    // ============================================
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: '#E8F5E9',
        },
        standardError: {
          backgroundColor: '#FFEBEE',
        },
        standardWarning: {
          backgroundColor: '#FFF3E0',
        },
        standardInfo: {
          backgroundColor: '#F0ECFF',
        },
      },
    },

    // ============================================
    // SCROLLBAR (Global)
    // ============================================
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#D0C8E0 #F5F0F8',
        },
        '::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: '#F5F0F8',
          borderRadius: '3px',
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: '#D0C8E0',
          borderRadius: '3px',
          transition: 'background-color 0.2s ease',
        },
        '::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#B8AED0',
        },
      },
    },
  },
});

export default theme;