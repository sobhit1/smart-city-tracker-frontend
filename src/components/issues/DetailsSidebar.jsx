import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Chip,
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
    IconButton,
    Tooltip,
    TextField,
    Fade,
    Paper
} from '@mui/material';
import {
    Edit as EditIcon,
    KeyboardArrowUp as ArrowUpIcon,
    ExpandMore as ExpandMoreIcon,
    Delete as DeleteIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';

function SidebarRow({ label, children, hasEdit = false, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5,
                px: 1,
                mx: -1,
                borderRadius: 1.5,
                cursor: hasEdit ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': hasEdit ? {
                    backgroundColor: 'rgba(82, 153, 255, 0.08)',
                    transform: 'translateX(2px)',
                } : {}
            }}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Typography
                sx={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#8B949E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    minWidth: '100px',
                    transition: 'color 0.2s ease',
                    ...(hovered && hasEdit && { color: '#A8B3BE' })
                }}
            >
                {label}
            </Typography>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flex: 1,
                justifyContent: 'flex-end'
            }}>
                {children}
                <Fade in={hovered && hasEdit} timeout={200}>
                    <EditIcon sx={{
                        fontSize: 14,
                        color: '#5299FF',
                        ml: 0.5,
                        opacity: hovered && hasEdit ? 1 : 0
                    }} />
                </Fade>
            </Box>
        </Box>
    );
}

SidebarRow.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    hasEdit: PropTypes.bool,
    onClick: PropTypes.func,
};

/**
 * A dialog for assigning a user to the issue.
 */
function AssignmentDialog({ open, onClose, onAssign, currentAssignee, availableUsers }) {
    const [selectedUserId, setSelectedUserId] = useState(currentAssignee?.id || '');
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
            <DialogContent sx={{ pt: 3 }}>
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
                                        {user.name[0]}
                                    </Avatar>
                                    {user.name}
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

function DeleteConfirmationDialog({ open, onClose, onConfirm, issueTitle }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    backgroundColor: '#1F2428',
                    border: '1px solid #373E47'
                }
            }}
        >
            <DialogTitle sx={{ color: '#f85149', borderBottom: '1px solid #373E47', pb: 2 }}>
                Delete Issue
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Typography color="text.primary">
                    Are you sure you want to delete this issue?
                </Typography>
                <Paper sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: 'rgba(248, 81, 73, 0.1)',
                    border: '1px solid rgba(248, 81, 73, 0.3)',
                    borderRadius: 1
                }}>
                    <Typography sx={{ fontWeight: 600, color: '#E6EDF2' }}>
                        "{issueTitle}"
                    </Typography>
                </Paper>
                <Typography sx={{ mt: 2, color: '#8B949E', fontSize: '14px' }}>
                    ⚠️ This action cannot be undone.
                </Typography>
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
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    sx={{
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(248, 81, 73, 0.3)'
                        }
                    }}
                >
                    Delete Issue
                </Button>
            </DialogActions>
        </Dialog>
    );
}

DeleteConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    issueTitle: PropTypes.string.isRequired,
};

/**
 * Date picker row component
 */
function DatePickerRow({ label, value, onChange, hasEdit = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [dateValue, setDateValue] = useState(value || '');

    const handleSave = () => {
        onChange(dateValue);
        setIsEditing(false);
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return 'Not set';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <SidebarRow
            label={label}
            hasEdit={hasEdit && !isEditing}
            onClick={() => hasEdit && setIsEditing(true)}
        >
            {isEditing ? (
                <Fade in={true} timeout={200}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TextField
                            type="date"
                            size="small"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            sx={{
                                '& .MuiInputBase-root': {
                                    fontSize: '13px',
                                    height: '30px',
                                    backgroundColor: '#1F2428',
                                    borderRadius: '6px',
                                    border: '1px solid #373E47',
                                },
                                '& .MuiInputBase-input': {
                                    padding: '4px 8px',
                                    color: '#E6EDF2',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none',
                                },
                                '&:hover .MuiInputBase-root': {
                                    borderColor: '#5299FF',
                                },
                                width: '140px'
                            }}
                            autoFocus
                        />
                        <IconButton
                            size="small"
                            onClick={handleSave}
                            sx={{
                                backgroundColor: '#5299FF',
                                color: 'white',
                                width: 24,
                                height: 24,
                                '&:hover': { backgroundColor: '#4285E8' }
                            }}
                        >
                            <CheckIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setIsEditing(false)}
                            sx={{
                                backgroundColor: 'rgba(139, 148, 158, 0.1)',
                                color: '#8B949E',
                                width: 24,
                                height: 24,
                                '&:hover': { backgroundColor: 'rgba(139, 148, 158, 0.2)' }
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                </Fade>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 16, color: value ? '#5299FF' : '#8B949E' }} />
                    <Typography sx={{
                        fontSize: '14px',
                        color: value ? '#E6EDF2' : '#8B949E',
                        fontStyle: value ? 'normal' : 'italic',
                        fontWeight: value ? 500 : 400
                    }}>
                        {formatDisplayDate(value)}
                    </Typography>
                </Box>
            )}
        </SidebarRow>
    );
}
DatePickerRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    hasEdit: PropTypes.bool,
};

