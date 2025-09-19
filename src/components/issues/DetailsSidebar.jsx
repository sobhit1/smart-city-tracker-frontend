import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Chip,
    Select,
    MenuItem,
    FormControl,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

import ReporterAssignee from './ReporterAssignee';
import SidebarRow from './SidebarRow';
import AssignmentDialog from './AssignmentDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import DatePickerRow from './DatePickerRow';
import PriorityRow from './PriorityRow';

function DetailsSidebar({ issue, canChangeStatus, canAssignIssue, canDeleteIssue }) {
    const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsExpanded, setDetailsExpanded] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [priority, setPriority] = useState('High');
    const [assignee, setAssignee] = useState(issue.assignee);
    const [reporter, setReporter] = useState(issue.reporter);

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

    const handleAssigneeChange = (newAssignee) => {
        setAssignee(newAssignee);
        console.log("Assignee changed to:", newAssignee);
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
                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <ExpandMoreIcon
                            sx={{
                                fontSize: 24,
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

                        <ReporterAssignee
                            label={"Assignee"}
                            value={assignee}
                            onChange={handleAssigneeChange}
                            hasEdit={canChangeStatus || canAssignIssue}
                            availableUsers={mockAvailableUsers}
                        />

                        <ReporterAssignee
                            label={"Reporter"}
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
                item={'Issue'}
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