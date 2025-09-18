import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { hideNotification } from '../state/notificationSlice';

function SnackbarAlert() {
  const dispatch = useDispatch();
  
  const { open, message, severity } = useSelector((state) => state.notifications);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideNotification());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
    >
      {message && (
        <Alert 
          onClose={handleClose} 
          severity={severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      )}
    </Snackbar>
  );
}

export default SnackbarAlert;