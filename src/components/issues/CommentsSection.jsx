import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
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

import { addComment, updateComment, deleteComment } from '../../api/issuesApi';
import { showNotification } from '../../state/notificationSlice';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

function Comment({ comment, currentUser, canDeleteAnyComment, onEdit, onDelete, onReply }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const canEditComment = currentUser.id === comment.author.id;
    const canDeleteComment = canDeleteAnyComment || canEditComment;

    const handleSave = () => {
        onEdit({ text: editText });
        setIsEditing(false);
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>{comment?.author?.name?.charAt(0)?.toUpperCase() || '?'}</Avatar>
            <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {comment?.author?.name || 'Unknown User'}
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
                        onClick={() => onReply(comment?.author?.name || 'Unknown User')}
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
                        <MenuItem onClick={() => { setAnchorEl(null); onDelete(); }} sx={{ color: 'error.main' }}>
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

function CommentsSection({ issueId, issueComments, currentUser, canDeleteAnyComment }) {
    const [newComment, setNewComment] = useState('');
    const [newCommentFiles, setNewCommentFiles] = useState([]);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const commentInputRef = useRef(null);
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const { mutate: addCommentMutation, isPending: isAddingComment } = useMutation({
        mutationFn: addComment,
        onSuccess: () => {
            queryClient.invalidateQueries(['issue', issueId]);
            dispatch(showNotification({ message: 'Comment added', severity: 'success' }));
            setNewComment('');
            setNewCommentFiles([]);
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to add comment', severity: 'error' }));
        }
    });

    const { mutate: updateCommentMutation } = useMutation({
        mutationFn: updateComment,
        onSuccess: () => {
            queryClient.invalidateQueries(['issue', issueId]);
            dispatch(showNotification({ message: 'Comment updated', severity: 'success' }));
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update comment', severity: 'error' }));
        }
    });

    const { mutate: deleteCommentMutation, isPending: isDeletingComment } = useMutation({
        mutationFn: deleteComment,
        onSuccess: () => {
            queryClient.invalidateQueries(['issue', issueId]);
            dispatch(showNotification({ message: 'Comment deleted', severity: 'success' }));
            setCommentToDelete(null);
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to delete comment', severity: 'error' }));
        }
    });
    
    const handleAddComment = () => {
        if (newComment.trim() === '') return;
        const commentData = { text: newComment };
        addCommentMutation({ issueId, commentData, files: newCommentFiles });
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
                        sx={{ '& .MuiOutlinedInput-root': { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, border: 1, borderColor: 'divider', borderTop: 0, borderBottomLeftRadius: (theme) => theme.shape.borderRadius, borderBottomRightRadius: (theme) => theme.shape.borderRadius, bgcolor: 'background.paper' }}>
                        <IconButton size="small" component="label" aria-label="attach file">
                            <AttachFileIcon fontSize="small" />
                            <input type="file" hidden multiple onChange={handleFileChange} />
                        </IconButton>
                        <Stack direction="row" spacing={1}>
                            {(newComment.trim() !== '' || newCommentFiles.length > 0) && (
                                <Button variant="text" onClick={() => { setNewComment(''); setNewCommentFiles([]); }}>Cancel</Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={handleAddComment}
                                disabled={isAddingComment || newComment.trim() === ''}
                            >
                                {isAddingComment ? <CircularProgress size={24} color="inherit" /> : 'Save'}
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
                {issueComments.map((comment) => (
                    <Comment
                        key={comment.id}
                        comment={comment}
                        currentUser={currentUser}
                        canDeleteAnyComment={canDeleteAnyComment}
                        onEdit={(updateData) => updateCommentMutation({ issueId, commentId: comment.id, ...updateData })}
                        onDelete={() => setCommentToDelete(comment)}
                        onReply={handleReply}
                    />
                ))}
            </Box>

            {commentToDelete && (
                <DeleteConfirmationDialog
                    open={!!commentToDelete}
                    onClose={() => setCommentToDelete(null)}
                    onConfirm={() => deleteCommentMutation({ issueId, commentId: commentToDelete.id })}
                    item={`comment by ${commentToDelete?.author?.name || 'Unknown User'}`}
                    isDeleting={isDeletingComment}
                />
            )}
        </Box>
    );
}

CommentsSection.propTypes = {
    issueId: PropTypes.number.isRequired,
    issueComments: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    canDeleteAnyComment: PropTypes.bool.isRequired,
};

export default CommentsSection;