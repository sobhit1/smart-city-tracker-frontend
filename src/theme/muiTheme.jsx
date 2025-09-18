import { createTheme } from '@mui/material/styles';

// A professional and modern dark theme palette inspired by developer-centric UIs like Jira.
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5299FF', // A brighter, more accessible blue for primary actions.
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
      default: '#1D2125', // A dark charcoal background, not pure black.
      paper: '#282E33',   // A slightly lighter charcoal for cards and tables.
    },
    text: {
      primary: '#E6EDF2',   // A light grey for high-contrast primary text.
      secondary: '#7D858D', // A muted grey for secondary text and labels.
    },
    divider: '#373E47', // A subtle color for borders and dividers.
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
          border: `1px solid #373E47`, // full table border

          // Table cells
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid #373E47`,
            borderRight: `1px solid #373E47`,
          },

          // Column headers
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#1D2125',
            borderBottom: `1px solid #373E47`,
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: `1px solid #373E47`,
          },

          // Remove last column’s extra border (avoid double line)
          '& .MuiDataGrid-columnHeader:last-child, & .MuiDataGrid-cell:last-child': {
            borderRight: 'none',
          },

          // Footer
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid #373E47`,
          },

          // Toolbar
          '& .MuiDataGrid-toolbarContainer': {
            padding: '8px',
            '& .MuiButton-root': {
              color: '#7D858D',
            },
          },

          // Row hover effect
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#2C333A',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove MUI's default gradient on dark paper
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