import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    Chip,
    Collapse,
    Divider,
    Fade,
    CircularProgress,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreHoriz as MoreHorizIcon,
    Reply as ReplyIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    AttachFile as AttachFileIcon,
} from '@mui/icons-material';

import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import HighlightedText from './HighlightedText';
import AttachmentList from './AttachmentList';
import CommentInput from './CommentInput';
import { addAttachmentsToComment } from '../../../api/issuesApi';
import { showNotification } from '../../../state/notificationSlice';

const MAX_FILES = 5;
const MENTION_MARKER = '\u200B';

function Comment({
    comment,
    currentUser,
    canDeleteAnyComment,
    onEdit,
    onDelete,
    onReply,
    onDeleteAttachment,
    level = 0,
    issueId,
    onRefresh,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const [editFiles, setEditFiles] = useState([]);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replyFiles, setReplyFiles] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [attachmentToDelete, setAttachmentToDelete] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [repliesCollapsed, setRepliesCollapsed] = useState(false);
    const menuOpen = Boolean(anchorEl);
    const menuButtonRef = useRef(null);
    const inputRef = useRef(null);
    const editInputRef = useRef(null);

    const dispatch = useDispatch();

    const canEditComment = currentUser.id === comment.author.id;
    const canDeleteComment = canDeleteAnyComment || canEditComment;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const hasAttachments = comment.attachments && comment.attachments.length > 0;

    useEffect(() => {
        if (menuOpen && menuButtonRef.current) {
            menuButtonRef.current.focus();
        }
    }, [menuOpen]);

    const { mutate: uploadAttachments, isPending: isUploading } = useMutation({
        mutationFn: ({ files }) =>
            addAttachmentsToComment({
                issueId,
                commentId: comment.id,
                files,
            }),
        onSuccess: () => {
            setEditFiles([]);
            if (onRefresh) onRefresh();
            dispatch(showNotification({ message: 'Attachment(s) added successfully', severity: 'success' }));
        },
        onError: (error) => {
            dispatch(showNotification({ message: error?.response?.data?.message || 'Failed to add attachment(s)', severity: 'error' }));
        },
    });

    const handleSave = async () => {
        if (editText.trim() === '' && editFiles.length === 0) return;

        try {
            let textUpdated = false;
            let attachmentsUpdated = false;

            if (editText.trim() !== comment.text.trim()) {
                await onEdit(comment.id, { text: editText, files: [] });
                textUpdated = true;
            }

            if (editFiles.length > 0) {
                await uploadAttachments({ files: editFiles });
                attachmentsUpdated = true;
            }

            setIsEditing(false);

            if (textUpdated && attachmentsUpdated) {
                dispatch(showNotification({ message: 'Comment and attachments updated successfully', severity: 'success' }));
            } else if (textUpdated) {
                dispatch(showNotification({ message: 'Comment updated successfully', severity: 'success' }));
            } else if (attachmentsUpdated) {
            }

        } catch (error) {
            dispatch(showNotification({ message: 'Failed to update comment', severity: 'error' }));
            console.error('Failed to update comment:', error);
        }
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

        setTimeout(() => {
            if (inputRef.current) {
                const textarea = inputRef.current.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                    const cursorPosition = mentionText.length;
                    textarea.setSelectionRange(cursorPosition, cursorPosition);
                }
            }
        }, 0);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setAnchorEl(null);
        setEditText(comment.text);

        setTimeout(() => {
            if (editInputRef.current) {
                const textarea = editInputRef.current.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                    const cursorPosition = comment.text.length;
                    textarea.setSelectionRange(cursorPosition, cursorPosition);
                }
            }
        }, 0);
    };

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        if (isEditing) {
            setEditFiles((prev) => [...prev, ...newFiles].slice(0, MAX_FILES));
        } else {
            setReplyFiles((prev) => [...prev, ...newFiles].slice(0, MAX_FILES));
        }
    };

    const handleRemoveFile = (indexToRemove) => {
        if (isEditing) {
            setEditFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
        } else {
            setReplyFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
        }
    };

    const confirmDeleteAttachment = () => {
        if (attachmentToDelete) {
            onDeleteAttachment(attachmentToDelete.id);
            setAttachmentToDelete(null);
        }
    };

    const getRelativeTime = (date) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diffMs = now - commentDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return commentDate.toLocaleDateString();
    };

    const marginLeft = Math.min(level, 6) * 24;
    const maxNestingLevel = 6;

    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
                sx={{
                    display: 'flex',
                    gap: 1.5,
                    py: 1.5,
                    ml: `${marginLeft}px`,
                    px: { xs: 1, sm: 1.5 },
                    borderRadius: '6px',
                    bgcolor: isHovered ? '#2C333A' : 'transparent',
                    transition: 'background-color 0.15s ease',
                    position: 'relative',
                    '&::before': level > 0
                        ? {
                            content: '""',
                            position: 'absolute',
                            left: -12,
                            top: 0,
                            bottom: hasReplies && !repliesCollapsed ? 0 : '50%',
                            width: 2,
                            bgcolor: '#373E47',
                        }
                        : {},
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#5299FF',
                        fontSize: 14,
                        fontWeight: 600,
                        flexShrink: 0,
                    }}
                    aria-label={`Avatar for ${comment?.author?.name || 'Unknown User'}`}
                >
                    {comment?.author?.name?.charAt(0)?.toUpperCase() || '?'}
                </Avatar>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    {/* Header: name, time, edited, menu */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'wrap',
                                minWidth: 0,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: '#E6EDF2',
                                    maxWidth: 180,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                                title={comment?.author?.name || 'Unknown User'}
                            >
                                {comment?.author?.name || 'Unknown User'}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#7D858D',
                                    fontSize: 12,
                                }}
                            >
                                {getRelativeTime(comment.createdAt)}
                            </Typography>
                            {comment.edited && (
                                <Chip
                                    label="Edited"
                                    size="small"
                                    sx={{
                                        height: 18,
                                        fontSize: 10,
                                        fontWeight: 500,
                                        bgcolor: '#373E47',
                                        color: '#7D858D',
                                        '& .MuiChip-label': { px: 0.75 },
                                    }}
                                />
                            )}
                        </Box>
                        {(canEditComment || canDeleteComment) && !isEditing && (
                            <Fade in={isHovered || menuOpen}>
                                <Box
                                    sx={{
                                        opacity: isHovered || menuOpen ? 1 : 0,
                                        transition: 'opacity 0.15s',
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        ref={menuButtonRef}
                                        onClick={(e) => setAnchorEl(e.currentTarget)}
                                        sx={{
                                            color: '#7D858D',
                                            '&:hover': {
                                                bgcolor: '#373E47',
                                                color: '#E6EDF2',
                                            },
                                        }}
                                        aria-label="More actions"
                                        aria-haspopup="true"
                                        aria-controls={menuOpen ? 'comment-menu' : undefined}
                                    >
                                        <MoreHorizIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Fade>
                        )}
                    </Box>

                    {/* Main content: edit or display */}
                    {isEditing ? (
                        <Box sx={{ mt: 1 }}>
                            <CommentInput
                                value={editText}
                                onChange={setEditText}
                                onSubmit={handleSave}
                                onCancel={() => {
                                    setIsEditing(false);
                                    setEditFiles([]);
                                }}
                                currentUser={currentUser}
                                files={editFiles}
                                onFileChange={handleFileChange}
                                onRemoveFile={handleRemoveFile}
                                isSubmitting={isUploading}
                                inputRef={editInputRef}
                            />
                            {isUploading && (
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={18} />
                                    <Typography variant="caption" sx={{ color: '#7D858D' }}>
                                        Uploading attachments...
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    mt: 0.5,
                                    color: '#E6EDF2',
                                    fontSize: 14,
                                    lineHeight: 1.5,
                                    wordBreak: 'break-word',
                                }}
                            >
                                <HighlightedText text={comment.text} />
                            </Box>

                            {hasAttachments && (
                                <Box sx={{ mt: 1 }}>
                                    <AttachmentList
                                        attachments={comment.attachments}
                                        onDelete={(attachment) => setAttachmentToDelete(attachment)}
                                        canDelete={canEditComment}
                                    />
                                </Box>
                            )}

                            <Box
                                sx={{
                                    mt: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Button
                                    size="small"
                                    startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
                                    onClick={handleReplyClick}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: 12,
                                        color: '#7D858D',
                                        px: 1,
                                        py: 0.25,
                                        minHeight: 0,
                                        '&:hover': {
                                            bgcolor: '#373E47',
                                            color: '#E6EDF2',
                                        },
                                    }}
                                >
                                    Reply
                                </Button>

                                {hasAttachments && (
                                    <Chip
                                        icon={<AttachFileIcon sx={{ fontSize: 12 }} />}
                                        label={comment.attachments.length}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            fontSize: 11,
                                            bgcolor: '#373E47',
                                            color: '#7D858D',
                                            '& .MuiChip-icon': { ml: 0.5, color: '#7D858D' },
                                        }}
                                    />
                                )}

                                {hasReplies && (
                                    <Button
                                        size="small"
                                        endIcon={
                                            repliesCollapsed ? (
                                                <ExpandMoreIcon sx={{ fontSize: 14 }} />
                                            ) : (
                                                <ExpandLessIcon sx={{ fontSize: 14 }} />
                                            )
                                        }
                                        onClick={() => setRepliesCollapsed(!repliesCollapsed)}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            fontSize: 12,
                                            color: '#7D858D',
                                            px: 1,
                                            py: 0.25,
                                            minHeight: 0,
                                            ml: 'auto',
                                            '&:hover': {
                                                bgcolor: '#373E47',
                                                color: '#E6EDF2',
                                            },
                                        }}
                                    >
                                        {comment.replies.length}{' '}
                                        {comment.replies.length === 1 ? 'reply' : 'replies'}
                                    </Button>
                                )}
                            </Box>
                        </>
                    )}

                    {/* Reply input */}
                    <Collapse in={isReplying}>
                        <Box sx={{ mt: 1.5, pl: { xs: 0, sm: 5 } }}>
                            <CommentInput
                                value={replyText}
                                onChange={setReplyText}
                                onSubmit={handleReplySubmit}
                                onCancel={() => {
                                    setIsReplying(false);
                                    setReplyText('');
                                    setReplyFiles([]);
                                }}
                                currentUser={currentUser}
                                files={replyFiles}
                                onFileChange={handleFileChange}
                                onRemoveFile={handleRemoveFile}
                                isSubmitting={false}
                                placeholder="Write a reply..."
                                inputRef={inputRef}
                            />
                        </Box>
                    </Collapse>

                    {/* Menu for edit/delete */}
                    <Menu
                        id="comment-menu"
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={() => setAnchorEl(null)}
                        PaperProps={{
                            sx: {
                                bgcolor: '#282E33',
                                border: '1px solid #373E47',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                                borderRadius: '6px',
                                minWidth: 160,
                            },
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        {canEditComment && (
                            <MenuItem
                                onClick={handleEditClick}
                                sx={{
                                    py: 0.5,
                                    px: 1,
                                    minHeight: 28,
                                    fontSize: 13,
                                    color: '#E6EDF2',
                                    '&:hover': {
                                        bgcolor: '#373E47',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <EditIcon fontSize="small" sx={{ color: '#7D858D' }} />
                                </ListItemIcon>
                                Edit
                            </MenuItem>
                        )}
                        {canEditComment && canDeleteComment && (
                            <Divider sx={{ borderColor: '#373E47' }} />
                        )}
                        {canDeleteComment && (
                            <MenuItem
                                onClick={() => {
                                    setAnchorEl(null);
                                    onDelete(comment.id);
                                }}
                                sx={{
                                    py: 0.5,
                                    px: 1,
                                    minHeight: 28,
                                    fontSize: 13,
                                    color: '#f85149',
                                    '&:hover': {
                                        bgcolor: 'rgba(248, 81, 73, 0.1)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <DeleteIcon fontSize="small" sx={{ color: '#f85149' }} />
                                </ListItemIcon>
                                Delete
                            </MenuItem>
                        )}
                    </Menu>
                </Box>
            </Box>

            {/* Recursive rendering of replies */}
            <Collapse in={hasReplies && !repliesCollapsed}>
                <Box>
                    {comment.replies?.map((reply) => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            currentUser={currentUser}
                            canDeleteAnyComment={canDeleteAnyComment}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onReply={onReply}
                            onDeleteAttachment={onDeleteAttachment}
                            level={Math.min(level + 1, maxNestingLevel)}
                            issueId={issueId}
                            onRefresh={onRefresh}
                        />
                    ))}
                </Box>
            </Collapse>

            {/* Attachment delete confirmation */}
            {attachmentToDelete && (
                <DeleteConfirmationDialog
                    open={!!attachmentToDelete}
                    onClose={() => setAttachmentToDelete(null)}
                    onConfirm={confirmDeleteAttachment}
                    item={`attachment "${attachmentToDelete.fileName || attachmentToDelete.name}"`}
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
    issueId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onRefresh: PropTypes.func,
};

export default Comment;