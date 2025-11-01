import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { createTheme, ThemeProvider } from '@mui/material';
import { green, orange, red } from '@mui/material/colors';

export default function Navbar() {
    const theme = createTheme({
        palette:{
            primary: green,
        }
});
    
  return (
    <ThemeProvider theme={theme}>

    <Box sx={{ flexGrow: 1 }} className='mx-6 pt-5'>
      <AppBar position="static" color='primary' className=' rounded-3xl '>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="default"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Satellite Visualizer
          </Typography>
          {/* <Button color="inherit" >Github</Button> */}
        </Toolbar>
      </AppBar>
    </Box>
    </ThemeProvider>
  );
}