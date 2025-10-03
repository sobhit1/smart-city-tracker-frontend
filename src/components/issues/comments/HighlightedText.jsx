import PropTypes from 'prop-types';
import {
    Typography,
    Chip,
    Tooltip,
    Link,
    Box,
} from '@mui/material';
import {
    Person as PersonIcon,
    Link as LinkIcon,
} from '@mui/icons-material';

const truncateUrl = (url, max = 48) =>
    url.length > max ? url.slice(0, max - 3) + '...' : url;

const combinedRegex =
    /(\[([^\]]+)\]\((\/people\/[^\)]+)\))|(@[a-zA-Z0-9_]+(?: [a-zA-Z0-9_]+)*)|(https?:\/\/[^\s]+)|(#\w+)/g;

function HighlightedText({ text }) {
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex, match.index),
                key: `text-${lastIndex}`,
            });
        }

        if (match[1]) {
            parts.push({
                type: 'mention',
                content: match[2],
                url: match[3],
                key: `mention-${match.index}`,
            });
        } else if (match[4]) {
            parts.push({
                type: 'plainMention',
                content: match[4].slice(1),
                key: `plainMention-${match.index}`,
            });
        } else if (match[5]) {
            parts.push({
                type: 'url',
                content: match[5],
                key: `url-${match.index}`,
            });
        } else if (match[6]) {
            parts.push({
                type: 'hashtag',
                content: match[6],
                key: `hashtag-${match.index}`,
            });
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.slice(lastIndex),
            key: `text-${lastIndex}`,
        });
    }

    const renderPart = (part) => {
        switch (part.type) {
            case 'mention':
                return (
                    <Tooltip key={part.key} title={`Mentioned user: ${part.content}`}>
                        <Chip
                            component="a"
                            href={part.url}
                            clickable
                            icon={<PersonIcon sx={{ fontSize: 14 }} />}
                            label={part.content}
                            size="small"
                            sx={{
                                height: 22,
                                bgcolor: 'rgba(82,153,255,0.15)',
                                color: '#5299FF',
                                fontWeight: 500,
                                fontSize: 13,
                                border: '1px solid rgba(82,153,255,0.3)',
                                mx: 0.25,
                                my: 0.25,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                '& .MuiChip-label': { px: 1 },
                                '& .MuiChip-icon': { ml: 0.5, color: '#5299FF' },
                                '&:hover': {
                                    bgcolor: 'rgba(82,153,255,0.25)',
                                    borderColor: '#5299FF',
                                },
                            }}
                            tabIndex={0}
                            aria-label={`Mentioned user: ${part.content}`}
                        />
                    </Tooltip>
                );

            case 'plainMention':
                return (
                    <Tooltip key={part.key} title={`Mentioned user: ${part.content}`}>
                        <Chip
                            label={`@${part.content}`}
                            size="small"
                            sx={{
                                height: 22,
                                bgcolor: 'rgba(82,153,255,0.15)',
                                color: '#5299FF',
                                fontWeight: 500,
                                fontSize: 13,
                                border: '1px solid rgba(82,153,255,0.3)',
                                mx: 0.25,
                                my: 0.25,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                '& .MuiChip-label': { px: 1 },
                                '& .MuiChip-icon': { ml: 0.5, color: '#5299FF' },
                                '&:hover': {
                                    bgcolor: 'rgba(82,153,255,0.25)',
                                    borderColor: '#5299FF',
                                },
                            }}
                            tabIndex={0}
                            aria-label={`Mentioned user: ${part.content}`}
                        />
                    </Tooltip>
                );

            case 'url':
                return (
                    <Tooltip key={part.key} title={part.content}>
                        <Link
                            href={part.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: '#5299FF',
                                fontWeight: 400,
                                textDecoration: 'none',
                                borderBottom: '1px solid rgba(82,153,255,0.4)',
                                mx: 0.25,
                                my: 0.25,
                                transition: 'all 0.15s',
                                '&:hover': {
                                    color: '#4080D0',
                                    borderBottomColor: '#4080D0',
                                },
                                maxWidth: 220,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            tabIndex={0}
                            aria-label={`External link: ${part.content}`}
                        >
                            <LinkIcon sx={{ fontSize: 14 }} />
                            {truncateUrl(part.content)}
                        </Link>
                    </Tooltip>
                );

            case 'hashtag':
                return (
                    <Tooltip key={part.key} title="Hashtag">
                        <Chip
                            label={part.content}
                            size="small"
                            sx={{
                                height: 22,
                                bgcolor: 'rgba(63,185,80,0.15)',
                                color: '#3fb950',
                                fontWeight: 500,
                                fontSize: 13,
                                border: '1px solid rgba(63,185,80,0.3)',
                                mx: 0.25,
                                my: 0.25,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                '& .MuiChip-label': { px: 1 },
                                '& .MuiChip-icon': { ml: 0.5, color: '#3fb950' },
                                '&:hover': {
                                    bgcolor: 'rgba(63,185,80,0.25)',
                                    borderColor: '#3fb950',
                                },
                            }}
                            tabIndex={0}
                            aria-label={`Hashtag: ${part.content}`}
                        />
                    </Tooltip>
                );

            case 'text':
            default:
                return (
                    <Box
                        key={part.key}
                        component="span"
                        sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {part.content}
                    </Box>
                );
        }
    };

    return (
        <Typography
            component="div"
            sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.5,
                fontSize: 14,
                color: '#E6EDF2',
                '& a, & .MuiChip-root': {
                    verticalAlign: 'middle',
                },
                '& .MuiChip-root': {
                    maxWidth: 220,
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