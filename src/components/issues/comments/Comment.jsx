import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Button,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreHoriz as MoreHorizIcon,
    Reply as ReplyIcon,
} from '@mui/icons-material';

import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import HighlightedText from './HighlightedText';
import AttachmentList from './AttachmentList';
import CommentInput from './CommentInput';

const MAX_FILES = 5;

const MENTION_MARKER = '\u200B';

function Comment({ comment, currentUser, canDeleteAnyComment, onEdit, onDelete, onReply, onDeleteAttachment, level = 0 }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const [editFiles, setEditFiles] = useState([]);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replyFiles, setReplyFiles] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [attachmentToDelete, setAttachmentToDelete] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const canEditComment = currentUser.id === comment.author.id;
    const canDeleteComment = canDeleteAnyComment || canEditComment;

    const handleSave = () => {
        onEdit({ text: editText, files: editFiles });
        setIsEditing(false);
        setEditFiles([]);
    };

    const handleReplySubmit = () => {
        if (replyText.trim() === '' && replyFiles.length === 0) return;
        onReply(comment.id, { text: replyText, files: replyFiles });
        setReplyText('');
        setReplyFiles([]);
        setIsReplying(false);
    };

    const handleReplyClick = () => {
        const mentionText = `@[${comment?.author?.name || 'Unknown User'}]${MENTION_MARKER} `;
        setReplyText(mentionText);
        setIsReplying(true);
    };

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        if (isEditing) {
            setEditFiles(prev => [...prev, ...newFiles].slice(0, MAX_FILES));
        } else {
            setReplyFiles(prev => [...prev, ...newFiles].slice(0, MAX_FILES));
        }
    };

    const handleRemoveFile = (indexToRemove) => {
        if (isEditing) {
            setEditFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        } else {
            setReplyFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        }
    };

    const handleDeleteAttachment = (attachment) => {
        setAttachmentToDelete(attachment);
    };

    const confirmDeleteAttachment = () => {
        if (attachmentToDelete) {
            onDeleteAttachment(comment.id, attachmentToDelete.id);
            setAttachmentToDelete(null);
        }
    };

    const marginLeft = isMobile ? Math.min(level, 3) * 2 : Math.min(level, 6) * 5;

    return (
        <Box sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, py: 2.5, ml: marginLeft }}>
                {level > 0 && (
                    <Box sx={{ 
                        position: 'absolute', 
                        left: marginLeft - (isMobile ? 1 : 2.5), 
                        top: 0, 
                        bottom: 0, 
                        width: 2, 
                        bgcolor: 'primary.main',
                        opacity: 0.3
                    }} />
                )}
                
                <Avatar sx={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, bgcolor: 'primary.main', flexShrink: 0, boxShadow: 1 }}>
                    {comment?.author?.name?.charAt(0)?.toUpperCase() || '?'}
                </Avatar>
                
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="body2" component="span" sx={{ fontWeight: 700, color: 'text.primary', mr: 1.5, fontSize: isMobile ? '0.875rem' : '0.95rem' }}>
                                {comment?.author?.name || 'Unknown User'}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                                {new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                        {(canEditComment || canDeleteComment) && !isEditing && (
                            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ opacity: 0.7, '&:hover': { opacity: 1 }, ml: 1 }}>
                                <MoreHorizIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>

                    {isEditing ? (
                        <Box sx={{ mt: 1 }}>
                            <CommentInput
                                value={editText}
                                onChange={setEditText}
                                onSubmit={handleSave}
                                onCancel={() => { setIsEditing(false); setEditFiles([]); }}
                                currentUser={currentUser}
                                files={editFiles}
                                onFileChange={handleFileChange}
                                onRemoveFile={handleRemoveFile}
                                isSubmitting={false}
                                autoFocus={true}
                            />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mt: 0.5 }}>
                                <HighlightedText text={comment.text} />
                            </Box>
                            
                            <AttachmentList 
                                attachments={comment.attachments} 
                                onDelete={handleDeleteAttachment}
                                canDelete={canEditComment}
                            />

                            <Box sx={{ mt: 1.5 }}>
                                <Button
                                    size="small"
                                    startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
                                    onClick={handleReplyClick}
                                    sx={{ 
                                        textTransform: 'none', 
                                        color: 'text.secondary', 
                                        fontSize: isMobile ? '0.75rem' : '0.8rem',
                                        minWidth: 'auto',
                                        px: 1.5,
                                        py: 0.5,
                                        fontWeight: 600,
                                        '&:hover': { color: 'primary.main', bgcolor: 'action.hover' }
                                    }}
                                >
                                    Reply
                                </Button>
                            </Box>
                        </>
                    )}

                    {isReplying && (
                        <Box sx={{ 
                            mt: 2,
                            display: 'flex', 
                            gap: isMobile ? 1 : 2,
                            pl: isMobile ? 0 : 0,
                            pt: 2,
                            borderTop: 1,
                            borderColor: 'divider',
                            bgcolor: 'rgba(25, 118, 210, 0.02)'
                        }}>
                            <Avatar sx={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, bgcolor: 'secondary.main', flexShrink: 0, boxShadow: 1 }}>
                                {currentUser?.fullName?.[0]}
                            </Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                    Replying to {comment?.author?.name || 'Unknown User'}
                                </Typography>
                                <CommentInput
                                    value={replyText}
                                    onChange={setReplyText}
                                    onSubmit={handleReplySubmit}
                                    onCancel={() => { setIsReplying(false); setReplyText(''); setReplyFiles([]); }}
                                    currentUser={currentUser}
                                    files={replyFiles}
                                    onFileChange={handleFileChange}
                                    onRemoveFile={handleRemoveFile}
                                    isSubmitting={false}
                                    placeholder="Write a reply..."
                                    autoFocus={true}
                                />
                            </Box>
                        </Box>
                    )}

                    <Menu 
                        anchorEl={anchorEl} 
                        open={menuOpen} 
                        onClose={() => setAnchorEl(null)}
                        PaperProps={{ elevation: 8 }}
                    >
                        {canEditComment && (
                            <MenuItem onClick={() => { setIsEditing(true); setAnchorEl(null); }} sx={{ py: 1.5 }}>
                                <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                                <Typography variant="body2">Edit</Typography>
                            </MenuItem>
                        )}
                        {canDeleteComment && (
                            <MenuItem onClick={() => { setAnchorEl(null); onDelete(); }} sx={{ color: 'error.main', py: 1.5 }}>
                                <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                                <Typography variant="body2">Delete</Typography>
                            </MenuItem>
                        )}
                    </Menu>
                </Box>
            </Box>

            {comment.replies && comment.replies.length > 0 && (
                <Box>
                    {comment.replies.map((reply) => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            currentUser={currentUser}
                            canDeleteAnyComment={canDeleteAnyComment}
                            onEdit={(updateData) => onEdit(reply.id, updateData)}
                            onDelete={() => onDelete(reply.id)}
                            onReply={onReply}
                            onDeleteAttachment={onDeleteAttachment}
                            level={level + 1}
                        />
                    ))}
                </Box>
            )}

            {attachmentToDelete && (
                <DeleteConfirmationDialog
                    open={!!attachmentToDelete}
                    onClose={() => setAttachmentToDelete(null)}
                    onConfirm={confirmDeleteAttachment}
                    item={`attachment "${attachmentToDelete.filename || attachmentToDelete.name}"`}
                    isDeleting={false}
                />
            )}
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
    onDeleteAttachment: PropTypes.func.isRequired,
    level: PropTypes.number,
};

export default Comment;