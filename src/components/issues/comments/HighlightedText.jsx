import PropTypes from 'prop-types';
import {
    Typography,
    Chip,
} from '@mui/material';

function HighlightedText({ text }) {
    const mentionRegex = /@\[([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex, match.index),
                key: `text-${lastIndex}`
            });
        }
        parts.push({
            type: 'mention',
            content: `@${match[1]}`,
            key: `mention-${match.index}`
        });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.substring(lastIndex),
            key: `text-${lastIndex}`
        });
    }

    return (
        <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {parts.map((part) => 
                part.type === 'mention' ? (
                    <Chip
                        key={part.key}
                        label={part.content}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(25, 118, 210, 0.12)',
                            color: 'primary.main',
                            fontWeight: 600,
                            height: 24,
                            mx: 0.5,
                            border: '1px solid',
                            borderColor: 'primary.main',
                            '& .MuiChip-label': { px: 1.5 }
                        }}
                    />
                ) : (
                    <span key={part.key}>{part.content}</span>
                )
            )}
        </Typography>
    );
}

HighlightedText.propTypes = {
    text: PropTypes.string.isRequired,
};

export default HighlightedText;