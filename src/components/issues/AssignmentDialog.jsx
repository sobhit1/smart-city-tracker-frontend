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
    InputBase,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

function AssignmentDialog({ open, onClose, onAssign, currentAssignee, availableUsers }) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (open) {
            setSelectedUserId(currentAssignee?.id || '');
            setSearch('');
        }
    }, [open, currentAssignee]);

    const filteredUsers = availableUsers.filter(user =>
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.userName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAssign = () => {
        if (selectedUserId !== (currentAssignee?.id || '')) {
            onAssign(selectedUserId);
        }
    };

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
                    border: '1px solid #373E47',
                    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)'
                }
            }}
        >
            <DialogTitle
                sx={{
                    borderBottom: '1px solid #373E47',
                    pb: 2,
                    fontWeight: 700,
                    fontSize: 18,
                    color: '#E6EDF2',
                    letterSpacing: 0.2,
                }}
            >
                Assign Issue
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <FormControl fullWidth>
                    <InputLabel
                        sx={{
                            backgroundColor: '#1F2428',
                            px: 1,
                            color: '#8B949E',
                            fontWeight: 500,
                            fontSize: 15,
                        }}
                    >
                        Assignee
                    </InputLabel>
                    <Select
                        value={selectedUserId}
                        label="Assignee"
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        displayEmpty
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    backgroundColor: '#23272e',
                                    border: '1px solid #373E47',
                                    borderRadius: '10px',
                                    mt: 0.5,
                                    maxHeight: 320,
                                }
                            }
                        }}
                        sx={{
                            mt: 1,
                            fontSize: '15px',
                            backgroundColor: '#23272e',
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#373E47',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#5299FF',
                            }
                        }}
                        renderValue={(val) => {
                            if (!val) return <em style={{ color: '#8B949E' }}>Unassigned</em>;
                            const user = availableUsers.find(u => u.id === val);
                            return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{
                                        width: 26,
                                        height: 26,
                                        fontSize: '13px',
                                        bgcolor: '#5299FF',
                                        fontWeight: 600
                                    }}>
                                        {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, color: '#E6EDF2', fontSize: 15 }}>
                                            {user?.fullName || 'Unknown User'}
                                        </Typography>
                                        {user?.userName && (
                                            <Typography sx={{ fontSize: 12, color: '#8B949E' }}>
                                                @{user.userName}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            );
                        }}
                    >
                        {/* Search box */}
                        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #373E47', background: '#1F2428' }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#23272e',
                                borderRadius: '6px',
                                border: '1px solid #373E47',
                                px: 1,
                                '&:focus-within': { borderColor: '#5299FF' },
                            }}>
                                <SearchIcon sx={{ fontSize: 18, color: '#8B949E', mr: 1 }} />
                                <InputBase
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    sx={{
                                        flex: 1,
                                        fontSize: '14px',
                                        color: '#E6EDF2',
                                        py: 0.5,
                                        '& input::placeholder': {
                                            color: '#8B949E',
                                            opacity: 1,
                                        }
                                    }}
                                    onClick={e => e.stopPropagation()}
                                    inputProps={{ 'aria-label': 'Search users' }}
                                />
                            </Box>
                        </Box>
                        <MenuItem value="">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 26, height: 26, fontSize: '13px', bgcolor: '#373E47' }}>
                                    ?
                                </Avatar>
                                <Typography sx={{ color: '#8B949E', fontStyle: 'italic', fontWeight: 500 }}>
                                    Unassigned
                                </Typography>
                            </Box>
                        </MenuItem>
                        {filteredUsers.length === 0 && search && (
                            <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '13px', color: '#8B949E' }}>
                                    No users found
                                </Typography>
                            </Box>
                        )}
                        {filteredUsers.map(user => (
                            <MenuItem key={user.id} value={user.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{
                                        width: 26,
                                        height: 26,
                                        fontSize: '13px',
                                        bgcolor: '#5299FF',
                                        fontWeight: 600
                                    }}>
                                        {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, color: '#E6EDF2', fontSize: 15 }}>
                                            {user?.fullName || 'Unknown User'}
                                        </Typography>
                                        {user?.userName && (
                                            <Typography sx={{ fontSize: 12, color: '#8B949E' }}>
                                                @{user.userName}
                                            </Typography>
                                        )}
                                    </Box>
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
                        fontWeight: 500,
                        '&:hover': { backgroundColor: 'rgba(139, 148, 158, 0.1)' }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleAssign}
                    variant="contained"
                    disabled={selectedUserId === (currentAssignee?.id || '')}
                    sx={{
                        backgroundColor: '#5299FF',
                        fontWeight: 600,
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