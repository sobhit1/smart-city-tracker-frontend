import PropTypes from 'prop-types';
import {
    Typography,
    Chip,
    Tooltip,
    Link,
} from '@mui/material';
import {
    Person as PersonIcon,
    Link as LinkIcon,
    Tag as TagIcon,
} from '@mui/icons-material';

function HighlightedText({ text }) {
    const mentionRegex = /@\[([^\]]+)\]/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /#(\w+)/g;
    
    const parts = [];
    let lastIndex = 0;

    const combinedRegex = new RegExp(
        `(${mentionRegex.source})|(${urlRegex.source})|(${hashtagRegex.source})`,
        'g'
    );

    let match;
    while ((match = combinedRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex, match.index),
                key: `text-${lastIndex}`
            });
        }

        if (match[1]) {
            const mentionMatch = /@\[([^\]]+)\]/.exec(match[0]);
            parts.push({
                type: 'mention',
                content: mentionMatch[1],
                key: `mention-${match.index}`
            });
        } else if (match[2]) {
            parts.push({
                type: 'url',
                content: match[0],
                key: `url-${match.index}`
            });
        } else if (match[3]) {
            parts.push({
                type: 'hashtag',
                content: match[0],
                key: `hashtag-${match.index}`
            });
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.substring(lastIndex),
            key: `text-${lastIndex}`
        });
    }

    const renderPart = (part) => {
        switch (part.type) {
            case 'mention':
                return (
                    <Tooltip
                        key={part.key}
                        title={`Mentioned user: ${part.content}`}
                        arrow
                        placement="top"
                        enterDelay={300}
                    >
                        <Chip
                            icon={<PersonIcon sx={{ fontSize: 16 }} />}
                            label={`@${part.content}`}
                            size="small"
                            sx={{
                                bgcolor: 'primary.lighter',
                                color: 'primary.dark',
                                fontWeight: 600,
                                height: 26,
                                mx: 0.5,
                                my: 0.25,
                                border: 1.5,
                                borderColor: 'primary.main',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '& .MuiChip-label': { px: 1.5 },
                                '& .MuiChip-icon': { ml: 1, color: 'primary.main' },
                                '&:hover': {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    transform: 'translateY(-1px)',
                                    boxShadow: 2,
                                    '& .MuiChip-icon': { color: 'inherit' },
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                },
                            }}
                        />
                    </Tooltip>
                );

            case 'url':
                const displayUrl = part.content.length > 40 
                    ? part.content.substring(0, 37) + '...' 
                    : part.content;
                
                return (
                    <Tooltip
                        key={part.key}
                        title="Click to open link"
                        arrow
                        placement="top"
                        enterDelay={300}
                    >
                        <Link
                            href={part.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: 'info.main',
                                fontWeight: 600,
                                textDecoration: 'none',
                                borderBottom: 2,
                                borderColor: 'info.lighter',
                                px: 0.5,
                                mx: 0.25,
                                borderRadius: 0.5,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'info.lighter',
                                    borderColor: 'info.main',
                                    transform: 'translateY(-1px)',
                                },
                            }}
                        >
                            <LinkIcon sx={{ fontSize: 14 }} />
                            {displayUrl}
                        </Link>
                    </Tooltip>
                );

            case 'hashtag':
                return (
                    <Tooltip
                        key={part.key}
                        title="Hashtag"
                        arrow
                        placement="top"
                        enterDelay={300}
                    >
                        <Chip
                            icon={<TagIcon sx={{ fontSize: 14 }} />}
                            label={part.content}
                            size="small"
                            sx={{
                                bgcolor: 'success.lighter',
                                color: 'success.dark',
                                fontWeight: 600,
                                height: 24,
                                mx: 0.5,
                                my: 0.25,
                                border: 1.5,
                                borderColor: 'success.main',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '& .MuiChip-label': { px: 1.5 },
                                '& .MuiChip-icon': { ml: 0.75, color: 'success.main' },
                                '&:hover': {
                                    bgcolor: 'success.main',
                                    color: 'success.contrastText',
                                    transform: 'translateY(-1px)',
                                    boxShadow: 2,
                                    '& .MuiChip-icon': { color: 'inherit' },
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                },
                            }}
                        />
                    </Tooltip>
                );

            case 'text':
            default:
                return <span key={part.key}>{part.content}</span>;
        }
    };

    return (
        <Typography
            variant="body1"
            component="div"
            sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.7,
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                color: 'text.primary',
                '& a, & .MuiChip-root': {
                    verticalAlign: 'middle',
                },
            }}
        >
            {parts.length > 0 ? parts.map(renderPart) : text}
        </Typography>
    );
}

HighlightedText.propTypes = {
    text: PropTypes.string.isRequired,
};

export default HighlightedText;