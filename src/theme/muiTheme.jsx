import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5299FF',
    },
    secondary: {
      main: '#8b949e',
    },
    success: {
      main: '#3fb950',
    },
    error: {
      main: '#f85149',
    },
    background: {
      default: '#1D2125',
      paper: '#282E33',
    },
    text: {
      primary: '#E6EDF2',
      secondary: '#7D858D',
    },
    divider: '#373E47',
  },

  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 600 },
  },

  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid #373E47`,

          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid #373E47`,
            borderRight: `1px solid #373E47`,
          },

          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#1D2125',
            borderBottom: `1px solid #373E47`,
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: `1px solid #373E47`,
          },

          '& .MuiDataGrid-columnHeader:last-child, & .MuiDataGrid-cell:last-child': {
            borderRight: 'none',
          },

          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid #373E47`,
          },

          '& .MuiDataGrid-toolbarContainer': {
            padding: '8px',
            '& .MuiButton-root': {
              color: '#7D858D',
            },
          },

          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#2C333A',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '6px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#373E47',
            },
            '&:hover fieldset': {
              borderColor: '#8b949e',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#282E33',
          borderBottom: '1px solid #373E47',
        },
      },
    },
  },
});

export default muiTheme;