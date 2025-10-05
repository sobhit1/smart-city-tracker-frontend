import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    Avatar,
    Fade,
    InputBase,
    ClickAwayListener,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

import SidebarRow from './SidebarRow';

function ReporterAssignee({ label, value, onChange = () => {}, hasEdit = false, availableUsers, avatarColor }) {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedValue, setSelectedValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const selectRef = useRef();

    useEffect(() => {
        setSelectedValue(value?.id || '');
    }, [value]);

    const getUserById = (id) => availableUsers.find(user => user.id === id);

    const filteredUsers = availableUsers.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.userName && user.userName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSelectChange = (newValue) => {
        setSelectedValue(newValue);
        const selectedUser = availableUsers.find(user => user.id === newValue);
        onChange(selectedUser || null);
        setIsEditing(false);
        setSearchQuery('');
        setDropdownOpen(false);
    };

    const isClickInsideSelectOrDropdown = (target) => {
        if (selectRef.current && selectRef.current.contains(target)) return true;
        const dropdown = document.querySelector('.MuiPopover-root');
        if (dropdown && dropdown.contains(target)) return true;
        return false;
    };

    const handleClickAway = (event) => {
        if (dropdownOpen) return;
        if (isClickInsideSelectOrDropdown(event.target)) return;
        setIsEditing(false);
        setSearchQuery('');
    };

    const handleOpen = () => setDropdownOpen(true);
    const handleClose = () => {
        setDropdownOpen(false);
        setIsEditing(false);
        setSearchQuery('');
    };

    return (
        <SidebarRow
            label={label}
            hasEdit={hasEdit && !isEditing}
            onClick={() => hasEdit && setIsEditing(true)}
        >
            {isEditing ? (
                <ClickAwayListener onClickAway={handleClickAway}>
                    <Fade in={true} timeout={200}>
                        <Box ref={selectRef} sx={{ width: '100%' }}>
                            <FormControl size="small" sx={{ flex: 1, width: '100%' }}>
                                <Select
                                    value={selectedValue}
                                    onChange={(e) => handleSelectChange(e.target.value)}
                                    onOpen={handleOpen}
                                    onClose={handleClose}
                                    autoFocus
                                    displayEmpty
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: '#1F2428',
                                                border: '1px solid #373E47',
                                                borderRadius: '8px',
                                                mt: 0.5,
                                                maxHeight: 320,
                                                '& .MuiList-root': {
                                                    py: 0.5,
                                                },
                                            }
                                        },
                                        anchorOrigin: {
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        },
                                        transformOrigin: {
                                            vertical: 'top',
                                            horizontal: 'left',
                                        },
                                    }}
                                    sx={{
                                        fontSize: '14px',
                                        backgroundColor: '#1F2428',
                                        borderRadius: '8px',
                                        '& .MuiSelect-select': {
                                            py: 1,
                                            px: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#373E47',
                                            borderWidth: '1px',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#5299FF'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#5299FF',
                                            borderWidth: '1px',
                                        }
                                    }}
                                    renderValue={(val) => {
                                        const user = getUserById(val);
                                        return (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: '13px',
                                                    bgcolor: user ? avatarColor : '#373E47',
                                                    fontWeight: 600,
                                                    border: user ? `2px solid ${avatarColor}20` : 'none'
                                                }}>
                                                    {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                                </Avatar>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                                    <Typography sx={{
                                                        fontSize: '14px',
                                                        color: '#E6EDF2',
                                                        fontWeight: 500,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: 1.2
                                                    }}>
                                                        {user?.fullName || 'Unassigned'}
                                                    </Typography>
                                                    {user?.userName && (
                                                        <Typography sx={{
                                                            fontSize: '12px',
                                                            color: '#8B949E',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            lineHeight: 1.2
                                                        }}>
                                                            @{user.userName}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        );
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Escape') handleClose();
                                    }}
                                >
                                    {/* search box */}
                                    <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #373E47', mb: 0.5 }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: '#0D1117',
                                            borderRadius: '6px',
                                            border: '1px solid #373E47',
                                            px: 1,
                                            '&:focus-within': {
                                                borderColor: '#5299FF',
                                            }
                                        }}>
                                            <SearchIcon sx={{ fontSize: 16, color: '#8B949E', mr: 0.5 }} />
                                            <InputBase
                                                placeholder="Search users..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                sx={{
                                                    flex: 1,
                                                    fontSize: '13px',
                                                    color: '#E6EDF2',
                                                    py: 0.5,
                                                    '& input::placeholder': {
                                                        color: '#8B949E',
                                                        opacity: 1,
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                autoFocus
                                            />
                                        </Box>
                                    </Box>

                                    <MenuItem value="">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 28, height: 28, fontSize: '13px', bgcolor: '#373E47' }}>
                                                ?
                                            </Avatar>
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Typography sx={{ fontSize: '14px', color: '#8B949E', fontStyle: 'italic' }}>
                                                    Unassigned
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>

                                    {filteredUsers.length === 0 && searchQuery && (
                                        <Box sx={{ px: 1.5, py: 2, textAlign: 'center' }}>
                                            <Typography sx={{ fontSize: '13px', color: '#8B949E' }}>
                                                No users found
                                            </Typography>
                                        </Box>
                                    )}

                                    {filteredUsers.map(user => (
                                        <MenuItem key={user.id} value={user.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                                <Avatar sx={{
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: '13px',
                                                    bgcolor: avatarColor,
                                                    fontWeight: 600,
                                                    border: `2px solid ${avatarColor}20`
                                                }}>
                                                    {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                                </Avatar>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                                                    <Typography sx={{
                                                        fontSize: '14px',
                                                        color: '#E6EDF2',
                                                        fontWeight: 500,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: 1.3
                                                    }}>
                                                        {user.fullName}
                                                    </Typography>
                                                    {user.userName && (
                                                        <Typography sx={{
                                                            fontSize: '12px',
                                                            color: '#8B949E',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            lineHeight: 1.3
                                                        }}>
                                                            @{user.userName}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Fade>
                </ClickAwayListener>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                    <Avatar sx={{
                        width: 28,
                        height: 28,
                        fontSize: '13px',
                        bgcolor: value ? avatarColor : '#373E47',
                        fontWeight: 600,
                        border: value ? `2px solid ${avatarColor}20` : 'none'
                    }}>
                        {value?.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                        <Typography sx={{
                            fontSize: '14px',
                            color: value ? '#E6EDF2' : '#8B949E',
                            fontWeight: value ? 500 : 400,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.3,
                            fontStyle: value ? 'normal' : 'italic'
                        }}>
                            {value?.fullName || 'Unassigned'}
                        </Typography>
                        {value?.userName && (
                            <Typography sx={{
                                fontSize: '12px',
                                color: '#8B949E',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.3
                            }}>
                                @{value.userName}
                            </Typography>
                        )}
                    </Box>
                </Box>
            )}
        </SidebarRow>
    );
}

ReporterAssignee.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.object,
    onChange: PropTypes.func,
    hasEdit: PropTypes.bool,
    availableUsers: PropTypes.array.isRequired,
    avatarColor: PropTypes.string.isRequired,
};

export default ReporterAssignee;