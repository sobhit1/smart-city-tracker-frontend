import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    CircularProgress,
    Stack,
    useTheme,
    useMediaQuery,
    Chip,
    Tooltip,
    Fade,
    LinearProgress,
    Alert,
    Collapse,
} from '@mui/material';
import {
    AttachFile as AttachFileIcon,
    Send as SendIcon,
    EmojiEmotions as EmojiIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

import AttachmentList from './AttachmentList';
import UserMentionAutocomplete from './UserMentionAutocomplete';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_CHARS = 5000;

const MENTION_MARKER = '\u200B';

function CommentInput({ value, onChange, onSubmit, onCancel, files, onFileChange, onRemoveFile, isSubmitting, placeholder, autoFocus }) {
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [mentionSearch, setMentionSearch] = useState('');
    const [mentionStartPos, setMentionStartPos] = useState(null);
    const [internalValue, setInternalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [fileError, setFileError] = useState('');
    const [charCount, setCharCount] = useState(0);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setInternalValue(value);
        setCharCount(value.length);
    }, [value]);

    const parseMentionsToDisplay = (text) => {
        return text.replace(/@\[([^\]]+)\]/g, '@$1');
    };

    const handleTextChange = (e) => {
        const text = e.target.value;
        
        if (text.length > MAX_CHARS) {
            return;
        }

        const cursorPos = e.target.selectionStart;
        
        setInternalValue(text);
        setCharCount(text.length);
        onChange(text);

        const textBeforeCursor = text.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            const hasSpace = textAfterAt.includes(' ') || textAfterAt.includes('\n');
            
            if (!hasSpace && textAfterAt.length >= 0) {
                const beforeAt = textBeforeCursor.substring(0, lastAtIndex);
                const hasMentionBefore = /@\[[^\]]+\]\s?$/.test(beforeAt);
                
                if (!hasMentionBefore) {
                    setMentionSearch(textAfterAt);
                    setMentionStartPos(lastAtIndex);
                    if (inputRef.current) {
                        setMentionAnchorEl(inputRef.current);
                    }
                    return;
                }
            }
        }
        setMentionAnchorEl(null);
    };

    const handleSelectUser = (user) => {
        if (mentionStartPos !== null) {
            const beforeMention = internalValue.substring(0, mentionStartPos);
            const afterMention = internalValue.substring(mentionStartPos + mentionSearch.length + 1);
            const mentionText = `@[${user.fullName}]`;
            const newText = `${beforeMention}${mentionText}${MENTION_MARKER} ${afterMention}`;
            
            setInternalValue(newText);
            setCharCount(newText.length);
            onChange(newText);
            
            setTimeout(() => {
                const newCursorPos = mentionStartPos + mentionText.length + 2;
                const input = inputRef.current?.querySelector('textarea');
                if (input) {
                    input.focus();
                    input.setSelectionRange(newCursorPos, newCursorPos);
                }
            }, 0);
        }
        setMentionAnchorEl(null);
        setMentionSearch('');
        setMentionStartPos(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isSubmitting) {
            e.preventDefault();
            if (internalValue.trim() !== '' || files.length > 0) {
                onSubmit();
            }
            return;
        }

        if (e.key === 'Escape' && mentionAnchorEl) {
            setMentionAnchorEl(null);
            e.preventDefault();
            return;
        }

        if (e.key === 'Backspace') {
            const cursorPos = e.target.selectionStart;
            const selectionEnd = e.target.selectionEnd;
            
            if (cursorPos === selectionEnd && cursorPos > 0) {
                const textBeforeCursor = internalValue.substring(0, cursorPos);
                const mentionMatch = textBeforeCursor.match(/@\[([^\]]+)\][\u200B\s]?$/);
                
                if (mentionMatch) {
                    e.preventDefault();
                    const newText = internalValue.substring(0, cursorPos - mentionMatch[0].length) + internalValue.substring(cursorPos);
                    setInternalValue(newText);
                    setCharCount(newText.length);
                    onChange(newText);
                    setTimeout(() => {
                        const input = e.target;
                        const newPos = cursorPos - mentionMatch[0].length;
                        input.setSelectionRange(newPos, newPos);
                    }, 0);
                }
            }
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const cursorPos = e.target.selectionStart;
            const direction = e.key === 'ArrowLeft' ? -1 : 1;
            
            const checkPos = direction === -1 ? cursorPos - 1 : cursorPos;
            const textToCheck = direction === -1 
                ? internalValue.substring(0, cursorPos)
                : internalValue.substring(cursorPos);
            
            const mentionPattern = direction === -1 
                ? /@\[([^\]]+)\][\u200B\s]?$/
                : /^[\u200B\s]?@\[([^\]]+)\]/;
            
            const match = textToCheck.match(mentionPattern);
            
            if (match) {
                e.preventDefault();
                const newPos = direction === -1 
                    ? cursorPos - match[0].length
                    : cursorPos + match[0].length;
                e.target.setSelectionRange(newPos, newPos);
            }
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        setTimeout(() => {
            setMentionAnchorEl(null);
        }, 200);
    };

    const validateFiles = (newFiles) => {
        const validFiles = [];
        const errors = [];

        newFiles.forEach(file => {
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name} exceeds 10MB limit`);
            } else {
                validFiles.push(file);
            }
        });

        return { validFiles, errors };
    };

    const handleFileSelection = (event) => {
        const newFiles = Array.from(event.target.files);
        const { validFiles, errors } = validateFiles(newFiles);
        
        if (errors.length > 0) {
            setFileError(errors.join(', '));
            setTimeout(() => setFileError(''), 5000);
        }

        const totalFiles = files.length + validFiles.length;
        if (totalFiles > MAX_FILES) {
            setFileError(`Maximum ${MAX_FILES} files allowed. ${totalFiles - MAX_FILES} file(s) will be ignored.`);
            setTimeout(() => setFileError(''), 5000);
        }

        onFileChange({ target: { files: validFiles } });
        event.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (files.length >= MAX_FILES) {
            setFileError(`Maximum ${MAX_FILES} files allowed`);
            setTimeout(() => setFileError(''), 5000);
            return;
        }

        const droppedFiles = Array.from(e.dataTransfer.files);
        const { validFiles, errors } = validateFiles(droppedFiles);
        
        if (errors.length > 0) {
            setFileError(errors.join(', '));
            setTimeout(() => setFileError(''), 5000);
        }

        if (validFiles.length > 0) {
            onFileChange({ target: { files: validFiles } });
        }
    };

    const displayValue = parseMentionsToDisplay(internalValue);
    const isNearLimit = charCount > MAX_CHARS * 0.8;
    const hasContent = internalValue.trim() !== '' || files.length > 0;

    return (
        <Box
            sx={{
                position: 'relative',
                borderRadius: 2,
                border: 2,
                borderColor: isFocused ? 'primary.main' : 'divider',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isFocused ? 4 : 1,
                bgcolor: 'background.paper',
                overflow: 'hidden',
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <Collapse in={!!fileError}>
                <Alert
                    severity="warning"
                    icon={false}
                    sx={{
                        borderRadius: 0,
                        borderBottom: 1,
                        borderColor: 'divider',
                        py: 0.75,
                    }}
                    action={
                        <IconButton
                            size="small"
                            onClick={() => setFileError('')}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {fileError}
                </Alert>
            </Collapse>

            <TextField
                fullWidth
                multiline
                rows={isMobile ? 3 : 4}
                placeholder={placeholder || "Add a comment... (Use @ to mention • Cmd/Ctrl + Enter to send)"}
                value={displayValue}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                ref={inputRef}
                autoFocus={autoFocus}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: 'none' },
                        fontSize: isMobile ? 14 : 15,
                        lineHeight: 1.6,
                    },
                    '& .MuiInputBase-input': {
                        p: 2,
                        '&::placeholder': {
                            color: 'text.secondary',
                            opacity: 0.7,
                        }
                    }
                }}
            />

            {isNearLimit && (
                <Box sx={{ px: 2, pb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LinearProgress
                            variant="determinate"
                            value={(charCount / MAX_CHARS) * 100}
                            sx={{
                                flexGrow: 1,
                                height: 4,
                                borderRadius: 2,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: charCount >= MAX_CHARS ? 'error.main' : 'warning.main',
                                    borderRadius: 2,
                                }
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 600,
                                color: charCount >= MAX_CHARS ? 'error.main' : 'warning.main',
                                minWidth: 70,
                                textAlign: 'right',
                            }}
                        >
                            {charCount}/{MAX_CHARS}
                        </Typography>
                    </Stack>
                </Box>
            )}
            
            <Collapse in={files.length > 0}>
                <Box sx={{ px: 2, pb: 2, bgcolor: 'action.hover' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Attachments
                        </Typography>
                        <Chip
                            label={`${files.length}/${MAX_FILES}`}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: files.length >= MAX_FILES ? 'error.lighter' : 'primary.lighter',
                                color: files.length >= MAX_FILES ? 'error.dark' : 'primary.dark',
                            }}
                        />
                    </Stack>
                    <AttachmentList 
                        attachments={files} 
                        onDelete={(file) => onRemoveFile(files.indexOf(file))}
                        canDelete={true}
                    />
                </Box>
            </Collapse>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 1.5,
                    py: 1.5,
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title={`Attach files (${files.length}/${MAX_FILES})`} arrow placement="top">
                        <span>
                            <IconButton
                                size="small"
                                component="label"
                                disabled={files.length >= MAX_FILES}
                                sx={{
                                    color: files.length >= MAX_FILES ? 'text.disabled' : 'text.secondary',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                        color: 'primary.main',
                                        transform: 'scale(1.1)',
                                    }
                                }}
                            >
                                <AttachFileIcon fontSize="small" />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                    onChange={handleFileSelection}
                                />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Formatting options coming soon" arrow placement="top">
                        <span>
                            <IconButton
                                size="small"
                                disabled
                                sx={{
                                    color: 'text.disabled',
                                    opacity: 0.5,
                                }}
                            >
                                <EmojiIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>

                    {!isMobile && hasContent && (
                        <Fade in>
                            <Chip
                                label="Cmd/Ctrl + Enter"
                                size="small"
                                sx={{
                                    height: 24,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    bgcolor: 'action.selected',
                                    color: 'text.secondary',
                                    ml: 1,
                                }}
                            />
                        </Fade>
                    )}
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Fade in={hasContent && !!onCancel}>
                        <Button
                            variant="outlined"
                            onClick={onCancel}
                            size={isMobile ? 'small' : 'medium'}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 2.5,
                                borderRadius: 1.5,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: 2,
                                }
                            }}
                        >
                            Cancel
                        </Button>
                    </Fade>
                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        disabled={isSubmitting || !hasContent}
                        size={isMobile ? 'small' : 'medium'}
                        endIcon={isSubmitting ? null : <SendIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            borderRadius: 1.5,
                            boxShadow: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 4,
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                            },
                            '&.Mui-disabled': {
                                bgcolor: 'action.disabledBackground',
                                color: 'action.disabled',
                            }
                        }}
                    >
                        {isSubmitting ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CircularProgress size={18} color="inherit" />
                                <span>Sending...</span>
                            </Stack>
                        ) : (
                            'Comment'
                        )}
                    </Button>
                </Stack>
            </Box>

            <UserMentionAutocomplete
                anchorEl={mentionAnchorEl}
                searchQuery={mentionSearch}
                onSelectUser={handleSelectUser}
                onClose={() => setMentionAnchorEl(null)}
            />
        </Box>
    );
}

CommentInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    currentUser: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    onFileChange: PropTypes.func.isRequired,
    onRemoveFile: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool,
    placeholder: PropTypes.string,
    autoFocus: PropTypes.bool,
};

export default CommentInput;