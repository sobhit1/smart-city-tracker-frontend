import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Fade,
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';

import SidebarRow from './SidebarRow';

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
                                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                    filter: 'invert(1)',
                                    cursor: 'pointer',
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

export default DatePickerRow;