import { useState } from 'react';
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
} from '@mui/material';
import {
    AttachFile as AttachFileIcon,
    Check as CheckIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

import { updateIssue, deleteAttachment, addAttachmentsToIssue } from '../../api/issuesApi';
import { showNotification } from '../../state/notificationSlice';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

function EditableField({ initialValue, onSave, canEdit, multiline = false, variant = "body1", placeholder }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);

    const handleSave = () => {
        onSave(value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <Box>
                <TextField
                    fullWidth
                    multiline={multiline}
                    rows={multiline ? 5 : 1}
                    variant="outlined"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoFocus
                    sx={{ mb: 1, '& .MuiInputBase-root': { fontSize: variant === 'h4' ? '1.5rem' : '1rem' } }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={handleSave} variant="contained" size="small" startIcon={<CheckIcon />}>Save</Button>
                    <Button onClick={() => setIsEditing(false)} variant="outlined" size="small" startIcon={<CloseIcon />}>Cancel</Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box onClick={() => canEdit && setIsEditing(true)} sx={{ cursor: canEdit ? 'pointer' : 'default', '&:hover': { bgcolor: canEdit ? 'action.hover' : 'transparent' }, p: 1, m: -1, borderRadius: 1 }}>
            <Typography variant={variant} sx={{ whiteSpace: 'pre-wrap', color: value ? 'text.primary' : 'text.secondary', fontWeight: variant === 'h4' ? 'bold' : 'normal' }}>
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
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

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

    const { mutate: addAttachmentsMutation, isPending: isUploading } = useMutation({
        mutationFn: addAttachmentsToIssue,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
            dispatch(showNotification({ message: 'Attachment(s) added successfully', severity: 'success' }));
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to add attachment(s)', severity: 'error' }));
        }
    });

    const { mutate: deleteAttachmentMutation, isPending: isDeleting } = useMutation({
        mutationFn: deleteAttachment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
            dispatch(showNotification({ message: 'Attachment deleted successfully', severity: 'success' }));
            setAttachmentToDelete(null);
        },
        onError: (error) => {
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
    };

    const handleDeleteAttachment = () => {
        if (!attachmentToDelete) return;
        deleteAttachmentMutation({ issueId: issue.id, attachmentId: attachmentToDelete.id });
    };

    const handleOpenLightbox = (imageUrl) => {
        setSelectedImage(imageUrl);
        setLightboxOpen(true);
    };

    return (
        <>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                    <Typography variant="h6" gutterBottom>Description</Typography>
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
                    <Typography variant="h6" gutterBottom>Attachments</Typography>
                    <Grid container spacing={2}>
                        {issue.attachments.map((att) => (
                            <Grid item key={att.id}>
                                <Box sx={{ position: 'relative' }}>
                                    <Box
                                        component="img"
                                        src={att.url}
                                        alt={att.fileName}
                                        sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                                        onClick={() => handleOpenLightbox(att.url)}
                                    />
                                    {canDeleteAttachments && (
                                        <IconButton
                                            size="small"
                                            onClick={() => setAttachmentToDelete(att)}
                                            sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0, 0, 0, 0.6)', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' } }}
                                        >
                                            <CloseIcon fontSize="small" sx={{ color: 'white' }} />
                                        </IconButton>
                                    )}
                                </Box>
                            </Grid>
                        ))}
                        {canUploadProof && (
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    disabled={isUploading}
                                    sx={{ width: 120, height: 120, borderStyle: 'dashed' }}
                                >
                                    {isUploading ? <CircularProgress size={24} /> : <AttachFileIcon />}
                                    <input type="file" hidden multiple onChange={handleFileChange} />
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Paper>

            {/* Lightbox Dialog component */}
            <Dialog open={lightboxOpen} onClose={() => setLightboxOpen(false)} maxWidth="lg" PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}>
                <IconButton onClick={() => setLightboxOpen(false)} sx={{ position: 'absolute', top: 8, right: 8, color: 'white', bgcolor: 'rgba(0, 0, 0, 0.5)', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' } }}>
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ p: 0 }}>
                    <img src={selectedImage} alt="Full screen attachment" style={{ maxWidth: '100%', maxHeight: '90vh', display: 'block' }} />
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