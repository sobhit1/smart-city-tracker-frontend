import { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    IconButton,
    Tooltip,
    CircularProgress,
    Fade,
    ClickAwayListener,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

import { updateIssue, deleteIssue } from '../../api/issuesApi';
import { useUsers, useStatuses, usePriorities } from '../../hooks/useLookups';
import { showNotification } from '../../state/notificationSlice';
import { DASHBOARD_PATH } from '../../const/routes';
import ReporterAssignee from './ReporterAssignee';
import SidebarRow from './SidebarRow';
import AssignmentDialog from './AssignmentDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import DatePickerRow from './DatePickerRow';
import PriorityRow from './PriorityRow';

function normalizeIssue(issue, statuses, priorities, users) {
    let statusObj = issue.status;
    if (typeof statusObj === 'string') {
        statusObj = statuses.find(s => s.name === issue.status) || { id: '', name: issue.status };
    }
    let priorityObj = issue.priority;
    if (typeof priorityObj === 'string') {
        priorityObj = priorities.find(p => p.name === issue.priority) || { id: '', name: issue.priority };
    }
    let assigneeObj = issue.assignee;
    if (assigneeObj && typeof assigneeObj === 'object' && assigneeObj.id) {
        assigneeObj = users.find(u => u.id === assigneeObj.id) || assigneeObj;
    } else if (typeof assigneeObj === 'number' || typeof assigneeObj === 'string') {
        assigneeObj = users.find(u => u.id === assigneeObj) || null;
    } else if (!assigneeObj) {
        assigneeObj = null;
    }
    let reporterObj = issue.reporter;
    if (reporterObj && typeof reporterObj === 'object' && reporterObj.id) {
        reporterObj = users.find(u => u.id === reporterObj.id) || reporterObj;
    } else if (typeof reporterObj === 'number' || typeof reporterObj === 'string') {
        reporterObj = users.find(u => u.id === reporterObj) || null;
    } else if (!reporterObj) {
        reporterObj = null;
    }
    const startDate = issue.startDate
        ? (issue.startDate.includes('T') ? issue.startDate.split('T')[0] : issue.startDate)
        : '';
    const dueDate = issue.dueDate
        ? (issue.dueDate.includes('T') ? issue.dueDate.split('T')[0] : issue.dueDate)
        : '';
    return {
        ...issue,
        status: statusObj,
        priority: priorityObj,
        assignee: assigneeObj,
        reporter: reporterObj,
        startDate,
        dueDate,
    };
}

function DetailsSidebar({ issue, canChangeStatus, canAssignIssue, canDeleteIssue, isAdmin }) {
    const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statusEdit, setStatusEdit] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const statusSelectRef = useRef();

    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { data: availableUsersData, isLoading: usersLoading } = useUsers('STAFF');
    const { data: statusesData, isLoading: statusesLoading } = useStatuses();
    const { data: prioritiesData, isLoading: prioritiesLoading } = usePriorities();

    const availableUsers = availableUsersData || [];
    const statuses = statusesData || [];
    const priorities = prioritiesData || [];

    const [localIssue, setLocalIssue] = useState(issue);

    useEffect(() => {
        setLocalIssue(issue);
    }, [issue]);

    const isReady = !usersLoading && !statusesLoading && !prioritiesLoading && !!localIssue;

    const normalizedIssue = useMemo(
        () => isReady ? normalizeIssue(localIssue, statuses, priorities, availableUsers) : null,
        [localIssue, statuses, priorities, availableUsers, isReady]
    );

    const { mutate: updateIssueMutation } = useMutation({
        mutationFn: updateIssue,
        onSuccess: (updated) => {
            setLocalIssue(prev => ({
                ...prev,
                ...updated,
            }));
            queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
            dispatch(showNotification({ message: 'Issue updated successfully', severity: 'success' }));
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update issue', severity: 'error' }));
        }
    });

    const { mutate: deleteIssueMutation, isPending: isDeleting } = useMutation({
        mutationFn: deleteIssue,
        onSuccess: () => {
            dispatch(showNotification({ message: 'Issue deleted successfully', severity: 'success' }));
            queryClient.invalidateQueries({ queryKey: ['issues'] });
            navigate(DASHBOARD_PATH);
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to delete issue', severity: 'error' }));
        }
    });

    const handleUpdate = (updateData) => {
        setLocalIssue(prev => ({
            ...prev,
            ...updateData,
        }));
        updateIssueMutation({ issueId: issue.id, updateData });
    };

    const handleDelete = () => {
        deleteIssueMutation(issue.id);
    };

    const getStatusChip = (statusName) => {
        const statusConfig = {
            'OPEN': { color: '#f85149', bgColor: 'rgba(248, 81, 73, 0.15)', label: 'OPEN' },
            'IN_PROGRESS': { color: '#5299FF', bgColor: 'rgba(82, 153, 255, 0.15)', label: 'IN PROGRESS' },
            'RESOLVED': { color: '#3fb950', bgColor: 'rgba(63, 185, 80, 0.15)', label: 'RESOLVED' }
        };
        const config = statusConfig[statusName] || statusConfig['OPEN'];
        return (
            <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.5,
                borderRadius: '12px',
                backgroundColor: config.bgColor,
                border: `1.5px solid ${config.color}`,
                color: config.color,
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '0.5px',
                minWidth: 90,
                justifyContent: 'center'
            }}>
                {config.label}
            </Box>
        );
    };

    const isClickInsideStatusSelectOrDropdown = (target) => {
        if (statusSelectRef.current && statusSelectRef.current.contains(target)) return true;
        const dropdown = document.querySelector('.MuiPopover-root');
        if (dropdown && dropdown.contains(target)) return true;
        return false;
    };

    const handleStatusClickAway = (event) => {
        if (statusDropdownOpen) return;
        if (isClickInsideStatusSelectOrDropdown(event.target)) return;
        setStatusEdit(false);
    };

    if (!isReady || !normalizedIssue) {
        return (
            <Box sx={{ width: '320px', p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ width: '320px', position: 'sticky', top: '16px' }}>
                <Box
                    sx={{
                        backgroundColor: '#282E33',
                        border: '1px solid #373E47',
                        borderRadius: 1,
                        mb: 2,
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            px: 2,
                            py: 1.5
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#7D858D',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Details
                        </Typography>
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
                    </Box>

                    <Box sx={{ p: 2 }}>
                        {/* Status */}
                        <SidebarRow label="Status" hasEdit={canChangeStatus && !statusEdit} onClick={() => canChangeStatus && setStatusEdit(true)}>
                            {canChangeStatus && statusEdit ? (
                                <ClickAwayListener onClickAway={handleStatusClickAway}>
                                    <Fade in={true} timeout={200}>
                                        <Box ref={statusSelectRef}>
                                            <FormControl size="small" fullWidth sx={{ minWidth: 120 }}>
                                                <Select
                                                    value={normalizedIssue.status.id}
                                                    onChange={(e) => {
                                                        handleUpdate({ statusId: e.target.value });
                                                        setStatusEdit(false);
                                                        setStatusDropdownOpen(false);
                                                    }}
                                                    onOpen={() => setStatusDropdownOpen(true)}
                                                    onClose={() => {
                                                        setStatusDropdownOpen(false);
                                                        setStatusEdit(false);
                                                    }}
                                                    autoFocus
                                                    sx={{
                                                        '& .MuiSelect-select': {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            py: 0.5,
                                                            px: 1,
                                                            minHeight: '32px',
                                                            fontWeight: 700,
                                                            fontSize: '13px',
                                                            border: 'none'
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        backgroundColor: '#23272e',
                                                        borderRadius: '8px',
                                                    }}
                                                    renderValue={() => (
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {getStatusChip(normalizedIssue.status.name)}
                                                        </Box>
                                                    )}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: {
                                                                backgroundColor: '#23272e',
                                                                border: '1px solid #373E47',
                                                                borderRadius: '8px',
                                                                mt: 0.5,
                                                            }
                                                        }
                                                    }}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Escape') {
                                                            setStatusDropdownOpen(false);
                                                            setStatusEdit(false);
                                                        }
                                                    }}
                                                >
                                                    {(() => {
                                                        const current = normalizedIssue?.status?.name || 'OPEN';
                                                        let allowed = [];
                                                        if (current === 'OPEN') {
                                                            allowed = statuses.filter(s => ['OPEN', 'IN_PROGRESS'].includes(s.name));
                                                        } else if (current === 'IN_PROGRESS') {
                                                            allowed = statuses.filter(s => ['IN_PROGRESS', 'RESOLVED'].includes(s.name));
                                                        } else if (current === 'RESOLVED') {
                                                            allowed = statuses.filter(s => ['RESOLVED'].includes(s.name));
                                                        }
                                                        return allowed.map((status) => (
                                                            <MenuItem key={status.id} value={status.id}>
                                                                {getStatusChip(status?.name || 'OPEN')}
                                                            </MenuItem>
                                                        ));
                                                    })()}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Fade>
                                </ClickAwayListener>
                            ) : (
                                getStatusChip(normalizedIssue?.status?.name || 'OPEN')
                            )}
                        </SidebarRow>

                        {/* Assignee */}
                        <ReporterAssignee
                            label={'Assignee'}
                            value={normalizedIssue.assignee}
                            onChange={(newAssignee) =>
                                handleUpdate({ assigneeId: newAssignee ? newAssignee.id : 0 })
                            }
                            hasEdit={canAssignIssue}
                            availableUsers={availableUsers}
                            avatarColor="#FF5722"
                        />
                        {/* Reporter */}
                        <ReporterAssignee
                            label={'Reporter'}
                            value={normalizedIssue.reporter}
                            onChange={(newReporter) => handleUpdate({ reporterId: newReporter.id })}
                            hasEdit={isAdmin}
                            availableUsers={availableUsers}
                            avatarColor="#F44336"
                        />
                        {/* Priority */}
                        <PriorityRow
                            value={normalizedIssue?.priority?.name || 'Medium'}
                            onChange={(newPriority) => handleUpdate({ priorityId: newPriority.id })}
                            hasEdit={canChangeStatus}
                            availablePriorities={priorities}
                        />

                        {/* Date Reported */}
                        <SidebarRow label="Date Reported">
                            <Typography sx={{ fontSize: '13px', color: '#E6EDF2' }}>
                                {normalizedIssue.createdAt
                                    ? new Date(normalizedIssue.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                    : ''}
                            </Typography>
                        </SidebarRow>

                        {/* Start Date */}
                        <DatePickerRow
                            label="Start Date"
                            value={normalizedIssue.startDate}
                            onChange={(newDate) =>
                                handleUpdate({
                                    startDate: newDate ? new Date(newDate).toISOString() : null
                                })
                            }
                            hasEdit={canChangeStatus}
                        />
                        {/* End Date */}
                        <DatePickerRow
                            label="End Date"
                            value={normalizedIssue.dueDate}
                            onChange={(newDate) =>
                                handleUpdate({
                                    dueDate: newDate ? new Date(newDate).toISOString() : null
                                })
                            }
                            hasEdit={canChangeStatus}
                        />
                    </Box>
                </Box>
            </Box>

            <AssignmentDialog
                open={isAssignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                onAssign={(userId) => handleUpdate({ assigneeId: userId })}
                currentAssignee={normalizedIssue.assignee}
                availableUsers={availableUsers}
            />
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                item={`Issue "${normalizedIssue.title}"`}
                isDeleting={isDeleting}
            />
        </>
    );
}

DetailsSidebar.propTypes = {
    issue: PropTypes.object.isRequired,
    canChangeStatus: PropTypes.bool.isRequired,
    canAssignIssue: PropTypes.bool.isRequired,
    canDeleteIssue: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired
};

export default DetailsSidebar;