import PropTypes from 'prop-types';
import {
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Fade
} from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

function DeleteConfirmationDialog({ open, onClose, onConfirm, item }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            TransitionComponent={Fade}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    backgroundColor: '#1F2428',
                    border: '1px solid #373E47',
                    p: 1.5
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#f85149',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    pb: 0.5
                }}
            >
                <ErrorOutline sx={{ color: '#f85149', fontSize: 24 }} />
                Delete {item}
            </DialogTitle>

            <DialogContent sx={{ pt: 1.5, pb: 1 }}>
                <Typography
                    color="text.primary"
                    sx={{
                        fontSize: '15px',
                        lineHeight: 2,
                        marginLeft: 4
                    }}
                >
                    Are you sure you want to delete ?
                </Typography>
                <Typography
                    sx={{
                        mt: 1.5,
                        color: '#8B949E',
                        fontSize: '14px',
                        lineHeight: 2,
                        marginLeft: 4
                    }}
                >
                    This action <strong>cannot</strong> be undone.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ pt: 1.5, px: 2, pb: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        color: '#8B949E',
                        borderColor: '#30363d',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        px: 2,
                        py: 0.5,
                        '&:hover': {
                            backgroundColor: 'rgba(139, 148, 158, 0.1)',
                            borderColor: '#444c56'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '14px',
                        px: 2.5,
                        py: 0.6,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 3px 12px rgba(248, 81, 73, 0.35)'
                        }
                    }}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}

DeleteConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    issueTitle: PropTypes.string.isRequired,
};

export default DeleteConfirmationDialog;