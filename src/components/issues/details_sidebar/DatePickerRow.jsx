import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    TextField,
    Fade,
    IconButton,
    Tooltip,
    ClickAwayListener,
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    Close as CloseIcon,
    Check as CheckIcon,
} from '@mui/icons-material';

import SidebarRow from './SidebarRow';

function DatePickerRow({ label, value, onChange, hasEdit = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [dateValue, setDateValue] = useState(value || '');
    const inputRef = useRef();

    useEffect(() => {
        setDateValue(value || '');
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleDateChange = (newValue) => {
        setDateValue(newValue);
    };

    const handleSave = () => {
        onChange(dateValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setDateValue(value || '');
        setIsEditing(false);
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return 'Not set';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return 'Not set';
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        if (isNaN(date.getTime())) return 'Not set';
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
                <ClickAwayListener onClickAway={handleCancel}>
                    <Fade in={true} timeout={200}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            backgroundColor: '#23272e',
                            borderRadius: '8px',
                            px: 1.5,
                            py: 1,
                            minWidth: 180,
                            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                        }}>
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    handleSave();
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                            >
                                <TextField
                                    type="date"
                                    size="small"
                                    value={dateValue}
                                    inputRef={inputRef}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            fontSize: '14px',
                                            height: '36px',
                                            backgroundColor: '#1F2428',
                                            borderRadius: '6px',
                                            border: '1px solid #373E47',
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: '6px 10px',
                                            color: '#E6EDF2',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '&:hover .MuiInputBase-root': {
                                            borderColor: '#5299FF',
                                        },
                                        '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                            filter: 'invert(1)',
                                            cursor: 'pointer',
                                        },
                                        width: '140px'
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            e.preventDefault();
                                            handleCancel();
                                        }
                                    }}
                                />
                                <Tooltip title="Save">
                                    <IconButton
                                        size="small"
                                        type="submit"
                                        aria-label="Save date"
                                        tabIndex={0}
                                    >
                                        <CheckIcon fontSize="small" sx={{ color: '#3fb950' }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                    <IconButton
                                        size="small"
                                        onClick={handleCancel}
                                        aria-label="Cancel"
                                        tabIndex={0}
                                    >
                                        <CloseIcon fontSize="small" sx={{ color: '#f85149' }} />
                                    </IconButton>
                                </Tooltip>
                            </form>
                        </Box>
                    </Fade>
                </ClickAwayListener>
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        minHeight: 36,
                        px: 1,
                        py: 0.5,
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                        '&:hover': hasEdit ? { backgroundColor: 'rgba(82, 153, 255, 0.08)' } : {},
                    }}
                >
                    <CalendarIcon sx={{ fontSize: 18, color: value ? '#5299FF' : '#8B949E' }} />
                    <Typography sx={{
                        fontSize: '15px',
                        color: value ? '#E6EDF2' : '#8B949E',
                        fontStyle: value ? 'normal' : 'italic',
                        fontWeight: value ? 600 : 400,
                        letterSpacing: 0.1,
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

export default DatePickerRow;