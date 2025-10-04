import PropTypes from 'prop-types';
import {
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Box,
} from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

function DeleteConfirmationDialog({ open, onClose, onConfirm, item, isDeleting }) {
    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                    onClose();
                }
            }}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '8px',
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    color: '#c9d1d9',
                    fontWeight: 600,
                    fontSize: '16px',
                    px: 3,
                    py: 1.5,
                    borderBottom: '1px solid #30363d',
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(248, 81, 73, 0.1)',
                        border: '1px solid rgba(248, 81, 73, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ErrorOutline sx={{ color: '#f85149', fontSize: 20 }} />
                </Box>
                Delete Confirmation
            </DialogTitle>

            <DialogContent sx={{ px: 3, pt: 3 }}>
                <Typography
                    sx={{ 
                        fontSize: '14px', 
                        lineHeight: 1.6,
                        color: '#c9d1d9',
                        mb: 1.5,
                        pt: 1.5,
                    }}
                >
                    Are you sure you want to delete <strong>{item}</strong>?
                </Typography>
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        backgroundColor: '#0d1117',
                        border: '1px solid #f85149',
                        borderRadius: '6px',
                    }}
                >
                    <Typography
                        sx={{ 
                            color: '#f85149',
                            fontSize: '13px',
                            lineHeight: 1.5,
                        }}
                    >
                        ⚠️ This action cannot be undone. All data will be permanently removed.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions 
                sx={{ 
                    px: 3,
                    pb: 2, 
                    gap: 1.5,
                }}
            >
                <Button
                    onClick={onClose}
                    disabled={isDeleting}
                    sx={{
                        color: '#c9d1d9',
                        backgroundColor: '#21262d',
                        border: '1px solid #30363d',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        px: 2.5,
                        py: 0.75,
                        borderRadius: '6px',
                        '&:hover': { 
                            backgroundColor: '#30363d',
                            borderColor: '#484f58',
                        },
                        '&:disabled': {
                            color: '#6e7681',
                            backgroundColor: '#21262d',
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    sx={{
                        color: '#fff',
                        backgroundColor: '#da3633',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '14px',
                        px: 2.5,
                        py: 0.75,
                        borderRadius: '6px',
                        boxShadow: 'none',
                        minWidth: '90px',
                        '&:hover': { 
                            backgroundColor: '#f85149',
                            boxShadow: '0 4px 12px rgba(248, 81, 73, 0.4)',
                        },
                        '&:disabled': {
                            color: '#8b949e',
                            backgroundColor: '#30363d',
                        }
                    }}
                >
                    {isDeleting ? (
                        <CircularProgress size={18} sx={{ color: '#8b949e' }} />
                    ) : (
                        'Delete'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

DeleteConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    item: PropTypes.string.isRequired,
    isDeleting: PropTypes.bool,
};

export default DeleteConfirmationDialog;