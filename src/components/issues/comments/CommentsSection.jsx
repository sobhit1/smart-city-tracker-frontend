import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    Avatar,
    Divider,
    Fade,
} from '@mui/material';

import {
    addComment,
    updateComment,
    deleteComment,
    deleteAttachment,
} from '../../../api/issuesApi';
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

    const refreshComments = () => {
        queryClient.invalidateQueries(['issue', issueId]);
    };

    const { mutate: addCommentMutation, isPending: isAddingComment } = useMutation({
        mutationFn: addComment,
        onSuccess: () => {
            refreshComments();
            dispatch(showNotification({ message: 'Comment added successfully', severity: 'success' }));
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
            refreshComments();
            dispatch(showNotification({ message: 'Comment updated successfully', severity: 'success' }));
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update comment', severity: 'error' }));
        }
    });

    const { mutate: deleteCommentMutation, isPending: isDeletingComment } = useMutation({
        mutationFn: deleteComment,
        onSuccess: () => {
            refreshComments();
            dispatch(showNotification({ message: 'Comment deleted successfully', severity: 'success' }));
            setCommentToDelete(null);
        },
        onError: (error) => {
            dispatch(showNotification({ message: error.response?.data?.message || 'Failed to delete comment', severity: 'error' }));
        }
    });

    const { mutate: deleteAttachmentMutation } = useMutation({
        mutationFn: deleteAttachment,
        onSuccess: () => {
            refreshComments();
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
        addCommentMutation({
            issueId,
            commentData: { text: replyData.text, parentId: parentCommentId },
            files: replyData.files || [],
        });
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
        if (comment) setCommentToDelete(comment);
    };

    const handleDeleteAttachment = (attachmentId) => {
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
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: '#E6EDF2',
                    mb: 2,
                }}
            >
                Comments ({issueComments?.length || 0})
            </Typography>

            {/* Add new comment */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#5299FF',
                        fontSize: 14,
                        fontWeight: 600,
                        flexShrink: 0,
                    }}
                >
                    {currentUser?.fullName?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <CommentInput
                        value={newComment}
                        onChange={setNewComment}
                        onSubmit={handleAddComment}
                        onCancel={null}
                        currentUser={currentUser}
                        files={newCommentFiles}
                        onFileChange={handleFileChange}
                        onRemoveFile={handleRemoveFile}
                        isSubmitting={isAddingComment}
                    />
                </Box>
            </Box>

            {/* Comments list */}
            {threadedComments.length === 0 ? (
                <Fade in>
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 4,
                            px: 2,
                            bgcolor: '#282E33',
                            borderRadius: '6px',
                            border: '1px solid #373E47',
                        }}
                    >
                        <Typography sx={{ color: '#7D858D', fontSize: 14 }}>
                            No comments yet. Be the first to comment!
                        </Typography>
                    </Box>
                </Fade>
            ) : (
                <Box>
                    {threadedComments.map((comment, index) => (
                        <Box key={comment.id}>
                            <Comment
                                comment={comment}
                                currentUser={currentUser}
                                canDeleteAnyComment={canDeleteAnyComment}
                                onEdit={handleEditComment}
                                onDelete={handleDeleteComment}
                                onReply={handleReply}
                                onDeleteAttachment={handleDeleteAttachment}
                                level={0}
                                issueId={issueId}
                                onRefresh={refreshComments}
                            />
                            {index < threadedComments.length - 1 && (
                                <Divider sx={{ borderColor: '#373E47', my: 1 }} />
                            )}
                        </Box>
                    ))}
                </Box>
            )}

            {/* Delete confirmation dialog */}
            {commentToDelete && (
                <DeleteConfirmationDialog
                    open={!!commentToDelete}
                    onClose={() => setCommentToDelete(null)}
                    onConfirm={() =>
                        deleteCommentMutation({ issueId, commentId: commentToDelete.id })
                    }
                    item={`comment by ${commentToDelete?.author?.name || 'Unknown User'}`}
                    isDeleting={isDeletingComment}
                />
            )}
        </Box>
    );
}

CommentsSection.propTypes = {
    issueId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    issueComments: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    canDeleteAnyComment: PropTypes.bool.isRequired,
};

export default CommentsSection;