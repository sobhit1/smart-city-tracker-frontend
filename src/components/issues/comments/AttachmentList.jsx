import { useState, useEffect, useRef } from 'react';
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
    CircularProgress,
    Tooltip,
    Fade,
    Zoom,
    Chip,
    Stack,
} from '@mui/material';
import {
    Close as CloseIcon,
    InsertDriveFile as FileIcon,
    BrokenImage as BrokenImageIcon,
    ZoomIn as ZoomInIcon,
    Download as DownloadIcon,
    Image as ImageIcon,
} from '@mui/icons-material';

function AttachmentList({ attachments, onDelete, canDelete = false }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedImageName, setSelectedImageName] = useState('');
    const [loadingStates, setLoadingStates] = useState({});
    const [errorStates, setErrorStates] = useState({});
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const urlMapRef = useRef(new Map());
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const urls = Array.from(urlMapRef.current.values());
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
            urlMapRef.current.clear();
        };
    }, []);

    if (!attachments || attachments.length === 0) return null;

    const isImage = (fileType, fileName) => {
        if (fileType) return fileType.startsWith('image/');
        return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName || '');
    };

    const handleImageClick = (url, filename) => {
        setSelectedImage(url);
        setSelectedImageName(filename);
        setLightboxOpen(true);
    };

    const getAttachmentUrl = (attachment) => {
        if (attachment.url) return attachment.url;
        if (attachment instanceof File) {
            if (!urlMapRef.current.has(attachment)) {
                const objectUrl = URL.createObjectURL(attachment);
                urlMapRef.current.set(attachment, objectUrl);
            }
            return urlMapRef.current.get(attachment);
        }
        return '';
    };

    const handleLoad = (index) => {
        setLoadingStates(prev => ({ ...prev, [index]: false }));
    };

    const handleError = (index) => {
        setLoadingStates(prev => ({ ...prev, [index]: false }));
        setErrorStates(prev => ({ ...prev, [index]: true }));
    };

    const handleDownload = (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    const getFileExtension = (filename) => {
        const ext = filename.split('.').pop()?.toUpperCase();
        return ext && ext.length <= 4 ? ext : 'FILE';
    };

    const thumbnailSize = isMobile ? 100 : isTablet ? 120 : 140;

    return (
        <>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                {attachments.map((attachment, index) => {
                    const url = getAttachmentUrl(attachment);
                    const filename = attachment.fileName || attachment.name || 'file';
                    const filetype = attachment.fileType || attachment.type;
                    const filesize = attachment.size || attachment.fileSize;
                    const isImg = isImage(filetype, filename);

                    return (
                        <Grid item key={attachment.id || index} xs={6} sm={4} md={3} lg={2}>
                            <Zoom in timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                                <Box
                                    sx={{ position: 'relative' }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {canDelete && (
                                        <Tooltip title="Remove" arrow placement="top">
                                            <IconButton
                                                size="small"
                                                onClick={() => onDelete(attachment)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    zIndex: 10,
                                                    bgcolor: 'error.main',
                                                    color: 'white',
                                                    width: 32,
                                                    height: 32,
                                                    boxShadow: 3,
                                                    opacity: hoveredIndex === index ? 1 : 0.85,
                                                    transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        bgcolor: 'error.dark',
                                                        boxShadow: 4,
                                                        transform: 'scale(1.15)',
                                                    }
                                                }}
                                            >
                                                <CloseIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {isImg ? (
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                height: thumbnailSize,
                                                width: '100%',
                                                borderRadius: 2.5,
                                                overflow: 'hidden',
                                                border: 2,
                                                borderColor: hoveredIndex === index ? 'primary.main' : 'divider',
                                                boxShadow: hoveredIndex === index ? 6 : 2,
                                                bgcolor: 'grey.900',
                                                cursor: 'pointer',
                                                transform: hoveredIndex === index ? 'translateY(-4px)' : 'translateY(0)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                            onClick={() => !errorStates[index] && handleImageClick(url, filename)}
                                        >
                                            {loadingStates[index] !== false && (
                                                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.3)' }}>
                                                    <CircularProgress size={32} thickness={4} />
                                                </Box>
                                            )}

                                            {errorStates[index] ? (
                                                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                    <BrokenImageIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        Failed to load
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <>
                                                    <Box
                                                        component="img"
                                                        src={url}
                                                        alt={filename}
                                                        onLoad={() => handleLoad(index)}
                                                        onError={() => handleError(index)}
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            display: loadingStates[index] === false ? 'block' : 'none'
                                                        }}
                                                    />
                                                    <Fade in={hoveredIndex === index}>
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                inset: 0,
                                                                bgcolor: 'rgba(0,0,0,0.5)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backdropFilter: 'blur(2px)',
                                                            }}
                                                        >
                                                            <ZoomInIcon sx={{ fontSize: 40, color: 'white' }} />
                                                        </Box>
                                                    </Fade>
                                                </>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1.5,
                                                p: 2,
                                                height: thumbnailSize,
                                                width: '100%',
                                                border: 2,
                                                borderColor: hoveredIndex === index ? 'primary.main' : 'divider',
                                                borderRadius: 2.5,
                                                cursor: 'pointer',
                                                bgcolor: 'background.paper',
                                                boxShadow: hoveredIndex === index ? 6 : 1,
                                                transform: hoveredIndex === index ? 'translateY(-4px)' : 'translateY(0)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                }
                                            }}
                                            onClick={() => window.open(url, '_blank')}
                                        >
                                            <FileIcon 
                                                sx={{ 
                                                    fontSize: isMobile ? 40 : 48, 
                                                    color: hoveredIndex === index ? 'primary.main' : 'action.active',
                                                    transition: 'color 0.2s'
                                                }} 
                                            />
                                            <Chip
                                                label={getFileExtension(filename)}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    bgcolor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                }}
                                            />
                                        </Box>
                                    )}

                                    <Box sx={{ mt: 1 }}>
                                        <Tooltip title={filename} arrow>
                                            <Typography
                                                variant="caption"
                                                noWrap
                                                sx={{
                                                    display: 'block',
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    color: 'text.primary',
                                                }}
                                            >
                                                {filename}
                                            </Typography>
                                        </Tooltip>
                                        {filesize && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: 11,
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {formatFileSize(filesize)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Zoom>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Enhanced Lightbox */}
            <Dialog
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                maxWidth={false}
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.95)',
                        boxShadow: 'none',
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        m: 2,
                    }
                }}
                TransitionComponent={Fade}
                transitionDuration={300}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 1,
                    }}
                >
                    <Tooltip title="Download" arrow>
                        <IconButton
                            onClick={() => handleDownload(selectedImage, selectedImageName)}
                            sx={{
                                color: 'white',
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                },
                                boxShadow: 3,
                            }}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Close" arrow>
                        <IconButton
                            onClick={() => setLightboxOpen(false)}
                            sx={{
                                color: 'white',
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                },
                                boxShadow: 3,
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>

                {selectedImageName && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 16,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: 3,
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ImageIcon sx={{ fontSize: 20, color: 'grey.400' }} />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'white',
                                    fontWeight: 500,
                                    maxWidth: isMobile ? 250 : 500,
                                }}
                                noWrap
                            >
                                {selectedImageName}
                            </Typography>
                        </Stack>
                    </Box>
                )}

                <DialogContent
                    sx={{
                        p: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                    onClick={() => setLightboxOpen(false)}
                >
                    <Box
                        component="img"
                        src={selectedImage}
                        alt={selectedImageName}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                            borderRadius: 1,
                            boxShadow: 8,
                        }}
                        onClick={(e) => e.stopPropagation()}
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