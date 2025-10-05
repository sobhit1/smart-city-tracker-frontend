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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    AttachFile as AttachFileIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    ZoomIn as ZoomInIcon,
    Delete as DeleteIcon,
    MyLocation as MyLocationIcon,
} from '@mui/icons-material';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { updateIssue, deleteAttachment, addAttachmentsToIssue } from '../../api/issuesApi';
import { useCategories } from '../../hooks/useLookups';
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
                        startIcon={<CheckCircleIcon />}
                        sx={{ fontWeight: 600 }}
                    >
                        Save
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="outlined"
                        size="small"
                        startIcon={<CancelIcon />}
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

function LocationPicker({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
}

function IssueContent({ issue, canEdit, canUploadProof, canDeleteAttachments }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [attachmentToDelete, setAttachmentToDelete] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [localAttachments, setLocalAttachments] = useState(issue.attachments);

    const { data: categoriesData, isLoading: areCategoriesLoading } = useCategories();
    const categories = categoriesData || [];

    const [category, setCategory] = useState(issue.category || '');
    const [categoryUpdating, setCategoryUpdating] = useState(false);

    const [location, setLocation] = useState(
        issue.latitude && issue.longitude
            ? { lat: issue.latitude, lng: issue.longitude }
            : null
    );
    const [mapCenter, setMapCenter] = useState(
        issue.latitude && issue.longitude
            ? [issue.latitude, issue.longitude]
            : [18.61, 73.72]
    );
    const [pendingLocation, setPendingLocation] = useState(null);
    const [locationUpdating, setLocationUpdating] = useState(false);

    useEffect(() => {
        setCategory(issue.category || '');
        setLocation(issue.latitude && issue.longitude ? { lat: issue.latitude, lng: issue.longitude } : null);
        setMapCenter(issue.latitude && issue.longitude ? [issue.latitude, issue.longitude] : [18.61, 73.72]);
        setLocalAttachments(issue.attachments);
        setPendingLocation(null);
    }, [issue]);

    const fileInputRef = useRef(null);

    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    const updateCategoryMutation = useMutation({
        mutationFn: ({ categoryId }) => updateIssue({ issueId: issue.id, updateData: { categoryId } }),
        onMutate: () => setCategoryUpdating(true),
        onSuccess: (updated) => {
            setCategory(updated.category);
            setCategoryUpdating(false);
            queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
            dispatch(showNotification({ message: 'Category updated successfully', severity: 'success' }));
        },
        onError: (error) => {
            setCategory(issue.category || '');
            setCategoryUpdating(false);
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update category', severity: 'error' }));
        }
    });

    const updateLocationMutation = useMutation({
        mutationFn: ({ latitude, longitude }) => updateIssue({ issueId: issue.id, updateData: { latitude, longitude } }),
        onMutate: () => setLocationUpdating(true),
        onSuccess: (updated) => {
            setLocation({ lat: updated.latitude, lng: updated.longitude });
            setMapCenter([updated.latitude, updated.longitude]);
            setPendingLocation(null);
            setLocationUpdating(false);
            queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
            dispatch(showNotification({ message: 'Location updated successfully', severity: 'success' }));
        },
        onError: (error) => {
            setPendingLocation(null);
            setLocationUpdating(false);
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update location', severity: 'error' }));
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
            return { tempAttachments };
        },
        onSuccess: (newAttachments) => {
            setLocalAttachments(prev => [
                ...prev.filter(att => {
                    const attId = String(att.id);
                    return !attId.startsWith('temp-');
                }),
                ...newAttachments.map(att => ({ ...att, uploading: false }))
            ]);
            dispatch(showNotification({ message: 'Attachment(s) added successfully', severity: 'success' }));
        },
        onError: (error) => {
            setLocalAttachments(prev => 
                prev.filter(att => {
                    const attId = String(att.id);
                    return !attId.startsWith('temp-');
                })
            );
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
        updateIssue({ issueId: issue.id, updateData: { [fieldName]: value } });
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

    const handleCategoryChange = (e) => {
        const selectedCategoryName = e.target.value;
        setCategory(selectedCategoryName);
        const selectedCategoryObj = categoriesData?.find(c => c.name === selectedCategoryName);
        if (selectedCategoryObj) {
            updateCategoryMutation.mutate({ categoryId: selectedCategoryObj.id });
        } else {
            dispatch(showNotification({ message: 'Invalid category selected', severity: 'error' }));
        }
    };

    const handleLocationSelect = (latlng) => {
        setPendingLocation(latlng);
    };

    const handleUpdateLocation = () => {
        if (pendingLocation) {
            updateLocationMutation.mutate({
                latitude: pendingLocation.lat,
                longitude: pendingLocation.lng
            });
        }
    };

    const handleCancelLocation = () => {
        setPendingLocation(null);
    };

    const handleGetCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newPos = { lat: latitude, lng: longitude };
                setPendingLocation(newPos);
                setMapCenter([latitude, longitude]);
            },
            () => {
                dispatch(showNotification({ message: 'Could not get your location. Please select manually.', severity: 'error' }));
            }
        );
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
                {/* Category */}
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Category
                    </Typography>
                    {canEdit ? (
                        <FormControl>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={category}
                                label="Category"
                                onChange={handleCategoryChange}
                                disabled={areCategoriesLoading || categoryUpdating}
                                sx={{
                                    minWidth: 180,
                                    backgroundColor: '#23272e',
                                    borderRadius: 2,
                                }}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                            {categoryUpdating && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <CircularProgress size={18} sx={{ mr: 1 }} />
                                    <Typography variant="caption">Updating...</Typography>
                                </Box>
                            )}
                        </FormControl>
                    ) : (
                        <Typography sx={{ fontSize: 16, color: 'text.secondary', fontStyle: 'italic' }}>
                            {category || 'N/A'}
                        </Typography>
                    )}
                </Box>
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
                {/* Location */}
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Location
                    </Typography>
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {canEdit && (
                            <>
                                <Button
                                    size="small"
                                    startIcon={<MyLocationIcon />}
                                    onClick={handleGetCurrentLocation}
                                    sx={{
                                        minHeight: '32px',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    Use Current Location
                                </Button>
                            </>
                        )}
                    </Box>
                    <Box sx={{
                        height: 300,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'relative'
                    }}>
                        <MapContainer
                            center={pendingLocation ? [pendingLocation.lat, pendingLocation.lng] : mapCenter}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            key={(pendingLocation ? [pendingLocation.lat, pendingLocation.lng] : mapCenter).join(',')}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {(pendingLocation || location) && (
                                <Marker position={pendingLocation ? [pendingLocation.lat, pendingLocation.lng] : [location.lat, location.lng]} />
                            )}
                            {canEdit && <LocationPicker onLocationSelect={handleLocationSelect} />}
                        </MapContainer>
                        {canEdit && pendingLocation && (
                            <Box sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                display: 'flex',
                                gap: 2,
                                zIndex: 1000,
                            }}>
                                <Tooltip title="Confirm Location">
                                    <span>
                                        <IconButton
                                            onClick={handleUpdateLocation}
                                            sx={{
                                                bgcolor: '#2e7d32',
                                                color: '#fff',
                                                boxShadow: 2,
                                                width: 48,
                                                height: 48,
                                                '&:hover': { bgcolor: '#388e3c' },
                                                border: '2px solid #fff',
                                            }}
                                            disabled={locationUpdating}
                                        >
                                            {locationUpdating
                                                ? <CircularProgress size={28} sx={{ color: '#fff' }} />
                                                : <CheckCircleIcon sx={{ fontSize: 32 }} />
                                            }
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                    <IconButton
                                        onClick={handleCancelLocation}
                                        sx={{
                                            bgcolor: '#c62828',
                                            color: '#fff',
                                            boxShadow: 2,
                                            width: 48,
                                            height: 48,
                                            '&:hover': { bgcolor: '#b71c1c' },
                                            border: '2px solid #fff',
                                        }}
                                        disabled={locationUpdating}
                                    >
                                        <CancelIcon sx={{ fontSize: 32 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        )}
                    </Box>
                    <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
                        {(pendingLocation || location)
                            ? `Lat: ${(pendingLocation || location).lat}, Lng: ${(pendingLocation || location).lng}`
                            : 'No location selected'}
                    </Typography>
                    {canEdit && (
                        <Typography sx={{ fontSize: 13, color: 'warning.main', mt: 0.5 }}>
                            {pendingLocation && "Click the tick to update location or cross to discard."}
                        </Typography>
                    )}
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
                                    {att.url ? (
                                        <Box
                                            component="img"
                                            src={att.url}
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
                                                '&:hover': { opacity: att.uploading ? 0.5 : 0.85 }
                                            }}
                                            onClick={() => !att.uploading && att.url && handleOpenLightbox(att.url)}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'background.default',
                                                color: 'text.secondary',
                                                fontSize: 12,
                                                textAlign: 'center',
                                                p: 1,
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {att.fileName || 'No preview'}
                                        </Box>
                                    )}
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
                                            {!att.uploading && att.url && (
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
                    <CancelIcon />
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