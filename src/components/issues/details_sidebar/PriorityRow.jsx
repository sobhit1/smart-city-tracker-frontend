import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    Fade,
    Skeleton,
    ClickAwayListener,
} from '@mui/material';

import { usePriorities } from '../../../hooks/useLookups';
import SidebarRow from './SidebarRow';

function PriorityRow({ value, onChange, hasEdit = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [priorityValue, setPriorityValue] = useState('');
    const selectRef = useRef();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { data: prioritiesData, isLoading } = usePriorities();
    const priorities = prioritiesData || [];

    useEffect(() => {
        setPriorityValue(value || 'Medium');
    }, [value]);

    const handleSelectChange = (val) => {
        const selectedPriority = priorities.find((p) => p.name === val);
        onChange(selectedPriority);
        setIsEditing(false);
        setDropdownOpen(false);
    };

    const isClickInsideSelectOrDropdown = (target) => {
        if (selectRef.current && selectRef.current.contains(target)) return true;
        const dropdown = document.querySelector('.MuiPopover-root');
        if (dropdown && dropdown.contains(target)) return true;
        return false;
    };

    const handleClickAway = (event) => {
        if (dropdownOpen) return;
        if (isClickInsideSelectOrDropdown(event.target)) return;
        setIsEditing(false);
    };

    const handleOpen = () => setDropdownOpen(true);
    const handleClose = () => {
        setDropdownOpen(false);
        setIsEditing(false);
    };

    const priorityIcons = {
        Highest: '⬆⬆',
        High: '⬆',
        Medium: '➡',
        Low: '⬇',
        Lowest: '⬇⬇'
    };
    const colorMap = {
        Highest: '#DC2626',
        High: '#F85149',
        Medium: '#FFA500',
        Low: '#3FB950',
        Lowest: '#5299FF',
    };
    const bgMap = {
        Highest: 'rgba(220, 38, 38, 0.12)',
        High: 'rgba(248, 81, 73, 0.12)',
        Medium: 'rgba(255, 165, 0, 0.12)',
        Low: 'rgba(63, 185, 80, 0.12)',
        Lowest: 'rgba(82, 153, 255, 0.12)',
    };

    const getCurrentPriority = (val) => {
        const priority = priorities.find((p) => p.name === val);
        const name = priority?.name || 'Medium';
        return {
            ...priority,
            name,
            color: colorMap[name],
            bgColor: bgMap[name],
            icon: priorityIcons[name],
        };
    };

    if (isLoading) {
        return (
            <SidebarRow label="Priority">
                <Skeleton variant="rectangular" width={120} height={28} sx={{ borderRadius: 2 }} />
            </SidebarRow>
        );
    }

    return (
        <SidebarRow
            label="Priority"
            hasEdit={hasEdit && !isEditing}
            onClick={() => hasEdit && !isLoading && setIsEditing(true)}
        >
            {isEditing ? (
                <ClickAwayListener onClickAway={handleClickAway}>
                    <Fade in={true} timeout={200}>
                        <Box ref={selectRef}>
                            <FormControl size="small" sx={{ minWidth: 170 }}>
                                <Select
                                    value={priorityValue}
                                    onChange={(e) => handleSelectChange(e.target.value)}
                                    onOpen={handleOpen}
                                    onClose={handleClose}
                                    autoFocus
                                    displayEmpty
                                    inputProps={{
                                        'aria-label': 'Select priority',
                                    }}
                                    sx={{
                                        fontSize: '14px',
                                        height: '38px',
                                        backgroundColor: '#23272e',
                                        borderRadius: '8px',
                                        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
                                        '& .MuiSelect-select': {
                                            py: 1,
                                            px: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#373E47',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#5299FF',
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: '#23272e',
                                                border: '1px solid #373E47',
                                                borderRadius: '10px',
                                                mt: 0.5,
                                                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
                                            }
                                        }
                                    }}
                                    renderValue={(val) => {
                                        const priority = getCurrentPriority(val);
                                        return (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box
                                                    sx={{
                                                        width: 26,
                                                        height: 26,
                                                        backgroundColor: priority.bgColor,
                                                        border: `2px solid ${priority.color}`,
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '15px',
                                                        color: priority.color,
                                                        fontWeight: 700,
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    {priority.icon}
                                                </Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: '15px',
                                                        color: '#E6EDF2',
                                                        fontWeight: 600,
                                                        letterSpacing: 0.2,
                                                    }}
                                                >
                                                    {priority?.name || 'Medium'}
                                                </Typography>
                                            </Box>
                                        );
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Escape') handleClose();
                                    }}
                                >
                                    {priorities.map((priority) => {
                                        const p = getCurrentPriority(priority.name);
                                        return (
                                            <MenuItem
                                                key={p.id}
                                                value={p.name}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    py: 1.2,
                                                    px: 2,
                                                    borderRadius: '6px',
                                                    backgroundColor: priorityValue === p.name ? `${p.bgColor}` : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: `${p.bgColor}80`,
                                                    },
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                        backgroundColor: p.bgColor,
                                                        border: `2px solid ${p.color}`,
                                                        borderRadius: '5px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '13px',
                                                        color: p.color,
                                                        fontWeight: 700,
                                                        mr: 1,
                                                    }}
                                                >
                                                    {p.icon}
                                                </Box>
                                                <Typography sx={{
                                                    fontSize: '14px',
                                                    color: '#E6EDF2',
                                                    fontWeight: 500,
                                                    letterSpacing: 0.1,
                                                }}>
                                                    {p?.name || 'Medium'}
                                                </Typography>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Box>
                    </Fade>
                </ClickAwayListener>
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 0.5,
                        px: 1,
                        minHeight: 36,
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                        '&:hover': hasEdit ? { backgroundColor: 'rgba(82, 153, 255, 0.08)' } : {},
                    }}
                >
                    <Box
                        sx={{
                            width: 26,
                            height: 26,
                            backgroundColor: getCurrentPriority(value).bgColor,
                            border: `2px solid ${getCurrentPriority(value).color}`,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            color: getCurrentPriority(value).color,
                            fontWeight: 700,
                        }}
                    >
                        {getCurrentPriority(value).icon}
                    </Box>
                    <Typography sx={{
                        fontSize: '15px',
                        color: '#E6EDF2',
                        fontWeight: 600,
                        letterSpacing: 0.2,
                    }}>
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