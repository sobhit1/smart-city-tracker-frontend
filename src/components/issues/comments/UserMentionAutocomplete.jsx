import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Popper,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Box,
    Fade,
    Chip,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Search as SearchIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import { useUsers } from '../../../hooks/useLookups';

function UserMentionAutocomplete({ anchorEl, searchQuery, onSelectUser, onClose }) {
    const { data: users, isLoading } = useUsers();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const filteredUsers = (users || []).filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!anchorEl || filteredUsers.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredUsers.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                if (filteredUsers[selectedIndex]) {
                    e.preventDefault();
                    onSelectUser(filteredUsers[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [anchorEl, filteredUsers, selectedIndex, onSelectUser, onClose]);

    const highlightMatch = (text, query) => {
        if (!query) return text;
        
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) => 
            part.toLowerCase() === query.toLowerCase() ? (
                <Box
                    key={index}
                    component="span"
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 0.5,
                        borderRadius: 0.5,
                        fontWeight: 700,
                    }}
                >
                    {part}
                </Box>
            ) : part
        );
    };

    if (!anchorEl) return null;

    if (isLoading) {
        return (
            <Popper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                placement="bottom-start"
                style={{ zIndex: 1500 }}
                modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
                transition
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                        <Paper
                            elevation={12}
                            sx={{
                                minWidth: { xs: 280, sm: 320 },
                                border: 2,
                                borderColor: 'primary.light',
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                <CircularProgress size={32} thickness={4} />
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    Loading users...
                                </Typography>
                            </Box>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        );
    }

    if (filteredUsers.length === 0) {
        return (
            <Popper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                placement="bottom-start"
                style={{ zIndex: 1500 }}
                modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
                transition
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                        <Paper
                            elevation={12}
                            sx={{
                                minWidth: { xs: 280, sm: 320 },
                                border: 2,
                                borderColor: 'divider',
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                <SearchIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                                <Typography variant="body2" color="text.secondary" fontWeight={500} textAlign="center">
                                    No users found matching "{searchQuery}"
                                </Typography>
                            </Box>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        );
    }

    return (
        <Popper
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            placement="bottom-start"
            style={{ zIndex: 1500 }}
            modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
            transition
        >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={200}>
                    <Paper
                        elevation={12}
                        sx={{
                            maxHeight: 320,
                            overflow: 'hidden',
                            minWidth: { xs: 300, sm: 360 },
                            border: 2,
                            borderColor: 'primary.light',
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon sx={{ fontSize: 20 }} />
                                <Typography variant="body2" fontWeight={700}>
                                    Mention User
                                </Typography>
                            </Box>
                            <Chip
                                label={`${filteredUsers.length} ${filteredUsers.length === 1 ? 'user' : 'users'}`}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'inherit',
                                    '& .MuiChip-label': { px: 1 },
                                }}
                            />
                        </Box>

                        {/* User List */}
                        <List
                            dense
                            disablePadding
                            sx={{
                                overflow: 'auto',
                                flexGrow: 1,
                                '&::-webkit-scrollbar': {
                                    width: 8,
                                },
                                '&::-webkit-scrollbar-track': {
                                    bgcolor: 'action.hover',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bgcolor: 'primary.main',
                                    borderRadius: 1,
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    }
                                }
                            }}
                        >
                            {filteredUsers.map((user, index) => {
                                const isSelected = index === selectedIndex;
                                const isHovered = index === hoveredIndex;
                                
                                return (
                                    <Box key={user.id}>
                                        <ListItem
                                            button
                                            onClick={() => onSelectUser(user)}
                                            onMouseEnter={() => {
                                                setHoveredIndex(index);
                                                setSelectedIndex(index);
                                            }}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                            sx={{
                                                py: 1.5,
                                                px: 2,
                                                bgcolor: isSelected ? 'primary.lighter' : 'transparent',
                                                borderLeft: 4,
                                                borderColor: isSelected ? 'primary.main' : 'transparent',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                                                '&:hover': {
                                                    bgcolor: 'primary.lighter',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        bgcolor: 'primary.main',
                                                        fontSize: 18,
                                                        fontWeight: 700,
                                                        boxShadow: isSelected ? 3 : 1,
                                                        transition: 'all 0.2s',
                                                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                                    }}
                                                >
                                                    {user.fullName.charAt(0)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" fontWeight={600} fontSize="0.95rem">
                                                            {highlightMatch(user.fullName, searchQuery)}
                                                        </Typography>
                                                        {isSelected && (
                                                            <CheckCircleIcon
                                                                sx={{
                                                                    fontSize: 16,
                                                                    color: 'primary.main',
                                                                    animation: 'fadeIn 0.2s ease-in',
                                                                    '@keyframes fadeIn': {
                                                                        from: { opacity: 0, transform: 'scale(0)' },
                                                                        to: { opacity: 1, transform: 'scale(1)' },
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography variant="caption" fontSize="0.85rem" color="text.secondary">
                                                        @{highlightMatch(user.userName, searchQuery)}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        {index < filteredUsers.length - 1 && (
                                            <Divider sx={{ opacity: 0.5 }} />
                                        )}
                                    </Box>
                                );
                            })}
                        </List>

                        {/* Footer with keyboard hints */}
                        <Box
                            sx={{
                                px: 2,
                                py: 1,
                                bgcolor: 'action.hover',
                                borderTop: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                gap: 1.5,
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                            }}
                        >
                            <Chip
                                label="↑↓ Navigate"
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    bgcolor: 'background.paper',
                                }}
                            />
                            <Chip
                                label="↵ Select"
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    bgcolor: 'background.paper',
                                }}
                            />
                            <Chip
                                label="Esc Close"
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    bgcolor: 'background.paper',
                                }}
                            />
                        </Box>
                    </Paper>
                </Fade>
            )}
        </Popper>
    );
}

UserMentionAutocomplete.propTypes = {
    anchorEl: PropTypes.object,
    searchQuery: PropTypes.string,
    onSelectUser: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default UserMentionAutocomplete;