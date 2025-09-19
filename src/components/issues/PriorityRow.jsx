import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    IconButton,
    Fade,
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';

import SidebarRow from './SidebarRow';

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

export default PriorityRow;