function PriorityRow({ value, onChange, hasEdit = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [priorityValue, setPriorityValue] = useState(value || 'Medium');

    const priorities = [
        { value: 'Highest', color: '#DC2626', icon: '⬆⬆', bgColor: 'rgba(220, 38, 38, 0.15)' },
        { value: 'High', color: '#F85149', icon: '⬆', bgColor: 'rgba(248, 81, 73, 0.15)' },
        { value: 'Medium', color: '#FFA500', icon: '➡', bgColor: 'rgba(255, 165, 0, 0.15)' },
        { value: 'Low', color: '#3FB950', icon: '⬇', bgColor: 'rgba(63, 185, 80, 0.15)' },
        { value: 'Lowest', color: '#5299FF', icon: '⬇⬇', bgColor: 'rgba(82, 153, 255, 0.15)' }
    ];

    const getCurrentPriority = (val) => priorities.find(p => p.value === val) || priorities[2];

    const handleSave = () => {
        onChange(priorityValue);
        setIsEditing(false);
    };

    return (
        <SidebarRow
            label="Priority"
            hasEdit={hasEdit && !isEditing}
            onClick={() => hasEdit && setIsEditing(true)}
        >
            {isEditing ? (
                <Fade in={true} timeout={200}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                            <Select
                                value={priorityValue}
                                onChange={(e) => setPriorityValue(e.target.value)}
                                sx={{
                                    fontSize: '13px',
                                    height: '30px',
                                    backgroundColor: '#1F2428',
                                    borderRadius: '6px',
                                    '& .MuiSelect-select': {
                                        py: 0,
                                        px: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#373E47',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#5299FF',
                                    }
                                }}
                                renderValue={(val) => {
                                    const priority = getCurrentPriority(val);
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{
                                                width: 20,
                                                height: 20,
                                                backgroundColor: priority.bgColor,
                                                border: `1px solid ${priority.color}`,
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                                color: priority.color,
                                                fontWeight: 'bold'
                                            }}>
                                                {priority.icon}
                                            </Box>
                                            <Typography sx={{ fontSize: '13px', color: '#E6EDF2', fontWeight: 500 }}>
                                                {priority.value}
                                            </Typography>
                                        </Box>
                                    );
                                }}
                            >
                                {priorities.map(priority => (
                                    <MenuItem key={priority.value} value={priority.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{
                                                width: 20,
                                                height: 20,
                                                backgroundColor: priority.bgColor,
                                                border: `1px solid ${priority.color}`,
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                                color: priority.color,
                                                fontWeight: 'bold'
                                            }}>
                                                {priority.icon}
                                            </Box>
                                            <Typography sx={{ fontSize: '13px' }}>
                                                {priority.value}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <IconButton
                            size="small"
                            onClick={handleSave}
                            sx={{
                                backgroundColor: '#5299FF',
                                color: 'white',
                                width: 24,
                                height: 24,
                                '&:hover': { backgroundColor: '#4285E8' }
                            }}
                        >
                            <CheckIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setIsEditing(false)}
                            sx={{
                                backgroundColor: 'rgba(139, 148, 158, 0.1)',
                                color: '#8B949E',
                                width: 24,
                                height: 24,
                                '&:hover': { backgroundColor: 'rgba(139, 148, 158, 0.2)' }
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                </Fade>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        width: 22,
                        height: 22,
                        backgroundColor: getCurrentPriority(value).bgColor,
                        border: `1.5px solid ${getCurrentPriority(value).color}`,
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Typography sx={{
                            fontSize: '11px',
                            color: getCurrentPriority(value).color,
                            fontWeight: 'bold',
                            lineHeight: 1
                        }}>
                            {getCurrentPriority(value).icon}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: '#E6EDF2', fontWeight: 500 }}>
                        {getCurrentPriority(value).value}
                    </Typography>
                </Box>
            )}
        </SidebarRow>
    );
}
PriorityRow.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    hasEdit: PropTypes.bool,
};


