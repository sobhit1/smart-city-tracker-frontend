import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    Fade,
} from '@mui/material';

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

    const handleSelectChange = (val) => {
        const selectedPriority = priorities.find((p) => p.name === val);
        onChange(selectedPriority);
        setIsEditing(false); // auto-close after selection
    };

    const priorityIcons = { Highest: '⬆⬆', High: '⬆', Medium: '➡', Low: '⬇', Lowest: '⬇⬇' };
    const getCurrentPriority = (val) => {
        const priority = priorities.find((p) => p.name === val);
        if (!priority)
            return {
                name: 'Medium',
                color: '#FFA500',
                icon: '➡',
                bgColor: 'rgba(255, 165, 0, 0.15)',
            };
        const colorMap = {
            Highest: '#DC2626',
            High: '#F85149',
            Medium: '#FFA500',
            Low: '#3FB950',
            Lowest: '#5299FF',
        };
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
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={priorityValue}
                            onChange={(e) => handleSelectChange(e.target.value)}
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
                                    gap: 1,
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#373E47',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#5299FF',
                                },
                            }}
                            renderValue={(val) => {
                                const priority = getCurrentPriority(val);
                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
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
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {priority.icon}
                                        </Box>
                                        <Typography
                                            sx={{
                                                fontSize: '13px',
                                                color: '#E6EDF2',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {priority?.name || 'Medium'}
                                        </Typography>
                                    </Box>
                                );
                            }}
                        >
                            {priorities.map((priority) => {
                                const p = getCurrentPriority(priority.name);
                                return (
                                    <MenuItem key={p.id} value={p.name}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    backgroundColor: p.bgColor,
                                                    border: `1px solid ${p.color}`,
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '10px',
                                                    color: p.color,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {p.icon}
                                            </Box>
                                            <Typography sx={{ fontSize: '13px' }}>
                                                {p?.name || 'Medium'}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Fade>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 22,
                            height: 22,
                            backgroundColor: getCurrentPriority(value).bgColor,
                            border: `1.5px solid ${getCurrentPriority(value).color}`,
                            borderRadius: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '11px',
                                color: getCurrentPriority(value).color,
                                fontWeight: 'bold',
                                lineHeight: 1,
                            }}
                        >
                            {getCurrentPriority(value).icon}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: '#E6EDF2', fontWeight: 500 }}>
                        {getCurrentPriority(value)?.name || 'Medium'}
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