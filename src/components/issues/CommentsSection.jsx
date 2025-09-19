import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    CircularProgress,
    Stack,
    Grid,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreHoriz as MoreHorizIcon,
    Reply as ReplyIcon,
    AttachFile as AttachFileIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

import DeleteConfirmationDialog from './DeleteConfirmationDialog';

function Comment({ comment, currentUser, canDeleteAnyComment, onEdit, onReply }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const canEditComment = currentUser.id === comment.author.id;
    const canDeleteComment = canDeleteAnyComment || canEditComment;

    const handleSave = () => {
        onEdit(comment.id, editText);
        setIsEditing(false);
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>{comment.author.name[0]}</Avatar>
            <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {comment.author.name}
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            - {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                    </Typography>
                    {(canEditComment || canDeleteComment) && !isEditing && (
                        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                            <MoreHorizIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>

                {isEditing ? (
                    <Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            autoFocus
                            sx={{ mb: 1 }}
                        />
                        <Stack direction="row" spacing={1}>
                            <Button onClick={handleSave} variant="contained" size="small">Save</Button>
                            <Button onClick={() => setIsEditing(false)} variant="text" size="small">Cancel</Button>
                        </Stack>
                    </Box>
                ) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {comment.text}
                    </Typography>
                )}

                {/* Reply Button */}
                {!isEditing && (
                    <Button
                        size="small"
                        startIcon={<ReplyIcon />}
                        onClick={() => onReply(comment.author.name)}
                        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.75rem', mt: 1 }}
                    >
                        Reply
                    </Button>
                )}

                <Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setAnchorEl(null)}>
                    {canEditComment && (
                        <MenuItem onClick={() => { setIsEditing(true); setAnchorEl(null); }}>
                            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Edit
                        </MenuItem>
                    )}
                    {canDeleteComment && (
                        <MenuItem
                            onClick={() => {
                                setAnchorEl(null);
                                comment.onRequestDelete(comment.id);
                            }}
                            sx={{ color: 'error.main' }}
                        >
                            <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>Delete
                        </MenuItem>
                    )}
                </Menu>
            </Box>
        </Box>
    );
}

Comment.propTypes = {
    comment: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    canDeleteAnyComment: PropTypes.bool.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onReply: PropTypes.func.isRequired,
};

function CommentsSection({ issueComments, currentUser, canDeleteAnyComment }) {
    const [comments, setComments] = useState(issueComments);
    const [newComment, setNewComment] = useState('');
    const [newCommentFiles, setNewCommentFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const commentInputRef = useRef(null);

    const handleAddComment = async () => {
        if (newComment.trim() === '') return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        const newCommentObject = {
            id: Math.random(),
            author: { id: currentUser.id, name: currentUser.fullName },
            text: newComment,
            attachments: newCommentFiles,
            createdAt: new Date().toISOString(),
        };
        setComments([...comments, newCommentObject]);
        setNewComment('');
        setNewCommentFiles([]);
        setIsSubmitting(false);
    };

    const handleEditComment = async (commentId, newText) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setComments(comments.map(c => c.id === commentId ? { ...c, text: newText } : c));
    };

    const handleDeleteComment = async (commentId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setComments(comments.filter(c => c.id !== commentId));
    };

    const requestDeleteComment = (commentId) => {
        setCommentToDelete(commentId);
        setDeleteDialogOpen(true);
    };

    const handleReply = (authorName) => {
        setNewComment(prev => `@${authorName} ${prev}`.trim());
        commentInputRef.current.focus();
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setNewCommentFiles(prev => [...prev, ...files].slice(0, 5));
    };

    const handleRemoveFile = (indexToRemove) => {
        setNewCommentFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Comments</Typography>

            {/* Add New Comment Form */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>{currentUser?.fullName?.[0]}</Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        inputRef={commentInputRef}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                            },
                        }}
                    />
                    {/* Toolbar for the comment box */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            border: 1,
                            borderColor: 'divider',
                            borderTop: 0,
                            borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
                            borderBottomRightRadius: (theme) => theme.shape.borderRadius,
                            bgcolor: 'background.paper',
                        }}
                    >
                        <IconButton size="small" component="label" aria-label="attach file">
                            <AttachFileIcon fontSize="small" />
                            <input type="file" hidden multiple onChange={handleFileChange} />
                        </IconButton>
                        <Stack direction="row" spacing={1}>
                            {/* The "Cancel" button is now visible if there is text */}
                            {newComment.trim() !== '' && (
                                <Button variant="text" onClick={() => { setNewComment(''); setNewCommentFiles([]); }}>
                                    Cancel
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={handleAddComment}
                                disabled={isSubmitting || newComment.trim() === ''}
                            >
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                            </Button>
                        </Stack>
                    </Box>
                    {/* Previews for new comment attachments */}
                    {newCommentFiles.length > 0 && (
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                            {newCommentFiles.map((file, index) => (
                                <Grid item key={index}>
                                    <Box sx={{ position: 'relative' }}>
                                        <IconButton size="small" onClick={() => handleRemoveFile(index)} sx={{ position: 'absolute', top: -5, right: -5, zIndex: 1, bgcolor: 'rgba(0,0,0,0.7)', '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' } }}>
                                            <CloseIcon fontSize="small" sx={{ color: 'white' }} />
                                        </IconButton>
                                        <Box component="img" src={URL.createObjectURL(file)} sx={{ height: 60, width: 60, objectFit: 'cover', borderRadius: 1 }} />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Box>

            {/* List of Existing Comments */}
            <Box>
                {comments.map((comment) => (
                    <Comment
                        key={comment.id}
                        comment={{ ...comment, onRequestDelete: requestDeleteComment }}
                        currentUser={currentUser}
                        canDeleteAnyComment={canDeleteAnyComment}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                        onReply={handleReply}
                    />
                ))}
            </Box>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={() => {
                    handleDeleteComment(commentToDelete);
                    setDeleteDialogOpen(false);
                    setCommentToDelete(null);
                }}
                item="Comment"
            />
        </Box>
    );
}

CommentsSection.propTypes = {
    issueComments: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    canDeleteAnyComment: PropTypes.bool.isRequired,
};

export default CommentsSection;