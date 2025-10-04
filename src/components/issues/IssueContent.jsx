import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    TextField,
    IconButton,
    Dialog,
    DialogContent,
    CircularProgress,
    Tooltip,
    Fade,
} from '@mui/material';
import {
    AttachFile as AttachFileIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    ZoomIn as ZoomInIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

import { updateIssue, deleteAttachment, addAttachmentsToIssue } from '../../api/issuesApi';
import { showNotification } from '../../state/notificationSlice';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

function EditableField({ initialValue, onSave, canEdit, multiline = false, variant = "body1", placeholder }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSave = () => {
        if (value !== initialValue) onSave(value);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setValue(initialValue);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <Box sx={{ mb: 1 }}>
                <TextField
                    fullWidth
                    multiline={multiline}
                    rows={multiline ? 5 : 1}
                    variant="outlined"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoFocus
                    sx={{
                        mb: 1,
                        '& .MuiInputBase-root': {
                            fontSize: variant === 'h4' ? '1.5rem' : '1rem',
                            backgroundColor: '#23272e',
                            borderRadius: 2,
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !multiline) handleSave();
                        if (e.key === 'Escape') handleCancel();
                    }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        size="small"
                        startIcon={<CheckIcon />}
                        sx={{ fontWeight: 600 }}
                    >
                        Save
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="outlined"
                        size="small"
                        startIcon={<CloseIcon />}
                        sx={{ fontWeight: 500 }}
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            onClick={() => canEdit && setIsEditing(true)}
            sx={{
                cursor: canEdit ? 'pointer' : 'default',
                borderRadius: 2,
                px: 1,
                py: 0.5,
                transition: 'background 0.2s',
                '&:hover': canEdit ? { backgroundColor: 'rgba(82, 153, 255, 0.08)' } : {},
            }}
        >
            <Typography
                variant={variant}
                sx={{
                    whiteSpace: 'pre-wrap',
                    color: value ? 'text.primary' : 'text.secondary',
                    fontWeight: variant === 'h4' ? 700 : 400,
                    fontSize: variant === 'h4' ? 24 : 16,
                    letterSpacing: 0.1,
                }}
            >
                {value || placeholder}
            </Typography>
        </Box>
    );
}

EditableField.propTypes = {
    initialValue: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    canEdit: PropTypes.bool.isRequired,
    multiline: PropTypes.bool,
    variant: PropTypes.string,
    placeholder: PropTypes.string,
};

function IssueContent({ issue, canEdit, canUploadProof, canDeleteAttachments }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [attachmentToDelete, setAttachmentToDelete] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [localAttachments, setLocalAttachments] = useState(issue.attachments);

    const fileInputRef = useRef(null);

    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    useEffect(() => {
        setLocalAttachments(issue.attachments);
    }, [issue.attachments]);

    const { mutate: updateIssueMutation } = useMutation({
        mutationFn: updateIssue,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
            dispatch(showNotification({ message: 'Issue updated successfully', severity: 'success' }));
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update issue', severity: 'error' }));
        }
    });

    const { mutate: addAttachmentsMutation } = useMutation({
        mutationFn: async ({ issueId, files }) => {
            return addAttachmentsToIssue({ issueId, files });
        },
        onMutate: ({ files }) => {
            setUploading(true);
            const tempAttachments = files.map((file, idx) => ({
                id: `temp-${Date.now()}-${idx}`,
                url: '',
                fileName: file.name,
                fileType: file.type,
                uploading: true,
            }));
            setLocalAttachments(prev => [...prev, ...tempAttachments]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
            dispatch(showNotification({ message: 'Attachment(s) added successfully', severity: 'success' }));
        },
        onError: (error) => {
            setLocalAttachments(issue.attachments);
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to add attachment(s)', severity: 'error' }));
        },
        onSettled: () => setUploading(false),
    });

    const { mutate: deleteAttachmentMutation, isPending: isDeleting } = useMutation({
        mutationFn: deleteAttachment,
        onMutate: ({ attachmentId }) => {
            setLocalAttachments(prev => prev.filter(att => att.id !== attachmentId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
            dispatch(showNotification({ message: 'Attachment deleted successfully', severity: 'success' }));
            setAttachmentToDelete(null);
        },
        onError: (error) => {
            setLocalAttachments(issue.attachments);
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to delete attachment', severity: 'error' }));
        }
    });

    const handleSaveField = (fieldName, value) => {
        updateIssueMutation({ issueId: issue.id, updateData: { [fieldName]: value } });
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            addAttachmentsMutation({ issueId: issue.id, files });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDeleteAttachment = () => {
        if (!attachmentToDelete) return;
        deleteAttachmentMutation({ issueId: issue.id, attachmentId: attachmentToDelete.id });
    };

    const handleOpenLightbox = (imageUrl) => {
        setSelectedImage(imageUrl);
        setLightboxOpen(true);
    };

    const handleLightboxKeyDown = (e) => {
        if (e.key === 'Escape') setLightboxOpen(false);
    };

    return (
        <>
            <Paper sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)'
            }}>
                {/* Title */}
                <EditableField
                    initialValue={issue.title}
                    onSave={(newTitle) => handleSaveField('title', newTitle)}
                    canEdit={canEdit}
                    variant="h4"
                    placeholder="Enter issue title..."
                />

                {/* Description */}
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Description
                    </Typography>
                    <EditableField
                        initialValue={issue.description}
                        onSave={(newDesc) => handleSaveField('description', newDesc)}
                        canEdit={canEdit}
                        multiline
                        placeholder="Add a description..."
                    />
                </Box>

                {/* Attachments */}
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Attachments
                    </Typography>
                    <Grid container spacing={2}>
                        {localAttachments.length === 0 && !canUploadProof && (
                            <Grid item xs={12}>
                                <Typography sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: 15 }}>
                                    No attachments
                                </Typography>
                            </Grid>
                        )}
                        {localAttachments.map((att) => (
                            <Grid item key={att.id}>
                                <Box sx={{
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    boxShadow: '0 1px 6px 0 rgba(0,0,0,0.10)',
                                    '&:hover .attachment-actions': { opacity: 1 },
                                }}>
                                    <Box
                                        component="img"
                                        src={att.url || ''}
                                        alt={att.fileName}
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            objectFit: 'cover',
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            cursor: att.uploading ? 'not-allowed' : 'pointer',
                                            opacity: att.uploading ? 0.5 : 1,
                                            transition: 'opacity 0.2s',
                                            background: att.uploading ? 'repeating-linear-gradient(45deg, #23272e, #23272e 10px, #282E33 10px, #282E33 20px)' : undefined,
                                            '&:hover': { opacity: att.uploading ? 0.5 : 0.85 }
                                        }}
                                        onClick={() => !att.uploading && handleOpenLightbox(att.url)}
                                    />
                                    {att.uploading && (
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0, left: 0, width: '100%', height: '100%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            bgcolor: 'rgba(0,0,0,0.3)',
                                        }}>
                                            <CircularProgress size={32} />
                                        </Box>
                                    )}
                                    <Fade in={canDeleteAttachments || true}>
                                        <Box
                                            className="attachment-actions"
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                display: 'flex',
                                                gap: 0.5,
                                                opacity: canDeleteAttachments && !att.uploading ? 1 : 0,
                                                transition: 'opacity 0.2s',
                                            }}
                                        >
                                            {!att.uploading && (
                                                <Tooltip title="View">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenLightbox(att.url)}
                                                        sx={{
                                                            bgcolor: 'rgba(82,153,255,0.15)',
                                                            color: '#5299FF',
                                                            '&:hover': { bgcolor: 'rgba(82,153,255,0.25)' }
                                                        }}
                                                    >
                                                        <ZoomInIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {canDeleteAttachments && !att.uploading && (
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setAttachmentToDelete(att)}
                                                        sx={{
                                                            bgcolor: 'rgba(248,81,73,0.15)',
                                                            color: '#f85149',
                                                            '&:hover': { bgcolor: 'rgba(248,81,73,0.25)' }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </Fade>
                                </Box>
                            </Grid>
                        ))}
                        {canUploadProof && (
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    disabled={uploading}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderStyle: 'dashed',
                                        borderRadius: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: uploading ? 'text.secondary' : 'primary.main',
                                        borderColor: uploading ? 'divider' : 'primary.main',
                                        fontWeight: 600,
                                        fontSize: 16,
                                        gap: 1,
                                        backgroundColor: uploading ? 'action.disabledBackground' : 'transparent',
                                        transition: 'background 0.2s',
                                        '&:hover': {
                                            backgroundColor: 'rgba(82,153,255,0.08)',
                                            borderColor: 'primary.dark',
                                        }
                                    }}
                                >
                                    {uploading ? <CircularProgress size={28} /> : <AttachFileIcon fontSize="large" />}
                                    <Typography sx={{ fontSize: 13, mt: 1 }}>
                                        {uploading ? 'Uploading...' : 'Upload'}
                                    </Typography>
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                    />
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Paper>

            {/* Lightbox Dialog component */}
            <Dialog
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                maxWidth="lg"
                PaperProps={{
                    sx: { bgcolor: 'transparent', boxShadow: 'none', p: 0, m: 0 }
                }}
                onKeyDown={handleLightboxKeyDown}
            >
                <IconButton
                    onClick={() => setLightboxOpen(false)}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'white',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' }
                    }}
                    aria-label="Close image preview"
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img
                        src={selectedImage}
                        alt="Full screen attachment"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            display: 'block',
                            borderRadius: 8,
                            boxShadow: '0 4px 32px 0 rgba(0,0,0,0.32)'
                        }}
                        onClick={() => setLightboxOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            {attachmentToDelete && (
                <DeleteConfirmationDialog
                    open={!!attachmentToDelete}
                    onClose={() => setAttachmentToDelete(null)}
                    onConfirm={handleDeleteAttachment}
                    item={`attachment "${attachmentToDelete.fileName}"`}
                    isDeleting={isDeleting}
                />
            )}
        </>
    );
}

IssueContent.propTypes = {
    issue: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    canUploadProof: PropTypes.bool.isRequired,
    canDeleteAttachments: PropTypes.bool.isRequired,
};

export default IssueContent;