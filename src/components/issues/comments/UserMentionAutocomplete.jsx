import PropTypes from 'prop-types';
import {
    Avatar,
    Popper,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
} from '@mui/material';

const MOCK_USERS = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com' },
];

function UserMentionAutocomplete({ anchorEl, searchQuery, onSelectUser, onClose, position }) {
    const filteredUsers = MOCK_USERS.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!anchorEl || filteredUsers.length === 0) return null;

    return (
        <Popper 
            open={Boolean(anchorEl)} 
            anchorEl={anchorEl} 
            placement="bottom-start" 
            style={{ zIndex: 1500 }}
            modifiers={[
                {
                    name: 'offset',
                    options: {
                        offset: [0, 8],
                    },
                },
            ]}
        >
            <Paper elevation={8} sx={{ maxHeight: 280, overflow: 'auto', minWidth: { xs: 280, sm: 320 }, border: 1, borderColor: 'divider' }}>
                <List dense disablePadding>
                    {filteredUsers.map((user) => (
                        <ListItem
                            key={user.id}
                            button
                            onClick={() => onSelectUser(user)}
                            sx={{ 
                                py: 1.5,
                                px: 2,
                                '&:hover': { bgcolor: 'action.hover' },
                                borderBottom: 1,
                                borderColor: 'divider',
                                '&:last-child': { borderBottom: 0 },
                                cursor: 'pointer'
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                                    {user.name.charAt(0)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={user.name} 
                                secondary={user.email}
                                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                                secondaryTypographyProps={{ fontSize: '0.85rem' }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Popper>
    );
}

UserMentionAutocomplete.propTypes = {
    anchorEl: PropTypes.object,
    searchQuery: PropTypes.string,
    onSelectUser: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    position: PropTypes.object,
};

export default UserMentionAutocomplete;