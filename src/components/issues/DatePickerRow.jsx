import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    TextField,
    Fade,
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';

import SidebarRow from './SidebarRow';

function DatePickerRow({ label, value, onChange, hasEdit = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [dateValue, setDateValue] = useState(value || '');

    useEffect(() => {
        setDateValue(value || '');
    }, [value]);

    const handleDateChange = (newValue) => {
        setDateValue(newValue);
        onChange(newValue);
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return 'Not set';
        const parts = dateStr.split('-');
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            type="date"
                            size="small"
                            value={dateValue}
                            onChange={(e) => handleDateChange(e.target.value)}
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
                            onBlur={() => setIsEditing(false)}
                        />
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