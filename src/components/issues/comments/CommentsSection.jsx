import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';

import { addComment, updateComment, deleteComment, deleteAttachment } from '../../../api/issuesApi';
import { showNotification } from '../../../state/notificationSlice';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import Comment from './Comment';
import CommentInput from './CommentInput';

const MAX_FILES = 5;

function CommentsSection({ issueId, issueComments, currentUser, canDeleteAnyComment }) {
    const [newComment, setNewComment] = useState('');
    const [newCommentFiles, setNewCommentFiles] = useState([]);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { mutate: addCommentMutation, isPending: isAddingComment } = useMutation({
        mutationFn: addComment,
        onSuccess: () => {
            queryClient.invalidateQueries(['issue', issueId]);
            dispatch(showNotification({ message: 'Comment added successfully', severity: 'success' }));
            setNewComment('');
            setNewCommentFiles([]);
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to add comment', severity: 'error' }));
        }
    });

    const { mutate: updateCommentMutation, isPending: isUpdatingComment } = useMutation({
        mutationFn: updateComment,
        onSuccess: () => {
            queryClient.invalidateQueries(['issue', issueId]);
            dispatch(showNotification({ message: 'Comment updated successfully', severity: 'success' }));
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update comment', severity: 'error' }));
        }
    });

    const { mutate: deleteCommentMutation, isPending: isDeletingComment } = useMutation({
        mutationFn: deleteComment,
        onSuccess: () => {
            queryClient.invalidateQueries(['issue', issueId]);
            dispatch(showNotification({ message: 'Comment deleted successfully', severity: 'success' }));
            setCommentToDelete(null);
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to delete comment', severity: 'error' }));
        }
    });

    const { mutate: deleteAttachmentMutation, isPending: isDeletingAttachment } = useMutation({
        mutationFn: deleteAttachment,
        onSuccess: () => {
            queryClient.invalidateQueries(['issue', issueId]);
            dispatch(showNotification({ message: 'Attachment deleted', severity: 'success' }));
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to delete attachment', severity: 'error' }));
        }
    });

    const handleAddComment = () => {
        if (newComment.trim() === '' && newCommentFiles.length === 0) return;
        const commentData = { text: newComment };
        addCommentMutation({ issueId, commentData, files: newCommentFiles });
    };

    const handleReply = (parentCommentId, replyData) => {
        addCommentMutation({ issueId, commentData: { text: replyData.text, parentId: parentCommentId }, files: replyData.files || [] });
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setNewCommentFiles(prev => [...prev, ...files].slice(0, MAX_FILES));
    };

    const handleRemoveFile = (indexToRemove) => {
        setNewCommentFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleEditComment = (commentId, updateData) => {
        updateCommentMutation({ issueId, commentId, text: updateData.text });
    };

    const handleDeleteComment = (commentId) => {
        const findComment = (comments, id) => {
            for (const comment of comments) {
                if (comment.id === id) return comment;
                if (comment.replies && comment.replies.length > 0) {
                    const found = findComment(comment.replies, id);
                    if (found) return found;
                }
            }
            return null;
        };
        const comment = findComment(threadedComments, commentId);
        if (comment) {
            setCommentToDelete(comment);
        }
    };

    const handleDeleteAttachment = (commentId, attachmentId) => {
        deleteAttachmentMutation({ issueId, attachmentId });
    };

    const buildCommentTree = (comments) => {
        if (!comments) return [];
        const commentMap = {};
        const rootComments = [];

        comments.forEach(comment => {
            commentMap[comment.id] = { ...comment, replies: [] };
        });

        comments.forEach(comment => {
            if (comment.parentId && commentMap[comment.parentId]) {
                commentMap[comment.parentId].replies.push(commentMap[comment.id]);
            } else {
                rootComments.push(commentMap[comment.id]);
            }
        });

        return rootComments;
    };

    const threadedComments = buildCommentTree(issueComments);

    return (
        <Box sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Comments ({issueComments?.length || 0})
            </Typography>

            <Box sx={{ display: 'flex', gap: isMobile ? 1.5 : 2, mb: 4 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                    {currentUser?.fullName?.[0]}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <CommentInput
                        value={newComment}
                        onChange={setNewComment}
                        onSubmit={handleAddComment}
                        onCancel={() => { setNewComment(''); setNewCommentFiles([]); }}
                        currentUser={currentUser}
                        files={newCommentFiles}
                        onFileChange={handleFileChange}
                        onRemoveFile={handleRemoveFile}
                        isSubmitting={isAddingComment}
                    />
                </Box>
            </Box>

            {threadedComments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <Typography>No comments yet. Be the first to comment!</Typography>
                </Box>
            ) : (
                <Box sx={{ '& > *:not(:last-child)': { borderBottom: 1, borderColor: 'divider' } }}>
                    {threadedComments.map((comment) => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            currentUser={currentUser}
                            canDeleteAnyComment={canDeleteAnyComment}
                            onEdit={handleEditComment}
                            onDelete={handleDeleteComment}
                            onReply={handleReply}
                            onDeleteAttachment={handleDeleteAttachment}
                            isUpdating={isUpdatingComment}
                            isReplying={isAddingComment}
                            isDeletingAttachment={deleteAttachmentMutation.isPending}
                            level={0}
                        />
                    ))}
                </Box>
            )}

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