function ReporterRow({ value, onChange, hasEdit = false, availableUsers }) {
    const [isEditing, setIsEditing] = useState(false);
    const [reporterValue, setReporterValue] = useState(value?.id || '');

    const handleSave = () => {
        const selectedUser = availableUsers.find(user => user.id === reporterValue);
        onChange(selectedUser || value);
        setIsEditing(false);
    };

    const getUserById = (id) => availableUsers.find(user => user.id === id) || value;

    return (
        <SidebarRow
            label="Reporter"
            hasEdit={hasEdit && !isEditing}
            onClick={() => hasEdit && setIsEditing(true)}
        >
            {isEditing ? (
                <Fade in={true} timeout={200}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                                value={reporterValue}
                                onChange={(e) => setReporterValue(e.target.value)}
                                sx={{
                                    fontSize: '13px',
                                    height: '30px',
                                    backgroundColor: '#1F2428',
                                    borderRadius: '6px',
                                    '& .MuiSelect-select': {
                                        py: 0,
                                        px: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#373E47',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#5299FF',
                                    }
                                }}
                                renderValue={(val) => {
                                    const user = getUserById(val);
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{
                                                width: 20,
                                                height: 20,
                                                fontSize: '10px',
                                                bgcolor: '#F44336',
                                                fontWeight: 600
                                            }}>
                                                {user?.name?.[0] || 'U'}
                                            </Avatar>
                                            <Typography sx={{ fontSize: '13px', color: '#E6EDF2' }}>
                                                {user?.name || 'Unknown'}
                                            </Typography>
                                        </Box>
                                    );
                                }}
                            >
                                {availableUsers.map(user => (
                                    <MenuItem key={user.id} value={user.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{
                                                width: 20,
                                                height: 20,
                                                fontSize: '10px',
                                                bgcolor: '#F44336',
                                                fontWeight: 600
                                            }}>
                                                {user.name[0]}
                                            </Avatar>
                                            <Typography sx={{ fontSize: '13px' }}>
                                                {user.name}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <IconButton
                            size="small"
                            onClick={handleSave}
                            sx={{
                                backgroundColor: '#5299FF',
                                color: 'white',
                                width: 24,
                                height: 24,
                                '&:hover': { backgroundColor: '#4285E8' }
                            }}
                        >
                            <CheckIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setIsEditing(false)}
                            sx={{
                                backgroundColor: 'rgba(139, 148, 158, 0.1)',
                                color: '#8B949E',
                                width: 24,
                                height: 24,
                                '&:hover': { backgroundColor: 'rgba(139, 148, 158, 0.2)' }
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                </Fade>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{
                        width: 22,
                        height: 22,
                        fontSize: '11px',
                        bgcolor: '#F44336',
                        fontWeight: 600,
                        border: '2px solid rgba(244, 67, 54, 0.2)'
                    }}>
                        {value?.name?.[0] || 'U'}
                    </Avatar>
                    <Typography sx={{ fontSize: '14px', color: '#E6EDF2', fontWeight: 500 }}>
                        {value?.name || 'Unknown'}
                    </Typography>
                </Box>
            )}
        </SidebarRow>
    );
}
ReporterRow.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    hasEdit: PropTypes.bool,
    availableUsers: PropTypes.array.isRequired,
};

