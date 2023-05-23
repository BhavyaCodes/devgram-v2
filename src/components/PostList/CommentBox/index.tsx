import { Box, IconButton, Paper, Typography, useTheme } from '@mui/material';
import { timeAgo } from '~/utils/timeAgo';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

interface CommentBoxProps {
  userId: {
    _id: string;
    image?: string;
    name: string;
  };
  postId: string;
  content: string;
  createdAt: Date;
}

const CommentBox = ({ content, userId, createdAt }: CommentBoxProps) => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        flexBasis: '100%',
        p: 2,
        // border: '1px solid rgb(56, 68, 77)',
        borderRadius: 3,
        display: 'flex',
      }}
    >
      <Box
        flexShrink={0}
        flexBasis="8%"
        sx={{
          '& img': {
            width: '100%',
            maxWidth: '100%',
            borderRadius: 200,
          },
          [theme.breakpoints.down('md')]: {
            flexBasis: '20%',
          },
          pr: 2,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={userId.image} alt={`${userId.name} avatar`} />
      </Box>
      <Box flexGrow={1}>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Typography variant="h6">{userId.name}</Typography>
            <Box
              ml={1}
              mr={0.5}
              width={2}
              height={2}
              borderRadius={100}
              sx={{
                bgcolor: (theme) => theme.palette.text.primary,
                opacity: 0.4,
              }}
            />
            <Typography component="span" variant="body2">
              {timeAgo.format(createdAt, 'twitter')}
            </Typography>
          </Box>
          <IconButton
            disableFocusRipple
            disableTouchRipple
            size="small"
            sx={{
              '&:hover': {
                bgcolor: 'transparent',
                '& svg': {
                  fill: '#fff',
                },
              },
            }}
          >
            <MoreHorizRoundedIcon sx={{ color: 'rgb(56, 68, 77)' }} />
          </IconButton>
        </Box>
        <Typography variant="body1">{content}</Typography>
      </Box>
    </Paper>
  );
};

export default CommentBox;
