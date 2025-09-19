import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Fade,
} from '@mui/material';
import {
    Edit as EditIcon,
} from '@mui/icons-material';

function SidebarRow({ label, children, hasEdit = false, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5,
                px: 1,
                mx: -1,
                borderRadius: 1.5,
                cursor: hasEdit ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': hasEdit ? {
                    backgroundColor: 'rgba(82, 153, 255, 0.08)',
                    transform: 'translateX(2px)',
                } : {}
            }}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Typography
                sx={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#8B949E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    minWidth: '100px',
                    transition: 'color 0.2s ease',
                    ...(hovered && hasEdit && { color: '#A8B3BE' })
                }}
            >
                {label}
            </Typography>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flex: 1,
                justifyContent: 'flex-end'
            }}>
                {children}
                <Fade in={hovered && hasEdit} timeout={200}>
                    <EditIcon sx={{
                        fontSize: 14,
                        color: '#5299FF',
                        ml: 0.5,
                        opacity: hovered && hasEdit ? 1 : 0
                    }} />
                </Fade>
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

export default SidebarRow;