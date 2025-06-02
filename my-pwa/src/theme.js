import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors'; // Example color import

// A basic theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6', // Example primary color (Material UI default blue-ish)
    },
    secondary: {
      main: '#19857b', // Example secondary color (Material UI default green-ish)
    },
    error: {
      main: red.A400, // Example error color from MUI colors
    },
    // You can also define mode: 'light' or 'dark'
    // background: { default: '#fff', paper: '#f5f5f5' }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    // You can customize typography variants here if needed
    // h1: { fontSize: '2.2rem' },
  },
  // You can also add customizations for components, spacing, breakpoints, etc.
  // components: { MuiButton: { styleOverrides: { root: { borderRadius: 8 } } } }
});

export default theme;
