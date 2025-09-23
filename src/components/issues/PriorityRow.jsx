import { useState, useEffect } from 'react';
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

import { usePriorities } from '../../hooks/useLookups';
import SidebarRow from './SidebarRow';

function PriorityRow({ value, onChange, hasEdit = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [priorityValue, setPriorityValue] = useState('');

    const { data: prioritiesData, isLoading } = usePriorities();
    const priorities = prioritiesData || [];

    useEffect(() => {
        setPriorityValue(value || 'Medium');
    }, [value]);

    const handleSave = () => {
        const selectedPriority = priorities.find(p => p.name === priorityValue);
        onChange(selectedPriority);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setIsEditing(false);
    };

    const priorityIcons = { Highest: '⬆⬆', High: '⬆', Medium: '➡', Low: '⬇', Lowest: '⬇⬇' };
    const getCurrentPriority = (val) => {
        const priority = priorities.find(p => p.name === val);
        if (!priority) return { name: 'Medium', color: '#FFA500', icon: '➡', bgColor: 'rgba(255, 165, 0, 0.15)' };
        const colorMap = { Highest: '#DC2626', High: '#F85149', Medium: '#FFA500', Low: '#3FB950', Lowest: '#5299FF' };
        return {
            ...priority,
            color: colorMap[priority.name],
            bgColor: `${colorMap[priority.name]}26`,
            icon: priorityIcons[priority.name],
        };
    };

    return (
        <SidebarRow
            label="Priority"
            hasEdit={hasEdit && !isEditing}
            onClick={() => hasEdit && !isLoading && setIsEditing(true)}
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
                                    '& .MuiSelect-select': { py: 0, px: 1, display: 'flex', alignItems: 'center', gap: 1 },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#373E47' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#5299FF' }
                                }}
                                renderValue={(val) => {
                                    const priority = getCurrentPriority(val);
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 20, height: 20, backgroundColor: priority.bgColor, border: `1px solid ${priority.color}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: priority.color, fontWeight: 'bold' }}>
                                                {priority.icon}
                                            </Box>
                                            <Typography sx={{ fontSize: '13px', color: '#E6EDF2', fontWeight: 500 }}>
                                                {priority.name}
                                            </Typography>
                                        </Box>
                                    );
                                }}
                            >
                                {priorities.map(priority => {
                                    const p = getCurrentPriority(priority.name);
                                    return (
                                        <MenuItem key={p.id} value={p.name}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 20, height: 20, backgroundColor: p.bgColor, border: `1px solid ${p.color}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: p.color, fontWeight: 'bold' }}>
                                                    {p.icon}
                                                </Box>
                                                <Typography sx={{ fontSize: '13px' }}>
                                                    {p.name}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <IconButton size="small" onClick={handleSave} sx={{ backgroundColor: '#5299FF', color: 'white', width: 24, height: 24, '&:hover': { backgroundColor: '#4285E8' } }}>
                            <CheckIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancel} sx={{ backgroundColor: 'rgba(139, 148, 158, 0.1)', color: '#8B949E', width: 24, height: 24, '&:hover': { backgroundColor: 'rgba(139, 148, 158, 0.2)' } }}>
                            <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                </Fade>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 22, height: 22, backgroundColor: getCurrentPriority(value).bgColor, border: `1.5px solid ${getCurrentPriority(value).color}`, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '11px', color: getCurrentPriority(value).color, fontWeight: 'bold', lineHeight: 1 }}>
                            {getCurrentPriority(value).icon}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: '#E6EDF2', fontWeight: 500 }}>
                        {getCurrentPriority(value).name}
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