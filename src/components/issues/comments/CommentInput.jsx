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
} from '@mui/material';
import {
    AttachFile as AttachFileIcon,
} from '@mui/icons-material';

import AttachmentList from './AttachmentList';
import UserMentionAutocomplete from './UserMentionAutocomplete';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const MENTION_MARKER = '\u200B';

function CommentInput({ value, onChange, onSubmit, onCancel, currentUser, files, onFileChange, onRemoveFile, isSubmitting, placeholder, autoFocus }) {
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [mentionSearch, setMentionSearch] = useState('');
    const [mentionStartPos, setMentionStartPos] = useState(null);
    const [internalValue, setInternalValue] = useState(value);
    const inputRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const parseMentionsToDisplay = (text) => {
        return text.replace(/@\[([^\]]+)\]/g, '@$1');
    };

    const handleTextChange = (e) => {
        const text = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        setInternalValue(text);
        onChange(text);

        const textBeforeCursor = text.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            const hasSpace = textAfterAt.includes(' ');
            const hasNewline = textAfterAt.includes('\n');
            
            if (!hasSpace && !hasNewline && textAfterAt.length >= 0) {
                const beforeAt = textBeforeCursor.substring(0, lastAtIndex);
                const hasMentionBefore = /@\[[^\]]+\]$/.test(beforeAt);
                
                if (!hasMentionBefore) {
                    setMentionSearch(textAfterAt);
                    setMentionStartPos(lastAtIndex);
                    setMentionAnchorEl(e.target);
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
            const mentionText = `@[${user.name}]`;
            const newText = `${beforeMention}${mentionText}${MENTION_MARKER} ${afterMention}`;
            
            setInternalValue(newText);
            onChange(newText);
            
            setTimeout(() => {
                const newCursorPos = mentionStartPos + mentionText.length + 2;
                if (inputRef.current) {
                    const input = inputRef.current.querySelector('textarea');
                    if (input) {
                        input.focus();
                        input.setSelectionRange(newCursorPos, newCursorPos);
                    }
                }
            }, 0);
        }
        setMentionAnchorEl(null);
        setMentionSearch('');
        setMentionStartPos(null);
    };

    const handleKeyDown = (e) => {
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
            alert(errors.join('\n'));
        }

        const totalFiles = files.length + validFiles.length;
        if (totalFiles > MAX_FILES) {
            alert(`You can only attach up to ${MAX_FILES} files. ${totalFiles - MAX_FILES} file(s) will be ignored.`);
        }

        onFileChange({ target: { files: validFiles } });
        event.target.value = '';
    };

    const displayValue = parseMentionsToDisplay(internalValue);

    return (
        <Box>
            <TextField
                fullWidth
                multiline
                rows={isMobile ? 2 : 3}
                placeholder={placeholder || "Add a comment... (Use @ to mention someone)"}
                value={displayValue}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                ref={inputRef}
                autoFocus={autoFocus}
                sx={{ 
                    '& .MuiOutlinedInput-root': { 
                        borderBottomLeftRadius: files.length > 0 ? 0 : undefined,
                        borderBottomRightRadius: files.length > 0 ? 0 : undefined,
                    } 
                }}
            />
            
            {files.length > 0 && (
                <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    border: 1, 
                    borderColor: 'divider',
                    borderTop: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0
                }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                        Attachments ({files.length}/{MAX_FILES})
                    </Typography>
                    <AttachmentList 
                        attachments={files} 
                        onDelete={(file) => {
                            const index = files.indexOf(file);
                            if (index !== -1) onRemoveFile(index);
                        }}
                        canDelete={true}
                    />
                </Box>
            )}

            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 1.5, 
                border: 1, 
                borderColor: 'divider', 
                borderTop: 0, 
                borderBottomLeftRadius: (theme) => theme.shape.borderRadius, 
                borderBottomRightRadius: (theme) => theme.shape.borderRadius, 
                bgcolor: 'background.paper',
                flexWrap: isMobile ? 'wrap' : 'nowrap',
                gap: 1
            }}>
                <IconButton 
                    size="small" 
                    component="label" 
                    aria-label="attach file" 
                    sx={{ color: 'text.secondary' }}
                    disabled={files.length >= MAX_FILES}
                >
                    <AttachFileIcon fontSize="small" />
                    <input 
                        type="file" 
                        hidden 
                        multiple 
                        accept="image/*,.pdf,.doc,.docx,.txt" 
                        onChange={handleFileSelection}
                    />
                </IconButton>
                <Stack direction="row" spacing={1} sx={{ width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
                    {(internalValue.trim() !== '' || files.length > 0) && onCancel && (
                        <Button variant="outlined" onClick={onCancel} size="small">Cancel</Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        disabled={isSubmitting || (internalValue.trim() === '' && files.length === 0)}
                        size="small"
                    >
                        {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Comment'}
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