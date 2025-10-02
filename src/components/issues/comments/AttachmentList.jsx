import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    IconButton,
    Grid,
    Dialog,
    DialogContent,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Close as CloseIcon,
    InsertDriveFile as FileIcon,
} from '@mui/icons-material';

function AttachmentList({ attachments, onDelete, canDelete = false }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        return () => {
            attachments?.forEach(attachment => {
                if (attachment instanceof File) {
                    URL.revokeObjectURL(URL.createObjectURL(attachment));
                }
            });
        };
    }, [attachments]);

    if (!attachments || attachments.length === 0) return null;

    const isImage = (filename) => {
        return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename);
    };

    const handleImageClick = (url) => {
        setSelectedImage(url);
        setLightboxOpen(true);
    };

    const getAttachmentUrl = (attachment) => {
        if (attachment.url) return attachment.url;
        if (attachment instanceof File) return URL.createObjectURL(attachment);
        return '';
    };

    return (
        <>
            <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
                {attachments.map((attachment, index) => {
                    const url = getAttachmentUrl(attachment);
                    const filename = attachment.filename || attachment.name;
                    
                    return (
                        <Grid item key={attachment.id || index}>
                            <Box sx={{ position: 'relative' }}>
                                {canDelete && (
                                    <IconButton 
                                        size="small" 
                                        onClick={() => onDelete(attachment)}
                                        sx={{ 
                                            position: 'absolute', 
                                            top: -10, 
                                            right: -10, 
                                            zIndex: 10, 
                                            bgcolor: 'error.main',
                                            color: 'white',
                                            width: 28,
                                            height: 28,
                                            boxShadow: 2,
                                            '&:hover': { bgcolor: 'error.dark', boxShadow: 3 }
                                        }}
                                    >
                                        <CloseIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                )}
                                {isImage(filename) ? (
                                    <Box
                                        component="img"
                                        src={url}
                                        alt={filename}
                                        sx={{
                                            height: isMobile ? 80 : 120,
                                            width: isMobile ? 80 : 120,
                                            objectFit: 'cover',
                                            borderRadius: 1.5,
                                            cursor: 'pointer',
                                            border: 2,
                                            borderColor: 'divider',
                                            boxShadow: 1,
                                            '&:hover': { 
                                                opacity: 0.9, 
                                                borderColor: 'primary.main',
                                                boxShadow: 3,
                                                transform: 'scale(1.02)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => handleImageClick(url)}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1,
                                            p: 2,
                                            height: isMobile ? 80 : 120,
                                            width: isMobile ? 80 : 120,
                                            border: 2,
                                            borderColor: 'divider',
                                            borderRadius: 1.5,
                                            cursor: 'pointer',
                                            bgcolor: 'grey.50',
                                            boxShadow: 1,
                                            '&:hover': { 
                                                bgcolor: 'grey.100', 
                                                borderColor: 'primary.main',
                                                boxShadow: 3,
                                                transform: 'scale(1.02)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => window.open(url, '_blank')}
                                    >
                                        <FileIcon color="action" sx={{ fontSize: isMobile ? 32 : 40 }} />
                                        <Typography variant="caption" noWrap sx={{ maxWidth: isMobile ? 60 : 100, fontSize: 11, textAlign: 'center', fontWeight: 500 }}>
                                            {filename}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>

            <Dialog 
                open={lightboxOpen} 
                onClose={() => setLightboxOpen(false)} 
                maxWidth="lg"
                fullScreen={isMobile}
                PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', maxWidth: '90vw', maxHeight: '90vh' } }}
            >
                <IconButton 
                    onClick={() => setLightboxOpen(false)} 
                    sx={{ 
                        position: 'absolute', 
                        top: 16, 
                        right: 16, 
                        color: 'white', 
                        bgcolor: 'rgba(0, 0, 0, 0.7)', 
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.9)' },
                        zIndex: 1,
                        boxShadow: 3
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                        component="img"
                        src={selectedImage}
                        alt="Full view"
                        sx={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

AttachmentList.propTypes = {
    attachments: PropTypes.array,
    onDelete: PropTypes.func,
    canDelete: PropTypes.bool,
};

export default AttachmentList;