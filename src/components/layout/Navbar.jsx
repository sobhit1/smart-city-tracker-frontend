import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Divider,
} from '@mui/material';
import Logout from '@mui/icons-material/Logout';

import { logout } from '../../state/authSlice';
import apiClient from '../../toolkit/apiClient';
import { LOGOUT_API } from '../../const/api';
import { LOGIN_PATH } from '../../const/routes';

/**
 * A helper function to get the user's initials from their full name.
 * @param {string} name - The user's full name.
 * @returns {string} The user's initials (e.g., "JD" for "John Doe").
 */
const getInitials = (name = '') => {
  const nameParts = name.split(' ');
  const firstNameInitial = nameParts[0] ? nameParts[0][0] : '';
  const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
  return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
};

/**
 * The main navigation bar for the application.
 * Features a user menu with an avatar and a logout option.
 */
function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // State to manage the user menu's open/closed status.
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose(); // Close the menu first
    try {
      await apiClient.post(LOGOUT_API);
    } catch (error) {
      console.error('Logout API call failed, proceeding with client-side logout.', error);
    } finally {
      dispatch(logout());
      navigate(LOGIN_PATH);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* App Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart City Issue Tracker
        </Typography>

        {/* User Menu Trigger */}
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
          <Typography sx={{ minWidth: 100, display: { xs: 'none', sm: 'block' } }}>
            Hi, {user?.fullName.split(' ')[0]}
          </Typography>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {getInitials(user?.fullName)}
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