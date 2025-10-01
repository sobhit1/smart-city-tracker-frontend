import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Select,
    MenuItem,
    FormControl,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    InputLabel,
    Typography,
} from '@mui/material';

function AssignmentDialog({ open, onClose, onAssign, currentAssignee, availableUsers }) {
    const [selectedUserId, setSelectedUserId] = useState('');

    useEffect(() => {
        if (open) {
            setSelectedUserId(currentAssignee?.id || '');
        }
    }, [open, currentAssignee]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    backgroundColor: '#1F2428',
                    border: '1px solid #373E47'
                }
            }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid #373E47', pb: 2 }}>
                Assign Issue
            </DialogTitle>
            <DialogContent sx={{ pt: '24px !important' }}>
                <FormControl fullWidth>
                    <InputLabel sx={{ backgroundColor: '#1F2428', px: 1 }}>Assignee</InputLabel>
                    <Select
                        value={selectedUserId}
                        label="Assignee"
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#373E47',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#5299FF',
                            }
                        }}
                    >
                        <MenuItem value=""><em style={{ color: '#8B949E' }}>Unassigned</em></MenuItem>
                        {availableUsers.map(user => (
                            <MenuItem key={user.id} value={user.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{
                                        width: 24,
                                        height: 24,
                                        fontSize: '11px',
                                        bgcolor: '#5299FF',
                                        fontWeight: 600
                                    }}>
                                        {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                    </Avatar>
                                    <Typography variant="body2">{user?.fullName || 'Unknown User'}</Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid #373E47', pt: 2, px: 3, pb: 2.5 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: '#8B949E',
                        '&:hover': { backgroundColor: 'rgba(139, 148, 158, 0.1)' }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => onAssign(selectedUserId)}
                    variant="contained"
                    sx={{
                        backgroundColor: '#5299FF',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: '#4285E8',
                            boxShadow: '0 4px 12px rgba(82, 153, 255, 0.3)'
                        }
                    }}
                >
                    Assign
                </Button>
            </DialogActions>
        </Dialog>
    );
}

AssignmentDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAssign: PropTypes.func.isRequired,
    currentAssignee: PropTypes.object,
    availableUsers: PropTypes.array.isRequired,
};

export default AssignmentDialog;