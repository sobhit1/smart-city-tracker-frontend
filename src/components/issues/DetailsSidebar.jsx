import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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

function DetailsSidebar({ issue, canChangeStatus, canAssignIssue, canDeleteIssue, isAdmin }) {
    const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsExpanded, setDetailsExpanded] = useState(true);
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { data: availableUsersData } = useUsers('STAFF');
    const { data: statusesData } = useStatuses();
    const { data: prioritiesData } = usePriorities();

    const availableUsers = availableUsersData || [];
    const statuses = statusesData || [];
    const priorities = prioritiesData || [];

    const { mutate: updateIssueMutation } = useMutation({
        mutationFn: updateIssue,
        onSuccess: () => {
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
        return <Chip label={config.label} size="small" sx={{ backgroundColor: config.bgColor, color: config.color, border: `1px solid ${config.color}`, fontSize: '11px', height: 24, fontWeight: 700, letterSpacing: '0.5px', '& .MuiChip-label': { px: 1.5 } }} />;
    };

    return (
        <>
            <Box sx={{ width: '320px', position: 'sticky', top: '16px' }}>
                <Box sx={{ backgroundColor: '#282E33', border: '1px solid #373E47', borderRadius: 1, mb: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, cursor: 'pointer' }} onClick={() => setDetailsExpanded(!detailsExpanded)}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#7D858D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Details</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {canDeleteIssue && (
                                <Tooltip title="Delete Issue">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true); }} sx={{ '&:hover': { backgroundColor: 'rgba(248, 81, 73, 0.1)', color: '#f85149' } }}>
                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <ExpandMoreIcon sx={{ fontSize: 24, color: '#7D858D', transform: detailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </Box>
                    </Box>

                    {detailsExpanded && (
                        <Box sx={{ p: 2 }}>
                            <SidebarRow label="Status">
                                {canChangeStatus ? (
                                    <FormControl size="small" fullWidth>
                                        <Select
                                            value={issue.status.id}
                                            onChange={(e) => handleUpdate({ statusId: e.target.value })}
                                            sx={{ '& .MuiSelect-select': { py: 0, px: 0, border: 'none' }, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                                            renderValue={() => getStatusChip(issue.status.name)}
                                        >
                                            {statuses.map(status => (
                                                <MenuItem key={status.id} value={status.id}>{getStatusChip(status.name)}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (getStatusChip(issue.status.name))}
                            </SidebarRow>

                            <ReporterAssignee
                                label={"Assignee"}
                                value={issue.assignee}
                                onChange={(newAssignee) => handleUpdate({ assigneeId: newAssignee ? newAssignee.id : 0 })}
                                hasEdit={canAssignIssue}
                                availableUsers={availableUsers}
                                avatarColor="#FF5722"
                            />
                            <ReporterAssignee
                                label={"Reporter"}
                                value={issue.reporter}
                                onChange={(newReporter) => handleUpdate({ reporterId: newReporter.id })}
                                hasEdit={isAdmin}
                                availableUsers={availableUsers}
                                avatarColor="#F44336"
                            />
                            <PriorityRow
                                value={issue.priority?.name}
                                onChange={(newPriority) => handleUpdate({ priorityId: newPriority.id })}
                                hasEdit={canChangeStatus}
                                availablePriorities={priorities}
                            />

                            <SidebarRow label="Date Reported">
                                <Typography sx={{ fontSize: '13px', color: '#E6EDF2' }}>
                                    {new Date(issue.createdAt).toLocaleDateString()}
                                </Typography>
                            </SidebarRow>

                            <DatePickerRow
                                label="Start Date"
                                value={issue.startDate ? issue.startDate.split('T')[0] : ''}
                                onChange={(newDate) => handleUpdate({ startDate: newDate ? new Date(newDate).toISOString() : null })}
                                hasEdit={canChangeStatus}
                            />
                            <DatePickerRow
                                label="End Date"
                                value={issue.dueDate ? issue.dueDate.split('T')[0] : ''}
                                onChange={(newDate) => handleUpdate({ dueDate: newDate ? new Date(newDate).toISOString() : null })}
                                hasEdit={canChangeStatus}
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            <AssignmentDialog
                open={isAssignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                onAssign={(userId) => handleUpdate({ assigneeId: userId })}
                currentAssignee={issue.assignee}
                availableUsers={availableUsers}
            />
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                item={`Issue "${issue.title}"`}
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
};

export default DetailsSidebar;