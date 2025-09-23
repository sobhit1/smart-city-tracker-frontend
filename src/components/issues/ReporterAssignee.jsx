import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    Avatar,
    IconButton,
    Fade,
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';

import SidebarRow from './SidebarRow';

function ReporterAssignee({ label, value, onChange, hasEdit = false, availableUsers, avatarColor }) {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedValue, setSelectedValue] = useState('');

    useEffect(() => {
        setSelectedValue(value?.id || '');
    }, [value]);

    const handleSave = () => {
        const selectedUser = availableUsers.find(user => user.id === selectedValue);
        onChange(selectedUser || null);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const getUserById = (id) => availableUsers.find(user => user.id === id);

    return (
        <SidebarRow
            label={label}
            hasEdit={hasEdit && !isEditing}
            onClick={() => hasEdit && setIsEditing(true)}
        >
            {isEditing ? (
                <Fade in={true} timeout={200}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                                value={selectedValue}
                                onChange={(e) => setSelectedValue(e.target.value)}
                                autoFocus
                                sx={{
                                    fontSize: '13px',
                                    height: '30px',
                                    backgroundColor: '#1F2428',
                                    borderRadius: '6px',
                                    '& .MuiSelect-select': { py: 0, px: 1, display: 'flex', alignItems: 'center', gap: 1 },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#373E47' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#5299FF' }
                                }}
                                renderValue={(val) => {
                                    const user = getUserById(val);
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 20, height: 20, fontSize: '10px', bgcolor: avatarColor, fontWeight: 600 }}>
                                                {user?.name?.[0].toUpperCase() || '?'}
                                            </Avatar>
                                            <Typography sx={{ fontSize: '13px', color: '#E6EDF2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 70 }}>
                                                {user?.name || 'Unassigned'}
                                            </Typography>
                                        </Box>
                                    );
                                }}
                            >
                                <MenuItem value=""><em>Unassigned</em></MenuItem>
                                {availableUsers.map(user => (
                                    <MenuItem key={user.id} value={user.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 20, height: 20, fontSize: '10px', bgcolor: avatarColor, fontWeight: 600 }}>
                                                {user.name[0]}
                                            </Avatar>
                                            <Typography sx={{ fontSize: '13px' }}>{user.name}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <IconButton size="small" onClick={handleSave} sx={{ backgroundColor: '#5299FF', color: 'white', width: 24, height: 24, '&:hover': { backgroundColor: '#4285E8' } }}>
                            <CheckIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancel} sx={{ backgroundColor: 'rgba(139, 148, 158, 0.1)', color: '#8B949E', width: 24, height: 24, '&:hover': { backgroundColor: 'rgba(139, 148, 158, 0.2)' } }}>
                            <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                </Fade>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 22, height: 22, fontSize: '11px', bgcolor: value ? avatarColor : '#282E33', fontWeight: 600, border: `2px solid ${value ? 'rgba(244, 67, 54, 0.2)' : 'transparent'}` }}>
                        {value?.name?.[0].toUpperCase() || '?'}
                    </Avatar>
                    <Typography sx={{ fontSize: '14px', color: '#E6EDF2', fontWeight: 500 }}>
                        {value?.name || 'Unassigned'}
                    </Typography>
                </Box>
            )}
        </SidebarRow>
    );
}
ReporterAssignee.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    hasEdit: PropTypes.bool,
    availableUsers: PropTypes.array.isRequired,
    avatarColor: PropTypes.string.isRequired,
};

export default ReporterAssignee;