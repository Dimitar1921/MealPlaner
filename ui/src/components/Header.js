import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/actions/userActions';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const handleLogout = () => {
   
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    
    dispatch(logout());
    
    
    navigate('/');
  };
console.log(user)
  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Nutrition Calculator
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            src={user?.picture} 
            alt={user?.username || user?.email || 'User'} 
            sx={{ width: 40, height: 40 }}
          >
            {!user?.picture && (user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </Avatar>
          {user?.username && (
            <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user.username}
            </Typography>
          )}
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

