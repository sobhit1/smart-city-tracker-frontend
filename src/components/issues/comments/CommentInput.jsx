import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    TextField,
    Button,
    IconButton,
    CircularProgress,
    Stack,
    Tooltip,
    Alert,
    Collapse,
    Typography,
} from '@mui/material';
import {
    AttachFile as AttachFileIcon,
    Send as SendIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

import AttachmentList from './AttachmentList';
import UserMentionAutocomplete from './UserMentionAutocomplete';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_CHARS = 5000;
const MENTION_MARKER = '\u200B';

function CommentInput({
    value,
    onChange,
    onSubmit,
    onCancel,
    files,
    onFileChange,
    onRemoveFile,
    isSubmitting,
    placeholder,
    autoFocus,
}) {
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [mentionSearch, setMentionSearch] = useState('');
    const [mentionStartPos, setMentionStartPos] = useState(null);
    const [internalValue, setInternalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [fileError, setFileError] = useState('');
    const [charCount, setCharCount] = useState(value.length);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setInternalValue(value);
        setCharCount(value.length);
    }, [value]);

    const parseMentionsToDisplay = (text) =>
        text.replace(/@\[([^\]]+)\]/g, '@$1');

    const handleTextChange = (e) => {
        const text = e.target.value;
        if (text.length > MAX_CHARS) return;

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
                    if (inputRef.current) setMentionAnchorEl(inputRef.current);
                    return;
                }
            }
        }
        setMentionAnchorEl(null);
    };

    const handleSelectUser = (user) => {
        if (mentionStartPos !== null) {
            const beforeMention = internalValue.substring(0, mentionStartPos);
            const afterMention = internalValue.substring(
                mentionStartPos + mentionSearch.length + 1
            );
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
                    const newText =
                        internalValue.substring(0, cursorPos - mentionMatch[0].length) +
                        internalValue.substring(cursorPos);
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
            const textToCheck =
                direction === -1
                    ? internalValue.substring(0, cursorPos)
                    : internalValue.substring(cursorPos);
            const mentionPattern =
                direction === -1
                    ? /@\[([^\]]+)\][\u200B\s]?$/
                    : /^[\u200B\s]?@\[([^\]]+)\]/;
            const match = textToCheck.match(mentionPattern);
            if (match) {
                e.preventDefault();
                const newPos =
                    direction === -1
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
        newFiles.forEach((file) => {
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
            setFileError(
                `Maximum ${MAX_FILES} files allowed. ${totalFiles - MAX_FILES} file(s) will be ignored.`
            );
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

    const handleClearAll = () => {
        setInternalValue('');
        setCharCount(0);
        onChange('');
        for (let i = files.length - 1; i >= 0; i--) {
            onRemoveFile(i);
        }
        if (onCancel) onCancel();
    };

    const displayValue = parseMentionsToDisplay(internalValue);
    const hasContent = internalValue.trim() !== '' || files.length > 0;

    return (
        <Box
            sx={{
                position: 'relative',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: isFocused ? '#5299FF' : '#373E47',
                transition: 'border-color 0.2s',
                bgcolor: '#282E33',
                overflow: 'hidden',
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* File error alert */}
            <Collapse in={!!fileError}>
                <Alert
                    severity="warning"
                    icon={false}
                    sx={{
                        borderRadius: 0,
                        borderBottom: '1px solid #373E47',
                        py: 0.5,
                        bgcolor: 'rgba(248, 81, 73, 0.1)',
                        color: '#f85149',
                        fontSize: 13,
                        '& .MuiAlert-message': { py: 0 },
                    }}
                    action={
                        <IconButton
                            size="small"
                            onClick={() => setFileError('')}
                            sx={{ color: '#f85149' }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {fileError}
                </Alert>
            </Collapse>

            {/* Text input */}
            <TextField
                fullWidth
                multiline
                rows={3}
                placeholder={
                    placeholder || 'Add a comment... (Use @ to mention, Cmd/Ctrl+Enter to send)'
                }
                value={displayValue}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                ref={inputRef}
                autoFocus={autoFocus}
                inputProps={{
                    maxLength: MAX_CHARS,
                    'aria-label': 'Comment input',
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: 'none' },
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: '#E6EDF2',
                    },
                    '& .MuiInputBase-input': {
                        p: 1.5,
                        '&::placeholder': {
                            color: '#7D858D',
                            opacity: 1,
                        },
                    },
                }}
            />

            {/* Attachments preview */}
            <Collapse in={files.length > 0}>
                <Box sx={{ px: 1.5, pb: 1.5, bgcolor: '#1D2125' }}>
                    <AttachmentList
                        attachments={files}
                        onDelete={(file) => onRemoveFile(files.indexOf(file))}
                        canDelete={true}
                    />
                </Box>
            </Collapse>

            {/* Footer: Attach, Cancel, Submit, Char count */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 1,
                    py: 1,
                    borderTop: '1px solid #373E47',
                    bgcolor: '#1D2125',
                    gap: 1,
                }}
            >
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title={`Attach files (${files.length}/${MAX_FILES})`} placement="top">
                        <span>
                            <IconButton
                                size="small"
                                component="label"
                                disabled={files.length >= MAX_FILES}
                                sx={{
                                    color: files.length >= MAX_FILES ? '#7D858D' : '#8b949e',
                                    '&:hover': {
                                        bgcolor: '#373E47',
                                        color: '#E6EDF2',
                                    },
                                    '&.Mui-disabled': {
                                        color: '#7D858D',
                                        opacity: 0.5,
                                    },
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
                    <Typography
                        variant="caption"
                        sx={{
                            color: charCount > MAX_CHARS ? '#f85149' : '#7D858D',
                            fontSize: 12,
                            ml: 1,
                            minWidth: 60,
                        }}
                    >
                        {charCount}/{MAX_CHARS}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                    {hasContent && (
                        <Button
                            variant="outlined"
                            onClick={handleClearAll}
                            size="small"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: 13,
                                px: 2,
                                borderRadius: '6px',
                                borderColor: '#373E47',
                                color: '#E6EDF2',
                                '&:hover': {
                                    borderColor: '#5299FF',
                                    bgcolor: 'transparent',
                                },
                            }}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        disabled={
                            isSubmitting ||
                            !hasContent ||
                            charCount > MAX_CHARS
                        }
                        size="small"
                        endIcon={isSubmitting ? null : <SendIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: 13,
                            px: 2.5,
                            borderRadius: '6px',
                            bgcolor: '#5299FF',
                            color: '#ffffff',
                            '&:hover': {
                                bgcolor: '#4080D0',
                            },
                            '&.Mui-disabled': {
                                bgcolor: '#373E47',
                                color: '#7D858D',
                            },
                        }}
                    >
                        {isSubmitting ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CircularProgress size={16} color="inherit" />
                                <span>Sending...</span>
                            </Stack>
                        ) : (
                            'Comment'
                        )}
                    </Button>
                </Stack>
            </Box>

            {/* Mention autocomplete popper */}
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