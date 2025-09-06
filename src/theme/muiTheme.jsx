import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0d6efd',
    },
    secondary: {
      main: '#6c757d',
    },
    success: {
      main: '#198754',
    },
    error: {
      main: '#dc3545',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },

  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
  },
  
  spacing: 8,

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none', 
          borderRadius: '6px',
          padding: '10px 20px',
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#1e1e1e',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          },
          '& .MuiInputLabel-root': {
            color: '#b0b0b0',
          },
        },
      },
    },

    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'inherit',
      },
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderBottom: '1px solid #333333',
        },
      },
    },
  },
});

export default muiTheme;