import { useState, useEffect, useRef } from 'react';
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
    CircularProgress,
    Divider,
    Fade,
    InputBase,
    Stack,
} from '@mui/material';
import {
    Search as SearchIcon,
    Person as PersonIcon,
    Add as AddIcon,
    ErrorOutline as ErrorIcon,
} from '@mui/icons-material';

import { useUsers } from '../../../hooks/useLookups';

function highlightMatch(text, query) {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <Box
                key={i}
                component="span"
                sx={{
                    bgcolor: '#5299FF',
                    color: '#fff',
                    px: 0.5,
                    borderRadius: '3px',
                    fontWeight: 600,
                }}
            >
                {part}
            </Box>
        ) : (
            part
        )
    );
}

function UserMentionAutocomplete({
    anchorEl,
    searchQuery = '',
    onSelectUser,
    onClose,
}) {
    const { data: users, isLoading, isError } = useUsers();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [freeSoloValue, setFreeSoloValue] = useState('');
    const listRef = useRef(null);

    const filteredUsers = (users || []).filter(
        (user) =>
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const allowFreeSolo =
        searchQuery.trim().length > 0 &&
        !filteredUsers.some(
            (user) =>
                user.fullName.toLowerCase() === searchQuery.toLowerCase() ||
                user.userName.toLowerCase() === searchQuery.toLowerCase()
        );

    useEffect(() => {
        setSelectedIndex(0);
        setFreeSoloValue(searchQuery);
    }, [searchQuery, anchorEl]);

    useEffect(() => {
        if (!anchorEl) return;

        const handleKeyDown = (e) => {
            if (!anchorEl) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev + 1 < filteredUsers.length + (allowFreeSolo ? 1 : 0)
                        ? prev + 1
                        : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev - 1 < 0
                        ? filteredUsers.length + (allowFreeSolo ? 1 : 0) - 1
                        : prev - 1
                );
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                if (filteredUsers[selectedIndex]) {
                    e.preventDefault();
                    onSelectUser(filteredUsers[selectedIndex]);
                } else if (allowFreeSolo && selectedIndex === filteredUsers.length) {
                    e.preventDefault();
                    onSelectUser({
                        id: null,
                        fullName: freeSoloValue,
                        userName: freeSoloValue,
                        avatarUrl: null,
                        isFreeSolo: true,
                    });
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [anchorEl, filteredUsers, selectedIndex, allowFreeSolo, freeSoloValue, onSelectUser, onClose]);

    useEffect(() => {
        if (listRef.current) {
            const item = listRef.current.querySelector(
                `[data-index="${selectedIndex}"]`
            );
            if (item) item.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    const minWidth = 320;
    const maxWidth = 420;

    if (!anchorEl) return null;

    return (
        <Popper
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            placement="bottom-start"
            style={{ zIndex: 1500 }}
            modifiers={[
                { name: 'offset', options: { offset: [0, 4] } },
                { name: 'preventOverflow', options: { altAxis: true, tether: true } },
            ]}
        >
            <Fade in>
                <Paper
                    elevation={8}
                    sx={{
                        minWidth: { xs: '90vw', sm: minWidth },
                        maxWidth: maxWidth,
                        bgcolor: '#282E33',
                        border: '1px solid #373E47',
                        borderRadius: '6px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 340,
                        width: '100%',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            px: 1.5,
                            py: 1,
                            bgcolor: '#1D2125',
                            borderBottom: '1px solid #373E47',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <PersonIcon sx={{ fontSize: 16, color: '#7D858D' }} />
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, color: '#E6EDF2', fontSize: 12 }}
                        >
                            Mention user
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ ml: 'auto', color: '#7D858D', fontSize: 11 }}
                        >
                            {filteredUsers.length}
                            {filteredUsers.length === 1 ? ' user' : ' users'}
                        </Typography>
                    </Box>

                    {/* Loading/Error/Empty */}
                    {isLoading ? (
                        <Box
                            sx={{
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <CircularProgress size={24} thickness={3} sx={{ color: '#5299FF' }} />
                            <Typography
                                variant="body2"
                                sx={{ color: '#7D858D', fontSize: 13 }}
                            >
                                Loading users...
                            </Typography>
                        </Box>
                    ) : isError ? (
                        <Box
                            sx={{
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <ErrorIcon sx={{ fontSize: 32, color: '#f85149' }} />
                            <Typography
                                variant="body2"
                                sx={{ color: '#f85149', fontSize: 13, textAlign: 'center' }}
                            >
                                Failed to load users.
                            </Typography>
                        </Box>
                    ) : filteredUsers.length === 0 && !allowFreeSolo ? (
                        <Box
                            sx={{
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <SearchIcon sx={{ fontSize: 32, color: '#7D858D' }} />
                            <Typography
                                variant="body2"
                                sx={{ color: '#7D858D', fontSize: 13, textAlign: 'center' }}
                            >
                                No users found matching "{searchQuery}"
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* User List */}
                            <List
                                dense
                                disablePadding
                                ref={listRef}
                                sx={{
                                    overflowY: 'auto',
                                    flexGrow: 1,
                                    maxHeight: { xs: 220, sm: 240 },
                                    '&::-webkit-scrollbar': {
                                        width: 6,
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        bgcolor: '#373E47',
                                        borderRadius: '3px',
                                    },
                                }}
                                role="listbox"
                                aria-label="Mention user list"
                            >
                                {filteredUsers.map((user, idx) => {
                                    const isSelected = idx === selectedIndex;
                                    return (
                                        <Box key={user.id || user.userName}>
                                            <ListItem
                                                button
                                                selected={isSelected}
                                                data-index={idx}
                                                onClick={() => onSelectUser(user)}
                                                onMouseEnter={() => setSelectedIndex(idx)}
                                                sx={{
                                                    py: 1,
                                                    px: 1.5,
                                                    bgcolor: isSelected ? '#373E47' : 'transparent',
                                                    borderLeft: '2px solid',
                                                    borderColor: isSelected ? '#5299FF' : 'transparent',
                                                    transition: 'all 0.15s',
                                                    '&:hover': {
                                                        bgcolor: '#373E47',
                                                    },
                                                }}
                                                role="option"
                                                aria-selected={isSelected}
                                            >
                                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                                    <Avatar
                                                        src={user.avatarUrl}
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            bgcolor: '#5299FF',
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {user.fullName?.charAt(0)?.toUpperCase() || <PersonIcon />}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 500,
                                                                fontSize: 13,
                                                                color: '#E6EDF2',
                                                                maxWidth: 180,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {highlightMatch(user.fullName, searchQuery)}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontSize: 12,
                                                                color: '#7D858D',
                                                                maxWidth: 120,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            @{highlightMatch(user.userName, searchQuery)}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                            {idx < filteredUsers.length - 1 && (
                                                <Divider sx={{ borderColor: '#373E47', ml: 7 }} />
                                            )}
                                        </Box>
                                    );
                                })}
                                {/* Free solo option */}
                                {allowFreeSolo && (
                                    <Box>
                                        <ListItem
                                            button
                                            selected={selectedIndex === filteredUsers.length}
                                            data-index={filteredUsers.length}
                                            onClick={() =>
                                                onSelectUser({
                                                    id: null,
                                                    fullName: freeSoloValue,
                                                    userName: freeSoloValue,
                                                    avatarUrl: null,
                                                    isFreeSolo: true,
                                                })
                                            }
                                            onMouseEnter={() => setSelectedIndex(filteredUsers.length)}
                                            sx={{
                                                py: 1,
                                                px: 1.5,
                                                bgcolor:
                                                    selectedIndex === filteredUsers.length
                                                        ? '#373E47'
                                                        : 'transparent',
                                                borderLeft: '2px solid',
                                                borderColor:
                                                    selectedIndex === filteredUsers.length
                                                        ? '#5299FF'
                                                        : 'transparent',
                                                transition: 'all 0.15s',
                                                '&:hover': {
                                                    bgcolor: '#373E47',
                                                },
                                            }}
                                            role="option"
                                            aria-selected={selectedIndex === filteredUsers.length}
                                        >
                                            <ListItemAvatar sx={{ minWidth: 40 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        bgcolor: '#7D858D',
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    <AddIcon sx={{ fontSize: 18 }} />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 500,
                                                                fontSize: 13,
                                                                color: '#E6EDF2',
                                                                maxWidth: 180,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            Mention <b>{freeSoloValue}</b>
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: '#5299FF',
                                                                fontWeight: 600,
                                                                fontSize: 11,
                                                                ml: 1,
                                                            }}
                                                        >
                                                            (custom)
                                                        </Typography>
                                                    </Stack>
                                                }
                                                secondary={
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontSize: 12,
                                                            color: '#7D858D',
                                                        }}
                                                    >
                                                        Add as a free-form mention
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    </Box>
                                )}
                            </List>
                            {/* Footer with keyboard hints */}
                            <Box
                                sx={{
                                    px: 1.5,
                                    py: 0.75,
                                    bgcolor: '#1D2125',
                                    borderTop: '1px solid #373E47',
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: '3px',
                                        bgcolor: '#373E47',
                                        fontSize: 10,
                                        fontWeight: 500,
                                        color: '#7D858D',
                                    }}
                                >
                                    ↑↓ Navigate
                                </Box>
                                <Box
                                    sx={{
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: '3px',
                                        bgcolor: '#373E47',
                                        fontSize: 10,
                                        fontWeight: 500,
                                        color: '#7D858D',
                                    }}
                                >
                                    ↵ Select
                                </Box>
                                <Box
                                    sx={{
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: '3px',
                                        bgcolor: '#373E47',
                                        fontSize: 10,
                                        fontWeight: 500,
                                        color: '#7D858D',
                                    }}
                                >
                                    Esc Close
                                </Box>
                            </Box>
                        </>
                    )}
                </Paper>
            </Fade>
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