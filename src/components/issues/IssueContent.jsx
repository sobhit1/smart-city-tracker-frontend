// src/components/issues/IssueContent.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton, // Import IconButton
  Dialog,     // Import Dialog for the lightbox
  DialogContent,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon for remove/close buttons

/**
 * An in-place editable field for the issue's title and description.
 * (This sub-component remains the same)
 */
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

/**
 * The main content area of the Issue Details page, now with a lightbox and attachment removal.
 */
function IssueContent({ issue, canEdit, canUploadProof, canDeleteAttachments }) {
  // NEW: State to manage the lightbox (full-screen image viewer)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleOpenLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };
  
  // Mock handler for removing an attachment
  const handleRemoveAttachment = (attachmentName) => {
    alert(`Admin is removing attachment: ${attachmentName}`);
    // In a real app, you would call an API to delete the attachment here.
  };

  return (
    <>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Title */}
        <EditableField
          initialValue={issue.title}
          onSave={(newTitle) => console.log('Title saved:', newTitle)}
          canEdit={canEdit}
          variant="h4"
          placeholder="Enter issue title..."
        />

        {/* Description */}
        <Box>
          <Typography variant="h6" gutterBottom>Description</Typography>
          <EditableField
            initialValue={issue.description}
            onSave={(newDesc) => console.log('Description saved:', newDesc)}
            canEdit={canEdit}
            multiline
            placeholder="Add a description..."
          />
        </Box>

        {/* Attachments */}
        <Box>
          <Typography variant="h6" gutterBottom>Attachments</Typography>
          <Grid container spacing={2}>
            {issue.attachments.map((att, index) => (
              <Grid item key={index}>
                {/* Wrap each attachment in a Box with relative positioning */}
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={att.url}
                    alt={att.name}
                    sx={{ 
                        width: 120, 
                        height: 120, 
                        objectFit: 'cover', 
                        borderRadius: 1, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        cursor: 'pointer',
                        '&:hover': {
                            opacity: 0.8
                        }
                    }}
                    // NEW: Open the lightbox on click
                    onClick={() => handleOpenLightbox(att.url)}
                  />
                  {/* NEW: Conditionally render the remove button for admins */}
                  {canDeleteAttachments && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveAttachment(att.name)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                      }}
                    >
                      <CloseIcon fontSize="small" sx={{ color: 'white' }} />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            ))}
            {canUploadProof && (
              <Grid item>
                <Button variant="outlined" component="label" sx={{ width: 120, height: 120, borderStyle: 'dashed' }}>
                  <AttachFileIcon />
                  <input type="file" hidden multiple />
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
      
      {/* NEW: Lightbox Dialog component */}
      <Dialog
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        maxWidth="lg"
        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}
      >
        <IconButton
            onClick={handleCloseLightbox}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' }
            }}
        >
            <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0 }}>
            <img 
                src={selectedImage} 
                alt="Full screen attachment" 
                style={{ maxWidth: '100%', maxHeight: '90vh', display: 'block' }} 
            />
        </DialogContent>
      </Dialog>
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