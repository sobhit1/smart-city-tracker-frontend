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
} from '@mui/material';
import {
  Edit as EditIcon,
  KeyboardArrowUp as ArrowUpIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

function SidebarRow({ label, children, hasEdit = false, onClick }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1,
        px: 0,
        cursor: hasEdit ? 'pointer' : 'default',
        '&:hover': hasEdit ? {
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: 1
        } : {}
      }}
      onClick={onClick}
    >
      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 500,
          color: '#7D858D',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          minWidth: '80px'
        }}
      >
        {label}
      </Typography>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        flex: 1,
        justifyContent: 'flex-end'
      }}>
        {children}
        {hasEdit && <EditIcon sx={{ fontSize: 14, color: '#7D858D', ml: 0.5 }} />}
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Assign Issue</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Assignee</InputLabel>
          <Select value={selectedUserId} label="Assignee" onChange={(e) => setSelectedUserId(e.target.value)}>
            <MenuItem value=""><em>Unassigned</em></MenuItem>
            {availableUsers.map(user => <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onAssign(selectedUserId)} variant="contained">Assign</Button>
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

/**
 * Confirmation dialog for deleting an issue
 */
function DeleteConfirmationDialog({ open, onClose, onConfirm, issueTitle }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#f85149' }}>Delete Issue</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this issue?
        </Typography>
        <Typography sx={{ mt: 1, fontWeight: 600 }}>
          "{issueTitle}"
        </Typography>
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
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
    return date.toLocaleDateString();
  };

  return (
    <SidebarRow 
      label={label} 
      hasEdit={hasEdit && !isEditing}
      onClick={() => hasEdit && setIsEditing(true)}
    >
      {isEditing ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TextField
            type="date"
            size="small"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '12px',
                height: '24px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '4px',
              },
              '& .MuiInputBase-input': {
                padding: '2px 6px',
                color: '#E6EDF2',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#373E47',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#5299FF',
              },
              width: '120px'
            }}
            autoFocus
          />
          <Button 
            size="small" 
            onClick={handleSave}
            variant="contained"
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              py: 0.25, 
              fontSize: '9px',
              height: '20px',
              backgroundColor: '#5299FF',
              '&:hover': { backgroundColor: '#4285e8' }
            }}
          >
            Save
          </Button>
          <Button 
            size="small" 
            onClick={() => setIsEditing(false)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              py: 0.25, 
              fontSize: '9px',
              height: '20px',
              color: '#7D858D',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' }
            }}
          >
            Cancel
          </Button>
        </Box>
      ) : (
        <Typography sx={{ 
          fontSize: '13px', 
          color: value ? '#E6EDF2' : '#7D858D',
          fontStyle: value ? 'normal' : 'italic'
        }}>
          {formatDisplayDate(value)}
        </Typography>
      )}
    </SidebarRow>
  );
}

/**
 * Priority selector row component
 */
function PriorityRow({ value, onChange, hasEdit = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [priorityValue, setPriorityValue] = useState(value || 'Medium');

  const priorities = [
    { value: 'Highest', color: '#8B0000', icon: '↑↑' },
    { value: 'High', color: '#f85149', icon: '↑' },
    { value: 'Medium', color: '#FF8C00', icon: '→' },
    { value: 'Low', color: '#3fb950', icon: '↓' },
    { value: 'Lowest', color: '#0066CC', icon: '↓↓' }
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={priorityValue}
              onChange={(e) => setPriorityValue(e.target.value)}
              sx={{
                fontSize: '12px',
                height: '24px',
                backgroundColor: 'rgba(255,255,255,0.05)',
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
                      width: 14,
                      height: 14,
                      backgroundColor: priority.color,
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {priority.icon}
                    </Box>
                    <Typography sx={{ fontSize: '12px', color: '#E6EDF2' }}>
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
                      width: 14,
                      height: 14,
                      backgroundColor: priority.color,
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {priority.icon}
                    </Box>
                    <Typography sx={{ fontSize: '12px' }}>
                      {priority.value}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            size="small" 
            onClick={handleSave}
            variant="contained"
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              py: 0.25, 
              fontSize: '9px',
              height: '20px',
              backgroundColor: '#5299FF',
              '&:hover': { backgroundColor: '#4285e8' }
            }}
          >
            Save
          </Button>
          <Button 
            size="small" 
            onClick={() => setIsEditing(false)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              py: 0.25, 
              fontSize: '9px',
              height: '20px',
              color: '#7D858D',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' }
            }}
          >
            Cancel
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 16,
            height: 16,
            backgroundColor: getCurrentPriority(value).color,
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography sx={{ fontSize: '10px', color: 'white', fontWeight: 'bold' }}>
              {getCurrentPriority(value).icon}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '13px', color: '#E6EDF2' }}>
            {getCurrentPriority(value).value}
          </Typography>
        </Box>
      )}
    </SidebarRow>
  );
}

/**
 * Reporter selector row component  
 */
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={reporterValue}
              onChange={(e) => setReporterValue(e.target.value)}
              sx={{
                fontSize: '12px',
                height: '24px',
                backgroundColor: 'rgba(255,255,255,0.05)',
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
                      width: 18,
                      height: 18,
                      fontSize: '9px',
                      bgcolor: '#F44336',
                      fontWeight: 600
                    }}>
                      {user?.name?.[0] || 'U'}
                    </Avatar>
                    <Typography sx={{ fontSize: '12px', color: '#E6EDF2' }}>
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
                      width: 18,
                      height: 18,
                      fontSize: '9px',
                      bgcolor: '#F44336',
                      fontWeight: 600
                    }}>
                      {user.name[0]}
                    </Avatar>
                    <Typography sx={{ fontSize: '12px' }}>
                      {user.name}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            size="small" 
            onClick={handleSave}
            variant="contained"
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              py: 0.25, 
              fontSize: '9px',
              height: '20px',
              backgroundColor: '#5299FF',
              '&:hover': { backgroundColor: '#4285e8' }
            }}
          >
            Save
          </Button>
          <Button 
            size="small" 
            onClick={() => setIsEditing(false)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              py: 0.25, 
              fontSize: '9px',
              height: '20px',
              color: '#7D858D',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' }
            }}
          >
            Cancel
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{
            width: 20,
            height: 20,
            fontSize: '10px',
            bgcolor: '#F44336',
            fontWeight: 600
          }}>
            {value?.name?.[0] || 'U'}
          </Avatar>
          <Typography sx={{ fontSize: '13px', color: '#E6EDF2' }}>
            {value?.name || 'Unknown'}
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

PriorityRow.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  hasEdit: PropTypes.bool,
};

ReporterRow.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  hasEdit: PropTypes.bool,
  availableUsers: PropTypes.array.isRequired,
};

/**
 * The main sidebar component for displaying issue details and metadata - Exact Jira replica.
 */
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
      'OPEN': { color: '#f85149', label: 'OPEN' },
      'IN_PROGRESS': { color: '#5299FF', label: 'IN PROGRESS' },
      'RESOLVED': { color: '#3fb950', label: 'RESOLVED' }
    };

    const config = statusConfig[status] || statusConfig['OPEN'];

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.color,
          color: 'white',
          fontSize: '10px',
          height: 20,
          fontWeight: 600,
          '& .MuiChip-label': {
            px: 1
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