import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    Grid,
    Dialog,
    DialogContent,
    Stack,
    CircularProgress,
    Fade,
} from '@mui/material';
import {
    Close as CloseIcon,
    InsertDriveFile as FileIcon,
    BrokenImage as BrokenImageIcon,
    Download as DownloadIcon,
    Image as ImageIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

const fileTypeIcon = (fileType, fileName) => {
    if (fileType && fileType.startsWith('image/')) return <ImageIcon sx={{ color: '#7D858D', fontSize: 28 }} />;
    const ext = (fileName || '').split('.').pop()?.toLowerCase();
    return <FileIcon sx={{ color: '#7D858D', fontSize: 28 }} />;
};

const isImage = (fileType, fileName) => {
    if (fileType) return fileType.startsWith('image/');
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName || '');
};

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const truncateFileName = (name, max = 28) => {
    if (!name) return '';
    if (name.length <= max) return name;
    const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
    return name.slice(0, max - ext.length - 3) + '...' + ext;
};

function AttachmentList({ attachments, onDelete, canDelete = false }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedImageName, setSelectedImageName] = useState('');
    const [loadingStates, setLoadingStates] = useState({});
    const [errorStates, setErrorStates] = useState({});
    const urlMapRef = useRef(new Map());

    useEffect(() => {
        const urls = Array.from(urlMapRef.current.values());
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
            urlMapRef.current.clear();
        };
    }, []);

    if (!attachments || attachments.length === 0) return null;

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

    const handleImageClick = (url, filename) => {
        setSelectedImage(url);
        setSelectedImageName(filename);
        setLightboxOpen(true);
    };

    const handleDownload = (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLoad = (index) => {
        setLoadingStates(prev => ({ ...prev, [index]: false }));
    };

    const handleError = (index) => {
        setLoadingStates(prev => ({ ...prev, [index]: false }));
        setErrorStates(prev => ({ ...prev, [index]: true }));
    };

    return (
        <>
            <Box sx={{ mt: 1 }}>
                <Grid container spacing={1.5}>
                    {attachments.map((attachment, index) => {
                        const url = getAttachmentUrl(attachment);
                        const filename = attachment.fileName || attachment.name || 'file';
                        const filetype = attachment.fileType || attachment.type;
                        const filesize = attachment.size || attachment.fileSize;
                        const isImg = isImage(filetype, filename);

                        return (
                            <Grid item key={attachment.id || index} xs={6} sm={4} md={3} lg={2}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: 112,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        bgcolor: '#23272F',
                                        border: '1px solid #373E47',
                                        transition: 'box-shadow 0.2s, border-color 0.2s',
                                        '&:hover': {
                                            borderColor: '#5299FF',
                                            boxShadow: '0 0 0 2px #5299FF',
                                        },
                                    }}
                                >
                                    {/* Overlay actions on hover */}
                                    <Fade in={canDelete || true}>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                pointerEvents: 'none',
                                                zIndex: 2,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
                                                {canDelete && (
                                                    <Tooltip title="Delete" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onDelete(attachment)}
                                                            sx={{
                                                                pointerEvents: 'auto',
                                                                bgcolor: 'rgba(40,46,51,0.85)',
                                                                color: '#f85149',
                                                                '&:hover': { bgcolor: '#f85149', color: '#fff' },
                                                                m: 0,
                                                                p: '2px',
                                                            }}
                                                        >
                                                            <DeleteIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
                                                <Tooltip title="Download" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDownload(url, filename)}
                                                        sx={{
                                                            pointerEvents: 'auto',
                                                            bgcolor: 'rgba(40,46,51,0.85)',
                                                            color: '#E6EDF2',
                                                            '&:hover': { bgcolor: '#5299FF', color: '#fff' },
                                                            m: 0,
                                                            p: '2px',
                                                        }}
                                                    >
                                                        <DownloadIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Fade>

                                    {/* Image preview */}
                                    {isImg ? (
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                cursor: errorStates[index] ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: '#23272F',
                                                position: 'relative',
                                            }}
                                            onClick={() => !errorStates[index] && handleImageClick(url, filename)}
                                        >
                                            {loadingStates[index] !== false && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: '#23272F',
                                                    }}
                                                >
                                                    <CircularProgress size={24} thickness={3} sx={{ color: '#5299FF' }} />
                                                </Box>
                                            )}
                                            {errorStates[index] ? (
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 0.5,
                                                    }}
                                                >
                                                    <BrokenImageIcon sx={{ fontSize: 32, color: '#7D858D' }} />
                                                    <Typography variant="caption" sx={{ color: '#7D858D', fontSize: 10 }}>
                                                        Failed to load
                                                    </Typography>
                                                </Box>
                                            ) : (
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
                                                        display: loadingStates[index] === false ? 'block' : 'none',
                                                        borderRadius: 2,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                bgcolor: '#23272F',
                                                gap: 1,
                                                p: 1.5,
                                            }}
                                            onClick={() => window.open(url, '_blank')}
                                        >
                                            {fileTypeIcon(filetype, filename)}
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: 11,
                                                    color: '#7D858D',
                                                    fontWeight: 600,
                                                    letterSpacing: 0.5,
                                                    bgcolor: '#282E33',
                                                    px: 1,
                                                    borderRadius: 1,
                                                    mt: 0.5,
                                                }}
                                            >
                                                {(filename.split('.').pop() || '').toUpperCase()}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                {/* Filename and size below tile */}
                                <Tooltip title={filename} placement="top">
                                    <Typography
                                        variant="caption"
                                        noWrap
                                        sx={{
                                            display: 'block',
                                            mt: 0.5,
                                            fontSize: 12,
                                            color: '#E6EDF2',
                                            fontWeight: 400,
                                            maxWidth: 120,
                                        }}
                                    >
                                        {truncateFileName(filename)}
                                    </Typography>
                                </Tooltip>
                                {filesize && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontSize: 11,
                                            color: '#7D858D',
                                        }}
                                    >
                                        {formatFileSize(filesize)}
                                    </Typography>
                                )}
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            {/* Lightbox for image preview */}
            <Dialog
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                maxWidth={false}
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0,0,0,0.97)',
                        boxShadow: 'none',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                    },
                }}
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
                    <Tooltip title="Download">
                        <IconButton
                            onClick={() => handleDownload(selectedImage, selectedImageName)}
                            sx={{
                                color: '#E6EDF2',
                                bgcolor: 'rgba(40,46,51,0.8)',
                                border: '1px solid #373E47',
                                '&:hover': {
                                    bgcolor: '#282E33',
                                    borderColor: '#5299FF',
                                },
                            }}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Close">
                        <IconButton
                            onClick={() => setLightboxOpen(false)}
                            sx={{
                                color: '#E6EDF2',
                                bgcolor: 'rgba(40,46,51,0.8)',
                                border: '1px solid #373E47',
                                '&:hover': {
                                    bgcolor: '#282E33',
                                    borderColor: '#5299FF',
                                },
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
                            bgcolor: 'rgba(40,46,51,0.95)',
                            border: '1px solid #373E47',
                            px: 2,
                            py: 1,
                            borderRadius: '6px',
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ImageIcon sx={{ fontSize: 18, color: '#7D858D' }} />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#E6EDF2',
                                    fontSize: 13,
                                    maxWidth: 400,
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
                        bgcolor: 'transparent',
                    }}
                    onClick={() => setLightboxOpen(false)}
                >
                    <Box
                        component="img"
                        src={selectedImage}
                        alt={selectedImageName}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '85vh',
                            objectFit: 'contain',
                            borderRadius: '6px',
                        }}
                        onClick={e => e.stopPropagation()}
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