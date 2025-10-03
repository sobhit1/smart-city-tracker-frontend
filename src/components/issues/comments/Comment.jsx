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
    Chip,
    Tooltip,
    Fade,
    Collapse,
    Divider,
    Badge,
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
    const [isHovered, setIsHovered] = useState(false);
    const [repliesCollapsed, setRepliesCollapsed] = useState(false);
    const menuOpen = Boolean(anchorEl);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const canEditComment = currentUser.id === comment.author.id;
    const canDeleteComment = canDeleteAnyComment || canEditComment;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const hasAttachments = comment.attachments && comment.attachments.length > 0;

    const handleSave = () => {
        onEdit(comment.id, { text: editText, files: editFiles });
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

    const confirmDeleteAttachment = () => {
        if (attachmentToDelete) {
            onDeleteAttachment(comment.id, attachmentToDelete.id);
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

    const marginLeft = isMobile ? Math.min(level, 3) * 2 : Math.min(level, 6) * 5;
    const maxNestingLevel = isMobile ? 3 : 6;
    const isMaxNesting = level >= maxNestingLevel;

    return (
        <Box sx={{ position: 'relative' }}>
            <Box
                sx={{
                    display: 'flex',
                    gap: isMobile ? 1.5 : 2,
                    py: 2,
                    ml: marginLeft,
                    px: isMobile ? 1.5 : 2,
                    borderRadius: 2,
                    bgcolor: isHovered ? 'action.hover' : 'transparent',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '&::before': level > 0 ? {
                        content: '""',
                        position: 'absolute',
                        left: isMobile ? -12 : -20,
                        top: 0,
                        bottom: hasReplies && !repliesCollapsed ? 0 : '50%',
                        width: 2,
                        bgcolor: 'divider',
                        borderRadius: 1,
                    } : {},
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                        level === 0 && hasReplies ? (
                            <Box
                                sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: 'white',
                                    border: 2,
                                    borderColor: 'background.paper',
                                }}
                            >
                                {comment.replies.length}
                            </Box>
                        ) : null
                    }
                >
                    <Avatar
                        sx={{
                            width: isMobile ? 36 : 44,
                            height: isMobile ? 36 : 44,
                            bgcolor: 'primary.main',
                            flexShrink: 0,
                            boxShadow: isHovered ? 3 : 1,
                            transition: 'box-shadow 0.2s',
                            fontSize: isMobile ? 16 : 18,
                            fontWeight: 600,
                        }}
                    >
                        {comment?.author?.name?.charAt(0)?.toUpperCase() || '?'}
                    </Avatar>
                </Badge>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', minWidth: 0 }}>
                            <Typography variant="body2" component="span" sx={{ fontWeight: 600, fontSize: isMobile ? 14 : 15 }}>
                                {comment?.author?.name || 'Unknown User'}
                            </Typography>
                            <Tooltip title={new Date(comment.createdAt).toLocaleString()} arrow placement="top">
                                <Chip
                                    label={getRelativeTime(comment.createdAt)}
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: 11,
                                        fontWeight: 500,
                                        bgcolor: 'action.selected',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                />
                            </Tooltip>
                            {hasAttachments && !isEditing && (
                                <Chip
                                    icon={<AttachFileIcon sx={{ fontSize: 14 }} />}
                                    label={comment.attachments.length}
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: 11,
                                        fontWeight: 500,
                                        bgcolor: 'info.lighter',
                                        color: 'info.dark',
                                        '& .MuiChip-icon': { ml: 0.5, color: 'info.main' },
                                    }}
                                />
                            )}
                            {comment.edited && (
                                <Chip
                                    label="Edited"
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: 10,
                                        fontWeight: 500,
                                        bgcolor: 'warning.lighter',
                                        color: 'warning.dark',
                                    }}
                                />
                            )}
                        </Box>
                        {(canEditComment || canDeleteComment) && !isEditing && (
                            <Fade in={isHovered || menuOpen || isMobile}>
                                <Tooltip title="More options" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => setAnchorEl(e.currentTarget)}
                                        sx={{
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                bgcolor: 'action.selected',
                                                transform: 'scale(1.1)',
                                            }
                                        }}
                                    >
                                        <MoreHorizIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Fade>
                        )}
                    </Box>

                    {isEditing ? (
                        <Fade in timeout={300}>
                            <Box sx={{ mt: 1.5 }}>
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
                        </Fade>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    mt: 0.5,
                                    p: 2,
                                    bgcolor: 'background.paper',
                                    borderRadius: 2,
                                    border: 1,
                                    borderColor: isHovered ? 'primary.light' : 'divider',
                                    transition: 'border-color 0.2s',
                                    boxShadow: isHovered ? 1 : 0,
                                }}
                            >
                                <HighlightedText text={comment.text} />
                            </Box>
                            {hasAttachments && (
                                <Box sx={{ mt: 1.5 }}>
                                    <AttachmentList
                                        attachments={comment.attachments}
                                        onDelete={(attachment) => setAttachmentToDelete(attachment)}
                                        canDelete={canEditComment}
                                    />
                                </Box>
                            )}
                            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Button
                                    size="small"
                                    startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
                                    onClick={handleReplyClick}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 2,
                                        py: 0.75,
                                        borderRadius: 1.5,
                                        '&:hover': {
                                            bgcolor: 'primary.lighter',
                                            transform: 'translateY(-1px)',
                                        },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    Reply
                                </Button>
                                {hasReplies && (
                                    <Button
                                        size="small"
                                        endIcon={repliesCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                                        onClick={() => setRepliesCollapsed(!repliesCollapsed)}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            color: 'text.secondary',
                                            px: 2,
                                            py: 0.75,
                                            borderRadius: 1.5,
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            },
                                        }}
                                    >
                                        {repliesCollapsed ? 'Show' : 'Hide'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                    </Button>
                                )}
                            </Box>
                        </>
                    )}

                    <Collapse in={isReplying} timeout={300}>
                        <Box sx={{ mt: 2.5, display: 'flex', gap: isMobile ? 1.5 : 2, pt: 2.5, borderTop: 2, borderColor: 'primary.light', borderRadius: 1 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: 16, fontWeight: 600, boxShadow: 1 }}>
                                {currentUser?.fullName?.[0]}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <ReplyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Replying to <strong>{comment?.author?.name || 'Unknown User'}</strong>
                                    </Typography>
                                </Box>
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
                    </Collapse>

                    <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={() => setAnchorEl(null)}
                        TransitionComponent={Fade}
                        PaperProps={{
                            sx: {
                                boxShadow: 4,
                                borderRadius: 2,
                                minWidth: 160,
                            }
                        }}
                    >
                        {canEditComment && (
                            <MenuItem
                                onClick={() => { setIsEditing(true); setAnchorEl(null); }}
                                sx={{
                                    py: 1.5,
                                    gap: 1.5,
                                    '&:hover': {
                                        bgcolor: 'primary.lighter',
                                    }
                                }}
                            >
                                <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                                <Typography variant="body2" fontWeight={500}>Edit</Typography>
                            </MenuItem>
                        )}
                        {canEditComment && canDeleteComment && <Divider sx={{ my: 0.5 }} />}
                        {canDeleteComment && (
                            <MenuItem
                                onClick={() => { setAnchorEl(null); onDelete(comment.id); }}
                                sx={{
                                    py: 1.5,
                                    gap: 1.5,
                                    color: 'error.main',
                                    '&:hover': {
                                        bgcolor: 'error.lighter',
                                    }
                                }}
                            >
                                <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                                <Typography variant="body2" fontWeight={500}>Delete</Typography>
                            </MenuItem>
                        )}
                    </Menu>
                </Box>
            </Box>

            {/* Recursive rendering of replies */}
            <Collapse in={hasReplies && !repliesCollapsed} timeout={300}>
                <Box>
                    {comment.replies?.map((reply, index) => (
                        <Box key={reply.id}>
                            <Comment
                                comment={reply}
                                currentUser={currentUser}
                                canDeleteAnyComment={canDeleteAnyComment}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onReply={onReply}
                                onDeleteAttachment={onDeleteAttachment}
                                level={Math.min(level + 1, maxNestingLevel)}
                            />
                            {index < comment.replies.length - 1 && (
                                <Divider sx={{ ml: marginLeft, opacity: 0.3 }} />
                            )}
                        </Box>
                    ))}
                </Box>
            </Collapse>

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
};

export default Comment;