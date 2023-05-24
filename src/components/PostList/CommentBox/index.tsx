import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { timeAgo } from '~/utils/timeAgo';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { trpc } from '~/utils/trpc';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
interface CommentBoxProps {
  commentId: string;
  postUserId: string;
  userId: {
    _id: string;
    image?: string;
    name: string;
  };
  postId: string;
  content: string;
  createdAt: Date;
  setDeleteCommentData: Dispatch<
    SetStateAction<{
      commentId: string;
      commentContent: string;
    } | null>
  >;
}

const CommentBox = ({
  commentId,
  content,
  userId,
  createdAt,
  postUserId,
  setDeleteCommentData,
}: CommentBoxProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const theme = useTheme();
  const [timeAgoString, setTimeAgoString] = useState<string | undefined>(
    undefined,
  );
  const userQuery = trpc.user.getUser.useQuery();

  useEffect(() => {
    setTimeAgoString(timeAgo.format(createdAt, 'twitter'));
  }, [createdAt]);

  const isDeletable =
    userQuery.data?._id.toString() === userId._id ||
    userQuery.data?._id.toString() === postUserId;

  return (
    <Paper
      sx={{
        flexBasis: '100%',
        px: 2,
        py: 1,
        mb: 1,
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

            {!!timeAgoString && (
              <Typography component="span" variant="body2">
                {timeAgoString}
              </Typography>
            )}
          </Box>
          {isDeletable && (
            <>
              <IconButton
                disableFocusRipple
                disableTouchRipple
                onClick={handleMenuOpen}
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
              <Menu
                open={menuOpen}
                anchorEl={anchorEl}
                onClose={handleMenuClose}
              >
                <MenuItem>
                  <ListItemIcon>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    onClick={() => {
                      handleMenuClose();
                      setDeleteCommentData({
                        commentId,
                        commentContent: content,
                      });
                    }}
                  >
                    Delete comment
                  </ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
        <Typography variant="body1">{content}</Typography>
      </Box>
    </Paper>
  );
};

export default CommentBox;