function DetailsSidebar({ issue, canChangeStatus, canAssignIssue, canDeleteIssue }) {
    const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsExpanded, setDetailsExpanded] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [priority, setPriority] = useState('High');
    const [reporter, setReporter] = useState(issue.reporter);

    // Mock available users for the assignment dialog and reporter selection
    const mockAvailableUsers = [
        { id: 1, name: 'John Citizen' },
        { id: 2, name: 'Jane Staff' },
        { id: 3, name: 'Admin User' },
        { id: 4, name: 'Prince Upadhyay' },
    ];

    const handleStatusChange = (newStatus) => {
        console.log("Status changed to:", newStatus);
    };

    const handleAssignIssue = (userId) => {
        console.log("Assigning issue to user ID:", userId);
        setAssignDialogOpen(false);
    };

    const handleDeleteIssue = () => {
        console.log("Issue deleted:", issue.title);
        setDeleteDialogOpen(false);
        // Here you would navigate back or refresh the page
    };

    const handleStartDateChange = (newDate) => {
        setStartDate(newDate);
        console.log("Start date changed to:", newDate);
    };

    const handleEndDateChange = (newDate) => {
        setEndDate(newDate);
        console.log("End date changed to:", newDate);
    };

    const handlePriorityChange = (newPriority) => {
        setPriority(newPriority);
        console.log("Priority changed to:", newPriority);
    };

    const handleReporterChange = (newReporter) => {
        setReporter(newReporter);
        console.log("Reporter changed to:", newReporter);
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            'OPEN': { color: '#f85149', bgColor: 'rgba(248, 81, 73, 0.15)', label: 'OPEN' },
            'IN_PROGRESS': { color: '#5299FF', bgColor: 'rgba(82, 153, 255, 0.15)', label: 'IN PROGRESS' },
            'RESOLVED': { color: '#3fb950', bgColor: 'rgba(63, 185, 80, 0.15)', label: 'RESOLVED' }
        };

        const config = statusConfig[status] || statusConfig['OPEN'];

        return (
            <Chip
                label={config.label}
                size="small"
                sx={{
                    backgroundColor: config.bgColor,
                    color: config.color,
                    border: `1px solid ${config.color}`,
                    fontSize: '11px',
                    height: 24,
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    '& .MuiChip-label': {
                        px: 1.5
                    }
                }}
            />
        );
    };

    return (
        <Box sx={{
            width: '320px',
            position: 'sticky',
            top: '16px'
        }}>
            {/* Details Section */}
            <Box sx={{
                backgroundColor: '#282E33',
                border: '1px solid #373E47',
                borderRadius: 1,
                mb: 2,
                overflow: 'hidden'
            }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderBottom: '1px solid #373E47',
                        cursor: 'pointer'
                    }}
                    onClick={() => setDetailsExpanded(!detailsExpanded)}
                >
                    <Typography sx={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#7D858D',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Details
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {canDeleteIssue && (
                            <Tooltip title="Delete Issue">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteDialogOpen(true);
                                    }}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(248, 81, 73, 0.1)',
                                            color: '#f85149'
                                        }
                                    }}
                                >
                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <ExpandMoreIcon
                            sx={{
                                fontSize: 16,
                                color: '#7D858D',
                                transform: detailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }}
                        />
                    </Box>
                </Box>

                {detailsExpanded && (
                    <Box sx={{ p: 2 }}>
                        <SidebarRow label="Status">
                            {canChangeStatus ? (
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <Select
                                        value={issue.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        sx={{
                                            '& .MuiSelect-select': {
                                                py: 0,
                                                px: 0,
                                                border: 'none',
                                                '&:focus': {
                                                    backgroundColor: 'transparent'
                                                }
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none'
                                            },
                                            '& .MuiSelect-icon': {
                                                color: '#7D858D'
                                            }
                                        }}
                                        renderValue={(value) => getStatusChip(value)}
                                    >
                                        <MenuItem value="OPEN">
                                            <Chip
                                                label="OPEN"
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#f85149',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    height: 20,
                                                    fontWeight: 600,
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                                }}
                                            />
                                        </MenuItem>
                                        <MenuItem value="IN_PROGRESS">
                                            <Chip
                                                label="IN PROGRESS"
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#5299FF',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    height: 20,
                                                    fontWeight: 600,
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                                }}
                                            />
                                        </MenuItem>
                                        <MenuItem value="RESOLVED">
                                            <Chip
                                                label="RESOLVED"
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#3fb950',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    height: 20,
                                                    fontWeight: 600,
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                                }}
                                            />
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            ) : (
                                getStatusChip(issue.status)
                            )}
                        </SidebarRow>

                        <SidebarRow
                            label="Assignee"
                            hasEdit={canAssignIssue}
                            onClick={() => canAssignIssue && setAssignDialogOpen(true)}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{
                                    width: 20,
                                    height: 20,
                                    fontSize: '10px',
                                    bgcolor: '#FF5722',
                                    fontWeight: 600
                                }}>
                                    {issue.assignee ? issue.assignee.name[0] : 'U'}
                                </Avatar>
                                <Typography sx={{ fontSize: '13px', color: '#E6EDF2' }}>
                                    {issue.assignee?.name || 'Unassigned'}
                                </Typography>
                            </Box>
                        </SidebarRow>

                        <ReporterRow
                            value={reporter}
                            onChange={handleReporterChange}
                            hasEdit={canChangeStatus || canAssignIssue}
                            availableUsers={mockAvailableUsers}
                        />

                        <PriorityRow
                            value={priority}
                            onChange={handlePriorityChange}
                            hasEdit={canChangeStatus || canAssignIssue}
                        />

                        <SidebarRow label="Date Reported">
                            <Typography sx={{ fontSize: '13px', color: '#E6EDF2' }}>
                                {new Date(issue.reportedAt).toLocaleDateString()}
                            </Typography>
                        </SidebarRow>

                        <DatePickerRow
                            label="Start Date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            hasEdit={canChangeStatus || canAssignIssue}
                        />

                        <DatePickerRow
                            label="End Date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            hasEdit={canChangeStatus || canAssignIssue}
                        />
                    </Box>
                )}
            </Box>

            <AssignmentDialog
                open={isAssignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                onAssign={handleAssignIssue}
                currentAssignee={issue.assignee}
                availableUsers={mockAvailableUsers}
            />

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteIssue}
                issueTitle={issue.title}
            />
        </Box>
    );
}

DetailsSidebar.propTypes = {
    issue: PropTypes.object.isRequired,
    canChangeStatus: PropTypes.bool.isRequired,
    canAssignIssue: PropTypes.bool.isRequired,
    canDeleteIssue: PropTypes.bool.isRequired,
};

export default DetailsSidebar;