import  { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import Logout from '@mui/icons-material/Logout';

import { useLogout } from '../../api/authApi';
import { logout } from '../../state/authSlice';
import { LOGIN_PATH, DASHBOARD_PATH } from '../../const/routes';
import { showNotification } from '../../state/notificationSlice';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { mutate: logoutMutation } = useLogout({
    onSuccess: () => {
      dispatch(logout());
      navigate(LOGIN_PATH);
    },
    onError: (error) => {
      console.error('Logout API call failed, proceeding with client-side logout.', error);
      dispatch(logout());
      navigate(LOGIN_PATH);
      dispatch(showNotification({ message: 'Could not contact server, logged out locally.', severity: 'warning' }));
    },
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logoutMutation();
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <RouterLink to={DASHBOARD_PATH} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart City Issue Tracker
          </Typography>
        </RouterLink>

        <Box sx={{ flexGrow: 1 }} />

        {/* User Menu Trigger */}
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
          <Typography sx={{ minWidth: 100, display: { xs: 'none', sm: 'block' } }}>
            Hi, {user?.fullName.split(' ')[0]}
          </Typography>
          <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>
          </IconButton>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;